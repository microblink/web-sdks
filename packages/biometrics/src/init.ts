/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import {
  BiometricsError,
  ConfigurationError,
  emitBiometricsDiagnostic,
  normalizeBiometricsError,
  type BiometricsDiagnosticCallback,
  type BiometricsDiagnosticEvent,
  type BiometricsErrorComponent,
} from "@microblink/biometrics-core";

import type { BiometricsAnalytics } from "./BiometricsAnalytics";

const DEFAULT_INITIALIZATION_TIMEOUT_MS = 60_000;

function now(): number {
  return globalThis.performance?.now() ?? Date.now();
}

function invokeCallback<T>(callback: ((value: T) => void) | undefined, value: T): void {
  try {
    callback?.(value);
  } catch {
    return;
  }
}

type BiometricsInitializationOptions = {
  timeoutMs?: number;
  timeoutMessage: (timeoutMs: number) => string;
  onDiagnostic?: BiometricsDiagnosticCallback;
  onError?: (error: BiometricsError) => void;
};

export class BiometricsInitialization {
  readonly #timeoutMessage: string;
  readonly #onDiagnostic: BiometricsDiagnosticCallback | undefined;
  readonly #onError: ((error: BiometricsError) => void) | undefined;
  readonly #startedAt = now();
  readonly #deadline: number;
  readonly #pendingDiagnostics: BiometricsDiagnosticEvent[] = [];
  readonly #diagnosticListeners = new Set<BiometricsDiagnosticCallback>();
  readonly #reportedErrors = new WeakSet<BiometricsError>();

  #analytics: BiometricsAnalytics | undefined;
  #diagnosticAnalytics = Promise.resolve();
  #diagnosticDepth = 0;
  #terminalDiagnosticEmitted = false;

  constructor(options: BiometricsInitializationOptions) {
    const timeoutMs = options.timeoutMs ?? DEFAULT_INITIALIZATION_TIMEOUT_MS;

    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
      const error = new ConfigurationError(
        "initializationTimeoutMs must be a positive finite number.",
        "INVALID_CONFIGURATION",
      );
      invokeCallback(options.onError, error);
      throw error;
    }

    this.#timeoutMessage = options.timeoutMessage(timeoutMs);
    this.#onDiagnostic = options.onDiagnostic;
    this.#onError = options.onError;
    this.#deadline = this.#startedAt + timeoutMs;

    this.emitDiagnostic({
      phase: "initialization",
      component: "sdk",
      status: "started",
      timestamp: new Date().toISOString(),
    });
  }

  remainingMs(): number {
    return Math.max(0, this.#deadline - now());
  }

  wait<T>(
    operation: Promise<T>,
    component: "sdk" | "camera" = "sdk",
    onLateResult?: (result: T) => void | Promise<void>,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const remainingMs = this.remainingMs();
      let timedOut = remainingMs === 0;
      const timeoutId =
        remainingMs > 0
          ? setTimeout(() => {
              timedOut = true;
              reject(this.#timeoutError(component));
            }, remainingMs)
          : undefined;

      if (timedOut) {
        reject(this.#timeoutError(component));
      }

      operation.then(
        (result) => {
          if (timedOut) {
            if (onLateResult) {
              void Promise.resolve()
                .then(() => onLateResult(result))
                .catch(() => undefined);
            }

            return;
          }

          clearTimeout(timeoutId);
          resolve(result);
        },
        (error: unknown) => {
          if (timedOut) {
            return;
          }

          clearTimeout(timeoutId);
          reject(error);
        },
      );
    });
  }

  async waitForCleanup(cleanup: Promise<void>, error: BiometricsError): Promise<void> {
    if (error.code === "INITIALIZATION_TIMEOUT") {
      void cleanup.catch(() => undefined);

      return;
    }

    await this.wait(cleanup).catch(() => undefined);
  }

  reportError(error: unknown, component: BiometricsErrorComponent = "sdk"): BiometricsError {
    return this.#reportError(
      normalizeBiometricsError(error, {
        stage: "initialization",
        component,
        preserve: true,
      }),
    );
  }

  reportInitializationError(error: unknown, component: BiometricsErrorComponent = "sdk"): BiometricsError {
    return this.#reportError(
      normalizeBiometricsError(error, {
        stage: "initialization",
        component,
      }),
    );
  }

  flushDiagnostics(): Promise<void> {
    return this.#diagnosticAnalytics;
  }

  #reportError(error: BiometricsError): BiometricsError {
    if (!this.#reportedErrors.has(error)) {
      this.#reportedErrors.add(error);
      invokeCallback(this.#onError, error);
    }

    return error;
  }

  setAnalytics(analytics: BiometricsAnalytics): void {
    this.#analytics = analytics;

    for (const event of this.#pendingDiagnostics.splice(0)) {
      this.#queueDiagnostic(analytics, event);
    }
  }

  emitDiagnostic(event: BiometricsDiagnosticEvent): void {
    emitBiometricsDiagnostic(this.#onDiagnostic, event);

    const analytics = this.#analytics;

    if (analytics) {
      this.#queueDiagnostic(analytics, event);
    } else {
      this.#pendingDiagnostics.push(event);
    }

    this.#diagnosticDepth += 1;

    try {
      for (const listener of [...this.#diagnosticListeners]) {
        emitBiometricsDiagnostic(listener, event);
      }
    } finally {
      this.#diagnosticDepth -= 1;
    }
  }

  readonly uxDiagnosticSink = (event: BiometricsDiagnosticEvent): void => {
    if (this.#diagnosticDepth === 0) {
      this.emitDiagnostic(event);
    }
  };

  readonly subscribeDiagnostic = (listener: BiometricsDiagnosticCallback): (() => void) => {
    this.#diagnosticListeners.add(listener);

    return () => this.#diagnosticListeners.delete(listener);
  };

  complete(): void {
    this.#emitTerminal("completed");
  }

  fail(error: BiometricsError): void {
    this.#emitTerminal(error.code === "INITIALIZATION_TIMEOUT" ? "timed-out" : "failed", error);
  }

  #timeoutError(component: "sdk" | "camera"): BiometricsError {
    return new BiometricsError({
      message: this.#timeoutMessage,
      code: "INITIALIZATION_TIMEOUT",
      stage: "initialization",
      component,
      isRetryable: true,
    });
  }

  #queueDiagnostic(analytics: BiometricsAnalytics, event: BiometricsDiagnosticEvent): void {
    this.#diagnosticAnalytics = this.#diagnosticAnalytics
      .then(() => analytics.logDiagnostic(event))
      .catch(() => undefined);
  }

  #emitTerminal(status: "completed" | "failed" | "timed-out", error?: BiometricsError): void {
    if (this.#terminalDiagnosticEmitted) {
      return;
    }

    this.#terminalDiagnosticEmitted = true;
    this.emitDiagnostic({
      phase: "initialization",
      component: "sdk",
      status,
      timestamp: new Date().toISOString(),
      durationMs: Math.max(0, now() - this.#startedAt),
      errorCode: error?.code,
    });
  }
}
