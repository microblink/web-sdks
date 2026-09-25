/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { Ping } from "@microblink/analytics/ping";
import {
  BiometricsError,
  type BiometricsErrorCode,
  type BoundingBox,
  type CaptureSignature,
  type FaceLandmarks,
  type LivenessFrame,
  type CaptureFrame,
  type WasmVariant,
} from "@microblink/biometrics-common";
import type {
  FaceAnalysisSessionSettings,
  NativeBoundingBox,
  NativeFaceLandmarks,
  ProcessResultPayload,
  ResolvedFaceAnalysisSessionSettings,
  WasmSuccessPayload,
} from "@microblink/biometrics-wasm";
import {
  InputError as WasmInputError,
  NativeFrameStatus,
  resolveFaceAnalysisSessionSettings,
  SessionError as WasmSessionError,
} from "@microblink/biometrics-wasm";
import { createCaptureRuntime, type CaptureRuntime } from "@microblink/biometrics-wasm/browser";
import type { ProgressStatusCallback } from "@microblink/biometrics-worker";
import { proxy } from "comlink";

import { SessionError } from "../error";
import {
  createCaptureInitializationContext,
  DEFAULT_INITIALIZATION_TIMEOUT_MS,
  remainingInitializationMs,
  runInitializationStep,
  type CaptureInitializationContext,
} from "../initialization";
import {
  BIOMETRICS_WASM_RESOURCES,
  resolveCaptureResourceBaseUrl,
  resolveBiometricsWorkerScriptUrl,
  resolveRuntimeResourceUrl,
} from "../resources/resourceManifest";
import { createBiometricsWorkerProxy } from "./biometricsWorkerClient";
import type { UnifiedFeedback } from "./feedback";
import { mapNativeFeedbackToFeedback } from "./wasmQualityMapping";

/** Result of a single frame analysis. */
export type AnalysisResult = {
  feedback: UnifiedFeedback;
  landmarks?: FaceLandmarks;
  boundingBox?: BoundingBox;
  image: ImageData;
  arrayBuffer: ArrayBuffer;
  isCaptureComplete: boolean;
  engineFrames?: {
    captureFrame: CaptureFrame;
    livenessFrames: LivenessFrame[];
    livenessBatchSignature?: CaptureSignature;
  };
};

export type CaptureAnalyzerInitConfig = {
  resourcePath?: string;
  imageOrigin?: "canvas2d" | "webgl";
  wasmVariant?: WasmVariant;
  faceAnalysis?: FaceAnalysisSessionSettings;
  initializationContext?: CaptureInitializationContext;
  onDownloadProgress?: ProgressStatusCallback;
};

export type WasmFaceAnalyzerConfig = {
  faceAnalysis?: FaceAnalysisSessionSettings;
  licenseKey?: string;
  userId?: string;
  pingProxyUrl?: string;
};

export type CaptureProcessor = {
  analyze(image: ImageData): Promise<AnalysisResult>;
  finish: CaptureRuntime["finish"];
  dispose: CaptureRuntime["dispose"];
};

type WorkerBundle = Awaited<ReturnType<typeof createBiometricsWorkerProxy>>;

type AnalyzerInitializationAttempt = {
  invalidated: boolean;
  bundle?: WorkerBundle;
  terminatedBundle?: WorkerBundle;
};

function mapNativeLandmarks(landmarks: NativeFaceLandmarks | null | undefined): FaceLandmarks | undefined {
  if (!landmarks) {
    return undefined;
  }

  return {
    LeftEye: landmarks.eyeLeft,
    RightEye: landmarks.eyeRight,
    LeftEar: landmarks.earLeft,
    RightEar: landmarks.earRight,
    NoseTip: landmarks.noseTip,
    Mouth: landmarks.mouthCenter,
  };
}

