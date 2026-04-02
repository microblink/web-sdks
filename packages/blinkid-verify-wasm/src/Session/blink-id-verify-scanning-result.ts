/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { EmbindObject } from "../emscripten";

/** Represents a captured frame */
export interface CapturedFrame {
  readonly jpegBytes: Uint8Array;
  orientation:
    | "portrait"
    | "landscape-left"
    | "upside-portrait"
    | "landscape-right";
}

/**
 * Represents the final result of scanning both sides of the document. It
 * potentially contains the captured frames for the front, back, and barcode.
 */
export type BlinkIdVerifyScanningResult = EmbindObject<{
  /** The captured frame of the front side of the document, if available. */
  frontFrame: CapturedFrame | undefined;
  /** The captured frame of the back side of the document, if available. */
  backFrame: CapturedFrame | undefined;
  /** The captured frame of the barcode, if available. */
  barcodeFrame: CapturedFrame | undefined;
}>;
