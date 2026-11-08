/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { WasmVariant } from "@microblink/wasm-common";

export type { WasmVariant } from "@microblink/wasm-common";

const wasmVariantNames: Record<WasmVariant, true> = {
  simd: true,
  "simd-threads": true,
  "simd-relaxed": true,
  "simd-relaxed-threads": true,
};

/** Every Wasm variant shipped with Biometrics. */
export const WASM_VARIANTS: readonly WasmVariant[] = Object.keys(wasmVariantNames).filter(isWasmVariant);

/** Checks whether a value names a shipped Wasm variant. */
export function isWasmVariant(value: unknown): value is WasmVariant {
  return typeof value === "string" && Object.hasOwn(wasmVariantNames, value);
}

/** Browser capabilities used by the Biometrics variant selection policy. */
export type WasmCapabilities = {
  minimumFeatures: boolean;
  relaxedSimd: boolean;
  threads: boolean;
  sharedMemory: boolean;
  worker: boolean;
  crossOriginIsolated: boolean;
  safari: boolean;
};

/** Selects the fastest supported runtime, or no runtime when SIMD is unavailable. */
export function selectWasmVariant(capabilities: WasmCapabilities): WasmVariant | undefined {
  if (!capabilities.minimumFeatures) {
    return undefined;
  }

  const useThreads =
    capabilities.threads &&
    capabilities.sharedMemory &&
    capabilities.worker &&
    capabilities.crossOriginIsolated &&
    !capabilities.safari;

  if (capabilities.relaxedSimd) {
    return useThreads ? "simd-relaxed-threads" : "simd-relaxed";
  }

  return useThreads ? "simd-threads" : "simd";
}
