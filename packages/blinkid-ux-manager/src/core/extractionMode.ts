/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { BlinkIdSessionSettings, ScanningSettings } from "@microblink/blinkid-core";

/**
 * UI-facing classification of how a BlinkID session extracts data.
 *
 * The UX manager uses this mode to choose feedback copy, help/onboarding locale groups, and extraction-specific modal
 * illustrations.
 *
 * - `full-document` - Standard document flow for document capture, MRZ, VIZ, or mixed multi-side extraction.
 * - `document-with-barcode` - Single-side document capture flow that requires the barcode side to be scanned.
 * - `document-with-mrz` - Single-side document capture flow that requires only the MRZ side to be scanned.
 * - `barcode-only` - Barcode extraction flow with no document capture, MRZ, or VIZ extraction.
 */
export type BlinkIdExtractionMode = "full-document" | "document-with-barcode" | "document-with-mrz" | "barcode-only";

/**
 * Minimal subset of session settings required to derive a UX extraction mode.
 *
 * The helper accepts partial settings because mode derivation only depends on module presence and whether the session
 * is explicitly configured for a single-side scan.
 */
export type BlinkIdExtractionModeInput = Partial<Pick<BlinkIdSessionSettings, "scanningMode">> & {
  scanningSettings?: Partial<
    Pick<ScanningSettings, "documentCaptureModule" | "barcodeModule" | "mrzModule" | "vizModule">
  > | null;
};

/**
 * Derives the UX extraction mode from BlinkID session settings.
 *
 * Barcode and MRZ-focused modes are intentionally narrow. `document-with-barcode` requires a mandatory barcode with MRZ
 * and VIZ disabled. `document-with-mrz` requires a mandatory MRZ with barcode and VIZ disabled. Mixed extraction keeps
 * the UI in the full-document flow because it relies on standard document-capture guidance and may need front-side
 * document context.
 *
 * @returns The matching extraction mode, or `full-document` when settings are missing or do not match a barcode or
 *   MRZ-focused flow.
 */
export function getBlinkIdExtractionMode(sessionSettings: BlinkIdExtractionModeInput): BlinkIdExtractionMode {
  const scanningSettings = sessionSettings?.scanningSettings;
  const barcodeModule = scanningSettings?.barcodeModule;
  const documentCaptureEnabled = scanningSettings?.documentCaptureModule !== null;
  const barcodeEnabled = barcodeModule !== null;
  const mrzEnabled = scanningSettings?.mrzModule !== null;
  const mrzModule = scanningSettings?.mrzModule;
  const vizEnabled = scanningSettings?.vizModule !== null;
  const isSingleSideScan = sessionSettings?.scanningMode === "single";
  const mandatoryBarcode = barcodeModule?.presenceMandatory === true;
  const mandatoryMrz = mrzModule?.presenceMandatory === true;

  if (documentCaptureEnabled && barcodeEnabled && mandatoryBarcode && isSingleSideScan && !mrzEnabled && !vizEnabled) {
    return "document-with-barcode";
  }

  if (documentCaptureEnabled && mrzEnabled && mandatoryMrz && isSingleSideScan && !barcodeEnabled && !vizEnabled) {
    return "document-with-mrz";
  }

  if (!documentCaptureEnabled && barcodeEnabled && !mrzEnabled && !vizEnabled) {
    return "barcode-only";
  }

  return "full-document";
}
