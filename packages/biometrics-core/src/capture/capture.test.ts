/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { type FaceLandmarks } from "@microblink/biometrics-common";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type AnalysisResult, WasmFaceAnalyzer } from "../analyzer/wasmFaceAnalyzer";
import { createBiometricsCapture, type BiometricsCaptureSession, type CaptureConfig } from "./capture";

const sampleLandmarks: FaceLandmarks = {
  LeftEye: { x: 0.4, y: 0.4 },
  RightEye: { x: 0.6, y: 0.4 },
  NoseTip: { x: 0.5, y: 0.52 },
  Mouth: { x: 0.5, y: 0.66 },
  LeftEar: { x: 0.25, y: 0.42 },
  RightEar: { x: 0.75, y: 0.42 },
};

const processor = vi.hoisted(() => ({
  analyze: vi.fn<(image: ImageData) => Promise<AnalysisResult>>(),
  finish: vi.fn<() => Promise<Record<string, never>>>(),
  dispose: vi.fn(),
}));

vi.mock("../analyzer/wasmFaceAnalyzer", () => ({
  WasmFaceAnalyzer: class {
    initialize(): Promise<void> {
      return Promise.resolve();
    }

    startSession(): Promise<void> {
      return Promise.resolve();
    }

    endSession(): Promise<void> {
      return Promise.resolve();
    }

    resetSession(): Promise<void> {
      return Promise.resolve();
    }

    close(): Promise<void> {
      return Promise.resolve();
    }

    createProcessor() {
      return processor;
    }

    getSessionId(): Promise<string> {
      return Promise.resolve("session-id");
    }

    getTraceId(): Promise<string> {
      return Promise.resolve("trace-id");
    }

    getSessionNumber(): Promise<number> {
      return Promise.resolve(1);
    }

    ping(): Promise<void> {
      return Promise.resolve();
    }

    sendPinglets(): Promise<void> {
      return Promise.resolve();
    }
  },
}));

function okResult(image: ImageData, overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    feedback: "OK",
    image,
    arrayBuffer: image.data.buffer,
    landmarks: sampleLandmarks,
    isCaptureComplete: true,
    ...overrides,
  };
}

function transferArrayBuffer(buffer: ArrayBuffer): ArrayBuffer {
  const transferredBuffer = buffer.slice(0);
  const channel = new MessageChannel();

  channel.port1.postMessage(buffer, [buffer]);
  channel.port1.close();
  channel.port2.close();

  return transferredBuffer;
}

const engineFrames = {
  captureFrame: {
    data: new Uint8Array([1, 2, 3]).buffer,
    mimeType: "image/jpeg" as const,
    frameNumber: 42,
    captureTimeMs: 1234,
  },
  livenessFrames: [
    {
      data: new Uint8Array([4, 5, 6]).buffer,
      mimeType: "image/qoi" as const,
      frameNumber: 43,
      captureTimeMs: 1250,
      timestamp: "2026-06-16T10:00:00.000Z",
    },
  ],
};

