/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import {
  BiometricsError,
  type BiometricsErrorCode,
  type BiometricsErrorComponent,
  type BiometricsErrorStage,
} from "./error";

export type SerializedBiometricsError = {
  message: string;
  code: BiometricsErrorCode;
  stage: BiometricsErrorStage;
  component: BiometricsErrorComponent;
  isRetryable: boolean;
};

export type BiometricsWorkerResult<T> = { ok: true; value: T } | { ok: false; error: SerializedBiometricsError };

/** Converts an error to the safe metadata allowed across the Worker boundary. */
export function serializeBiometricsError(error: BiometricsError): SerializedBiometricsError {
  return {
    message: error.message,
    code: error.code,
    stage: error.stage,
    component: error.component,
    isRetryable: error.isRetryable,
  };
}

/** Reconstructs the public error contract from Worker-safe metadata. */
export function deserializeBiometricsError(error: SerializedBiometricsError): BiometricsError {
  return new BiometricsError(error);
}

/** Returns a successful Worker value or throws its reconstructed error. */
export function unwrapBiometricsWorkerResult<T>(result: BiometricsWorkerResult<T>): T {
  if (result.ok) {
    return result.value;
  }

  throw deserializeBiometricsError(result.error);
}
