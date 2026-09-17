/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { WasmVariant } from "@microblink/wasm-common";

export function getSdkInitPlatformDetails(
  lightweight: boolean,
  wasmVariant: WasmVariant,
): WasmVariant | `lightweight-${WasmVariant}` {
  if (!lightweight) return wasmVariant;

  return `lightweight-${wasmVariant}`;
}

export function isThreadedWasmVariant(variant: WasmVariant): boolean {
  switch (variant) {
    case "simd-relaxed-threads":
    case "simd-threads":
      return true;
    default:
      return false;
  }
}
