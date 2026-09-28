/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { ConfigurationError } from "@microblink/biometrics-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createGuidedPresentation,
  type GuidedPresentationAction,
  type GuidedPresentationUpdate,
  validateHelpNudgeDelay,
} from "./GuidedPresentation";
import type { BiometricsUxFailureStage, BiometricsUxSessionState, BiometricsUxState } from "./types";

type Result = { value: string };
type TestError = Error & { code: string; isRetryable: boolean };

type CustomDialogKind = "offline";

const initialState = (): BiometricsUxState<TestError, CustomDialogKind> => ({
  key: "starting",
  sessionState: "IDLE",
  feedback: "FACE_NOT_FOUND",
  helpNudgeVisible: false,
  frameSize: { width: 0, height: 0 },
  mirrorX: false,
});

const capturing = (
  overrides: Partial<Extract<BiometricsUxSessionState<Result, TestError>, { phase: "capturing" }>["capture"]> = {},
): BiometricsUxSessionState<Result, TestError> => ({
  phase: "capturing",
  capture: {
    sessionState: "ANALYZING",
    feedback: "TOO_CLOSE",
    ...overrides,
  },
});

function createHarness(
  options: {
    helpNudgeDelayMs?: number | null;
    showDebugOverlay?: boolean;
    resolveErrorDialogKind?: (error: TestError, stage: BiometricsUxFailureStage) => CustomDialogKind | undefined;
  } = {},
) {
  let state = initialState();
  const updates: GuidedPresentationUpdate<Result, TestError, CustomDialogKind>[] = [];
  const actions: GuidedPresentationAction<Result>[] = [];
  const presentation = createGuidedPresentation<Result, TestError, CustomDialogKind>(
    {
      getState: () => state,
      showDebugOverlay: options.showDebugOverlay ?? false,
      helpNudgeDelayMs: options.helpNudgeDelayMs === undefined ? 5_000 : options.helpNudgeDelayMs,
      resolveErrorDialogKind: options.resolveErrorDialogKind,
    },
    (update) => {
      updates.push(update);

      if (update.state) {
        state = update.state;
      }

      actions.push(...update.actions);
    },
  );

  return { presentation, updates, actions, getState: () => state };
}