describe("BiometricsCapture", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    processor.analyze.mockReset();
    processor.finish.mockReset().mockResolvedValue({});
    processor.dispose.mockReset();

    let nowMs = 0;
    vi.spyOn(performance, "now").mockImplementation(() => {
      nowMs += 1000;

      return nowMs;
    });

    processor.analyze.mockImplementation((image) => Promise.resolve(okResult(image)));
  });

  const createCaptureClient = (config: Partial<CaptureConfig> = {}) =>
    createBiometricsCapture({
      licenseKey: "test-license",
      ...config,
    });

  const createCapture = async (config: Partial<CaptureConfig> = {}) => {
    const client = await createCaptureClient(config);

    return client.startSession();
  };

  const startSingleCapture = (
    capture: BiometricsCaptureSession,
    config: Parameters<BiometricsCaptureSession["capture"]>[0] = {},
  ) =>
    capture.capture({
      quality: { captureMode: "single" },
      initialDelayMs: 0,
      ...config,
    });

  const useControllableCaptureTime = () => {
    vi.useFakeTimers();

    let nowMs = 0;
    vi.spyOn(performance, "now").mockImplementation(() => nowMs);

    return async (durationMs: number) => {
      nowMs += durationMs;
      await vi.advanceTimersByTimeAsync(durationMs);
    };
  };

  it("forwards the WASM variant to analyzer initialization", async () => {
    const initialize = vi.spyOn(WasmFaceAnalyzer.prototype, "initialize");

    await createCapture({ wasmVariant: "simd-threads" });

    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({
        wasmVariant: "simd-threads",
      }),
    );
  });

  it("forwards download progress callbacks to analyzer initialization", async () => {
    const initialize = vi.spyOn(WasmFaceAnalyzer.prototype, "initialize");
    const onDownloadProgress = vi.fn();

    await createCapture({ onDownloadProgress });

    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({
        onDownloadProgress,
      }),
    );
  });

  it("does not complete a closed capture when processing finishes late", async () => {
    let resolveCompletion!: (completion: Record<string, never>) => void;
    const completion = new Promise<Record<string, never>>((resolve) => {
      resolveCompletion = resolve;
    });
    let notifyFinishing!: () => void;
    const finishing = new Promise<void>((resolve) => {
      notifyFinishing = resolve;
    });
    processor.finish.mockImplementation(() => {
      notifyFinishing();

      return completion;
    });

    const capture = await createCapture();
    const onCapture = vi.fn();
    const result = capture.capture({ initialDelayMs: 0, onCapture });
    const frame = capture.processFrame(new ImageData(2, 2));
    await finishing;

    const rejected = expect(result).rejects.toThrow("Capture session was closed");
    const closed = capture.close();
    resolveCompletion({});
    await Promise.all([rejected, closed, frame]);

    expect(processor.dispose).toHaveBeenCalledOnce();
    expect(onCapture).not.toHaveBeenCalled();
  });

  it("normalizes initialization failures and cleans up partial resources", async () => {
    const setupError = new Error("setup failed");
    const close = vi.spyOn(WasmFaceAnalyzer.prototype, "close").mockResolvedValue(undefined);
    vi.spyOn(WasmFaceAnalyzer.prototype, "initialize").mockRejectedValueOnce(setupError);
    const diagnostics: { status: string; errorCode?: string }[] = [];

    await expect(
      createCapture({
        onDiagnostic: (event) => diagnostics.push(event),
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_ERROR",
      stage: "initialization",
      component: "sdk",
      cause: setupError,
    });

    expect(close).toHaveBeenCalledOnce();
    expect(diagnostics).toEqual([
      expect.objectContaining({ status: "started" }),
      expect.objectContaining({
        status: "failed",
        errorCode: "INTERNAL_ERROR",
      }),
    ]);
  });

  it("rejects and cleans up when complete initialization exceeds its deadline", async () => {
    vi.useFakeTimers();
    const close = vi.spyOn(WasmFaceAnalyzer.prototype, "close").mockResolvedValue(undefined);
    vi.spyOn(WasmFaceAnalyzer.prototype, "initialize").mockReturnValueOnce(new Promise(() => undefined));
    const diagnostics: { status: string; errorCode?: string }[] = [];

    const creation = createCapture({
      initializationTimeoutMs: 100,
      onDiagnostic: (event) => diagnostics.push(event),
    });
    const rejection = expect(creation).rejects.toMatchObject({
      code: "INITIALIZATION_TIMEOUT",
      stage: "initialization",
      component: "sdk",
      isRetryable: true,
    });

    await vi.advanceTimersByTimeAsync(100);

    await rejection;

    expect(close).toHaveBeenCalledWith(0);
    expect(diagnostics).toEqual([
      expect.objectContaining({ status: "started" }),
      expect.objectContaining({
        status: "timed-out",
        errorCode: "INITIALIZATION_TIMEOUT",
      }),
    ]);
  });

  it("defaults capture mode to engineFrames", async () => {
    processor.analyze.mockResolvedValue(okResult(new ImageData(2, 2), { engineFrames }));

    const capture = await createCapture();

    const resultPromise = capture.capture({ quality: {}, initialDelayMs: 0 });

    await capture.processFrame(new ImageData(2, 2));
    const result = await resultPromise;

    expect(result.captureFrame?.frameNumber).toBe(42);
    expect(result.livenessFrames.map((frame) => frame.frameNumber)).toEqual([43]);
  });

  it("keeps engine frames out of single-mode results", async () => {
    processor.analyze.mockResolvedValue(okResult(new ImageData(2, 2), { engineFrames }));

    const capture = await createCapture();

    const resultPromise = startSingleCapture(capture);

    await capture.processFrame(new ImageData(2, 2));
    const result = await resultPromise;

    expect(result.captureFrame).toBeUndefined();
    expect(result.livenessFrames).toEqual([]);
  });

  it("rejects when native session creation fails", async () => {
    vi.spyOn(WasmFaceAnalyzer.prototype, "startSession").mockRejectedValueOnce(new Error("session start failed"));

    const capture = await createCaptureClient();

    await expect(capture.startSession()).rejects.toThrow("session start failed");
  });

  it("rejects an incomplete native correlation context", async () => {
    vi.spyOn(WasmFaceAnalyzer.prototype, "getTraceId").mockResolvedValueOnce(undefined);
    const endSession = vi.spyOn(WasmFaceAnalyzer.prototype, "endSession");
    const capture = await createCaptureClient();

    await expect(capture.startSession()).rejects.toMatchObject({ code: "WASM_SESSION_ERROR" });
    expect(endSession).toHaveBeenCalledOnce();
  });

  it("creates a new native identity for each sequential capture session", async () => {
    const startSession = vi.spyOn(WasmFaceAnalyzer.prototype, "startSession");
    const endSession = vi.spyOn(WasmFaceAnalyzer.prototype, "endSession");
    vi.spyOn(WasmFaceAnalyzer.prototype, "getSessionId")
      .mockResolvedValueOnce("session-a")
      .mockResolvedValueOnce("session-b");
    vi.spyOn(WasmFaceAnalyzer.prototype, "getSessionNumber").mockResolvedValueOnce(7).mockResolvedValueOnce(8);
    const capture = await createCaptureClient();

    const first = await capture.startSession();
    await first.close();
    const second = await capture.startSession();

    expect(first.context).toEqual({ sessionId: "session-a", traceId: "trace-id", sessionNumber: 7 });
    expect(second.context).toEqual({ sessionId: "session-b", traceId: "trace-id", sessionNumber: 8 });
    expect(startSession).toHaveBeenCalledTimes(2);
    expect(endSession).toHaveBeenCalledOnce();

    await second.close();
    expect(endSession).toHaveBeenCalledTimes(2);
  });

  it("closes the active native session when the capture client closes", async () => {
    const endSession = vi.spyOn(WasmFaceAnalyzer.prototype, "endSession");
    const closeAnalyzer = vi.spyOn(WasmFaceAnalyzer.prototype, "close");
    const capture = await createCaptureClient();
    const session = await capture.startSession();

    await capture.close();

    expect(endSession).toHaveBeenCalledOnce();
    expect(closeAnalyzer).toHaveBeenCalledOnce();
    expect(() => session.capture({})).toThrow("Capture session is closed");
  });

  it("closes the native session when capture setup fails", async () => {
    const endSession = vi.spyOn(WasmFaceAnalyzer.prototype, "endSession");
    const capture = await createCapture();

    await expect(capture.capture({ timeoutMs: 0 })).rejects.toMatchObject({
      code: "INVALID_CONFIGURATION",
      isRetryable: false,
    });

    expect(processor.dispose).toHaveBeenCalledOnce();
    expect(endSession).toHaveBeenCalledOnce();
    expect(() => capture.capture({})).toThrow("Capture session is closed");
  });

  it("rejects when closed during pending session startup", async () => {
    let resolveSessionId: ((sessionId: string) => void) | undefined;
    const getSessionId = vi.spyOn(WasmFaceAnalyzer.prototype, "getSessionId").mockImplementationOnce(
      () =>
        new Promise<string>((resolve) => {
          resolveSessionId = resolve;
        }),
    );
    const endSession = vi.spyOn(WasmFaceAnalyzer.prototype, "endSession");

    const capture = await createCaptureClient();

    const sessionPromise = capture.startSession();
    const rejection = expect(sessionPromise).rejects.toMatchObject({ code: "NOT_CONFIGURED" });
    await vi.waitFor(() => expect(getSessionId).toHaveBeenCalledOnce());
    const closing = capture.close();

    resolveSessionId?.("session-id");
    await rejection;
    await closing;

    expect(endSession).toHaveBeenCalledOnce();
  });

  it("returns frames unchanged when no capture is active", async () => {
    const capture = await createCapture();

    const frame = new ImageData(2, 2);

    expect(await capture.processFrame(frame)).toBe(frame.data.buffer);
  });

  it("throws when starting a second capture while one is running", async () => {
    const capture = await createCapture();

    const first = startSingleCapture(capture);

    expect(() => startSingleCapture(capture)).toThrow("Capture session is already running");

    await capture.processFrame(new ImageData(2, 2));
    await first;
  });

  it("preserves analysis errors when the error callback throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    processor.analyze.mockImplementationOnce(() => {
      throw new Error("analysis failed");
    });

    const capture = await createCapture();

    const resultPromise = startSingleCapture(capture, {
      onError: () => {
        throw new Error("callback failed");
      },
    });

    await capture.processFrame(new ImageData(2, 2));

    await expect(resultPromise).rejects.toThrow("analysis failed");

    expect(capture.getState().error?.message).toBe("analysis failed");
  });

  it("still resolves when feedback and capture callbacks throw", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const capture = await createCapture();

    const resultPromise = startSingleCapture(capture, {
      onFeedbackChange: () => {
        throw new Error("feedback callback failed");
      },
      onCapture: () => {
        throw new Error("capture callback failed");
      },
    });

    await capture.processFrame(new ImageData(2, 2));
    await expect(resultPromise).resolves.toBeDefined();
  });

  it("stops subscription updates after unsubscribe", async () => {
    const capture = await createCapture();

    const listener = vi.fn();
    const unsubscribe = capture.subscribe((state) => state.sessionState, listener);

    const resultPromise = startSingleCapture(capture);
    expect(listener).toHaveBeenCalledOnce();

    unsubscribe();

    await capture.processFrame(new ImageData(2, 2));
    await resultPromise;

    expect(listener).toHaveBeenCalledOnce();
  });

  it("waits for native completion before resolving", async () => {
    const incompleteImage = new ImageData(2, 2);
    const completedImage = new ImageData(2, 2);

    processor.analyze
      .mockResolvedValueOnce(okResult(incompleteImage, { isCaptureComplete: false }))
      .mockResolvedValueOnce(okResult(completedImage));

    const capture = await createCapture();

    const resultPromise = startSingleCapture(capture);
    const onSettled = vi.fn();
    void resultPromise.then(onSettled, onSettled);

    await capture.processFrame(new ImageData(2, 2));
    await Promise.resolve();

    expect(capture.getState().sessionState).toBe("CAPTURING");
    expect(onSettled).not.toHaveBeenCalled();

    await capture.processFrame(new ImageData(2, 2));
    await expect(resultPromise).resolves.toMatchObject({
      bestImage: { image: completedImage },
    });
  });

  it("emits analysis results in debug mode", async () => {
    const onAnalysisResult = vi.fn();

    const capture = await createCapture();

    const resultPromise = startSingleCapture(capture, {
      debugMode: true,
      onAnalysisResult,
    });

    await capture.processFrame(new ImageData(2, 2));
    await capture.processFrame(new ImageData(2, 2));
    await Promise.resolve();

    expect(onAnalysisResult).toHaveBeenCalledTimes(2);
    expect(processor.finish).not.toHaveBeenCalled();
    expect(onAnalysisResult).toHaveBeenCalledWith(
      expect.objectContaining({
        feedback: "OK",
        inputImageSize: { width: 2, height: 2 },
      }),
    );

    const rejection = expect(resultPromise).rejects.toThrow("Capture session was closed");

    await capture.close();
    await rejection;
  });

  it("returns busy frames without queuing them", async () => {
    let resolveFirstAnalysis: (() => void) | undefined;

    const analyzeFace = processor.analyze.mockImplementationOnce(
      (image) =>
        new Promise((resolve) => {
          resolveFirstAnalysis = () => resolve(okResult(image));
        }),
    );

    const capture = await createCapture();

    const resultPromise = startSingleCapture(capture, { debugMode: true });
    const firstFrame = new ImageData(2, 2);
    const busyFrame = new ImageData(3, 3);

    const firstFramePromise = capture.processFrame(firstFrame);

    expect(await capture.processFrame(busyFrame)).toBe(busyFrame.data.buffer);

    expect(analyzeFace).toHaveBeenCalledTimes(1);

    resolveFirstAnalysis?.();

    expect(await firstFramePromise).toBe(firstFrame.data.buffer);

    const rejection = expect(resultPromise).rejects.toThrow("Capture session was closed");

    await capture.close();
    await rejection;
  });

  it("replaces a detached frame buffer when worker transport fails", async () => {
    processor.analyze.mockImplementation((image) => {
      const inputBuffer = image.data.buffer;
      transferArrayBuffer(inputBuffer);

      return Promise.reject(new Error("worker transport failed"));
    });

    const capture = await createCapture();

    const resultPromise = startSingleCapture(capture);
    const frame = new ImageData(2, 2);
    const detachedBuffer = frame.data.buffer;

    const replacementBuffer = await capture.processFrame(frame);

    expect(detachedBuffer.byteLength).toBe(0);
    expect(replacementBuffer).not.toBe(detachedBuffer);
    expect(replacementBuffer.byteLength).toBe(16);

    await expect(resultPromise).rejects.toThrow("worker transport failed");
  });

  it("returns the worker buffer when native processing rejects structurally", async () => {
    let workerBuffer: ArrayBuffer | undefined;

    processor.analyze.mockImplementation((image) => {
      const inputBuffer = image.data.buffer;
      transferArrayBuffer(inputBuffer);
      workerBuffer = new ArrayBuffer(16);

      return Promise.reject(
        Object.assign(new Error("native processing failed"), {
          arrayBuffer: workerBuffer,
        }),
      );
    });

    const capture = await createCapture();

    const resultPromise = startSingleCapture(capture);

    expect(await capture.processFrame(new ImageData(2, 2))).toBe(workerBuffer);
    await expect(resultPromise).rejects.toThrow("native processing failed");
  });

  it("waits for terminal frame ownership before starting a retry", async () => {
    vi.useFakeTimers();

    let resolveAnalysis: (() => void) | undefined;
    let workerBuffer: ArrayBuffer | undefined;
    const events: string[] = [];
    const onAnalysisResult = vi.fn();
    const onFeedbackChange = vi.fn();
    const startSession = vi.spyOn(WasmFaceAnalyzer.prototype, "startSession");
    const resetSession = vi.spyOn(WasmFaceAnalyzer.prototype, "resetSession");

    processor.analyze.mockImplementationOnce((image) => {
      const inputBuffer = image.data.buffer;
      const transferredBuffer = transferArrayBuffer(inputBuffer);
      workerBuffer = transferredBuffer;

      return new Promise<void>((resolve) => {
        resolveAnalysis = () => resolve();
      }).then(() =>
        okResult(new ImageData(new Uint8ClampedArray(transferredBuffer), 2, 2), {
          arrayBuffer: transferredBuffer,
          isCaptureComplete: false,
        }),
      );
    });

    const capture = await createCapture();

    const resultPromise = startSingleCapture(capture, {
      timeoutMs: 100,
      onAnalysisResult,
      onFeedbackChange,
      onStateChange: (state) => events.push(`first:${state}`),
    });
    const framePromise = capture.processFrame(new ImageData(2, 2));
    const rejection = expect(resultPromise).rejects.toThrow("Capture timed out");

    await vi.advanceTimersByTimeAsync(100);
    await rejection;

    const retryResult = startSingleCapture(capture, {
      onStateChange: (state) => events.push(`second:${state}`),
    });

    expect(resetSession).not.toHaveBeenCalled();

    resolveAnalysis?.();

    expect(await framePromise).toBe(workerBuffer);
    await vi.waitFor(() => expect(resetSession).toHaveBeenCalledOnce());

    expect(onAnalysisResult).not.toHaveBeenCalled();
    expect(onFeedbackChange).not.toHaveBeenCalled();
    expect(events.slice(-2)).toEqual(["first:IDLE", "second:ANALYZING"]);
    expect(startSession).toHaveBeenCalledOnce();

    await capture.processFrame(new ImageData(2, 2));
    await expect(retryResult).resolves.toBeDefined();

    await capture.close();
  });

  it("serializes capture requests made from terminal callbacks", async () => {
    const capture = await createCapture();
    let retryResult!: ReturnType<BiometricsCaptureSession["capture"]>;
    let conflictingError: unknown;
    let publishedState: string | undefined;

    const firstResult = startSingleCapture(capture, {
      onStateChange: (state) => {
        if (state === "COMPLETE") {
          publishedState = capture.getState().sessionState;
          retryResult = startSingleCapture(capture);
        }
      },
      onCapture: () => {
        try {
          void startSingleCapture(capture).catch(() => undefined);
        } catch (error) {
          conflictingError = error;
        }
      },
    });

    await capture.processFrame(new ImageData(2, 2));
    await expect(firstResult).resolves.toBeDefined();
    await Promise.resolve();

    expect(publishedState).toBe("COMPLETE");
    expect(conflictingError).toMatchObject({ code: "SESSION_ALREADY_ACTIVE" });

    await capture.processFrame(new ImageData(2, 2));
    await expect(retryResult).resolves.toBeDefined();
  });

  it("keeps the native session alive after a retryable timeout", async () => {
    vi.useFakeTimers();

    let resolveEndSession: (() => void) | undefined;

    const endSession = vi.spyOn(WasmFaceAnalyzer.prototype, "endSession").mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveEndSession = resolve;
        }),
    );

    const capture = await createCapture();

    const resultPromise = capture.capture({ timeoutMs: 100 });
    const capturedError = resultPromise.catch((error: unknown) => error);

    await vi.advanceTimersByTimeAsync(100);

    await expect(capturedError).resolves.toMatchObject({
      message: "Capture timed out",
    });
    expect(endSession).not.toHaveBeenCalled();

    const closing = capture.close();
    await vi.waitFor(() => expect(endSession).toHaveBeenCalledOnce());
    resolveEndSession?.();
    await closing;

    vi.useRealTimers();
  });

  it("preserves the remaining timeout budget while paused", async () => {
    const advanceCaptureTime = useControllableCaptureTime();
    const onTimeout = vi.fn();
    const capture = await createCapture();
    const resultPromise = capture.capture({ timeoutMs: 100, onTimeout });
    const rejection = expect(resultPromise).rejects.toThrow("Capture timed out");

    await vi.advanceTimersByTimeAsync(0);
    await advanceCaptureTime(40);

    capture.setCaptureTimeoutPaused(true);
    capture.setCaptureTimeoutPaused(true);

    await advanceCaptureTime(5_000);

    capture.setCaptureTimeoutPaused(false);
    capture.setCaptureTimeoutPaused(false);

    await advanceCaptureTime(59);

    expect(capture.getState().sessionState).toBe("ANALYZING");
    expect(onTimeout).not.toHaveBeenCalled();

    await advanceCaptureTime(1);
    await rejection;

    expect(onTimeout).toHaveBeenCalledOnce();
    expect(capture.getState().sessionState).toBe("TIMEOUT");
  });

  it("accumulates active time across repeated timeout pauses", async () => {
    const advanceCaptureTime = useControllableCaptureTime();
    const capture = await createCapture();
    const resultPromise = capture.capture({ timeoutMs: 100 });
    const rejection = expect(resultPromise).rejects.toThrow("Capture timed out");

    await vi.advanceTimersByTimeAsync(0);
    await advanceCaptureTime(20);
    capture.setCaptureTimeoutPaused(true);
    await advanceCaptureTime(500);
    capture.setCaptureTimeoutPaused(false);
    await advanceCaptureTime(30);
    capture.setCaptureTimeoutPaused(true);
    await advanceCaptureTime(1_000);
    capture.setCaptureTimeoutPaused(false);
    await advanceCaptureTime(49);

    expect(capture.getState().sessionState).toBe("ANALYZING");

    await advanceCaptureTime(1);
    await rejection;
  });

  it("times out after the default duration", async () => {
    const advanceCaptureTime = useControllableCaptureTime();
    const onTimeout = vi.fn();
    const capture = await createCapture();
    const resultPromise = capture.capture({ onTimeout });
    const rejection = expect(resultPromise).rejects.toThrow("Capture timed out");

    await vi.advanceTimersByTimeAsync(0);
    await advanceCaptureTime(59_999);

    expect(onTimeout).not.toHaveBeenCalled();

    await advanceCaptureTime(1);
    await rejection;

    expect(onTimeout).toHaveBeenCalledOnce();
    expect(processor.dispose).toHaveBeenCalledOnce();
  });

  it("can run without a timeout", async () => {
    const advanceCaptureTime = useControllableCaptureTime();
    const onTimeout = vi.fn();
    const capture = await createCapture();
    const resultPromise = capture.capture({ timeoutMs: null, onTimeout });

    await vi.advanceTimersByTimeAsync(0);
    await advanceCaptureTime(120_000);

    expect(onTimeout).not.toHaveBeenCalled();

    const rejection = expect(resultPromise).rejects.toThrow("Capture session was closed");
    await capture.close();
    await rejection;
  });

  it("does not rearm a completed capture timeout", async () => {
    const advanceCaptureTime = useControllableCaptureTime();
    const onTimeout = vi.fn();
    const capture = await createCapture();
    const resultPromise = startSingleCapture(capture, {
      timeoutMs: 100,
      onTimeout,
    });

    await vi.advanceTimersByTimeAsync(0);
    await advanceCaptureTime(40);
    capture.setCaptureTimeoutPaused(true);
    await capture.processFrame(new ImageData(2, 2));
    await resultPromise;

    capture.setCaptureTimeoutPaused(false);
    await advanceCaptureTime(100);

    expect(onTimeout).not.toHaveBeenCalled();
    expect(capture.getState().sessionState).toBe("COMPLETE");
  });

  it("does not rearm a failed capture timeout", async () => {
    const advanceCaptureTime = useControllableCaptureTime();
    const onTimeout = vi.fn();

    processor.analyze.mockRejectedValueOnce(new Error("analysis failed"));

    const capture = await createCapture();
    const resultPromise = startSingleCapture(capture, {
      timeoutMs: 100,
      onTimeout,
    });
    const rejection = expect(resultPromise).rejects.toThrow("analysis failed");

    await vi.advanceTimersByTimeAsync(0);
    await advanceCaptureTime(40);
    capture.setCaptureTimeoutPaused(true);
    await capture.processFrame(new ImageData(2, 2));
    await rejection;

    capture.setCaptureTimeoutPaused(false);
    await advanceCaptureTime(100);

    expect(onTimeout).not.toHaveBeenCalled();
    expect(capture.getState().sessionState).toBe("ERROR");
  });

  it("does not rearm a closed capture timeout", async () => {
    const advanceCaptureTime = useControllableCaptureTime();
    const onTimeout = vi.fn();
    const capture = await createCapture();
    const resultPromise = capture.capture({ timeoutMs: 100, onTimeout });
    const rejection = expect(resultPromise).rejects.toThrow("Capture session was closed");

    await vi.advanceTimersByTimeAsync(0);
    await advanceCaptureTime(40);
    capture.setCaptureTimeoutPaused(true);
    await capture.close();
    await rejection;

    capture.setCaptureTimeoutPaused(false);
    await advanceCaptureTime(100);

    expect(onTimeout).not.toHaveBeenCalled();
  });

  it("gives each retry its full timeout budget", async () => {
    const advanceCaptureTime = useControllableCaptureTime();
    const capture = await createCapture();
    const firstResult = capture.capture({ timeoutMs: 100 });
    const firstRejection = expect(firstResult).rejects.toThrow("Capture timed out");

    await vi.advanceTimersByTimeAsync(0);
    await advanceCaptureTime(100);
    await firstRejection;

    const secondResult = capture.capture({ timeoutMs: 100 });
    const secondRejection = expect(secondResult).rejects.toThrow("Capture timed out");

    await vi.advanceTimersByTimeAsync(0);
    await advanceCaptureTime(99);

    expect(capture.getState().sessionState).toBe("ANALYZING");

    await advanceCaptureTime(1);
    await secondRejection;
  });

  it("keeps the first terminal image stable across a second capture", async () => {
    const capture = await createCapture();

    const firstResultPromise = startSingleCapture(capture);
    const firstFrame = new ImageData(new Uint8ClampedArray(16).fill(17), 2, 2);
    const firstBuffer = firstFrame.data.buffer;

    const firstReplacement = await capture.processFrame(firstFrame);
    const firstResult = await firstResultPromise;

    const firstBytes = Array.from(firstResult.bestImage.image.data);

    expect(firstResult.bestImage.image.data.buffer).toBe(firstBuffer);
    expect(firstReplacement).not.toBe(firstBuffer);

    const secondResultPromise = startSingleCapture(capture);
    await Promise.resolve();
    await Promise.resolve();

    const secondReplacement = await capture.processFrame(new ImageData(new Uint8ClampedArray(16).fill(34), 2, 2));
    const secondResult = await secondResultPromise;

    new Uint8Array(firstReplacement).fill(51);
    new Uint8Array(secondReplacement).fill(68);
    secondResult.bestImage.image.data.fill(85);
    expect(Array.from(firstResult.bestImage.image.data)).toEqual(firstBytes);
  });

  it("returns worker ownership when close occurs during an active call", async () => {
    vi.useFakeTimers();
    let resolveAnalysis: (() => void) | undefined;

    const onTimeout = vi.fn();

    processor.analyze.mockImplementation((image) => {
      const inputBuffer = image.data.buffer;
      const workerBuffer = transferArrayBuffer(inputBuffer);

      return new Promise<void>((resolve) => {
        resolveAnalysis = () => resolve();
      }).then(() =>
        okResult(new ImageData(new Uint8ClampedArray(workerBuffer), 2, 2), {
          arrayBuffer: workerBuffer,
          isCaptureComplete: false,
        }),
      );
    });

    const capture = await createCapture();

    const resultPromise = startSingleCapture(capture, {
      timeoutMs: 100,
      onTimeout,
    });
    const framePromise = capture.processFrame(new ImageData(2, 2));
    const rejection = expect(resultPromise).rejects.toThrow("Capture session was closed");

    const closing = capture.close();
    await vi.advanceTimersByTimeAsync(100);

    expect(onTimeout).not.toHaveBeenCalled();

    resolveAnalysis?.();

    expect((await framePromise).byteLength).toBe(16);
    await rejection;
    await closing;

    vi.useRealTimers();
  });

  it("prevents capture completion before initial delay elapses", async () => {
    let nowMs = 0;
    vi.spyOn(performance, "now").mockImplementation(() => nowMs);

    const onCapture = vi.fn();

    const capture = await createCapture();

    const resultPromise = startSingleCapture(capture, {
      initialDelayMs: 500,
      onCapture,
    });

    nowMs = 100;
    const delayedFrame = new ImageData(2, 2);

    expect(await capture.processFrame(delayedFrame)).toBe(delayedFrame.data.buffer);

    expect(onCapture).not.toHaveBeenCalled();

    nowMs = 600;

    await capture.processFrame(new ImageData(2, 2));

    const result = await resultPromise;

    expect(onCapture).toHaveBeenCalledWith(result);
  });
});