function mapNativeBoundingBox(
  boundingBox: NativeBoundingBox | null | undefined,
  frameWidth: number,
  frameHeight: number,
): BoundingBox | undefined {
  if (!boundingBox) {
    return undefined;
  }

  return {
    x: boundingBox.topLeft.x / frameWidth,
    y: boundingBox.topLeft.y / frameHeight,
    width: (boundingBox.bottomRight.x - boundingBox.topLeft.x) / frameWidth,
    height: (boundingBox.bottomRight.y - boundingBox.topLeft.y) / frameHeight,
  };
}

function flipImageVerticallyInPlace(data: Uint8ClampedArray, width: number, height: number): void {
  const bytesPerRow = width * 4;
  const row = new Uint8ClampedArray(bytesPerRow);

  for (let top = 0, bottom = height - 1; top < bottom; top++, bottom--) {
    const topOffset = top * bytesPerRow;
    const bottomOffset = bottom * bytesPerRow;
    row.set(data.subarray(topOffset, topOffset + bytesPerRow));
    data.copyWithin(topOffset, bottomOffset, bottomOffset + bytesPerRow);
    data.set(row, bottomOffset);
  }
}

function mapProcessErrorToFeedback(
  processResult: ProcessResultPayload,
  arrayBuffer: ArrayBuffer,
): UnifiedFeedback | null {
  const error = processResult.error;

  if (!error) {
    return null;
  }

  if (error.kind === "image") {
    return "TOO_BLURRY";
  }

  if (error.kind === "input") {
    throw new FrameProcessingError(
      `Biometrics WASM input error (${WasmInputError[error.code] ?? String(error.code)})`,
      "WASM_INPUT_ERROR",
      arrayBuffer,
    );
  }

  switch (error.code) {
    case WasmSessionError.Cancelled:
      return null;
    case WasmSessionError.NotInitialized:
      throw new FrameProcessingError("Biometrics WASM session is not initialized", "NOT_CONFIGURED", arrayBuffer);
    case WasmSessionError.Internal:
    case WasmSessionError.Unknown:
    default:
      throw new FrameProcessingError(
        `Biometrics WASM session error (code=${String(error.code)})`,
        "WASM_SESSION_ERROR",
        arrayBuffer,
        { isRetryable: true },
      );
  }
}

class FrameProcessingError extends SessionError {
  readonly #arrayBuffer: ArrayBuffer;

  constructor(
    message: string,
    code: BiometricsErrorCode,
    arrayBuffer: ArrayBuffer,
    options?: { isRetryable?: boolean },
  ) {
    super(message, code, options);
    this.#arrayBuffer = arrayBuffer;
  }

  get arrayBuffer(): ArrayBuffer {
    return this.#arrayBuffer;
  }
}

function mapCaptureSignature(signature: ArrayBuffer | undefined): CaptureSignature | undefined {
  if (!signature) {
    return undefined;
  }

  return {
    signature,
    algorithm: "engine",
  };
}

function mapCaptureFrame(frame: WasmSuccessPayload["captureFrame"]): CaptureFrame {
  return {
    data: frame.data,
    mimeType: "image/jpeg",
    frameNumber: frame.frameNumber,
    captureTimeMs: frame.captureTimeMs,
    signature: mapCaptureSignature(frame.signature),
  };
}

function mapLivenessFrames(frames: NonNullable<WasmSuccessPayload["livenessFrames"]> | undefined): LivenessFrame[] {
  return (frames ?? []).map((frame) => ({
    data: frame.data,
    mimeType: "image/qoi",
    frameNumber: frame.frameNumber,
    captureTimeMs: frame.captureTimeMs,
    timestamp: new Date().toISOString(),
    signature: mapCaptureSignature(frame.signature),
    imgQuality: frame.imgQuality,
  }));
}

function mapEngineFrames(success: WasmSuccessPayload | undefined): AnalysisResult["engineFrames"] | undefined {
  if (!success) {
    return undefined;
  }

  return {
    captureFrame: mapCaptureFrame(success.captureFrame),
    livenessFrames: mapLivenessFrames(success.livenessFrames),
    livenessBatchSignature: mapCaptureSignature(success.livenessBatchSignature),
  };
}

