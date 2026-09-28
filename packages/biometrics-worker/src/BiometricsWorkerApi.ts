/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { Ping } from "@microblink/analytics/ping";
import { BiometricsError, serializeBiometricsError } from "@microblink/biometrics-common";
import type {
  BiometricsErrorCode,
  BiometricsErrorComponent,
  BiometricsErrorStage,
  BiometricsWorkerResult,
  WasmVariant,
} from "@microblink/biometrics-common";
import { LoadError } from "@microblink/biometrics-wasm";
import type {
  BiometricsWasmLandmarks,
  FaceAnalysisResult,
  FaceAnalysisSessionSettings,
  ResetResultPayload,
  ResolvedFaceAnalysisSessionSettings,
} from "@microblink/biometrics-wasm";
import { LicenseError as WorkerLicenseError, ServerPermissionError } from "@microblink/worker-common/errors";

import {
  BiometricsWorker,
  BiometricsWorkerLoadError,
  type InitBiometricsParams,
  type ProgressStatusCallback,
} from "./BiometricsWorker";
import { BiometricsWorkerLifecycleError } from "./BiometricsWorkerLifecycleError";
import { transferFaceAnalysisWorkerResult, transferProcessWorkerResult } from "./processResultTransferables";
import type { BiometricsProcessResultWithBuffer } from "./processResultTransferables";

type ErrorDefaults = {
  code: BiometricsErrorCode;
  stage: BiometricsErrorStage;
  component: BiometricsErrorComponent;
  isRetryable: boolean;
};

const LIFECYCLE_ERROR_DETAILS: Record<
  BiometricsWorkerLifecycleError["reason"],
  Pick<ErrorDefaults, "code" | "isRetryable"> & { message: string }
> = {
  "not-initialized": {
    message: "Biometrics not initialized. Call init() first.",
    code: "NOT_CONFIGURED",
    isRetryable: false,
  },
  initializing: {
    message: "Biometrics initialization is still in progress.",
    code: "INVALID_STATE_TRANSITION",
    isRetryable: true,
  },
  "no-active-session": {
    message: "No active Biometrics session. Call startSession() first.",
    code: "INVALID_STATE_TRANSITION",
    isRetryable: false,
  },
  closed: {
    message: "Biometrics worker is closed.",
    code: "SESSION_CLOSED",
    isRetryable: false,
  },
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return typeof error === "string" ? error : "An unexpected worker error occurred";
}

function loadErrorDefaults(error: BiometricsWorkerLoadError): ErrorDefaults {
  switch (error.code) {
    case LoadError.InvalidSettings:
      return {
        code: "INVALID_CONFIGURATION",
        stage: "initialization",
        component: "wasm",
        isRetryable: false,
      };
    case LoadError.MissingResources:
      return {
        code: "RESOURCE_UNAVAILABLE",
        stage: "initialization",
        component: "resource",
        isRetryable: true,
      };
    case LoadError.InvalidResources:
      return {
        code: "RESOURCE_INVALID",
        stage: "initialization",
        component: "resource",
        isRetryable: false,
      };
    case LoadError.MemoryReserveFailed:
      return {
        code: "WASM_LOAD_FAILED",
        stage: "initialization",
        component: "wasm",
        isRetryable: false,
      };
    case LoadError.InvalidLicense:
      return {
        code: "INVALID_LICENSE_KEY",
        stage: "initialization",
        component: "wasm",
        isRetryable: false,
      };
    case LoadError.Unknown:
      return {
        code: "WASM_LOAD_FAILED",
        stage: "initialization",
        component: "wasm",
        isRetryable: true,
      };
  }
}

function toBiometricsError(error: unknown, defaults: ErrorDefaults): BiometricsError {
  if (error instanceof BiometricsError) {
    return error;
  }

  if (error instanceof WorkerLicenseError || error instanceof ServerPermissionError) {
    return new BiometricsError({
      message: error.message,
      code: "INVALID_LICENSE_KEY",
      stage: "initialization",
      component: "wasm",
      isRetryable: false,
      cause: error,
    });
  }

  if (error instanceof BiometricsWorkerLoadError) {
    return new BiometricsError({
      message: error.message,
      ...loadErrorDefaults(error),
      cause: error,
    });
  }

  if (error instanceof BiometricsWorkerLifecycleError) {
    return new BiometricsError({
      ...LIFECYCLE_ERROR_DETAILS[error.reason],
      stage: defaults.stage,
      component: "worker",
      cause: error,
    });
  }

  return new BiometricsError({
    message: getErrorMessage(error),
    ...defaults,
    cause: error,
  });
}