describe("GuidedPresentation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])("rejects invalid Help delay %s", (delayMs) => {
    expect(() => validateHelpNudgeDelay(delayMs)).toThrowError(ConfigurationError);
  });

  it("projects capture data, latches face bounds, and limits debug data", () => {
    const { presentation, getState, actions } = createHarness({ showDebugOverlay: true });
    const faceBounds = { x: 0.1, y: 0.2, width: 0.3, height: 0.4 };

    presentation.sessionChanged(
      capturing({
        technicalData: {
          normalizedFaceBounds: faceBounds,
          landmarks: {
            LeftEye: { x: 0.4, y: 0.4 },
            RightEye: { x: 0.6, y: 0.4 },
            NoseTip: { x: 0.5, y: 0.5 },
            Mouth: { x: 0.5, y: 0.6 },
            LeftEar: { x: 0.2, y: 0.5 },
            RightEar: { x: 0.8, y: 0.5 },
          },
          inputImageSize: { width: 640, height: 480 },
        },
      }),
    );
    vi.advanceTimersByTime(2_000);

    expect(getState()).toMatchObject({
      key: "capturing",
      feedback: "TOO_CLOSE",
      faceBounds,
      boundingBox: faceBounds,
      frameSize: { width: 640, height: 480 },
    });
    expect(getState().landmarks).toBeDefined();
    expect(actions).toContainEqual({ type: "startFrameCapture" });

    presentation.sessionChanged(
      capturing({
        sessionState: "PROCESSING",
        technicalData: { normalizedFaceBounds: { x: 1, y: 1, width: 1, height: 1 } },
      }),
    );

    expect(getState().faceBounds).toEqual(faceBounds);
  });

  it("protects initial guidance for two seconds and buffers completion", () => {
    const { presentation, getState } = createHarness();

    presentation.sessionChanged(capturing());
    presentation.sessionChanged(capturing({ sessionState: "COMPLETE", feedback: "OK" }));

    vi.advanceTimersByTime(1_999);
    expect(getState()).toMatchObject({
      key: "capturing",
      sessionState: "ANALYZING",
      feedback: "FACE_NOT_FOUND",
    });

    vi.advanceTimersByTime(1);
    expect(getState()).toMatchObject({ key: "complete", sessionState: "COMPLETE" });
  });

  it("keeps corrective guidance visible for one second", () => {
    const { presentation, getState } = createHarness();

    presentation.sessionChanged(capturing());
    vi.advanceTimersByTime(2_100);
    presentation.sessionChanged(capturing({ sessionState: "COMPLETE", feedback: "OK" }));

    vi.advanceTimersByTime(899);
    expect(getState().key).toBe("capturing");

    vi.advanceTimersByTime(1);
    expect(getState().key).toBe("complete");
  });

  it("pauses timers during Help while wall-clock time continues", () => {
    const { presentation, getState, actions } = createHarness();

    presentation.sessionChanged(capturing());
    vi.advanceTimersByTime(500);
    presentation.openHelp();
    presentation.sessionChanged(capturing({ sessionState: "COMPLETE", feedback: "OK" }));

    expect(getState().key).toBe("help");
    const actionCount = actions.length;

    vi.advanceTimersByTime(1_500);
    presentation.closeHelp();

    expect(getState().key).toBe("complete");
    expect(actions).toHaveLength(actionCount);
  });

  it("shows, disables, and clears the Help nudge", () => {
    const delayed = createHarness({ helpNudgeDelayMs: 100 });

    delayed.presentation.sessionChanged(capturing());
    vi.advanceTimersByTime(100);
    expect(delayed.getState().helpNudgeVisible).toBe(true);

    delayed.presentation.openHelp();
    expect(delayed.getState()).toMatchObject({ key: "help", helpNudgeVisible: false });

    const disabled = createHarness({ helpNudgeDelayMs: null });

    disabled.presentation.sessionChanged(capturing());
    vi.advanceTimersByTime(10_000);
    expect(disabled.getState().helpNudgeVisible).toBe(false);

    const immediate = createHarness({ helpNudgeDelayMs: 0 });

    immediate.presentation.sessionChanged(capturing());
    expect(immediate.getState().helpNudgeVisible).toBe(true);
  });

  it("gates processing and results on one animation completion", () => {
    const processing = createHarness();

    processing.presentation.sessionChanged(capturing({ feedback: "FACE_NOT_FOUND" }));
    vi.advanceTimersByTime(2_000);
    processing.presentation.sessionChanged(capturing({ sessionState: "COMPLETE", feedback: "OK" }));
    processing.presentation.sessionChanged({ phase: "processing" });

    expect(processing.getState().key).toBe("complete");
    expect(processing.actions).toContainEqual({ type: "stopFrameCapture" });
    expect(processing.presentation.animationCompleted()).toBe(true);
    expect(processing.presentation.animationCompleted()).toBe(false);
    expect(processing.getState().key).toBe("processing");

    const succeeding = createHarness();
    const result = { value: "success" };

    succeeding.presentation.sessionChanged(capturing({ feedback: "FACE_NOT_FOUND" }));
    vi.advanceTimersByTime(2_000);
    succeeding.presentation.sessionChanged(capturing({ sessionState: "COMPLETE", feedback: "OK" }));
    succeeding.presentation.sessionChanged({ phase: "succeeded", result });
    expect(succeeding.actions).not.toContainEqual({ type: "resultReady", result });

    expect(succeeding.presentation.animationCompleted()).toBe(true);
    expect(succeeding.presentation.animationCompleted()).toBe(false);
    expect(succeeding.actions).toContainEqual({ type: "resultReady", result });

    const delivered = succeeding.actions.filter((action) => action.type === "resultReady").length;

    succeeding.presentation.sessionChanged({ phase: "succeeded", result });
    expect(succeeding.actions.filter((action) => action.type === "resultReady")).toHaveLength(delivered + 1);
  });

  it("presents failures without waiting for animation completion", () => {
    const { presentation, getState } = createHarness();
    const error = Object.assign(new Error("timeout"), { code: "CAPTURE_TIMEOUT", isRetryable: true });

    presentation.sessionChanged(capturing());
    presentation.sessionChanged(capturing({ sessionState: "COMPLETE", feedback: "OK" }));
    presentation.sessionChanged({ phase: "failed", stage: "capture", error });

    expect(getState()).toMatchObject({
      key: "error",
      sessionState: "ERROR",
      error,
      errorDialogKind: "scanningUnsuccessful",
    });
  });

  it("keeps the session state for processing failures", () => {
    const { presentation, getState } = createHarness();
    const error = Object.assign(new Error("failed"), { code: "UNKNOWN", isRetryable: true });

    presentation.sessionChanged(capturing());
    presentation.sessionChanged(capturing({ sessionState: "COMPLETE", feedback: "OK" }));
    vi.advanceTimersByTime(2_000);
    presentation.sessionChanged({ phase: "failed", stage: "processing", error });

    expect(getState()).toMatchObject({
      key: "error",
      sessionState: "COMPLETE",
      error,
      errorDialogKind: "scanningNotAvailable",
    });
  });

  it("prefers the custom dialog resolver and falls back to the default", () => {
    const resolveErrorDialogKind = vi.fn((error: TestError) => (error.code === "OFFLINE" ? "offline" : undefined));
    const custom = createHarness({ resolveErrorDialogKind });
    const offline = Object.assign(new Error("offline"), { code: "OFFLINE", isRetryable: true });

    custom.presentation.sessionChanged({ phase: "failed", stage: "processing", error: offline });

    expect(resolveErrorDialogKind).toHaveBeenCalledWith(offline, "processing");
    expect(custom.getState()).toMatchObject({ key: "error", errorDialogKind: "offline" });

    const fallback = createHarness({ resolveErrorDialogKind });
    const timeout = Object.assign(new Error("timeout"), { code: "CAPTURE_TIMEOUT", isRetryable: true });

    fallback.presentation.sessionChanged({ phase: "failed", stage: "capture", error: timeout });

    expect(fallback.getState()).toMatchObject({ key: "error", errorDialogKind: "scanningUnsuccessful" });
  });

  it("does not publish timers or session changes after disposal", () => {
    const { presentation, updates } = createHarness({ helpNudgeDelayMs: 100 });

    presentation.sessionChanged(capturing());
    presentation.dispose();
    const updateCount = updates.length;

    vi.advanceTimersByTime(2_000);
    presentation.sessionChanged(capturing({ sessionState: "COMPLETE", feedback: "OK" }));

    expect(updates).toHaveLength(updateCount);
  });
});
