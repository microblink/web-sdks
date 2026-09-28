/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

/**
 * Native WebAssembly runtime variants shipped with Biometrics. `simd*` variants use fixed-width SIMD only;
 * `simd-relaxed*` variants additionally use relaxed SIMD instructions. `*-threads` variants use pthreads and require
 * shared memory.
 */
export type WasmVariant = "simd" | "simd-threads" | "simd-relaxed" | "simd-relaxed-threads";

/** Every Wasm variant shipped with Biometrics. */
export const WASM_VARIANTS: readonly WasmVariant[] = ["simd", "simd-threads", "simd-relaxed", "simd-relaxed-threads"];

/** Checks whether a value names a shipped Wasm variant. */
export function isWasmVariant(value: unknown): value is WasmVariant {
  return typeof value === "string" && (WASM_VARIANTS as readonly string[]).includes(value);
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