export class WasmFaceAnalyzer {
  private worker?: WorkerBundle;
  private faceAnalysis?: FaceAnalysisSessionSettings;
  private resolvedSessionSettings: ResolvedFaceAnalysisSessionSettings;
  private imageOrigin: CaptureAnalyzerInitConfig["imageOrigin"] = "canvas2d";
  private readonly licenseKey?: string;
  private readonly userId?: string;
  private readonly pingProxyUrl?: string;
  private sessionReady?: Promise<void>;
  private initializationAttempt?: AnalyzerInitializationAttempt;

  constructor(config: WasmFaceAnalyzerConfig = {}) {
    this.faceAnalysis = config.faceAnalysis;
    this.resolvedSessionSettings = resolveFaceAnalysisSessionSettings();
    this.licenseKey = config.licenseKey;
    this.userId = config.userId;
    this.pingProxyUrl = config.pingProxyUrl;
  }

  async initialize(config: CaptureAnalyzerInitConfig): Promise<void> {
    const attempt: AnalyzerInitializationAttempt = { invalidated: false };
    this.initializationAttempt = attempt;
    this.faceAnalysis = config.faceAnalysis ?? this.faceAnalysis;
    this.resolvedSessionSettings = resolveFaceAnalysisSessionSettings(this.faceAnalysis);
    this.imageOrigin = config.imageOrigin ?? "canvas2d";
    const resourceBase = resolveCaptureResourceBaseUrl(config.resourcePath);
    const initializationContext =
      config.initializationContext ?? createCaptureInitializationContext(DEFAULT_INITIALIZATION_TIMEOUT_MS);

    try {
      if (attempt.invalidated || this.initializationAttempt !== attempt) {
        throw this.#closedInitializationError();
      }

      const bundle = await runInitializationStep(
        initializationContext,
        {
          diagnosticComponent: "worker",
          errorComponent: "worker",
          failureCode: "WORKER_LOAD_FAILED",
          timeoutCode: "WORKER_START_TIMEOUT",
          resource: {
            kind: "worker-script",
            url: resolveBiometricsWorkerScriptUrl(resourceBase),
          },
        },
        () => {
          const creation = createBiometricsWorkerProxy(resourceBase, {
            timeoutMs: remainingInitializationMs(initializationContext),
          });

          void creation.then(
            (createdBundle) => {
              if (attempt.invalidated || this.initializationAttempt !== attempt) {
                attempt.terminatedBundle = createdBundle;
                createdBundle.terminate();
              }
            },
            () => undefined,
          );

          return creation;
        },
      );

      if (attempt.invalidated || this.initializationAttempt !== attempt) {
        if (attempt.terminatedBundle !== bundle) {
          bundle.terminate();
        }

        throw this.#closedInitializationError();
      }

      attempt.bundle = bundle;

      const wasmInitializationStep = {
        diagnosticComponent: "wasm-resources" as const,
        errorComponent: "wasm" as const,
        failureCode: "WASM_LOAD_FAILED" as const,
        resource:
          config.wasmVariant === undefined
            ? undefined
            : {
                kind: "biometrics-wasm-script" as const,
                url: resolveRuntimeResourceUrl(resourceBase, BIOMETRICS_WASM_RESOURCES[config.wasmVariant].script.path),
              },
      };

      let remoteInitializationError: unknown;

      try {
        await runInitializationStep(initializationContext, wasmInitializationStep, async () => {
          try {
            await bundle.remote.init(
              {
                resourceUrl: resourceBase,
                licenseKey: this.licenseKey ?? "",
                userId: this.userId ?? "",
                pingProxyUrl: this.pingProxyUrl,
                wasmVariant: config.wasmVariant,
                settings: this.faceAnalysis,
              },
              config.onDownloadProgress ? proxy(config.onDownloadProgress) : undefined,
            );
          } catch (error) {
            if (error instanceof BiometricsError && error.code === "SESSION_CLOSED") {
              remoteInitializationError = error;
              throw error;
            }

            if (attempt.invalidated || this.initializationAttempt !== attempt) {
              remoteInitializationError = this.#closedInitializationError();
              throw remoteInitializationError;
            }

            const wasmVariant = await bundle.remote.getWasmVariant().catch(() => undefined);

            if (wasmVariant !== undefined) {
              wasmInitializationStep.resource = {
                kind: "biometrics-wasm-script",
                url: resolveRuntimeResourceUrl(resourceBase, BIOMETRICS_WASM_RESOURCES[wasmVariant].script.path),
              };
            }

            throw error;
          }
        });
      } catch (error) {
        throw remoteInitializationError ?? error;
      }

      if (attempt.invalidated || this.initializationAttempt !== attempt) {
        throw this.#closedInitializationError();
      }

      attempt.bundle = undefined;
      this.worker = bundle;
      this.initializationAttempt = undefined;
    } catch (error) {
      if (this.initializationAttempt === attempt) {
        this.initializationAttempt = undefined;
      }

      const bundle = attempt.bundle;
      attempt.bundle = undefined;
      attempt.invalidated = true;

      if (bundle) {
        await this.#closeBundle(bundle, 5_000).catch((cleanupError) => {
          console.warn("Failed to close Biometrics worker after initialization failure:", cleanupError);
        });
      }

