/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  createMockImageData,
  enableRafAwareFakeTimers,
  setupDestroyableTeardown,
} from "@microblink/test-utils";
import { advanceAndFlushUi } from "@microblink/test-utils/vitest/timers";
import { BlinkCardUxManager } from "./BlinkCardUxManager";
import { blinkCardUiStateMap } from "./blinkcard-ui-state";
import {
  createDeviceInfo,
  createProcessResult,
  createScanningResult,
  createSessionSettings,
} from "./__testdata/blinkcardTestFixtures";
import {
  createBlinkCardIntegrationContext,
  type CreateBlinkCardIntegrationContextOptions,
} from "./test-helpers.integration";

/**
 * Test file role:
 * - Smoke-tests public BlinkCard scanning flow end-to-end with behavioral fakes.
 * - Covers frame processing, UI progression, timeout lifecycle, and result/error callbacks.
 * - Keeps mocking light and avoids internal-state forcing.
 */

const mockSleep = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock("@microblink/ux-common/utils", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@microblink/ux-common/utils")>();
  return { ...actual, sleep: mockSleep };
});

describe("BlinkCardUxManager integration smoke", () => {
  const trackManager = setupDestroyableTeardown<BlinkCardUxManager>();

  beforeEach(() => {
    vi.clearAllMocks();
    enableRafAwareFakeTimers();
  });

  const defaultContextOptions: CreateBlinkCardIntegrationContextOptions = {
    fakeCameraOptions: {
      initialState: {
        selectedCamera: { name: "default-camera", facingMode: "back" as const },
        videoResolution: { width: 1920, height: 1080 },
      },
    },
    sessionSettings: createSessionSettings(),
    showDemoOverlay: false,
    showProductionOverlay: false,
    deviceInfo: createDeviceInfo("integration-test-agent"),
  };

  test("full capture lifecycle emits result and stops capture", async () => {
    const scanningResult = createScanningResult();
    const context = createBlinkCardIntegrationContext({
      ...defaultContextOptions,
      sessionOverrides: {
        process: vi.fn().mockResolvedValue(
          createProcessResult({
            resultCompleteness: { scanningStatus: "card-scanned" },
          }),
        ),
        getResult: vi.fn().mockResolvedValue(scanningResult),
      },
    });
    const manager = trackManager(context.manager);

    const resultSpy = vi.fn();
    manager.addOnResultCallback(resultSpy);

    context.fakeCameraManager.emitPlaybackState("capturing");
    await context.fakeCameraManager.emitFrame(createMockImageData());
    await advanceAndFlushUi(blinkCardUiStateMap.INTRO_FRONT.minDuration + 100);

    await vi.waitFor(() => {
      expect(context.fakeCameraManager.stopFrameCapture).toHaveBeenCalled();
      expect(context.scanningSession.getResult).toHaveBeenCalled();
      expect(resultSpy).toHaveBeenCalledWith(scanningResult);
    });
  });

  test("side capture chains through FLIP_CARD to INTRO_BACK and resumes capture", async () => {
    const context = createBlinkCardIntegrationContext({
      ...defaultContextOptions,
      sessionOverrides: {
        process: vi.fn().mockResolvedValue(
          createProcessResult({
            inputImageAnalysisResult: {
              processingStatus: "awaiting-other-side",
            },
          }),
        ),
      },
    });
    const manager = trackManager(context.manager);

    const uiStates: string[] = [];
    manager.addOnUiStateChangedCallback((state) => {
      uiStates.push(state.key);
    });

    context.fakeCameraManager.emitPlaybackState("capturing");
    await context.fakeCameraManager.emitFrame(createMockImageData());
    await advanceAndFlushUi(
      blinkCardUiStateMap.INTRO_FRONT.minDuration +
        blinkCardUiStateMap.FIRST_SIDE_CAPTURED.minDuration +
        blinkCardUiStateMap.FLIP_CARD.minDuration +
        200,
    );

    expect(context.fakeCameraManager.stopFrameCapture).toHaveBeenCalled();
    expect(context.fakeCameraManager.startFrameCapture).toHaveBeenCalled();
    expect(uiStates).toContain("FIRST_SIDE_CAPTURED");
    expect(uiStates).toContain("FLIP_CARD");
    expect(uiStates).toContain("INTRO_BACK");
  });

  test("timeout lifecycle starts on capture and clears on idle", async () => {
    const context = createBlinkCardIntegrationContext({
      ...defaultContextOptions,
    });
    const manager = trackManager(context.manager);
    manager.setTimeoutDuration(100);

    const errorSpy = vi.fn();
    manager.addOnErrorCallback(errorSpy);

    context.fakeCameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(100);
    expect(errorSpy).toHaveBeenCalledWith("timeout");
    expect(context.fakeCameraManager.stopFrameCapture).toHaveBeenCalled();

    errorSpy.mockClear();
    context.fakeCameraManager.emitPlaybackState("capturing");
    context.fakeCameraManager.emitPlaybackState("idle");
    await vi.advanceTimersByTimeAsync(100);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  test("busy guard drops overlapping frames during processing", async () => {
    let resolveFirst!: (value: ReturnType<typeof createProcessResult>) => void;
    const pendingProcess = new Promise<ReturnType<typeof createProcessResult>>(
      (resolve) => {
        resolveFirst = resolve;
      },
    );
    const context = createBlinkCardIntegrationContext({
      ...defaultContextOptions,
      sessionOverrides: {
        process: vi.fn().mockReturnValueOnce(pendingProcess),
      },
    });
    const manager = trackManager(context.manager);

    const firstFramePromise = context.fakeCameraManager.emitFrame(
      createMockImageData(),
    );
    const secondFrameResult = await context.fakeCameraManager.emitFrame(
      createMockImageData(),
    );

    expect(secondFrameResult).toBeUndefined();
    expect(context.scanningSession.process).toHaveBeenCalledTimes(1);

    resolveFirst(
      createProcessResult({
        inputImageAnalysisResult: { processingStatus: "detection-failed" },
      }),
    );
    await firstFramePromise;
    manager.reset();
  });

  test("result retrieval failure emits error and does not emit result", async () => {
    const processResult = createProcessResult({
      resultCompleteness: { scanningStatus: "card-scanned" },
    });
    const context = createBlinkCardIntegrationContext({
      ...defaultContextOptions,
      sessionOverrides: {
        process: vi.fn().mockResolvedValue(processResult),
        getResult: vi
          .fn()
          .mockRejectedValue(new Error("Mocked worker RPC failure")),
      },
    });
    const manager = trackManager(context.manager);

    const resultSpy = vi.fn();
    const errorSpy = vi.fn();
    manager.addOnResultCallback(resultSpy);
    manager.addOnErrorCallback(errorSpy);

    context.fakeCameraManager.emitPlaybackState("capturing");
    await context.fakeCameraManager.emitFrame(createMockImageData());
    await advanceAndFlushUi(blinkCardUiStateMap.INTRO_FRONT.minDuration + 100);

    await vi.waitFor(() => {
      expect(context.scanningSession.getResult).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith("result_retrieval_failed");
      expect(resultSpy).not.toHaveBeenCalled();
    });
  });
});
