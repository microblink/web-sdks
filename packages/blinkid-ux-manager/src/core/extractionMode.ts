/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  BlinkIdSessionSettings,
  ScanningSettings,
} from "@microblink/blinkid-core";

/**
 * UI-facing classification of how a BlinkID session extracts data.
 *
 * The UX manager uses this mode to choose feedback copy, help/onboarding locale
 * groups, and extraction-specific modal illustrations.
 *
 * - `full-document` - Standard document flow for document capture, MRZ, VIZ, or
 *   mixed multi-side extraction.
 * - `document-with-barcode` - Single-side document capture flow that requires
 *   the barcode side to be scanned.
 * - `barcode-only` - Barcode extraction flow with no document capture, MRZ, or
 *   VIZ extraction.
 */
export type BlinkIdExtractionMode =
  | "full-document"
  | "document-with-barcode"
  | "document-with-mrz"
  | "barcode-only";

/**
 * Minimal subset of session settings required to derive a UX extraction mode.
 *
 * The helper accepts partial settings because mode derivation only depends on
 * module presence and whether the session is explicitly configured for a
 * single-side scan.
 */
export type BlinkIdExtractionModeInput = Partial<
  Pick<BlinkIdSessionSettings, "scanningMode">
> & {
  scanningSettings?: Partial<
    Pick<
      ScanningSettings,
      "documentCaptureModule" | "barcodeModule" | "mrzModule" | "vizModule"
    >
  > | null;
};

/**
 * Derives the UX extraction mode from BlinkID session settings.
 *
 * Barcode-focused modes are intentionally narrow: document-with-barcode requires
 * a mandatory barcode, while MRZ and VIZ keep the UI in the full-document flow
 * because they rely on document-capture guidance and may need front-side
 * document context.
 *
 * @returns The matching extraction mode, or `full-document` when settings are
 * missing or do not match a barcode-focused flow.
 */
export function getBlinkIdExtractionMode(
  sessionSettings: BlinkIdExtractionModeInput,
): BlinkIdExtractionMode {
  const scanningSettings = sessionSettings?.scanningSettings;
  const barcodeModule = scanningSettings?.barcodeModule;
  const documentCaptureEnabled =
    scanningSettings?.documentCaptureModule !== null;
  const barcodeEnabled = barcodeModule !== null;
  const mrzEnabled = scanningSettings?.mrzModule !== null;
  const mrzModule = scanningSettings?.mrzModule;
  const vizEnabled = scanningSettings?.vizModule !== null;
  const isSingleSideScan = sessionSettings?.scanningMode === "single";
  const mandatoryBarcode = barcodeModule?.presenceMandatory === true;

  if (
    documentCaptureEnabled &&
    barcodeEnabled &&
    mandatoryBarcode &&
    isSingleSideScan &&
    !mrzEnabled &&
    !vizEnabled
  ) {
    return "document-with-barcode";
  }

  if (
    isSingleSideScan &&
    documentCaptureEnabled &&
    mrzEnabled &&
    mrzModule?.presenceMandatory
  ) {
    return "document-with-mrz";
  }

  if (!documentCaptureEnabled && barcodeEnabled && !mrzEnabled && !vizEnabled) {
    return "barcode-only";
  }

  return "full-document";
}
