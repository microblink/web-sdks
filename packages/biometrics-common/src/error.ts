/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

/** Stable error codes exposed by the Biometrics SDK. */
export type BiometricsErrorCode =
  | "INVALID_CONFIGURATION"
  | "INVALID_FORMAT"
  | "INVALID_HELP_NUDGE_DELAY"
  | "INVALID_HELP_TOOLTIP_SHOW_DELAY"
  | "INVALID_LICENSE_KEY"
  | "UNSUPPORTED_ENVIRONMENT"
  | "INSECURE_CONTEXT"
  | "INITIALIZATION_TIMEOUT"
  | "WORKER_LOAD_FAILED"
  | "WORKER_START_TIMEOUT"
  | "WASM_LOAD_FAILED"
  | "RESOURCE_UNAVAILABLE"
  | "RESOURCE_INVALID"
  | "CAMERA_ACCESS_DENIED"
  | "CAMERA_NOT_FOUND"
  | "CAMERA_START_FAILED"
  | "NOT_CONFIGURED"
  | "SESSION_ALREADY_ACTIVE"
  | "SESSION_CLOSED"
  | "SESSION_NOT_IDLE"
  | "SESSION_NOT_RETRYABLE"
  | "INVALID_STATE_TRANSITION"
  | "CAPTURE_TIMEOUT"
  | "FRAME_PROCESSING_FAILED"
  | "MISSING_LANDMARKS"
  | "WASM_INPUT_ERROR"
  | "WASM_SESSION_ERROR"
  | "INTERNAL_ERROR";

/** SDK lifecycle stage in which an error occurred. */
export type BiometricsErrorStage = "initialization" | "capture" | "shutdown";

/** SDK component that produced an error. */
export type BiometricsErrorComponent = "sdk" | "worker" | "wasm" | "resource" | "camera";

export type BiometricsErrorOptions = {
  message: string;
  code: BiometricsErrorCode;
  stage: BiometricsErrorStage;
  component: BiometricsErrorComponent;
  isRetryable: boolean;
  cause?: unknown;
};

export type BiometricsErrorContext = {
  stage?: BiometricsErrorStage;
  component?: BiometricsErrorComponent;
  cause?: unknown;
};

/** Base error class for all Biometrics errors. */
export class BiometricsError extends Error {
  /** Machine-readable code that identifies the failure. */
  public readonly code: BiometricsErrorCode;

  /** SDK lifecycle stage in which the failure occurred. */
  public readonly stage: BiometricsErrorStage;

  /** SDK component that produced the failure. */
  public readonly component: BiometricsErrorComponent;

  /** Indicates whether retrying the operation may resolve the failure. */
  public readonly isRetryable: boolean;

  public override readonly cause?: unknown;

  constructor(options: BiometricsErrorOptions) {
    super(options.message, { cause: options.cause });

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = "BiometricsError";
    this.code = options.code;
    this.stage = options.stage;
    this.component = options.component;
    this.isRetryable = options.isRetryable;
    this.cause = options.cause;
  }
}

/** Error thrown when there is an issue with the SDK license. */
export class LicenseError extends BiometricsError {
  constructor(
    message: string,
    code: BiometricsErrorCode = "INVALID_LICENSE_KEY",
    context: BiometricsErrorContext = {},
  ) {
    super({
      message,
      code,
      stage: context.stage ?? "initialization",
      component: context.component ?? "wasm",
      isRetryable: false,
      cause: context.cause,
    });
  }
}

/** Error thrown when the SDK configuration is invalid or incomplete. */
export class ConfigurationError extends BiometricsError {
  constructor(message: string, code: BiometricsErrorCode, context: BiometricsErrorContext = {}) {
    super({
      message,
      code,
      stage: context.stage ?? "initialization",
      component: context.component ?? "sdk",
      isRetryable: false,
      cause: context.cause,
    });
  }
}

