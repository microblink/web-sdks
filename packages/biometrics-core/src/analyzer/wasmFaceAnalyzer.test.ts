/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { BiometricsError, type FaceLandmarks } from "@microblink/biometrics-common";
import {
  ImageDataError,
  InputError,
  NativeFaceFeedback,
  NativeFrameStatus,
  type ResetResultPayload,
  SessionError as WasmSessionError,
} from "@microblink/biometrics-wasm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createCaptureInitializationContext } from "../initialization";
import type { BiometricsProcessResultWithBuffer } from "./biometricsWorkerClient";

const createBiometricsWorkerProxyMock = vi.hoisted(() => vi.fn());
const proxyMock = vi.hoisted(() => vi.fn((value: unknown) => ({ proxied: value })));
const resetSessionMock = vi.hoisted(() => vi.fn<() => Promise<ResetResultPayload>>());

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

vi.mock("./biometricsWorkerClient", () => ({
  createBiometricsWorkerProxy: createBiometricsWorkerProxyMock,
}));

vi.mock("comlink", () => ({
  proxy: proxyMock,
  transfer: (value: unknown) => value,
}));

import { WasmFaceAnalyzer } from "./wasmFaceAnalyzer";

const sampleLandmarks: FaceLandmarks = {
  LeftEye: { x: 0.2, y: 0.25 },
  RightEye: { x: 0.8, y: 0.25 },
  NoseTip: { x: 0.5, y: 0.45 },
  Mouth: { x: 0.5, y: 0.7 },
  LeftEar: { x: 0.1, y: 0.3 },
  RightEar: { x: 0.9, y: 0.3 },
};

function processOk(status: NativeFrameStatus, arrayBuffer = new ArrayBuffer(16)): BiometricsProcessResultWithBuffer {
  return {
    status,
    feedback: NativeFaceFeedback.Ok,
    error: null,
    arrayBuffer,
  };
}

async function createInitializedAnalyzer(
  config?: ConstructorParameters<typeof WasmFaceAnalyzer>[0],
  imageOrigin: "canvas2d" | "webgl" = "canvas2d",
) {
  const analyzer = new WasmFaceAnalyzer(config);

  await analyzer.initialize({
    resourcePath: "https://example.test/resources",
    imageOrigin,
  });

  return analyzer;
}

