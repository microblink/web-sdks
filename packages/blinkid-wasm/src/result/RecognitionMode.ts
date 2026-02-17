/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/** RecognitionMode defines possible recognition modes */
export type RecognitionMode =
  /** Recognition of mrz document (does not include visa and passport) */
  | "mrz-id"
  /** Recognition of visa mrz. */
  | "mrz-visa"
  /** Recognition of passport mrz. */
  | "mrz-passport"
  /** Recognition of documents that have face photo on the front. */
  | "photo-id"
  /** Detailed document recognition. */
  | "full-recognition"
  /** Recognition of barcode document. */
  | "barcode-id";
