/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { BlinkIdScanningResult, ScanningSide } from "@microblink/blinkid-wasm";

/**
 * Converts a scanning side to an index.
 *
 * @param side - The scanning side.
 * @returns The index.
 */
export function scanningSideToIndex(side: ScanningSide): number {
  return side === "first" ? 0 : 1;
}

/**
 * Extracts the input image for a given side from the scanning result.
 *
 * @param blinkIdScanningResult - The scanning result.
 * @param side - The side to extract the input image for.
 * @returns The input image for the given side.
 */
export function extractSideInputImage(
  blinkIdScanningResult: BlinkIdScanningResult,
  side: ScanningSide,
): ImageData | null {
  return (
    blinkIdScanningResult.subResults[scanningSideToIndex(side)]?.inputImage ??
    null
  );
}

/**
 * Extracts the barcode input image from the scanning result.
 *
 * @param blinkIdScanningResult - The scanning result.
 * @returns The barcode input image.
 */
export function extractBarcodeImage(
  blinkIdScanningResult: BlinkIdScanningResult,
): ImageData | null {
  if (!blinkIdScanningResult.barcodeImageScanningSide) {
    return null;
  }

  return (
    blinkIdScanningResult.subResults[
      scanningSideToIndex(blinkIdScanningResult.barcodeImageScanningSide)
    ]?.barcodeImage ?? null
  );
}

/**
 * Extracts the document image for a given side from the scanning result.
 *
 * @param blinkIdScanningResult - The scanning result.
 * @param side - The side to extract the document image for.
 * @returns The document image for the given side.
 */
export function extractSideDocumentImage(
  blinkIdScanningResult: BlinkIdScanningResult,
  side: ScanningSide,
): ImageData | null {
  return (
    blinkIdScanningResult.subResults[scanningSideToIndex(side)]
      ?.documentImage ?? null
  );
}

/**
 * Extracts the face image from the scanning result.
 *
 * @param blinkIdScanningResult - The scanning result.
 * @returns The face image.
 */
export function extractFaceImage(
  blinkIdScanningResult: BlinkIdScanningResult,
): ImageData | null {
  if (!blinkIdScanningResult.faceImageScanningSide) {
    return null;
  }

  return (
    blinkIdScanningResult.subResults[
      scanningSideToIndex(blinkIdScanningResult.faceImageScanningSide)
    ]?.faceImage?.image ?? null
  );
}

/**
 * Extracts the signature image from the scanning result.
 *
 * @param blinkIdScanningResult - The scanning result.
 * @returns The signature image.
 */
export function extractSignatureImage(
  blinkIdScanningResult: BlinkIdScanningResult,
): ImageData | null {
  if (!blinkIdScanningResult.signatureImageScanningSide) {
    return null;
  }

  return (
    blinkIdScanningResult.subResults[
      scanningSideToIndex(blinkIdScanningResult.signatureImageScanningSide)
    ]?.signatureImage?.image ?? null
  );
}