describe("WasmFaceAnalyzer", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.clearAllMocks();

    resetSessionMock.mockResolvedValue({ error: null });
    createBiometricsWorkerProxyMock.mockResolvedValue({
      remote: {
        init: vi.fn().mockResolvedValue(undefined),
        startSession: vi.fn().mockResolvedValue(undefined),
        endSession: vi.fn().mockResolvedValue(undefined),
        process: vi.fn().mockResolvedValue(processOk(NativeFrameStatus.Continue)),
        getSessionId: vi.fn().mockResolvedValue("session-id"),
        getTraceId: vi.fn().mockResolvedValue("trace-id"),
        getSessionNumber: vi.fn().mockResolvedValue(1),
        getWasmVariant: vi.fn().mockResolvedValue("simd"),
        reset: resetSessionMock,
        ping: vi.fn().mockResolvedValue(undefined),
        sendPinglets: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
      },
      terminate: vi.fn(),
    });
  });

  it("forwards the WASM variant to the worker", async () => {
    const workerBundle = await createBiometricsWorkerProxyMock();
    const analyzer = new WasmFaceAnalyzer();

    createBiometricsWorkerProxyMock.mockResolvedValue(workerBundle);

    await analyzer.initialize({
      resourcePath: "https://example.test/resources",
      wasmVariant: "simd-threads",
      imageOrigin: "canvas2d",
    });

    expect(workerBundle.remote.init).toHaveBeenCalledWith(
      expect.objectContaining({
        wasmVariant: "simd-threads",
      }),
      undefined,
    );
  });

  it("proxies download progress callbacks into worker init", async () => {
    const workerBundle = await createBiometricsWorkerProxyMock();
    const onDownloadProgress = vi.fn();
    const analyzer = new WasmFaceAnalyzer();

    createBiometricsWorkerProxyMock.mockResolvedValue(workerBundle);

    await analyzer.initialize({
      resourcePath: "https://example.test/resources",
      imageOrigin: "canvas2d",
      onDownloadProgress,
    });

    expect(proxyMock).toHaveBeenCalledWith(onDownloadProgress);
    expect(workerBundle.remote.init).toHaveBeenCalledWith(expect.any(Object), { proxied: onDownloadProgress });
  });

  it("surfaces native reset failures", async () => {
    const analyzer = await createInitializedAnalyzer();

    await analyzer.startSession();
    resetSessionMock.mockResolvedValueOnce({ error: WasmSessionError.Internal });

    await expect(analyzer.resetSession()).rejects.toMatchObject({
      code: "WASM_SESSION_ERROR",
      component: "wasm",
      isRetryable: false,
    });
    expect(resetSessionMock).toHaveBeenCalledOnce();
  });

  it("emits ordered component diagnostics during initialization", async () => {
    const diagnostics: { component: string; status: string }[] = [];
    const analyzer = new WasmFaceAnalyzer();

    await analyzer.initialize({
      resourcePath: "https://example.test/resources",
      imageOrigin: "canvas2d",
      initializationContext: createCaptureInitializationContext(60_000, (event) => diagnostics.push(event)),
    });

    expect(diagnostics).toEqual([
      expect.objectContaining({ component: "worker", status: "started" }),
      expect.objectContaining({ component: "worker", status: "completed" }),
      expect.objectContaining({
        component: "wasm-resources",
        status: "started",
      }),
      expect.objectContaining({
        component: "wasm-resources",
        status: "completed",
      }),
    ]);
  });

  it("terminates a partially initialized worker after WASM setup fails", async () => {
    const workerBundle = await createBiometricsWorkerProxyMock();

    const setupError = new Error("WASM setup failed");

    // oxlint-disable-next-line typescript/no-unsafe-call
    workerBundle.remote.init.mockRejectedValue(setupError);
    createBiometricsWorkerProxyMock.mockResolvedValue(workerBundle);

    const analyzer = new WasmFaceAnalyzer();

    await expect(
      analyzer.initialize({
        resourcePath: "https://example.test/resources",
        imageOrigin: "canvas2d",
      }),
    ).rejects.toMatchObject({
      code: "WASM_LOAD_FAILED",
      stage: "initialization",
      component: "wasm",
      cause: setupError,
    });

    expect(workerBundle.remote.close).toHaveBeenCalledOnce();
    expect(workerBundle.terminate).toHaveBeenCalledOnce();
  });

  it("reports the resolved WASM resource when automatic setup fails", async () => {
    const diagnostics: unknown[] = [];
    const workerBundle = await createBiometricsWorkerProxyMock();

    // oxlint-disable-next-line typescript/no-unsafe-call
    workerBundle.remote.getWasmVariant.mockResolvedValue("simd-threads");
    // oxlint-disable-next-line typescript/no-unsafe-call
    workerBundle.remote.init.mockRejectedValue(new Error("WASM setup failed"));
    createBiometricsWorkerProxyMock.mockResolvedValue(workerBundle);

    await expect(
      new WasmFaceAnalyzer().initialize({
        resourcePath: "https://example.test/resources",
        imageOrigin: "canvas2d",
        initializationContext: createCaptureInitializationContext(60_000, (event) => diagnostics.push(event)),
      }),
    ).rejects.toMatchObject({ code: "WASM_LOAD_FAILED" });

    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        component: "wasm-resources",
        status: "failed",
        resource: {
          kind: "biometrics-wasm-script",
          url: "https://example.test/resources/simd-threads/biometrics-wasm.js",
        },
      }),
    );
  });

  it("terminates a worker bundle created after close invalidates initialization", async () => {
    const workerBundle = await createBiometricsWorkerProxyMock();
    const workerCreation = deferred<typeof workerBundle>();
    const analyzer = new WasmFaceAnalyzer();

    createBiometricsWorkerProxyMock.mockClear();
    createBiometricsWorkerProxyMock.mockReturnValue(workerCreation.promise);

    const initialization = analyzer.initialize({
      resourcePath: "https://example.test/resources",
      imageOrigin: "canvas2d",
    });

    await vi.waitFor(() => expect(createBiometricsWorkerProxyMock).toHaveBeenCalledOnce());
    await analyzer.close();
    workerCreation.resolve(workerBundle);

    await expect(initialization).rejects.toMatchObject({
      code: "SESSION_CLOSED",
      stage: "initialization",
      component: "worker",
    });
    expect(workerBundle.remote.close).not.toHaveBeenCalled();
    expect(workerBundle.terminate).toHaveBeenCalledOnce();
  });

  it("terminates a worker bundle created after its initialization step times out", async () => {
    vi.useFakeTimers();

    const workerBundle = await createBiometricsWorkerProxyMock();
    const workerCreation = deferred<typeof workerBundle>();
    const analyzer = new WasmFaceAnalyzer();

    createBiometricsWorkerProxyMock.mockClear();
    createBiometricsWorkerProxyMock.mockReturnValue(workerCreation.promise);

    const initialization = analyzer.initialize({
      resourcePath: "https://example.test/resources",
      imageOrigin: "canvas2d",
      initializationContext: createCaptureInitializationContext(100),
    });

    const rejection = expect(initialization).rejects.toMatchObject({ code: "WORKER_START_TIMEOUT" });

    await vi.advanceTimersByTimeAsync(100);
    await rejection;
    workerCreation.resolve(workerBundle);

    await vi.waitFor(() => expect(workerBundle.terminate).toHaveBeenCalledOnce());
  });

  it("does not query the closed worker after initialization is invalidated", async () => {
    const workerBundle = await createBiometricsWorkerProxyMock();
    const remoteInitialization = deferred<void>();
    const analyzer = new WasmFaceAnalyzer();

    // oxlint-disable-next-line typescript/no-unsafe-call
    workerBundle.remote.init.mockReturnValue(remoteInitialization.promise);
    // oxlint-disable-next-line typescript/no-unsafe-call
    workerBundle.remote.getWasmVariant.mockReturnValue(new Promise(() => undefined));
    createBiometricsWorkerProxyMock.mockResolvedValue(workerBundle);

    const initialization = analyzer.initialize({
      resourcePath: "https://example.test/resources",
      imageOrigin: "canvas2d",
    });

    await vi.waitFor(() => expect(workerBundle.remote.init).toHaveBeenCalledOnce());
    await analyzer.close();
    remoteInitialization.reject(new Error("Worker connection closed"));

    await expect(initialization).rejects.toMatchObject({
      code: "SESSION_CLOSED",
      stage: "initialization",
      component: "worker",
    });
    expect(workerBundle.remote.getWasmVariant).not.toHaveBeenCalled();
    expect(workerBundle.terminate).toHaveBeenCalledOnce();
  });

  it("keeps the worker bundle stable while frame processing waits for the session", async () => {
    const workerBundle = await createBiometricsWorkerProxyMock();
    const session = deferred<void>();
    const processError = new Error("remote process failed");

    // oxlint-disable-next-line typescript/no-unsafe-call
    workerBundle.remote.startSession.mockReturnValue(session.promise);
    // oxlint-disable-next-line typescript/no-unsafe-call
    workerBundle.remote.process.mockRejectedValue(processError);
    createBiometricsWorkerProxyMock.mockResolvedValue(workerBundle);
    const analyzer = await createInitializedAnalyzer();
    const sessionStart = analyzer.startSession();
    const analysis = analyzer.createProcessor({ mode: "engineFrames" }).analyze(new ImageData(2, 2));

    expect(workerBundle.remote.process).not.toHaveBeenCalled();
    await analyzer.close();
    session.resolve();

    await sessionStart;
    await expect(analysis).rejects.toBe(processError);
    expect(workerBundle.remote.process).toHaveBeenCalledOnce();
  });

  it("hard-terminates when graceful worker close does not settle", async () => {
    vi.useFakeTimers();

    const workerBundle = await createBiometricsWorkerProxyMock();

    // oxlint-disable-next-line typescript/no-unsafe-call
    workerBundle.remote.close.mockReturnValue(new Promise(() => undefined));
    createBiometricsWorkerProxyMock.mockResolvedValue(workerBundle);

    const analyzer = await createInitializedAnalyzer();

    const close = analyzer.close(100);
    await vi.advanceTimersByTimeAsync(100);
    await close;

    expect(workerBundle.terminate).toHaveBeenCalledOnce();
  });

  it("sends face-missing frames to WASM", async () => {
    const workerBundle = await createBiometricsWorkerProxyMock();
    const image = new ImageData(2, 2);

    createBiometricsWorkerProxyMock.mockResolvedValue(workerBundle);
    // oxlint-disable-next-line typescript/no-unsafe-call
    workerBundle.remote.process.mockResolvedValue({
      status: NativeFrameStatus.Continue,
      feedback: NativeFaceFeedback.FaceNotFound,
      error: null,
      arrayBuffer: new ArrayBuffer(16),
    } satisfies BiometricsProcessResultWithBuffer);

    const analyzer = await createInitializedAnalyzer();
    const result = await analyzer.createProcessor({ mode: "engineFrames" }).analyze(image);

    expect(result.feedback).toBe("FACE_NOT_FOUND");
    expect(workerBundle.remote.process).toHaveBeenCalledWith(
      expect.objectContaining({ width: 2, height: 2 }),
      undefined,
      undefined,
    );
  });

  it("processes frames without external landmarks and maps native geometry", async () => {
    const workerBundle = await createBiometricsWorkerProxyMock();

    // oxlint-disable-next-line typescript/no-unsafe-call
    workerBundle.remote.process.mockResolvedValue({
      status: NativeFrameStatus.Continue,
      feedback: NativeFaceFeedback.Ok,
      error: null,
      landmarks: {
        eyeLeft: { x: 0.2, y: 0.25 },
        eyeRight: { x: 0.8, y: 0.25 },
        earLeft: { x: 0.1, y: 0.3 },
        earRight: { x: 0.9, y: 0.3 },
        noseTip: { x: 0.5, y: 0.45 },
        mouthCenter: { x: 0.5, y: 0.7 },
      },
      boundingBox: {
        topLeft: { x: 20, y: 10 },
        bottomRight: { x: 180, y: 90 },
      },
      arrayBuffer: new ArrayBuffer(200 * 100 * 4),
    } satisfies BiometricsProcessResultWithBuffer);
    createBiometricsWorkerProxyMock.mockResolvedValue(workerBundle);

    const analyzer = await createInitializedAnalyzer({
      faceAnalysis: { maximumInputLongEdge: 200, maximumInputShortEdge: 100 },
    });
    const result = await analyzer.createProcessor({ mode: "engineFrames" }).analyze(new ImageData(200, 100));

    expect(workerBundle.remote.process).toHaveBeenCalledWith(
      expect.objectContaining({ width: 200, height: 100 }),
      undefined,
      undefined,
    );
    expect(result.landmarks).toEqual(sampleLandmarks);
    expect(result.boundingBox).toEqual({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
  });

  it("maps native multiple-face feedback", async () => {
    const workerBundle = await createBiometricsWorkerProxyMock();

    // oxlint-disable-next-line typescript/no-unsafe-call
    workerBundle.remote.process.mockResolvedValue({
      status: NativeFrameStatus.Continue,
      feedback: NativeFaceFeedback.TooManyFaces,
      error: null,
      arrayBuffer: new ArrayBuffer(16),
    } satisfies BiometricsProcessResultWithBuffer);
    createBiometricsWorkerProxyMock.mockResolvedValue(workerBundle);

    const analyzer = await createInitializedAnalyzer();
    const result = await analyzer.createProcessor({ mode: "engineFrames" }).analyze(new ImageData(2, 2));

    expect(result.feedback).toBe("MULTIPLE_FACES");
  });

  it("flips WebGL frames for native processing and restores the returned image", async () => {
    const workerBundle = await createBiometricsWorkerProxyMock();
    let processedBytes: number[] = [];

    // oxlint-disable-next-line typescript/no-unsafe-call
    workerBundle.remote.process.mockImplementation((image: ImageData) => {
      processedBytes = [...image.data];

      return Promise.resolve({
        status: NativeFrameStatus.Continue,
        feedback: NativeFaceFeedback.Ok,
        error: null,
        arrayBuffer: image.data.buffer,
      } satisfies BiometricsProcessResultWithBuffer);
    });
    createBiometricsWorkerProxyMock.mockResolvedValue(workerBundle);

    const image = new ImageData(new Uint8ClampedArray([1, 2, 3, 4, 5, 6, 7, 8]), 1, 2);
    const analyzer = await createInitializedAnalyzer(undefined, "webgl");
    const result = await analyzer.createProcessor({ mode: "engineFrames" }).analyze(image);

    expect(processedBytes).toEqual([5, 6, 7, 8, 1, 2, 3, 4]);
    expect([...result.image.data]).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("propagates native processing failures", async () => {
    const workerBundle = await createBiometricsWorkerProxyMock();
    const processError = new Error("Native face processing failed");

    // oxlint-disable-next-line typescript/no-unsafe-call
    workerBundle.remote.process.mockRejectedValue(processError);
    createBiometricsWorkerProxyMock.mockResolvedValue(workerBundle);

    const analyzer = await createInitializedAnalyzer();

    await expect(analyzer.createProcessor({ mode: "engineFrames" }).analyze(new ImageData(2, 2))).rejects.toBe(
      processError,
    );
  });

  it("accepts both orientations within the reserved edges", async () => {
    const workerBundle = await createBiometricsWorkerProxyMock();
    createBiometricsWorkerProxyMock.mockResolvedValue(workerBundle);
    const analyzer = await createInitializedAnalyzer({
      faceAnalysis: { maximumInputLongEdge: 3, maximumInputShortEdge: 2 },
    });
    const processor = analyzer.createProcessor({ mode: "engineFrames" });

    await processor.analyze(new ImageData(3, 2));
    await processor.analyze(new ImageData(2, 3));

    expect(workerBundle.remote.process).toHaveBeenCalledTimes(2);
  });

  it.each([
    { width: 4, height: 2 },
    { width: 3, height: 3 },
  ])("rejects frames outside the reserved edges ($width x $height)", async ({ width, height }) => {
    const workerBundle = await createBiometricsWorkerProxyMock();
    createBiometricsWorkerProxyMock.mockResolvedValue(workerBundle);
    const analyzer = await createInitializedAnalyzer({
      faceAnalysis: { maximumInputLongEdge: 3, maximumInputShortEdge: 2 },
    });

    await expect(
      analyzer.createProcessor({ mode: "engineFrames" }).analyze(new ImageData(width, height)),
    ).rejects.toThrow("exceeds the reserved 3x2 long-edge/short-edge limits");
    expect(workerBundle.remote.process).not.toHaveBeenCalled();
  });

  it("exposes capture and liveness frames from a native success payload", async () => {
    const captureBytes = new Uint8Array([1, 2, 3]).buffer;
    const livenessBytes = new Uint8Array([4, 5, 6]).buffer;
    const signatureBytes = new Uint8Array([7, 8, 9]).buffer;

    const workerBundle = await createBiometricsWorkerProxyMock();

    // oxlint-disable-next-line typescript/no-unsafe-call
    workerBundle.remote.process.mockResolvedValue({
      status: NativeFrameStatus.Done,
      feedback: NativeFaceFeedback.Ok,
      error: null,
      success: {
        captureFrame: {
          data: captureBytes,
          mimeType: "image/jpeg",
          frameNumber: 10,
          captureTimeMs: 1000,
          signature: signatureBytes,
        },
        livenessFrames: [
          {
            data: livenessBytes,
            mimeType: "image/qoi",
            frameNumber: 11,
            captureTimeMs: 1016,
          },
        ],
      },
      arrayBuffer: new ArrayBuffer(16),
    } satisfies BiometricsProcessResultWithBuffer);
    createBiometricsWorkerProxyMock.mockResolvedValue(workerBundle);
    const analyzer = await createInitializedAnalyzer();
    const result = await analyzer.createProcessor({ mode: "engineFrames" }).analyze(new ImageData(2, 2));

    expect(result.isCaptureComplete).toBe(true);
    expect(result.engineFrames?.captureFrame?.data).toBe(captureBytes);
    expect(result.engineFrames?.captureFrame?.signature?.signature).toBe(signatureBytes);
    expect(result.engineFrames?.livenessFrames[0]?.data).toBe(livenessBytes);
  });

  it("maps image-data errors to TOO_BLURRY feedback", async () => {
    const workerBundle = await createBiometricsWorkerProxyMock();

    // oxlint-disable-next-line typescript/no-unsafe-call
    workerBundle.remote.process.mockResolvedValue({
      status: -1,
      error: { kind: "image", code: ImageDataError.InvalidDimensions },
      arrayBuffer: new ArrayBuffer(16),
    } satisfies BiometricsProcessResultWithBuffer);
    createBiometricsWorkerProxyMock.mockResolvedValue(workerBundle);
    const analyzer = await createInitializedAnalyzer();
    const result = await analyzer.createProcessor({ mode: "engineFrames" }).analyze(new ImageData(2, 2));

    expect(result.feedback).toBe("TOO_BLURRY");
    expect(result.isCaptureComplete).toBe(false);
  });

  it.each([
    {
      name: "session",
      error: { kind: "session" as const, code: WasmSessionError.Internal },
      code: "WASM_SESSION_ERROR",
    },
    {
      name: "input",
      error: { kind: "input" as const, code: InputError.InvalidLandmarks },
      code: "WASM_INPUT_ERROR",
    },
  ])("surfaces $name process errors as SessionError", async ({ error, code }) => {
    const workerBundle = await createBiometricsWorkerProxyMock();
    const returnedBuffer = new ArrayBuffer(16);

    // oxlint-disable-next-line typescript/no-unsafe-call
    workerBundle.remote.process.mockResolvedValue({
      status: -1,
      error,
      arrayBuffer: returnedBuffer,
    } satisfies BiometricsProcessResultWithBuffer);

    createBiometricsWorkerProxyMock.mockResolvedValue(workerBundle);
    const analyzer = await createInitializedAnalyzer();

    await expect(analyzer.createProcessor({ mode: "engineFrames" }).analyze(new ImageData(2, 2))).rejects.toMatchObject(
      {
        code,
        arrayBuffer: returnedBuffer,
      },
    );
  });

  it("treats Cancelled session errors as benign", async () => {
    const workerBundle = await createBiometricsWorkerProxyMock();

    // oxlint-disable-next-line typescript/no-unsafe-call
    workerBundle.remote.process.mockResolvedValue({
      status: -1,
      error: { kind: "session", code: WasmSessionError.Cancelled },
      arrayBuffer: new ArrayBuffer(16),
    } satisfies BiometricsProcessResultWithBuffer);
    createBiometricsWorkerProxyMock.mockResolvedValue(workerBundle);
    const analyzer = await createInitializedAnalyzer();
    const result = await analyzer.createProcessor({ mode: "engineFrames" }).analyze(new ImageData(2, 2));

    expect(result.feedback).toBe("OK");
  });
});
