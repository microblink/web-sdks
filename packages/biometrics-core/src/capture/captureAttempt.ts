/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import {
  BiometricsError,
  normalizeBiometricsError,
  type FaceCaptureResult,
  type Logger,
} from "@microblink/biometrics-common";
import { FeedbackStabilizer } from "@microblink/feedback-stabilizer";

import type { UnifiedFeedback } from "../analyzer/feedback";
import type { AnalysisResult } from "../analyzer/wasmFaceAnalyzer";
import type { CaptureProcessor } from "../analyzer/wasmFaceAnalyzer";
import { biometricsUiStateMap } from "../biometricsUiStateMap";
import { ConfigurationError, SessionError } from "../error";
import type { CaptureSessionState } from "../session/session";
import { createFaceCaptureResult } from "./captureResult";
import type { createCaptureStore } from "./captureStore";
import type { CaptureAnalysisResult, CaptureFaceConfig, CaptureMode, CaptureSessionContext } from "./captureTypes";

const DEFAULT_INITIAL_DELAY_MS = 1_000;
const DEFAULT_CAPTURE_TIMEOUT_MS = 60_000;
const INITIAL_FEEDBACK: UnifiedFeedback = "FACE_NOT_FOUND";

const ALLOWED_STATE_TRANSITIONS: Readonly<Record<CaptureSessionState, ReadonlySet<CaptureSessionState>>> = {
  IDLE: new Set(["ANALYZING", "ERROR"]),
  ANALYZING: new Set(["CAPTURING", "TIMEOUT", "ERROR"]),
  CAPTURING: new Set(["PROCESSING", "TIMEOUT", "ERROR"]),
  PROCESSING: new Set(["COMPLETE", "ERROR"]),
  COMPLETE: new Set(["IDLE", "ERROR"]),
  TIMEOUT: new Set(["IDLE", "ERROR"]),
  ERROR: new Set(["IDLE"]),
};

function resolveCaptureTimeout(timeoutMs: number | null | undefined): number {
  if (timeoutMs === null) {
    return 0;
  }

  const resolved = timeoutMs ?? DEFAULT_CAPTURE_TIMEOUT_MS;

  if (!Number.isFinite(resolved) || resolved <= 0) {
    throw new ConfigurationError("timeoutMs must be a positive finite number or null.", "INVALID_CONFIGURATION");
  }

  return resolved;
}

function isBufferAttached(buffer: ArrayBuffer): boolean {
  try {
    new Uint8Array(buffer);

    return true;
  } catch {
    return false;
  }
}

function getReturnedErrorBuffer(error: unknown): ArrayBuffer | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "arrayBuffer" in error &&
    error.arrayBuffer instanceof ArrayBuffer
  ) {
    return error.arrayBuffer;
  }

  return undefined;
}

type CaptureAttemptDependencies = {
  processor: CaptureProcessor;
  store: ReturnType<typeof createCaptureStore>;
  logger: Logger;
  context: CaptureSessionContext;
};

export class CaptureAttempt {
  readonly #processor: CaptureProcessor;
  readonly #store: ReturnType<typeof createCaptureStore>;
  readonly #logger: Logger;
  readonly #config: CaptureFaceConfig;
  readonly #context: CaptureSessionContext;
  readonly #feedbackStabilizer = new FeedbackStabilizer(biometricsUiStateMap, INITIAL_FEEDBACK, 2000, 0.94);

  #lastEmittedFeedbackKey: UnifiedFeedback = INITIAL_FEEDBACK;
  #captureStartedAtMs = 0;

  #captureTimeoutRemainingMs: number;
  #captureTimeoutStartedAtMs?: number;
  #captureTimeoutId: ReturnType<typeof setTimeout> | undefined;
  #isCaptureTimeoutPaused = false;
  #state: CaptureSessionState = "IDLE";
  #isRetired = false;
  #frameProcessingPromise?: Promise<ArrayBuffer>;

  #pendingCaptureResolver?: (result: FaceCaptureResult) => void;
  #pendingCaptureRejecter?: (error: BiometricsError) => void;
  constructor(config: CaptureFaceConfig, dependencies: CaptureAttemptDependencies) {
    this.#config = config;
    this.#context = dependencies.context;
    this.#processor = dependencies.processor;
    this.#store = dependencies.store;
    this.#logger = dependencies.logger;
    this.#captureTimeoutRemainingMs = resolveCaptureTimeout(config.timeoutMs);
  }