function failure<T>(error: unknown, defaults: ErrorDefaults): BiometricsWorkerResult<T> {
  return {
    ok: false,
    error: serializeBiometricsError(toBiometricsError(error, defaults)),
  };
}

function success<T>(value: T): BiometricsWorkerResult<T> {
  return { ok: true, value };
}

const INITIALIZATION_RESOURCE_ERROR: ErrorDefaults = {
  code: "RESOURCE_UNAVAILABLE",
  stage: "initialization",
  component: "resource",
  isRetryable: true,
};

const CAPTURE_WASM_ERROR: ErrorDefaults = {
  code: "WASM_SESSION_ERROR",
  stage: "capture",
  component: "wasm",
  isRetryable: false,
};

/** Comlink-facing API. Result envelopes keep canonical error fields intact across the Worker boundary. */
export class BiometricsWorkerApi {
  readonly #worker: BiometricsWorker;

  constructor(worker = new BiometricsWorker()) {
    this.#worker = worker;
  }

  ready(): BiometricsWorkerResult<void> {
    return success(undefined);
  }

  async init(
    params: InitBiometricsParams,
    progressCallback?: ProgressStatusCallback,
  ): Promise<BiometricsWorkerResult<void>> {
    try {
      await this.#worker.init(params, progressCallback);

      return success(undefined);
    } catch (error) {
      return failure(error, INITIALIZATION_RESOURCE_ERROR);
    }
  }

  startSession(settings?: FaceAnalysisSessionSettings): BiometricsWorkerResult<void> {
    try {
      this.#worker.startSession(settings);

      return success(undefined);
    } catch (error) {
      return failure(error, CAPTURE_WASM_ERROR);
    }
  }

  endSession(): void {
    this.#worker.endSession();
  }

  process(
    imageData: ImageData,
    landmarks?: BiometricsWasmLandmarks,
    signalBatch?: Uint8Array<ArrayBuffer>,
  ): BiometricsWorkerResult<BiometricsProcessResultWithBuffer> {
    try {
      const value = this.#worker.process(imageData, landmarks, signalBatch);

      return transferProcessWorkerResult(value);
    } catch (error) {
      return failure(error, {
        code: error instanceof TypeError ? "INVALID_FORMAT" : "FRAME_PROCESSING_FAILED",
        stage: "capture",
        component: error instanceof TypeError ? "worker" : "wasm",
        isRetryable: error instanceof TypeError ? false : true,
      });
    }
  }

  finalizeCaptureMetadata(finalSignalBatch: Uint8Array<ArrayBuffer>): BiometricsWorkerResult<string | null> {
    return success(this.#worker.finalizeCaptureMetadata(finalSignalBatch));
  }

  getResult(): BiometricsWorkerResult<FaceAnalysisResult> {
    try {
      return transferFaceAnalysisWorkerResult(this.#worker.getResult());
    } catch (error) {
      return failure(error, CAPTURE_WASM_ERROR);
    }
  }

  getSettings(): BiometricsWorkerResult<ResolvedFaceAnalysisSessionSettings> {
    try {
      return success(this.#worker.getSettings());
    } catch (error) {
      return failure(error, CAPTURE_WASM_ERROR);
    }
  }

  getSessionId(): string {
    return this.#worker.getSessionId();
  }

  getTraceId(): string {
    return this.#worker.getTraceId();
  }

  getSessionNumber(): number {
    return this.#worker.getSessionNumber();
  }

  getWasmVariant(): WasmVariant | undefined {
    return this.#worker.getWasmVariant();
  }

  reset(): BiometricsWorkerResult<ResetResultPayload> {
    try {
      return success(this.#worker.reset());
    } catch (error) {
      return failure(error, CAPTURE_WASM_ERROR);
    }
  }

  ping(pinglet: Ping): BiometricsWorkerResult<void> {
    try {
      this.#worker.ping(pinglet);

      return success(undefined);
    } catch (error) {
      return failure(error, {
        code: "NOT_CONFIGURED",
        stage: "initialization",
        component: "worker",
        isRetryable: false,
      });
    }
  }

  sendPinglets(): void {
    this.#worker.sendPinglets();
  }

  close(gracePeriodMs?: number): Promise<void> {
    return this.#worker.close(gracePeriodMs);
  }
}
