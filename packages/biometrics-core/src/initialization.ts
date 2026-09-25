/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import {
  BiometricsError,
  ConfigurationError,
  emitBiometricsDiagnostic,
  normalizeBiometricsError,
  type BiometricsDiagnosticCallback,
  type BiometricsDiagnosticComponent,
  type BiometricsErrorCode,
  type BiometricsErrorComponent,
  type BiometricsResourceKind,
} from "@microblink/biometrics-common";

export const DEFAULT_INITIALIZATION_TIMEOUT_MS = 60_000; // 1 minute

const INITIALIZATION_TIMEOUT_CODES = new Set<BiometricsErrorCode>(["INITIALIZATION_TIMEOUT", "WORKER_START_TIMEOUT"]);

const RESOURCE_DIAGNOSTIC_CODES = new Set<BiometricsErrorCode>([
  "WORKER_LOAD_FAILED",
  "WORKER_START_TIMEOUT",
  "WASM_LOAD_FAILED",
  "INITIALIZATION_TIMEOUT",
  "RESOURCE_UNAVAILABLE",
  "RESOURCE_INVALID",
]);

export type CaptureInitializationContext = {
  readonly deadlineAtMs: number;
  readonly onDiagnostic?: BiometricsDiagnosticCallback;

  activeErrorComponent?: BiometricsErrorComponent;
  activeTimeoutCode?: BiometricsErrorCode;
};

type InitializationStepOptions = {
  diagnosticComponent: BiometricsDiagnosticComponent;
  errorComponent: BiometricsErrorComponent;
  failureCode: BiometricsErrorCode;
  timeoutCode?: BiometricsErrorCode;
  resource?: {
    kind: BiometricsResourceKind;
    url: string;
  };
};

function monotonicNow(): number {
  return globalThis.performance?.now() ?? Date.now();
}

function timestamp(): string {
  return new Date().toISOString();
}

export function isInitTimeoutCode(code: BiometricsErrorCode): boolean {
  return INITIALIZATION_TIMEOUT_CODES.has(code);
}

function resourceDiagnosticFor(
  error: BiometricsError,
  resource: InitializationStepOptions["resource"],
): InitializationStepOptions["resource"] {
  if (!resource) {
    return undefined;
  }

  if (error.component === "resource" || RESOURCE_DIAGNOSTIC_CODES.has(error.code)) {
    return resource;
  }

  return undefined;
}

export function resolveInitializationTimeout(timeoutMs?: number): number {
  const resolved = timeoutMs ?? DEFAULT_INITIALIZATION_TIMEOUT_MS;

  if (!Number.isFinite(resolved) || resolved <= 0) {
    throw new ConfigurationError("initializationTimeoutMs must be a positive finite number.", "INVALID_CONFIGURATION");
  }

  return resolved;
}

export function createCaptureInitializationContext(
  timeoutMs: number,
  onDiagnostic?: BiometricsDiagnosticCallback,
): CaptureInitializationContext {
  return {
    deadlineAtMs: monotonicNow() + timeoutMs,
    onDiagnostic,
  };
}

export function remainingInitializationMs(context: CaptureInitializationContext): number {
  return Math.max(0, context.deadlineAtMs - monotonicNow());
}

function initializationTimeoutError(context: CaptureInitializationContext): BiometricsError {
  return new BiometricsError({
    message: "Biometrics initialization timed out",
    code: context.activeTimeoutCode ?? "INITIALIZATION_TIMEOUT",
    stage: "initialization",
    component: context.activeErrorComponent ?? "sdk",
    isRetryable: true,
  });
}

export async function enforceInitializationDeadline<T>(
  context: CaptureInitializationContext,
  operation: () => Promise<T>,
): Promise<T> {
  const remainingMs = remainingInitializationMs(context);

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    if (remainingMs <= 0) {
      throw initializationTimeoutError(context);
    }

    return await Promise.race([
      operation(),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(initializationTimeoutError(context)), remainingMs);
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

export async function runInitializationStep<T>(
  context: CaptureInitializationContext,
  options: InitializationStepOptions,
  operation: () => Promise<T>,
): Promise<T> {
  const startedAt = monotonicNow();
  const previousComponent = context.activeErrorComponent;
  const previousTimeoutCode = context.activeTimeoutCode;

  context.activeErrorComponent = options.errorComponent;
  context.activeTimeoutCode = options.timeoutCode;

  emitBiometricsDiagnostic(context.onDiagnostic, {
    phase: "initialization",
    component: options.diagnosticComponent,
    status: "started",
    timestamp: timestamp(),
  });

  const remainingMs = remainingInitializationMs(context);

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    if (remainingMs <= 0) {
      throw new BiometricsError({
        message: "Biometrics initialization timed out",
        code: options.timeoutCode ?? "INITIALIZATION_TIMEOUT",
        stage: "initialization",
        component: options.errorComponent,
        isRetryable: true,
      });
    }

    const result = await Promise.race([
      operation(),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(
            new BiometricsError({
              message: "Biometrics initialization timed out",
              code: options.timeoutCode ?? "INITIALIZATION_TIMEOUT",
              stage: "initialization",
              component: options.errorComponent,
              isRetryable: true,
            }),
          );
        }, remainingMs);
      }),
    ]);

    emitBiometricsDiagnostic(context.onDiagnostic, {
      phase: "initialization",
      component: options.diagnosticComponent,
      status: "completed",
      timestamp: timestamp(),
      durationMs: monotonicNow() - startedAt,
    });

    return result;
  } catch (error) {
    const normalized: BiometricsError = normalizeBiometricsError(error, {
      stage: "initialization",
      component: options.errorComponent,
      code: error instanceof BiometricsError ? undefined : options.failureCode,
    });

    emitBiometricsDiagnostic(context.onDiagnostic, {
      phase: "initialization",
      component: options.diagnosticComponent,
      status: isInitTimeoutCode(normalized.code) ? "timed-out" : "failed",
      timestamp: timestamp(),
      durationMs: monotonicNow() - startedAt,
      errorCode: normalized.code,
      resource: resourceDiagnosticFor(normalized, options.resource),
    });

    throw normalized;
  } finally {
    context.activeErrorComponent = previousComponent;
    context.activeTimeoutCode = previousTimeoutCode;

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}
