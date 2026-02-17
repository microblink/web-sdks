/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import {
  BlinkCardScanningResult,
  ScanningSide,
} from "@microblink/blinkcard-wasm";

/**
 * Extracts the input image for a given side from the scanning result.
 *
 * @param scanningResult - The scanning result.
 * @param side - The side to extract the input image for.
 * @returns The input image for the given side.
 */
export function extractSideInputImage(
  scanningResult: BlinkCardScanningResult,
  side: ScanningSide,
): ImageData | null {
  if (side === "first") {
    return scanningResult.firstSideResult?.cardImage?.image ?? null;
  }
  return scanningResult.secondSideResult?.cardImage?.image ?? null;
}
