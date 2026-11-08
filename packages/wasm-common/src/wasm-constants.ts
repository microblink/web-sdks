/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

export const resourceFileTypes = ["wasm", "data"] as const;
export const wasmBuildTypes = ["full", "lightweight"] as const;
export const wasmVariants = ["simd", "simd-threads", "simd-relaxed", "simd-relaxed-threads"] as const;

export type ResourceFileType = (typeof resourceFileTypes)[number];
export type WasmBuildType = (typeof wasmBuildTypes)[number];
/**
 * Native WebAssembly runtime variants. `simd*` variants use fixed-width SIMD only; `simd-relaxed*` variants
 * additionally use relaxed SIMD instructions. `*-threads` variants use pthreads and require shared memory.
 */
export type WasmVariant = (typeof wasmVariants)[number];
