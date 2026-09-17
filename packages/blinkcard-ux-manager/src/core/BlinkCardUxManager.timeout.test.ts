/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { createFakeImageData, enableRafAwareFakeTimers, flushUiRaf } from "@microblink/test-utils";
import { advanceAndFlushUi } from "@microblink/test-utils/vitest/timers";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createProcessResult } from "./__testdata/blinkcardTestFixtures";
import { blinkCardUiStateMap } from "./blinkcard-ui-state";
import {
  defaultBlinkCardTimeoutConfiguration,
  type BlinkCardTimeoutConfiguration,
} from "./BlinkCardTimeoutConfiguration";
import { BlinkCardUxManager } from "./BlinkCardUxManager";
import { createBlinkCardIntegrationContext } from "./test-helpers.integration";

const createManager = (timeoutConfiguration?: Partial<BlinkCardTimeoutConfiguration>) =>
  createBlinkCardIntegrationContext({
    uxManagerOptions: { timeoutConfiguration },
  });

describe("BlinkCardUxManager timeout behavior", () => {
  const managers = new Set<BlinkCardUxManager>();

  beforeEach(() => {
    enableRafAwareFakeTimers();
  });

  afterEach(() => {
    managers.forEach((manager) => manager.destroy());
    managers.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("uses defaults, merges partial configuration, and returns a copy", () => {
    const { manager } = createManager({ inactivityTimeoutMs: 500 });
    managers.add(manager);

    expect(manager.getTimeoutConfiguration()).toEqual({
      ...defaultBlinkCardTimeoutConfiguration,
      inactivityTimeoutMs: 500,
    });

    const configuration = manager.getTimeoutConfiguration();
    configuration.inactivityTimeoutMs = 250;

    expect(manager.getTimeoutConfiguration().inactivityTimeoutMs).toBe(500);
  });

  test("exposes live timeout state for diagnostics", async () => {
    const { fakeCameraManager, manager } = createManager({
      inactivityTimeoutMs: 100,
      scanStepTimeoutMs: 500,
    });
    managers.add(manager);

    expect(manager.getTimeoutDebugState()).toEqual({
      inactivity: { configuredMs: 100, remainingMs: 100, status: "idle" },
      perSide: { configuredMs: 500, remainingMs: 500, status: "idle" },
      isTimingActiveScanStep: false,
      playbackState: "idle",
      inactivityResetUiStateKey: undefined,
    });

    fakeCameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(40);

    expect(manager.getTimeoutDebugState()).toMatchObject({
      inactivity: { configuredMs: 100, remainingMs: 60, status: "running" },
      perSide: { configuredMs: 500, remainingMs: 460, status: "running" },
      isTimingActiveScanStep: true,
      playbackState: "capturing",
      inactivityResetUiStateKey: "INTRO_FRONT",
    });

    fakeCameraManager.emitPlaybackState("playback");

    expect(manager.getTimeoutDebugState()).toMatchObject({
      inactivity: { configuredMs: 100, remainingMs: 100, status: "idle" },
      perSide: { configuredMs: 500, remainingMs: 460, status: "paused" },
      playbackState: "playback",
    });
  });

  test.each([
    ["inactivityTimeoutMs", 0],
    ["inactivityTimeoutMs", Number.POSITIVE_INFINITY],
    ["scanStepTimeoutMs", -1],
    ["scanStepTimeoutMs", Number.NaN],
  ] as const)("rejects invalid %s duration", (key, duration) => {
    expect(() => createManager({ [key]: duration })).toThrowError(`${key} must be greater than 0`);
  });

  test("rejects invalid configuration updates without changing the active configuration", () => {
    const { manager } = createManager();
    managers.add(manager);

    expect(() => manager.setTimeoutConfiguration({ scanStepTimeoutMs: 0 })).toThrowError(
      "scanStepTimeoutMs must be greater than 0",
    );
    expect(manager.getTimeoutConfiguration()).toEqual(defaultBlinkCardTimeoutConfiguration);
  });

  test("reports inactivity expiry, flushes analytics, and resets without restarting capture", async () => {
    const { fakeCameraManager, scanningSession, manager } = createManager({
      inactivityTimeoutMs: 100,
      scanStepTimeoutMs: 1_000,
    });
    managers.add(manager);
    const errorSpy = vi.fn();
    const inactivityAnalyticsSpy = vi.spyOn(manager.analytics, "logInactivityTimeoutEvent");
    const stepAnalyticsSpy = vi.spyOn(manager.analytics, "logStepTimeoutEvent");
    const flushSpy = vi.spyOn(manager.analytics, "sendPinglets");
    manager.addOnErrorCallback(errorSpy);

    fakeCameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(100);

    expect(errorSpy).toHaveBeenCalledWith("inactivity_timeout");
    expect(inactivityAnalyticsSpy).toHaveBeenCalledOnce();
    expect(stepAnalyticsSpy).not.toHaveBeenCalled();
    expect(flushSpy).toHaveBeenCalled();
    expect(fakeCameraManager.stopFrameCapture).toHaveBeenCalledOnce();
    expect(scanningSession.reset).toHaveBeenCalledOnce();
    expect(fakeCameraManager.startFrameCapture).not.toHaveBeenCalled();
  });

  test("reports scan-step expiry independently", async () => {
    const { fakeCameraManager, scanningSession, manager } = createManager({
      inactivityTimeoutMs: null,
      scanStepTimeoutMs: 100,
    });
    managers.add(manager);
    const errorSpy = vi.fn();
    const inactivityAnalyticsSpy = vi.spyOn(manager.analytics, "logInactivityTimeoutEvent");
    const stepAnalyticsSpy = vi.spyOn(manager.analytics, "logStepTimeoutEvent");
    manager.addOnErrorCallback(errorSpy);

    fakeCameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(100);

    expect(errorSpy).toHaveBeenCalledWith("scan_step_timeout");
    expect(stepAnalyticsSpy).toHaveBeenCalledOnce();
    expect(inactivityAnalyticsSpy).not.toHaveBeenCalled();
    expect(scanningSession.reset).toHaveBeenCalledOnce();
  });

  test("allows both timers to be disabled independently with null", async () => {
    const { fakeCameraManager, manager } = createManager({
      inactivityTimeoutMs: null,
      scanStepTimeoutMs: null,
    });
    managers.add(manager);
    const errorSpy = vi.fn();
    manager.addOnErrorCallback(errorSpy);

    fakeCameraManager.emitPlaybackState("capturing");
    manager.stopUiUpdateLoop();
    await vi.advanceTimersByTimeAsync(120_000);

    expect(errorSpy).not.toHaveBeenCalled();
  });

  test("restarts inactivity only after the stabilized UI state changes", async () => {
    const { fakeCameraManager, manager } = createManager({
      inactivityTimeoutMs: 1_000,
      scanStepTimeoutMs: 10_000,
    });
    managers.add(manager);
    const errorSpy = vi.fn();
    manager.addOnErrorCallback(errorSpy);

    fakeCameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(400);

    manager.feedbackStabilizer.reset("BLUR_DETECTED");
    await flushUiRaf();

    await vi.advanceTimersByTimeAsync(800);
    expect(errorSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(300);
    expect(errorSpy).toHaveBeenCalledWith("inactivity_timeout");
  });

  test("resets inactivity to a fresh window after capture interruption", async () => {
    const { fakeCameraManager, manager } = createManager({
      inactivityTimeoutMs: 100,
      scanStepTimeoutMs: 1_000,
    });
    managers.add(manager);
    const errorSpy = vi.fn();
    manager.addOnErrorCallback(errorSpy);

    fakeCameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(60);
    fakeCameraManager.emitPlaybackState("playback");
    await vi.advanceTimersByTimeAsync(500);

    fakeCameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(99);
    expect(errorSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(errorSpy).toHaveBeenCalledWith("inactivity_timeout");
  });

  test("pauses and resumes scan-step timing across capture interruption", async () => {
    const { fakeCameraManager, manager } = createManager({
      inactivityTimeoutMs: null,
      scanStepTimeoutMs: 100,
    });
    managers.add(manager);
    const errorSpy = vi.fn();
    manager.addOnErrorCallback(errorSpy);

    fakeCameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(60);
    fakeCameraManager.emitPlaybackState("playback");
    await vi.advanceTimersByTimeAsync(500);
    expect(errorSpy).not.toHaveBeenCalled();

    fakeCameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(39);
    expect(errorSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(errorSpy).toHaveBeenCalledWith("scan_step_timeout");
  });

  test("resets both timers when second-side capture starts", async () => {
    const { fakeCameraManager, scanningSession, manager } = createManager({
      inactivityTimeoutMs: 1_000,
      scanStepTimeoutMs: 1_000,
    });
    managers.add(manager);
    const errorSpy = vi.fn();
    manager.addOnErrorCallback(errorSpy);
    scanningSession.process.mockResolvedValueOnce(
      createProcessResult({
        inputImageAnalysisResult: { processingStatus: "awaiting-other-side" },
      }),
    );

    fakeCameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(900);
    await fakeCameraManager.emitFrame(createFakeImageData());
    fakeCameraManager.emitPlaybackState("playback");

    await advanceAndFlushUi(
      blinkCardUiStateMap.INTRO_FRONT.minDuration +
        blinkCardUiStateMap.FIRST_SIDE_CAPTURED.minDuration +
        blinkCardUiStateMap.FLIP_CARD.minDuration +
        100,
    );
    expect(manager.uiState.key).toBe("INTRO_BACK");

    fakeCameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(999);
    expect(errorSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(errorSpy).toHaveBeenCalledWith("inactivity_timeout");
  });

  test("resets both timers when returning to the foreground", async () => {
    const { fakeCameraManager, manager } = createManager({
      inactivityTimeoutMs: null,
      scanStepTimeoutMs: 100,
    });
    managers.add(manager);
    const errorSpy = vi.fn();
    manager.addOnErrorCallback(errorSpy);
    let visibilityState: DocumentVisibilityState = "visible";
    vi.spyOn(document, "visibilityState", "get").mockImplementation(() => visibilityState);

    fakeCameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(90);
    visibilityState = "hidden";
    document.dispatchEvent(new Event("visibilitychange"));
    fakeCameraManager.emitPlaybackState("playback");
    await vi.advanceTimersByTimeAsync(500);

    visibilityState = "visible";
    document.dispatchEvent(new Event("visibilitychange"));
    fakeCameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(99);
    expect(errorSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(errorSpy).toHaveBeenCalledWith("scan_step_timeout");
  });

  test("configuration updates reset both active timers", async () => {
    const { fakeCameraManager, manager } = createManager({
      inactivityTimeoutMs: 100,
      scanStepTimeoutMs: 1_000,
    });
    managers.add(manager);
    const errorSpy = vi.fn();
    manager.addOnErrorCallback(errorSpy);

    fakeCameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(90);
    manager.setTimeoutConfiguration({ inactivityTimeoutMs: 200, scanStepTimeoutMs: 300 });

    expect(manager.getTimeoutConfiguration()).toEqual({
      inactivityTimeoutMs: 200,
      scanStepTimeoutMs: 300,
    });
    await vi.advanceTimersByTimeAsync(199);
    expect(errorSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(errorSpy).toHaveBeenCalledWith("inactivity_timeout");
  });

  test("clears timers on successful completion", async () => {
    const { fakeCameraManager, scanningSession, manager } = createManager({
      inactivityTimeoutMs: 100,
      scanStepTimeoutMs: 100,
    });
    managers.add(manager);
    const errorSpy = vi.fn();
    manager.addOnErrorCallback(errorSpy);
    scanningSession.process.mockResolvedValueOnce(
      createProcessResult({ resultCompleteness: { scanningStatus: "card-scanned" } }),
    );

    fakeCameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(90);
    await fakeCameraManager.emitFrame(createFakeImageData());
    await vi.advanceTimersByTimeAsync(1_000);

    expect(errorSpy).not.toHaveBeenCalled();
  });

  test("clears timers on session reset, manager reset, and destroy", async () => {
    const resetContext = createManager({ inactivityTimeoutMs: 100, scanStepTimeoutMs: 1_000 });
    managers.add(resetContext.manager);
    const resetErrorSpy = vi.fn();
    resetContext.manager.addOnErrorCallback(resetErrorSpy);
    resetContext.fakeCameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(90);
    await resetContext.manager.resetScanningSession(false);

    const managerResetContext = createManager({ inactivityTimeoutMs: 100, scanStepTimeoutMs: 1_000 });
    managers.add(managerResetContext.manager);
    managerResetContext.fakeCameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(90);
    managerResetContext.manager.reset();

    const destroyContext = createManager({ inactivityTimeoutMs: 100, scanStepTimeoutMs: 1_000 });
    const destroyErrorSpy = vi.fn();
    destroyContext.manager.addOnErrorCallback(destroyErrorSpy);
    destroyContext.fakeCameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(90);
    destroyContext.manager.destroy();

    await vi.advanceTimersByTimeAsync(1_000);
    expect(resetErrorSpy).not.toHaveBeenCalled();
    expect(destroyErrorSpy).not.toHaveBeenCalled();
    expect(resetContext.fakeCameraManager.stopFrameCapture).not.toHaveBeenCalled();
    expect(managerResetContext.fakeCameraManager.stopFrameCapture).not.toHaveBeenCalled();
    expect(destroyContext.fakeCameraManager.stopFrameCapture).not.toHaveBeenCalled();
  });
});
