/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { ScanningStatus } from "./ScanningStatus";

/**
 * Represents the completeness of the extraction process for a scanned document.
 *
 * This structure tracks the status of the scanning process and indicates
 * whether specific components of the document, such as the specific fields from
 * the VIZ, MRZ, and barcode, have been successfully extracted.
 */
export type ResultCompleteness = {
  /** The status of the scanning process */
  scanningStatus: ScanningStatus;

  /** Whether the VIZ fields have been extracted */
  vizExtracted: boolean;

  /** Whether the MRZ fields have been extracted */
  mrzExtracted: boolean;

  /** Whether the barcode fields have been extracted */
  barcodeExtracted: boolean;

  /** Whether the document image has been extracted */
  documentImageExtracted: boolean;

  /** Whether the face image has been extracted */
  faceImageExtracted: boolean;

  /** Whether the signature image has been extracted */
  signatureImageExtracted: boolean;
};