  public start(): Promise<FaceCaptureResult> {
    this.#feedbackStabilizer.reset();
    this.#lastEmittedFeedbackKey = INITIAL_FEEDBACK;
    this.#store.setState({
      feedback: INITIAL_FEEDBACK,
      analysisResult: undefined,
      error: undefined,
    });

    const resultPromise = new Promise<FaceCaptureResult>((resolve, reject) => {
      this.#pendingCaptureResolver = resolve;

      this.#pendingCaptureRejecter = (error: BiometricsError) => {
        reject(error);
      };
    });

    this.#captureStartedAtMs = performance.now();
    this.#setSessionState("ANALYZING");

    this.#logger.debug("Capture attempt started", {
      timeoutMs: this.#captureTimeoutRemainingMs,
      debugMode: this.#config.debugMode ?? false,
    });
    this.#scheduleCaptureTimeout();

    return resultPromise;
  }

  public processFrame(imageData: ImageData): Promise<ArrayBuffer> {
    const inputBuffer = imageData.data.buffer;

    if (this.#state !== "ANALYZING" && this.#state !== "CAPTURING") {
      return Promise.resolve(inputBuffer);
    }

    if (!this.#pendingCaptureResolver || !this.#pendingCaptureRejecter) {
      return Promise.resolve(inputBuffer);
    }

    const initialDelayMs = this.#config.initialDelayMs ?? DEFAULT_INITIAL_DELAY_MS;

    if (performance.now() - this.#captureStartedAtMs < initialDelayMs) {
      return Promise.resolve(inputBuffer);
    }

    if (this.#frameProcessingPromise) {
      return Promise.resolve(inputBuffer);
    }

    const frameProcessingPromise = this.#processFrame(imageData, inputBuffer).finally(() => {
      if (this.#frameProcessingPromise === frameProcessingPromise) {
        this.#frameProcessingPromise = undefined;
      }
    });
    this.#frameProcessingPromise = frameProcessingPromise;

    return frameProcessingPromise;
  }

  public cancel(error: BiometricsError): void | Promise<void> {
    this.#isRetired = true;
    this.#processor.dispose();
    this.#feedbackStabilizer.reset();
    this.#lastEmittedFeedbackKey = INITIAL_FEEDBACK;

    if (this.#pendingCaptureRejecter) {
      this.#pendingCaptureRejecter(error);
      this.#clearPendingCapture();
    }

    return this.#frameProcessingPromise?.then(() => undefined);
  }

  public setCaptureTimeoutPaused(paused: boolean): void {
    if (!this.#pendingCaptureRejecter || this.#isCaptureTimeoutPaused === paused) {
      return;
    }

    this.#isCaptureTimeoutPaused = paused;

    if (paused) {
      if (this.#captureTimeoutStartedAtMs !== undefined) {
        this.#captureTimeoutRemainingMs = Math.max(
          0,
          this.#captureTimeoutRemainingMs - (performance.now() - this.#captureTimeoutStartedAtMs),
        );
      }

      this.#clearCaptureTimeout();

      return;
    }

    this.#scheduleCaptureTimeout();
  }

  public releaseForSuccessor(): void | Promise<void> {
    if (this.#state === "ANALYZING" || this.#state === "CAPTURING" || this.#state === "PROCESSING") {
      throw new SessionError("Capture session is already running", "SESSION_ALREADY_ACTIVE");
    }

    if (this.#frameProcessingPromise) {
      return this.#frameProcessingPromise.then(() => this.#retireForSuccessor());
    }

    this.#retireForSuccessor();
  }

  async #processFrame(imageData: ImageData, inputBuffer: ArrayBuffer): Promise<ArrayBuffer> {
    const inputByteLength = inputBuffer.byteLength;

    let returnedBuffer: ArrayBuffer | undefined;

    try {
      const result = await this.#processor.analyze(imageData);

      returnedBuffer = result.arrayBuffer;

      if (!this.#pendingCaptureResolver || !this.#pendingCaptureRejecter) {
        return returnedBuffer;
      }

      if (this.#state !== "ANALYZING" && this.#state !== "CAPTURING") {
        return returnedBuffer;
      }

      this.#emitAnalysisResult(result);

      const stabilizedState = this.#feedbackStabilizer.getNewUiState(result.feedback);

      if (stabilizedState.key !== this.#lastEmittedFeedbackKey) {
        this.#lastEmittedFeedbackKey = stabilizedState.key;
        this.#store.setState({ feedback: stabilizedState.key });
        this.#invokeCallback(() => this.#config.onFeedbackChange?.(stabilizedState.key));
      }

      if (result.feedback !== "OK") {
        return returnedBuffer;
      }

      if (!result.landmarks) {
        throw new SessionError("Missing landmarks for capture candidate", "MISSING_LANDMARKS");
      }

      if (this.#state === "ANALYZING") {
        this.#logger.debug("Transitioning to CAPTURING");
        this.#setSessionState("CAPTURING");
      }

      if (!result.isCaptureComplete || this.#config.debugMode) {
        return returnedBuffer;
      }

      this.#setSessionState("PROCESSING");
      this.#clearCaptureTimeout();

      const captureMode = this.#getCaptureMode();
      const completion = await this.#processor.finish();

      if (!this.#pendingCaptureResolver || !this.#pendingCaptureRejecter) {
        return returnedBuffer;
      }

      const face = {
        ...createFaceCaptureResult(
          {
            image: result.image,
            landmarks: result.landmarks,
            boundingBox: result.boundingBox,
            engineFrames: captureMode === "engineFrames" ? result.engineFrames : undefined,
          },
          this.#context,
        ),
        ...completion,
      };

      const replacementBuffer = new ArrayBuffer(returnedBuffer.byteLength);
      const captureResolver = this.#pendingCaptureResolver;

      this.#logger.debug("Capture complete");
      this.#clearPendingCapture();
      this.#setSessionState("COMPLETE");
      this.#invokeCallback(() => this.#config.onCapture?.(face));
      captureResolver(face);

      return replacementBuffer;
    } catch (error) {
      this.#processor.dispose();
      const returnedErrorBuffer = getReturnedErrorBuffer(error);
      returnedBuffer ??= returnedErrorBuffer;
      const reusableBuffer =
        returnedBuffer && isBufferAttached(returnedBuffer)
          ? returnedBuffer
          : isBufferAttached(inputBuffer)
            ? inputBuffer
            : new ArrayBuffer(inputByteLength);

      if (!this.#pendingCaptureRejecter) {
        return reusableBuffer;
      }

      const captureRejecter = this.#pendingCaptureRejecter;

      const captureError = normalizeBiometricsError(error, {
        stage: "capture",
        component: "wasm",
        code: "FRAME_PROCESSING_FAILED",
        isRetryable: true,
      });

      this.#clearPendingCapture();
      this.#setSessionState("ERROR");
      this.#store.setState({ error: captureError });
      this.#invokeCallback(() => this.#config.onError?.(captureError));
      captureRejecter(captureError);

      return reusableBuffer;
    }
  }

  #emitAnalysisResult(result: AnalysisResult): void {
    const analysisResult: CaptureAnalysisResult = {
      feedback: result.feedback,
      landmarks: result.landmarks,
      boundingBox: result.boundingBox,
      inputImageSize: {
        width: result.image.width,
        height: result.image.height,
      },
    };

    this.#store.setState({ analysisResult });
    this.#invokeCallback(() => this.#config.onAnalysisResult?.(analysisResult));
  }

  #handleCaptureTimeout(): void {
    if (!this.#pendingCaptureRejecter) {
      return;
    }

    const captureRejecter = this.#pendingCaptureRejecter;

    this.#logger.debug("Capture timed out");
    this.#processor.dispose();
    this.#clearCaptureTimeout();

    const timeoutError: BiometricsError = new SessionError("Capture timed out", "CAPTURE_TIMEOUT", {
      isRetryable: true,
    });

    this.#clearPendingCapture();
    this.#setSessionState("TIMEOUT");
    this.#store.setState({ error: timeoutError });
    this.#invokeCallback(() => this.#config.onTimeout?.());

    captureRejecter(timeoutError);
  }

  #clearCaptureTimeout(): void {
    if (this.#captureTimeoutId !== undefined) {
      clearTimeout(this.#captureTimeoutId);
      this.#captureTimeoutId = undefined;
    }

    this.#captureTimeoutStartedAtMs = undefined;
  }

  #scheduleCaptureTimeout(): void {
    if (this.#config.timeoutMs === null) {
      return;
    }

    if (this.#isCaptureTimeoutPaused || !this.#pendingCaptureRejecter || this.#captureTimeoutId !== undefined) {
      return;
    }

    this.#captureTimeoutStartedAtMs = performance.now();
    this.#captureTimeoutId = setTimeout(() => {
      this.#handleCaptureTimeout();
    }, this.#captureTimeoutRemainingMs);
  }

  #clearPendingCapture(): void {
    this.#clearCaptureTimeout();
    this.#pendingCaptureResolver = undefined;
    this.#pendingCaptureRejecter = undefined;
  }

  #getCaptureMode(): CaptureMode {
    return this.#config.quality?.captureMode ?? "engineFrames";
  }

  #retireForSuccessor(): void {
    if (this.#isRetired) {
      return;
    }

    this.#isRetired = true;
    this.#processor.dispose();

    if (this.#state !== "IDLE") {
      this.#setSessionState("IDLE");
    }
  }

  #setSessionState(state: CaptureSessionState): void {
    if (state === this.#state) {
      return;
    }

    if (!ALLOWED_STATE_TRANSITIONS[this.#state].has(state)) {
      throw new SessionError(
        `Invalid capture session state transition: ${this.#state} -> ${state}`,
        "INVALID_STATE_TRANSITION",
      );
    }

    this.#state = state;
    this.#store.setState({ sessionState: state });
    this.#invokeCallback(() => this.#config.onStateChange?.(state));
  }

  #invokeCallback(callback: () => void): void {
    try {
      callback();
    } catch (error) {
      this.#logger.error("Callback failed", error);
    }
  }
}
