/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { getDeviceInfo, type DeviceInfo } from "@microblink/biometrics-core";
import { BiometricsError, ConfigurationError, type BiometricsDiagnosticEvent } from "@microblink/biometrics-core";
import type { CameraManager, FrameCaptureCallback } from "@microblink/camera-manager/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  BiometricsUxManager,
  createBiometricsUxManager,
  type BiometricsUxManagerOptions,
  type BiometricsUxSession,
  type BiometricsUxSessionEvent,
  type BiometricsUxSessionState,
} from "./BiometricsUxManager";

vi.mock("@microblink/biometrics-core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@microblink/biometrics-core")>()),
  getDeviceInfo: vi.fn(),
}));

type Result = { value: string };
type CodedError = Error & { code: string; isRetryable: boolean };
type TestSessionError = BiometricsError | CodedError;

type SessionMock = ReturnType<typeof createSessionMock>;
type CameraMock = ReturnType<typeof createCameraManagerMock>;

function createDeviceInfo(formFactors: DeviceInfo["derivedDeviceInfo"]["formFactors"] = ["Desktop"]): DeviceInfo {
  return {
    derivedDeviceInfo: { formFactors },
  } as DeviceInfo;
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;

  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

function errorWithCode(code: string, message: string = code): CodedError {
  return Object.assign(new Error(message), { code, isRetryable: true });
}

function createSessionMock(initialState: BiometricsUxSessionState<Result, TestSessionError> = { phase: "idle" }) {
  const stateListeners = new Set<(state: BiometricsUxSessionState<Result, TestSessionError>) => void>();
  const eventListeners = new Set<(event: BiometricsUxSessionEvent) => void>();
  const errorListeners = new Set<(error: TestSessionError) => void>();
  const diagnosticListeners = new Set<(event: BiometricsDiagnosticEvent) => void>();

  let state = initialState;
  let operation = createDeferred<Result>();

  const setState = (next: BiometricsUxSessionState<Result, TestSessionError>) => {
    state = next;

    for (const listener of stateListeners) {
      listener(state);
    }
  };

  const beginCapture = () => {
    setState({
      phase: "capturing",
      capture: {
        sessionState: "ANALYZING",
        feedback: "FACE_NOT_FOUND",
      },
    });

    return operation.promise;
  };

  const run = vi.fn(beginCapture);
  const retry = vi.fn(() => operation.promise);
  const processFrame = vi.fn();
  const setCaptureTimeoutPaused = vi.fn();
  const finish = vi.fn();

  const session: BiometricsUxSession<Result, BiometricsUxSessionEvent, TestSessionError> = {
    getState: vi.fn(() => state),
    subscribe: vi.fn((listener: (state: BiometricsUxSessionState<Result, TestSessionError>) => void) => {
      stateListeners.add(listener);
      listener(state);

      return () => stateListeners.delete(listener);
    }),
    processFrame,
    run,
    retry,
    onEvent: vi.fn((listener: (event: BiometricsUxSessionEvent) => void) => {
      eventListeners.add(listener);

      return () => eventListeners.delete(listener);
    }),
    onError: vi.fn((listener: (error: TestSessionError) => void) => {
      errorListeners.add(listener);

      return () => errorListeners.delete(listener);
    }),
    onDiagnostic: vi.fn((listener: (event: BiometricsDiagnosticEvent) => void) => {
      diagnosticListeners.add(listener);

      return () => diagnosticListeners.delete(listener);
    }),
    setCaptureTimeoutPaused,
    finish,
  };

  return {
    session,
    run,
    retry,
    processFrame,
    setCaptureTimeoutPaused,
    finish,
    setState,
    emitEvent(event: BiometricsUxSessionEvent) {
      for (const listener of eventListeners) {
        listener(event);
      }
    },
    emitError(error: TestSessionError) {
      for (const listener of errorListeners) {
        listener(error);
      }
    },
    emitDiagnostic(event: BiometricsDiagnosticEvent) {
      for (const listener of diagnosticListeners) {
        listener(event);
      }
    },
    resolve(result: Result) {
      operation.resolve(result);
    },
    reject(error: TestSessionError) {
      operation.reject(error);
    },
    resetOperation() {
      operation = createDeferred<Result>();
    },
    stubRetry(nextState: BiometricsUxSessionState<Result, TestSessionError>) {
      retry.mockImplementation(() => {
        setState(nextState);

        return new Promise<Result>(() => undefined);
      });
    },
  };
}

function createCameraManagerMock() {
  const state = {
    mirrorX: true,
    cameras: [],
    selectedCamera: undefined,
    isSwappingCamera: false,
  };
  const startFrameCapture = vi.fn().mockResolvedValue(undefined);
  const stopFrameCapture = vi.fn();
  const reset = vi.fn();

  let frameCallback: FrameCaptureCallback | undefined;

  const addFrameCaptureCallback = vi.fn((callback: FrameCaptureCallback) => {
    frameCallback = callback;

    return vi.fn(() => {
      frameCallback = undefined;
    });
  });

  const cameraManager = {
    userInitiatedAbort: false,
    startFrameCapture,
    stopFrameCapture,
    reset,
    addFrameCaptureCallback,
    getState: vi.fn(() => state),
  } as unknown as CameraManager;

  return {
    cameraManager,
    startFrameCapture,
    stopFrameCapture,
    reset,
    addFrameCaptureCallback,
    get frameCallback() {
      return frameCallback;
    },
  };
}

const analyzingState = (
  patch: Partial<Extract<BiometricsUxSessionState<Result, TestSessionError>, { phase: "capturing" }>["capture"]> = {},
): BiometricsUxSessionState<Result, TestSessionError> => ({
  phase: "capturing",
  capture: {
    sessionState: "ANALYZING",
    feedback: "FACE_NOT_FOUND",
    ...patch,
  },
});

async function createHarness(
  options: BiometricsUxManagerOptions<Result, BiometricsUxSessionEvent, TestSessionError> = {},
  initialState?: BiometricsUxSessionState<Result, TestSessionError>,
): Promise<{
  session: SessionMock;
  camera: CameraMock;
  manager: BiometricsUxManager<Result, BiometricsUxSessionEvent, TestSessionError>;
}> {
  const session = createSessionMock(initialState);
  const camera = createCameraManagerMock();

  const manager = await createBiometricsUxManager<Result, BiometricsUxSessionEvent, TestSessionError>(
    camera.cameraManager,
    session.session,
    {
      showOnboarding: false,
      ...options,
    },
  );

  return { session, camera, manager };
}

async function reachComplete(
  session: SessionMock,
  manager: BiometricsUxManager<Result, BiometricsUxSessionEvent, TestSessionError>,
): Promise<void> {
  vi.useFakeTimers();
  void manager.beginCapture();
  session.setState(analyzingState());
  await vi.advanceTimersByTimeAsync(2_000);
  session.setState(analyzingState({ sessionState: "COMPLETE" }));
}

describe("BiometricsUxManager", () => {
  beforeEach(() => {
    vi.mocked(getDeviceInfo).mockReset();
    vi.mocked(getDeviceInfo).mockResolvedValue(createDeviceInfo());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("forwards workflow events and diagnostics and owns onboarding events", async () => {
    const onEvent = vi.fn();
    const onDiagnostic = vi.fn();

    const { session, manager } = await createHarness({
      showOnboarding: true,
      onEvent,
      onDiagnostic,
    });

    expect(onEvent).toHaveBeenCalledWith({
      kind: "ux",
      name: "onboardingShown",
    });
    expect(session.run).not.toHaveBeenCalled();
    expect(session.setCaptureTimeoutPaused).not.toHaveBeenCalled();

    void manager.beginCapture();

    expect(onEvent).toHaveBeenCalledWith({
      kind: "ux",
      name: "onboardingClosed",
    });

    const event = { kind: "captureTimeout" } as const;

    session.emitEvent(event);
    expect(onEvent).toHaveBeenCalledWith(event);

    const diagnostic = {
      phase: "capture",
      component: "sdk",
      status: "started",
      timestamp: "2026-07-24T12:00:00.000Z",
    } as const satisfies BiometricsDiagnosticEvent;

    session.emitDiagnostic(diagnostic);
    expect(onDiagnostic).toHaveBeenCalledWith(diagnostic);
  });

  it.each([["onboardingClosed", true] as const, ["helpClosed", false] as const])(
    "aborts work when %s closes the manager",
    async (eventName, showOnboarding) => {
      const session = createSessionMock();
      const camera = createCameraManagerMock();

      let manager!: BiometricsUxManager<Result, BiometricsUxSessionEvent, TestSessionError>;

      manager = await createBiometricsUxManager(camera.cameraManager, session.session, {
        showOnboarding,
        onEvent: (event) => {
          if (event.kind === "ux" && event.name === eventName) {
            manager.close();
          }
        },
      });

      if (eventName === "onboardingClosed") {
        await expect(manager.beginCapture()).rejects.toMatchObject({
          message: "The guided session is closed",
          code: "SESSION_CLOSED",
        });

        expect(session.run).not.toHaveBeenCalled();
        expect(camera.addFrameCaptureCallback).not.toHaveBeenCalled();
        expect(camera.reset).toHaveBeenCalledOnce();

        return;
      }

      void manager.beginCapture();

      await Promise.resolve();

      manager.openHelp();

      const startsBeforeClose = camera.startFrameCapture.mock.calls.length;

      await manager.closeHelp();

      expect(camera.startFrameCapture).toHaveBeenCalledTimes(startsBeforeClose);
      expect(camera.reset).toHaveBeenCalledOnce();
    },
  );

  it("returns the exact session frame promise to Camera Manager", async () => {
    const { session, camera, manager } = await createHarness();

    const frame = {} as ImageData;
    const buffer = new ArrayBuffer(16);
    const framePromise = Promise.resolve(buffer);

    session.processFrame.mockReturnValue(framePromise);

    void manager.beginCapture();

    expect(camera.frameCallback?.(frame)).toBe(framePromise);
    expect(session.processFrame).toHaveBeenCalledWith(frame);

    await expect(framePromise).resolves.toBe(buffer);
  });

  it("normalizes camera startup failures before exposing them", async () => {
    const failure = new Error("camera failed");
    const onError = vi.fn();

    const { camera, manager } = await createHarness({ onError });

    camera.startFrameCapture.mockRejectedValue(failure);

    void manager.beginCapture();

    await vi.waitFor(() => {
      expect(manager.getState().error).toMatchObject({
        code: "CAMERA_START_FAILED",
        stage: "capture",
        component: "camera",
        isRetryable: true,
        cause: failure,
      });
    });

    expect(onError).toHaveBeenCalledWith(manager.getState().error);
  });

  it("ignores camera startup failures from a replaced capture attempt", async () => {
    const staleStart = createDeferred<void>();
    const failure = errorWithCode("CAPTURE_TIMEOUT", "timeout");
    const onError = vi.fn();
    const { session, camera, manager } = await createHarness({ onError });

    camera.startFrameCapture.mockReturnValueOnce(staleStart.promise).mockResolvedValue(undefined);

    void manager.beginCapture();
    session.setState(analyzingState());
    session.setState({ phase: "failed", stage: "capture", error: failure });
    session.stubRetry(analyzingState());

    void manager.retry();
    staleStart.reject(new Error("stale camera failure"));

    await Promise.resolve();

    expect(manager.getState().key).toBe("capturing");
    expect(manager.getState().error).toBeUndefined();
    expect(onError).not.toHaveBeenCalled();
  });

  it("maps capture snapshots and freezes face bounds while processing", async () => {
    const { session, manager } = await createHarness({
      showDebugOverlay: true,
    });

    void manager.beginCapture();

    const firstBounds = { x: 0.2, y: 0.1, width: 0.5, height: 0.6 };
    const landmarks = {
      LeftEye: { x: 0.3, y: 0.3 },
      RightEye: { x: 0.7, y: 0.3 },
      NoseTip: { x: 0.5, y: 0.5 },
      Mouth: { x: 0.5, y: 0.7 },
      LeftEar: { x: 0.1, y: 0.4 },
      RightEar: { x: 0.9, y: 0.4 },
    };

    session.setState(
      analyzingState({
        feedback: "OK",
        technicalData: {
          normalizedFaceBounds: firstBounds,
          landmarks,
          inputImageSize: { width: 640, height: 480 },
        },
      }),
    );
    session.setState(
      analyzingState({
        sessionState: "PROCESSING",
        technicalData: {
          normalizedFaceBounds: { x: 0, y: 0, width: 0.1, height: 0.1 },
        },
      }),
    );

    expect(manager.getState()).toMatchObject({
      key: "capturing",
      sessionState: "ANALYZING",
      feedback: "FACE_NOT_FOUND",
      landmarks: undefined,
      boundingBox: { x: 0, y: 0, width: 0.1, height: 0.1 },
      faceBounds: firstBounds,
      frameSize: { width: 640, height: 480 },
      mirrorX: true,
    });
  });

  it("pauses capture for help and resumes only while the session is capturing", async () => {
    const { session, camera, manager } = await createHarness();

    void manager.beginCapture();

    await Promise.resolve();

    manager.openHelp();
    expect(manager.getState().key).toBe("help");
    expect(camera.stopFrameCapture).toHaveBeenCalled();
    expect(session.setCaptureTimeoutPaused).toHaveBeenCalledWith(true);

    manager.openHelp();
    expect(session.setCaptureTimeoutPaused).toHaveBeenCalledTimes(1);

    await manager.closeHelp();

    expect(manager.getState().key).toBe("capturing");
    expect(camera.startFrameCapture).toHaveBeenCalledTimes(2);
    expect(session.setCaptureTimeoutPaused).toHaveBeenNthCalledWith(2, false);

    await manager.closeHelp();
    expect(session.setCaptureTimeoutPaused).toHaveBeenCalledTimes(2);
  });

  it("does not resume after helpClosed synchronously ends capture", async () => {
    const session = createSessionMock();
    const camera = createCameraManagerMock();
    const manager = await createBiometricsUxManager(camera.cameraManager, session.session, {
      showOnboarding: false,
      onEvent: (event) => {
        if (event.kind === "ux" && event.name === "helpClosed") {
          session.setState({ phase: "failed", stage: "capture", error: errorWithCode("CAPTURE_TIMEOUT") });
        }
      },
    });

    void manager.beginCapture();
    await Promise.resolve();
    manager.openHelp();

    await manager.closeHelp();

    expect(manager.getState().key).toBe("error");
    expect(camera.startFrameCapture).toHaveBeenCalledOnce();
    expect(session.setCaptureTimeoutPaused).toHaveBeenCalledOnce();
    expect(session.setCaptureTimeoutPaused).toHaveBeenCalledWith(true);
  });

  it("keeps the timeout paused until frame capture restarts", async () => {
    const { session, camera, manager } = await createHarness();
    const frameCaptureStart = createDeferred<void>();

    void manager.beginCapture();
    await Promise.resolve();
    camera.startFrameCapture.mockImplementationOnce(() => frameCaptureStart.promise);
    manager.openHelp();

    const closePromise = manager.closeHelp();

    expect(session.setCaptureTimeoutPaused).toHaveBeenCalledOnce();
    expect(session.setCaptureTimeoutPaused).toHaveBeenCalledWith(true);

    frameCaptureStart.resolve(undefined);
    await closePromise;

    expect(session.setCaptureTimeoutPaused).toHaveBeenNthCalledWith(2, false);
  });

  it("keeps the timeout paused when frame capture restart fails", async () => {
    const { session, camera, manager } = await createHarness();
    const cameraError = new Error("camera start failed");

    void manager.beginCapture();
    await Promise.resolve();
    camera.startFrameCapture.mockRejectedValueOnce(cameraError);
    manager.openHelp();

    await expect(manager.closeHelp()).rejects.toBe(cameraError);

    expect(session.setCaptureTimeoutPaused).toHaveBeenCalledOnce();
    expect(session.setCaptureTimeoutPaused).toHaveBeenCalledWith(true);
  });

  it.each(["PROCESSING", "TIMEOUT", "ERROR", "COMPLETE"] as const)(
    "does not resume capture from help in the %s session state",
    async (sessionState) => {
      const { session, camera, manager } = await createHarness();

      void manager.beginCapture();
      await Promise.resolve();
      manager.openHelp();
      session.setState(analyzingState({ sessionState }));
      const frameCaptureStartCount = camera.startFrameCapture.mock.calls.length;

      await manager.closeHelp();

      expect(camera.startFrameCapture).toHaveBeenCalledTimes(frameCaptureStartCount);
      expect(session.setCaptureTimeoutPaused).toHaveBeenCalledOnce();
      expect(session.setCaptureTimeoutPaused).toHaveBeenCalledWith(true);
    },
  );

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid help nudge delay %s",
    async (helpNudgeDelayMs) => {
      await expect(createHarness({ helpNudgeDelayMs })).rejects.toMatchObject({
        code: "INVALID_HELP_NUDGE_DELAY",
      });
    },
  );

  it("gates results behind capture animation completion", async () => {
    const onCaptureAnimationComplete = vi.fn();
    const onResult = vi.fn();
    const result = { value: "success" };

    const { session, manager } = await createHarness({ onCaptureAnimationComplete, onResult });

    await reachComplete(session, manager);
    session.setState({ phase: "succeeded", result });

    expect(onResult).not.toHaveBeenCalled();
    manager.captureAnimationComplete();
    manager.captureAnimationComplete();

    expect(onCaptureAnimationComplete).toHaveBeenCalledOnce();
    expect(onResult).toHaveBeenCalledOnce();
  });

  it("shows a capture failure without waiting for animation completion", async () => {
    const onError = vi.fn();
    const error = errorWithCode("CAPTURE_TIMEOUT", "timeout");

    const { session, manager } = await createHarness({ onError });

    await reachComplete(session, manager);
    session.setState({ phase: "failed", stage: "capture", error });
    session.emitError(error);

    expect(onError).toHaveBeenCalledOnce();
    expect(manager.getState()).toMatchObject({
      key: "error",
      error,
      errorDialogKind: "scanningUnsuccessful",
    });
  });

  it("retries processing immediately without replaying capture", async () => {
    const error = errorWithCode("UNKNOWN", "processing");

    const { session, camera, manager } = await createHarness({}, { phase: "failed", stage: "processing", error });

    session.stubRetry({ phase: "processing" });

    void manager.retry();

    expect(session.retry).toHaveBeenCalledOnce();
    expect(session.run).not.toHaveBeenCalled();
    expect(camera.startFrameCapture).not.toHaveBeenCalled();
    expect(manager.getState()).toMatchObject({ key: "processing", error: undefined, errorDialogKind: undefined });
  });

  it("presents custom error dialog kinds", async () => {
    const error = errorWithCode("OFFLINE", "offline");

    const session = createSessionMock();
    const camera = createCameraManagerMock();
    const manager = await createBiometricsUxManager(camera.cameraManager, session.session, {
      showOnboarding: false,
      resolveErrorDialogKind: (sessionError: TestSessionError, stage) =>
        sessionError.code === "OFFLINE" && stage === "processing" ? ("offline" as const) : undefined,
    });

    void manager.beginCapture();
    session.setState({ phase: "failed", stage: "processing", error });

    expect(manager.getState()).toMatchObject({ key: "error", error, errorDialogKind: "offline" });
  });

  it("waits for the terminal frame before capture retry", async () => {
    const error = errorWithCode("CAPTURE_TIMEOUT", "timeout");
    const frame = createDeferred<ArrayBuffer>();

    const { session, camera, manager } = await createHarness();

    session.processFrame.mockReturnValue(frame.promise);
    session.stubRetry(analyzingState());

    void manager.beginCapture();
    expect(camera.frameCallback?.({} as ImageData)).toBe(frame.promise);
    session.setState({ phase: "failed", stage: "capture", error });
    void manager.retry();

    expect(camera.addFrameCaptureCallback).toHaveBeenCalledTimes(2);
    expect(session.retry).not.toHaveBeenCalled();
    expect(camera.startFrameCapture).toHaveBeenCalledOnce();

    frame.resolve(new ArrayBuffer(16));

    await frame.promise;
    await vi.waitFor(() => expect(session.retry).toHaveBeenCalledOnce());

    expect(camera.startFrameCapture).toHaveBeenCalledTimes(2);
  });

  it("suppresses buffered and late outcomes after close", async () => {
    const outcomes: BiometricsUxSessionState<Result, TestSessionError>[] = [
      { phase: "succeeded", result: { value: "success" } },
      {
        phase: "failed",
        stage: "capture",
        error: errorWithCode("CAPTURE_TIMEOUT", "timeout"),
      },
    ];

    for (const outcome of outcomes) {
      const onError = vi.fn();
      const onResult = vi.fn();

      const { session, manager } = await createHarness({ onError, onResult });

      await reachComplete(session, manager);
      session.setState(outcome);

      if (outcome.phase === "failed") {
        session.emitError(outcome.error);
      }

      manager.close();
      manager.captureAnimationComplete();
      session.emitError(errorWithCode("INTERNAL_ERROR", "late"));

      expect(manager.getState().key).toBe("closed");
      expect(onError).toHaveBeenCalledTimes(outcome.phase === "failed" ? 1 : 0);
      expect(onResult).not.toHaveBeenCalled();
    }

    const onError = vi.fn();
    const onResult = vi.fn();

    const afterGate = await createHarness({ onError, onResult });

    await reachComplete(afterGate.session, afterGate.manager);

    afterGate.manager.captureAnimationComplete();

    afterGate.manager.close();
    afterGate.session.setState({
      phase: "succeeded",
      result: { value: "late" },
    });
    afterGate.session.emitError(errorWithCode("INTERNAL_ERROR", "late"));

    expect(afterGate.manager.getState().key).toBe("closed");
    expect(onError).not.toHaveBeenCalled();
    expect(onResult).not.toHaveBeenCalled();
  });

  it("stops frame capture when camera startup resolves after close", async () => {
    const cameraStart = createDeferred<void>();

    const { camera, manager } = await createHarness();

    camera.startFrameCapture.mockReturnValue(cameraStart.promise);

    void manager.beginCapture();
    manager.close();

    const stopCountAfterClose = camera.stopFrameCapture.mock.calls.length;

    cameraStart.resolve();

    await vi.waitFor(() => expect(camera.stopFrameCapture).toHaveBeenCalledTimes(stopCountAfterClose + 1));

    expect(manager.getState().key).toBe("closed");
  });

  it("closes idempotently and cleans up after session finish", async () => {
    const onError = vi.fn();
    const onDiagnostic = vi.fn();
    const onResult = vi.fn();

    const active = await createHarness({ onDiagnostic, onError, onResult });

    await reachComplete(active.session, active.manager);

    active.manager.close();
    active.manager.close();
    active.session.setState({ phase: "succeeded", result: { value: "late" } });
    active.session.emitError(errorWithCode("INTERNAL_ERROR", "late"));
    active.session.emitDiagnostic({
      phase: "capture",
      component: "sdk",
      status: "completed",
      timestamp: "2026-07-24T12:00:00.000Z",
    });
    active.manager.captureAnimationComplete();

    expect(active.manager.getState().key).toBe("closed");
    expect(active.session.finish).toHaveBeenCalledOnce();
    expect(active.camera.reset).toHaveBeenCalledOnce();
    expect(onDiagnostic).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(onResult).not.toHaveBeenCalled();

    const finished = await createHarness();

    finished.session.setState({ phase: "finished" });
    expect(finished.manager.getState().key).toBe("closed");
    finished.manager.close();

    expect(finished.session.finish).toHaveBeenCalledOnce();
    expect(finished.camera.reset).toHaveBeenCalledOnce();
    expect(finished.camera.cameraManager.userInitiatedAbort).toBe(true);
  });

  it("isolates throwing consumer callbacks", async () => {
    const throwConsumer = () => {
      throw new Error("consumer");
    };

    const { session, manager } = await createHarness({
      onEvent: throwConsumer,
      onError: throwConsumer,
      onDiagnostic: throwConsumer,
      onResult: throwConsumer,
    });

    expect(() => session.emitEvent({ kind: "captureTimeout" })).not.toThrow();
    expect(() =>
      session.emitDiagnostic({
        phase: "capture",
        component: "sdk",
        status: "completed",
        timestamp: "2026-07-24T12:00:00.000Z",
        durationMs: 1,
      }),
    ).not.toThrow();
    expect(() => session.emitError(errorWithCode("INTERNAL_ERROR", "failure"))).not.toThrow();

    await reachComplete(session, manager);
    session.setState({ phase: "succeeded", result: { value: "success" } });

    expect(() => manager.captureAnimationComplete()).not.toThrow();
    expect(manager.getState().key).toBe("complete");
  });
});
