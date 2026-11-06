/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { WasmCapabilities } from "@microblink/biometrics-common";
import { isSafari } from "@microblink/worker-common/isSafari";
import { detectRelaxedSimdSupport, detectWasmFeatures } from "@microblink/worker-common/wasm-feature-detect";
import { isThreadedWasmVariant } from "@microblink/worker-common/wasmVariant";

type DetectWasmFeatures = typeof detectWasmFeatures;
type DetectRelaxedSimdSupport = typeof detectRelaxedSimdSupport;

function supportsSharedMemory(): boolean {
  try {
    return typeof globalThis.SharedArrayBuffer === "function" && new globalThis.SharedArrayBuffer(1).byteLength === 1;
  } catch {
    return false;
  }
}

export async function detectMainThreadWasmCapabilities(
  detectFeatures: DetectWasmFeatures = detectWasmFeatures,
  detectRelaxedSimd: DetectRelaxedSimdSupport = detectRelaxedSimdSupport,
): Promise<WasmCapabilities> {
  let minimumFeatures = true;
  let threads = false;

  try {
    threads = isThreadedWasmVariant(await detectFeatures());
  } catch (error) {
    if (error instanceof Error && error.message === "Not implemented") {
      threads = true;
    } else {
      minimumFeatures = false;
    }
  }

  // The variant detector cannot report relaxed SIMD on the main thread (its thread probe throws there), so relaxed
  // SIMD is probed separately.
  const relaxedSimd = minimumFeatures ? await detectRelaxedSimd() : false;

  return {
    minimumFeatures,
    relaxedSimd,
    threads,
    sharedMemory: supportsSharedMemory(),
    worker: typeof globalThis.Worker === "function",
    crossOriginIsolated: globalThis.crossOriginIsolated === true,
    safari: isSafari(),
  };
}
