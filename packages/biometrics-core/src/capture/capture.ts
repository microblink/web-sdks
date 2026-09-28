/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { Ping } from "@microblink/analytics/ping";
import {
  BiometricsError,
  LicenseError,
  createLogger,
  emitBiometricsDiagnostic,
  normalizeBiometricsError,
  type Logger,
} from "@microblink/biometrics-common";
import { resolveFaceAnalysisSessionSettings } from "@microblink/biometrics-wasm";
import { getUserId } from "@microblink/core-common/getUserId";

import { WasmFaceAnalyzer } from "../analyzer/wasmFaceAnalyzer";
import { ConfigurationError, SessionError } from "../error";
import {
  createCaptureInitializationContext,
  enforceInitializationDeadline,
  isInitTimeoutCode,
  resolveInitializationTimeout,
} from "../initialization";
import { BiometricsCaptureSessionImpl } from "./captureSession";
import type {
  BiometricsCaptureClient,
  CaptureConfig,
  CaptureSessionContext,
  FaceAnalysisSessionSettings,
} from "./captureTypes";

export type {
  BiometricsCaptureClient,
  BiometricsCaptureSession,
  CaptureAnalyticsSettings,
  CaptureAnalysisResult,
  CaptureConfig,
  CaptureFaceConfig,
  CaptureLogLevel,
  CaptureMode,
  CaptureSubscribe,
  CaptureSessionContext,
  FaceAnalysisSessionSettings,
  FacePositionThresholds,
  ImageOrigin,
  LandmarkStabilityThresholds,
  LightingThresholds,
} from "./captureTypes";

const BIOMETRICS_USER_ID_STORAGE_KEY = "biometrics-userid";

class BiometricsCapture implements BiometricsCaptureClient {
  readonly #config: CaptureConfig;
  readonly #analyzer: WasmFaceAnalyzer;
  readonly #logger: Logger;

  #activeSession?: BiometricsCaptureSessionImpl;
  #sessionStartPromise?: Promise<BiometricsCaptureSessionImpl>;
  #isInitialized = false;
  #closePromise?: Promise<void>;

