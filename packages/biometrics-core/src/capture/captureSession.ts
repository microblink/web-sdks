/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import {
  BiometricsError,
  createLogger,
  emitBiometricsDiagnostic,
  normalizeBiometricsError,
  type FaceCaptureResult,
  type Logger,
} from "@microblink/biometrics-common";

import type { WasmFaceAnalyzer } from "../analyzer/wasmFaceAnalyzer";
import { SessionError } from "../error";
import { CaptureAttempt } from "./captureAttempt";
import { createCaptureStore, getInitialCaptureStoreState, type CaptureStore } from "./captureStore";
import type {
  BiometricsCaptureSession,
  CaptureConfig,
  CaptureFaceConfig,
  CaptureSessionContext,
  CaptureSubscribe,
} from "./captureTypes";

type CaptureSessionDependencies = {
  analyzer: WasmFaceAnalyzer;
  config: CaptureConfig;
  context: CaptureSessionContext;
  onClose: () => void;
};

export class BiometricsCaptureSessionImpl implements BiometricsCaptureSession {
  readonly #analyzer: WasmFaceAnalyzer;
  readonly #config: CaptureConfig;
  readonly #logger: Logger;
  readonly #onClose: () => void;
  readonly #store = createCaptureStore();

  readonly context: CaptureSessionContext;
  readonly subscribe: CaptureSubscribe;
  readonly getState: () => CaptureStore;

  #activeAttempt?: CaptureAttempt;
  #isCaptureStartReserved = false;
  #closed = false;
  #closePromise?: Promise<void>;
  #cameraSource?: { video: HTMLVideoElement; track: MediaStreamTrack };

  constructor(dependencies: CaptureSessionDependencies) {
    const { analyzer, config, context, onClose } = dependencies;
    this.#analyzer = analyzer;
    this.#config = config;
    this.#logger = createLogger("BiometricsCaptureSession", config.logLevel ?? "warn");
    this.#onClose = onClose;
    this.context = context;
    this.subscribe = this.#store.subscribe;
    this.getState = this.#store.getState;
  }

  public capture(config: CaptureFaceConfig): Promise<FaceCaptureResult> {
    this.#ensureOpen();

    if (this.#isCaptureStartReserved) {
      throw new SessionError("Capture attempt is already running", "SESSION_ALREADY_ACTIVE");
    }

    this.#isCaptureStartReserved = true;

    let release: void | Promise<void>;

    try {
      release = this.#activeAttempt?.releaseForSuccessor();
    } catch (error) {
      this.#isCaptureStartReserved = false;
      throw error;
    }

    if (!this.#activeAttempt) {
      return this.#prepareCapture(config);
    }

    return Promise.resolve(release).then(
      () => this.#prepareCapture(config),
      (error: unknown) => {
        this.#isCaptureStartReserved = false;
        throw error;
      },
    );
  }

  async #prepareCapture(config: CaptureFaceConfig): Promise<FaceCaptureResult> {
    try {
      this.#ensureOpen();

      if (this.#activeAttempt) {
        await this.#analyzer.resetSession();
        this.#ensureOpen();
      }

      return this.#startCapture(config);
    } catch (error) {
      const normalized =
        error instanceof BiometricsError
          ? error
          : normalizeBiometricsError(error, {
              stage: "capture",
              component: "wasm",
              code: "WASM_SESSION_ERROR",
            });

      await this.close();
      throw normalized;
    } finally {
      this.#isCaptureStartReserved = false;
    }
  }

  #startCapture(config: CaptureFaceConfig): Promise<FaceCaptureResult> {
    const processor = this.#analyzer.createProcessor({
      source: this.#cameraSource,
      mode: config.quality?.captureMode ?? "engineFrames",
    });
    let result: Promise<FaceCaptureResult>;
    const startedAt = performance.now();

    try {
      this.#activeAttempt = new CaptureAttempt(config, {
        processor,
        store: this.#store,
        logger: this.#logger,
        context: this.context,
      });
      emitBiometricsDiagnostic(this.#config.onDiagnostic, {
        phase: "capture",
        component: "sdk",
        status: "started",
        timestamp: new Date().toISOString(),
      });
      result = this.#activeAttempt.start();
    } catch (error) {
      processor.dispose();
      throw error;
    }

    return result.then(
      (result) => {
        emitBiometricsDiagnostic(this.#config.onDiagnostic, {
          phase: "capture",
          component: "sdk",
          status: "completed",
          timestamp: new Date().toISOString(),
          durationMs: performance.now() - startedAt,
        });

        return result;
      },
      async (error: unknown) => {
        const normalized =
          error instanceof BiometricsError
            ? error
            : normalizeBiometricsError(error, {
                stage: "capture",
                component: "sdk",
              });
        emitBiometricsDiagnostic(this.#config.onDiagnostic, {
          phase: "capture",
          component: "sdk",
          status: normalized.code === "CAPTURE_TIMEOUT" ? "timed-out" : "failed",
          timestamp: new Date().toISOString(),
          durationMs: performance.now() - startedAt,
          errorCode: normalized.code,
        });

        if (!normalized.isRetryable) {
          await this.close();
        }

        throw normalized;
      },
    );
  }

  public processFrame(imageData: ImageData): Promise<ArrayBuffer> {
    if (this.#closed) {
      return Promise.resolve(imageData.data.buffer);
    }

    return this.#activeAttempt?.processFrame(imageData) ?? Promise.resolve(imageData.data.buffer);
  }

  public setCaptureTimeoutPaused(paused: boolean): void {
    this.#activeAttempt?.setCaptureTimeoutPaused(paused);
  }

  public setCameraSource(videoElement: HTMLVideoElement | undefined, track: MediaStreamTrack | undefined): void {
    this.#cameraSource = videoElement && track ? { video: videoElement, track } : undefined;
  }

  public close(): Promise<void> {
    this.#closePromise ??= this.#close();

    return this.#closePromise;
  }

  async #close(): Promise<void> {
    this.#closed = true;
    this.#isCaptureStartReserved = false;

    const release = this.#activeAttempt?.cancel(new SessionError("Capture session was closed", "SESSION_CLOSED"));

    try {
      await Promise.resolve(release).catch((error: unknown) => {
        this.#logger.warn("Capture attempt cleanup failed during session close", error);
      });
      await this.#analyzer.endSession();
    } finally {
      this.#activeAttempt = undefined;
      this.#store.setState(getInitialCaptureStoreState());
      this.#onClose();
    }
  }

  #ensureOpen(): void {
    if (this.#closed) {
      throw new SessionError("Capture session is closed", "SESSION_CLOSED");
    }
  }
}