/** Error thrown when there is an issue with a capture session. */
export class SessionError extends BiometricsError {
  constructor(
    message: string,
    code: BiometricsErrorCode,
    options: BiometricsErrorContext & { isRetryable?: boolean } = {},
  ) {
    super({
      message,
      code,
      stage: options.stage ?? "capture",
      component: options.component ?? "sdk",
      isRetryable: options.isRetryable ?? false,
      cause: options.cause,
    });
  }
}

/** Error thrown when required device permissions are unavailable. */
export class PermissionError extends BiometricsError {
  constructor(
    message: string,
    code: BiometricsErrorCode = "CAMERA_ACCESS_DENIED",
    context: BiometricsErrorContext = {},
  ) {
    super({
      message,
      code,
      stage: context.stage ?? "initialization",
      component: context.component ?? "camera",
      isRetryable: false,
      cause: context.cause,
    });
  }
}

export type NormalizeBiometricsErrorOptions = {
  stage: BiometricsErrorStage;
  component: BiometricsErrorComponent;
  preserve?: boolean;
  code?: BiometricsErrorCode;
  isRetryable?: boolean;
  message?: string;
};

type NormalizedDefaults = {
  code: BiometricsErrorCode;
  isRetryable: boolean;
};

function getKnownErrorDefaults(error: unknown, component: BiometricsErrorComponent): NormalizedDefaults {
  const hasKnownErrorShape =
    error instanceof Error ||
    (typeof error === "object" &&
      error !== null &&
      (("name" in error && typeof error.name === "string") ||
        ("message" in error && typeof error.message === "string")));

  if (!hasKnownErrorShape) {
    return { code: "INTERNAL_ERROR", isRetryable: false };
  }

  const errorName =
    typeof error === "object" && error !== null && "name" in error && typeof error.name === "string"
      ? error.name
      : undefined;
  const sourceCode =
    typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
      ? error.code
      : undefined;

  if (errorName === "SecurityError") {
    return { code: "INSECURE_CONTEXT", isRetryable: false };
  }

  if (component === "camera") {
    if (sourceCode === "PERMISSION_DENIED") {
      return { code: "CAMERA_ACCESS_DENIED", isRetryable: false };
    }

    if (errorName === "NotAllowedError" || errorName === "PermissionDeniedError") {
      return { code: "CAMERA_ACCESS_DENIED", isRetryable: false };
    }

    if (errorName === "NotFoundError" || errorName === "DevicesNotFoundError") {
      return { code: "CAMERA_NOT_FOUND", isRetryable: false };
    }

    return { code: "CAMERA_START_FAILED", isRetryable: true };
  }

  if (component === "worker") {
    return { code: "WORKER_LOAD_FAILED", isRetryable: true };
  }

  if (component === "wasm") {
    return { code: "WASM_LOAD_FAILED", isRetryable: true };
  }

  if (component === "resource") {
    return { code: "RESOURCE_UNAVAILABLE", isRetryable: true };
  }

  return { code: "INTERNAL_ERROR", isRetryable: false };
}

function errorMessage(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return typeof error === "string" ? error : undefined;
}

/** Converts an unknown failure into the stable Biometrics error contract. */
export function normalizeBiometricsError(error: unknown, options: NormalizeBiometricsErrorOptions): BiometricsError {
  if (
    error instanceof BiometricsError &&
    (options.preserve || (error.stage === options.stage && error.component === options.component))
  ) {
    return error;
  }

  const defaults =
    error instanceof BiometricsError
      ? { code: error.code, isRetryable: error.isRetryable }
      : getKnownErrorDefaults(error, options.component);

  return new BiometricsError({
    message: options.message ?? errorMessage(error) ?? "An unexpected error occurred",
    code: options.code ?? defaults.code,
    stage: options.stage,
    component: options.component,
    isRetryable: options.isRetryable ?? defaults.isRetryable,
    cause: error,
  });
}
