/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { BiometricsErrorCode, BiometricsErrorComponent, BiometricsErrorStage } from "./error";

export type BiometricsDiagnosticStatus = "started" | "completed" | "failed" | "timed-out";

export type BiometricsDiagnosticPhase = Exclude<BiometricsErrorStage, "shutdown">;

export type BiometricsDiagnosticComponent = Exclude<BiometricsErrorComponent, "wasm" | "resource"> | "wasm-resources";

export type BiometricsResourceKind =
  | "worker-script"
  | "biometrics-wasm-script"
  | "biometrics-wasm-binary"
  | "biometrics-wasm-data";

export type BiometricsDiagnosticResource = {
  kind: BiometricsResourceKind;
  url: string;
};

/** Safe lifecycle and component timing data exposed to SDK consumers. */
export type BiometricsDiagnosticEvent = {
  phase: BiometricsDiagnosticPhase;
  component: BiometricsDiagnosticComponent;
  status: BiometricsDiagnosticStatus;
  timestamp: string;
  durationMs?: number;
  errorCode?: BiometricsErrorCode;
  resource?: BiometricsDiagnosticResource;
};

export type BiometricsDiagnosticCallback = (event: BiometricsDiagnosticEvent) => void;

const SANITIZATION_BASE_URL = "https://biometrics.invalid";

/** Removes credentials and request-specific values from a diagnostic URL. */
export function sanitizeBiometricsResourceUrl(resourceUrl: string): string {
  try {
    const isAbsolute = /^[a-z][a-z\d+\-.]*:/i.test(resourceUrl);
    const url = new URL(resourceUrl, SANITIZATION_BASE_URL);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "[unsupported-url]";
    }

    url.username = "";
    url.password = "";
    url.search = "";
    url.hash = "";

    return isAbsolute ? url.href : `${url.pathname}${url.pathname === "" ? "/" : ""}`;
  } catch {
    return "[invalid-url]";
  }
}

function safeDuration(durationMs: number | undefined): number | undefined {
  return durationMs !== undefined && Number.isFinite(durationMs) && durationMs >= 0 ? durationMs : undefined;
}

/** Invokes a diagnostic callback with an explicit safe-field allowlist. */
export function emitBiometricsDiagnostic(
  callback: BiometricsDiagnosticCallback | undefined,
  event: BiometricsDiagnosticEvent,
): void {
  if (!callback) {
    return;
  }

  const safeEvent: BiometricsDiagnosticEvent = {
    phase: event.phase,
    component: event.component,
    status: event.status,
    timestamp: event.timestamp,
  };
  const durationMs = safeDuration(event.durationMs);

  if (durationMs !== undefined) {
    safeEvent.durationMs = durationMs;
  }

  if (event.errorCode !== undefined) {
    safeEvent.errorCode = event.errorCode;
  }

  if (event.resource !== undefined) {
    safeEvent.resource = {
      kind: event.resource.kind,
      url: sanitizeBiometricsResourceUrl(event.resource.url),
    };
  }

  try {
    callback(safeEvent);
  } catch {
    // Consumer diagnostics must not affect SDK behavior.
  }
}
