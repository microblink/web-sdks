/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { BiometricsUxFailureStage } from "./types";

export type BiometricsErrorDialogKind = "scanningUnsuccessful" | "scanningNotAvailable";

export type BiometricsFailurePhase = BiometricsUxFailureStage | "runtime";

function getErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return undefined;
  }

  return typeof error.code === "string" ? error.code : undefined;
}

export function resolveBiometricsErrorDialogKind(
  error: unknown,
  phase: BiometricsFailurePhase,
  afterTeardown = false,
): BiometricsErrorDialogKind | undefined {
  const code = getErrorCode(error);

  if (code === "SESSION_CLOSED" && afterTeardown) {
    return undefined;
  }

  if (phase === "capture" && code === "CAPTURE_TIMEOUT") {
    return "scanningUnsuccessful";
  }

  return "scanningNotAvailable";
}