      throw error;
    }
  }

  async startSession(settings?: FaceAnalysisSessionSettings): Promise<void> {
    if (!this.worker) {
      throw new SessionError("Biometrics WASM worker is not initialized", "NOT_CONFIGURED");
    }

    this.resolvedSessionSettings = resolveFaceAnalysisSessionSettings(
      settings,
      resolveFaceAnalysisSessionSettings(this.faceAnalysis),
    );
    this.sessionReady = this.worker.remote.startSession(settings);

    await this.sessionReady;
  }

  async endSession(): Promise<void> {
    try {
      await this.worker?.remote.endSession();
    } catch (error) {
      console.warn("Failed to end Biometrics analytics session:", error);
    } finally {
      this.sessionReady = undefined;
    }
  }

  async resetSession(): Promise<void> {
    if (!this.worker) {
      throw new SessionError("Biometrics WASM worker is not initialized", "NOT_CONFIGURED");
    }

    await this.sessionReady;

    const result = await this.worker.remote.reset();

    if (result.error !== null) {
      throw new SessionError(
        `Biometrics WASM session reset failed (${WasmSessionError[result.error] ?? String(result.error)})`,
        "WASM_SESSION_ERROR",
        { component: "wasm" },
      );
    }
  }

  /**
   * Returns the session UUID from the underlying Biometrics WASM session. Resolves to `undefined` before `initialize()`
   * has completed.
   */
  async getSessionId(): Promise<string | undefined> {
    return this.worker?.remote.getSessionId();
  }

  /**
   * Returns the Ping trace identifier from the underlying Biometrics WASM module. Resolves to `undefined` before
   * `initialize()` has completed.
   */
  async getTraceId(): Promise<string | undefined> {
    return this.worker?.remote.getTraceId();
  }

  /**
   * Returns the monotonic session number for analytics correlation. Resolves to `undefined` before `initialize()` has
   * completed.
   */
  async getSessionNumber(): Promise<number | undefined> {
    return this.worker?.remote.getSessionNumber();
  }

  async ping(pinglet: Ping): Promise<void> {
    try {
      await this.worker?.remote.ping(pinglet);
    } catch (error) {
      console.warn("Failed to report Biometrics pinglet:", error);
    }
  }

  async sendPinglets(): Promise<void> {
    try {
      await this.worker?.remote.sendPinglets();
    } catch (error) {
      console.warn("Failed to send Biometrics pinglets:", error);
    }
  }

  async close(gracefulTimeoutMs = 5_000): Promise<void> {
    const attempt = this.initializationAttempt;

    if (attempt) {
      attempt.invalidated = true;
    }

    const bundle = this.worker ?? attempt?.bundle;

    this.worker = undefined;
    this.sessionReady = undefined;
    this.initializationAttempt = undefined;

    if (attempt) {
      attempt.bundle = undefined;
    }

    if (bundle) {
      await this.#closeBundle(bundle, gracefulTimeoutMs);
    }
  }

  createProcessor(options: {
    source?: { video: HTMLVideoElement; track: MediaStreamTrack };
    mode: "single" | "engineFrames";
  }): CaptureProcessor {
    const bundle = this.worker;

    if (!bundle) {
      throw new SessionError("Biometrics WASM worker is not initialized", "NOT_CONFIGURED");
    }

    const ready = this.sessionReady;
    const runtime = createCaptureRuntime({ ...options, transport: bundle.remote });

    return {
      analyze: (image) => this.#analyzeFace(image, runtime, ready),
      finish: () => runtime.finish(),
      dispose: () => runtime.dispose(),
    };
  }

  async #analyzeFace(image: ImageData, runtime: CaptureRuntime, ready?: Promise<void>): Promise<AnalysisResult> {
    const { maximumInputLongEdge, maximumInputShortEdge } = this.resolvedSessionSettings;
    const inputLongEdge = Math.max(image.width, image.height);
    const inputShortEdge = Math.min(image.width, image.height);

    if (inputLongEdge > maximumInputLongEdge || inputShortEdge > maximumInputShortEdge) {
      throw new FrameProcessingError(
        `Input frame ${image.width}x${image.height} exceeds the reserved ${maximumInputLongEdge}x${maximumInputShortEdge} long-edge/short-edge limits`,
        "WASM_INPUT_ERROR",
        image.data.buffer,
      );
    }

    await ready;

    const { width, height, colorSpace } = image;
    if (this.imageOrigin === "webgl") {
      flipImageVerticallyInPlace(image.data, width, height);
    }

    return runtime.process(image).then(({ arrayBuffer, ...processResult }) => {
      const data = new Uint8ClampedArray(arrayBuffer);

      if (this.imageOrigin === "webgl") {
        flipImageVerticallyInPlace(data, width, height);
      }

      const errorFeedback = mapProcessErrorToFeedback(processResult, arrayBuffer);
      const feedback =
        errorFeedback ?? mapNativeFeedbackToFeedback(processResult.error ? undefined : processResult.feedback) ?? "OK";
      const isCaptureComplete = !processResult.error && processResult.status === NativeFrameStatus.Done;

      return {
        image: new ImageData(data, width, height, { colorSpace }),
        arrayBuffer,
        feedback,
        landmarks: processResult.error ? undefined : mapNativeLandmarks(processResult.landmarks),
        boundingBox: processResult.error ? undefined : mapNativeBoundingBox(processResult.boundingBox, width, height),
        isCaptureComplete,
        engineFrames: mapEngineFrames(processResult.error ? undefined : processResult.success),
      };
    });
  }

  #closedInitializationError(): SessionError {
    return new SessionError("Biometrics WASM worker was closed during initialization", "SESSION_CLOSED", {
      stage: "initialization",
      component: "worker",
    });
  }

  async #closeBundle(bundle: WorkerBundle, gracefulTimeoutMs: number): Promise<void> {
    let closeTimeoutId: ReturnType<typeof setTimeout> | undefined;

    try {
      await Promise.race([
        bundle.remote.close(gracefulTimeoutMs),
        new Promise<void>((resolve) => {
          closeTimeoutId = setTimeout(resolve, gracefulTimeoutMs);
        }),
      ]);
    } finally {
      if (closeTimeoutId !== undefined) {
        clearTimeout(closeTimeoutId);
      }

      bundle.terminate();
    }
  }
}