  constructor(config: CaptureConfig) {
    this.#config = config;
    this.#logger = createLogger("BiometricsCapture", config.logLevel ?? "warn");
    this.#analyzer = new WasmFaceAnalyzer({
      faceAnalysis: config.faceAnalysis,
      licenseKey: config.licenseKey,
      userId: config.analytics?.userId ?? getUserId(BIOMETRICS_USER_ID_STORAGE_KEY),
      pingProxyUrl: config.analytics?.pingProxyUrl,
    });
  }

  public async initialize(): Promise<void> {
    if (this.#isInitialized) {
      return;
    }

    this.#logger.debug("Initializing capture module");
    const initializationStartedAt = performance.now();
    emitBiometricsDiagnostic(this.#config.onDiagnostic, {
      phase: "initialization",
      component: "sdk",
      status: "started",
      timestamp: new Date().toISOString(),
    });

    try {
      if (!this.#config.licenseKey) {
        throw new LicenseError("License key is required");
      }

      try {
        resolveFaceAnalysisSessionSettings(this.#config.faceAnalysis);
      } catch (error) {
        throw new ConfigurationError(
          error instanceof Error ? error.message : "Invalid WASM session settings.",
          "INVALID_CONFIGURATION",
          { component: "wasm", cause: error },
        );
      }

      const initializationContext = createCaptureInitializationContext(
        resolveInitializationTimeout(this.#config.initializationTimeoutMs),
        this.#config.onDiagnostic,
      );

      await enforceInitializationDeadline(initializationContext, () =>
        this.#analyzer.initialize({
          resourcePath: this.#config.resourcePath,
          wasmVariant: this.#config.wasmVariant,
          imageOrigin: this.#config.imageOrigin,
          faceAnalysis: this.#config.faceAnalysis,
          initializationContext,
          onDownloadProgress: this.#config.onDownloadProgress,
        }),
      );

      this.#isInitialized = true;
      this.#logger.debug("Capture module initialized");

      emitBiometricsDiagnostic(this.#config.onDiagnostic, {
        phase: "initialization",
        component: "sdk",
        status: "completed",
        timestamp: new Date().toISOString(),
        durationMs: performance.now() - initializationStartedAt,
      });
    } catch (error) {
      const normalized =
        error instanceof BiometricsError
          ? error
          : normalizeBiometricsError(error, {
              stage: "initialization",
              component: "sdk",
            });

      try {
        await this.#analyzer.close(isInitTimeoutCode(normalized.code) ? 0 : undefined);
      } catch (cleanupError) {
        this.#logger.warn("Failed to clean up capture initialization", cleanupError);
      }

      emitBiometricsDiagnostic(this.#config.onDiagnostic, {
        phase: "initialization",
        component: "sdk",
        status: isInitTimeoutCode(normalized.code) ? "timed-out" : "failed",
        timestamp: new Date().toISOString(),
        durationMs: performance.now() - initializationStartedAt,
        errorCode: normalized.code,
      });
      throw normalized;
    }
  }

  public close(): Promise<void> {
    this.#closePromise ??= this.#close();

    return this.#closePromise;
  }

  async #close(): Promise<void> {
    this.#logger.debug("Closing capture module");
    this.#isInitialized = false;

    await this.#activeSession?.close();

    try {
      await this.#analyzer.close();
    } catch (error) {
      this.#logger.warn("Failed to gracefully close capture analyzer", error);
    }
  }

  public startSession(settings?: FaceAnalysisSessionSettings): Promise<BiometricsCaptureSessionImpl> {
    this.#ensureInitialized();

    if (this.#activeSession || this.#sessionStartPromise) {
      throw new SessionError("A capture session is already active", "SESSION_ALREADY_ACTIVE", {
        isRetryable: true,
      });
    }

    const startPromise = this.#startSession(settings);
    this.#sessionStartPromise = startPromise;

    return startPromise;
  }

  async #startSession(settings?: FaceAnalysisSessionSettings): Promise<BiometricsCaptureSessionImpl> {
    try {
      await this.#analyzer.startSession(settings);
      this.#ensureInitialized();

      const [sessionId, traceId, sessionNumber] = await Promise.all([
        this.#analyzer.getSessionId(),
        this.#analyzer.getTraceId(),
        this.#analyzer.getSessionNumber(),
      ]);
      this.#ensureInitialized();

      if (!sessionId || !traceId || sessionNumber === undefined) {
        throw new SessionError("Native capture session context is unavailable", "WASM_SESSION_ERROR", {
          component: "wasm",
        });
      }

      const context: CaptureSessionContext = Object.freeze({ sessionId, traceId, sessionNumber });
      let session: BiometricsCaptureSessionImpl;

      session = new BiometricsCaptureSessionImpl({
        analyzer: this.#analyzer,
        config: this.#config,
        context,
        onClose: () => {
          if (this.#activeSession === session) {
            this.#activeSession = undefined;
          }
        },
      });
      this.#activeSession = session;

      return session;
    } catch (error) {
      await this.#analyzer.endSession();

      throw error instanceof BiometricsError
        ? error
        : normalizeBiometricsError(error, {
            stage: "capture",
            component: "wasm",
            code: "WASM_SESSION_ERROR",
            isRetryable: true,
          });
    } finally {
      this.#sessionStartPromise = undefined;
    }
  }

  public async ping(pinglet: Ping): Promise<void> {
    try {
      await this.#analyzer.ping(pinglet);
    } catch (error) {
      this.#logger.warn("Failed to report capture pinglet", error);
    }
  }

  public async sendPinglets(): Promise<void> {
    try {
      await this.#analyzer.sendPinglets();
    } catch (error) {
      this.#logger.warn("Failed to send capture pinglets", error);
    }
  }

  #ensureInitialized(): void {
    if (!this.#isInitialized) {
      throw new ConfigurationError("BiometricsCapture is not initialized. Call initialize() first.", "NOT_CONFIGURED");
    }
  }
}

/** Creates and initializes a Biometrics capture client. */

export async function createBiometricsCapture(config: CaptureConfig): Promise<BiometricsCaptureClient> {
  const capture = new BiometricsCapture(config);

  await capture.initialize();

  return capture;
}
