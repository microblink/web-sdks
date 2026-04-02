/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { BlinkIdVerifyProcessResult } from "@microblink/blinkid-verify-core";

export function getDocumentRotation(processResult: BlinkIdVerifyProcessResult) {
  return processResult.inputImageAnalysisResult
    .extractionInputImageAnalysisResult.documentRotation;
}

/**
 * Checks if the document is a passport.
 *
 * @param docClass - The document class info.
 * @returns True if the document is a passport, false otherwise.
 */

export function isPassport(processResult: BlinkIdVerifyProcessResult) {
  return processResult.inputImageAnalysisResult
    .extractionInputImageAnalysisResult.isPassport;
}
/**
 * Checks if the document is a passport and has a barcode on the last page (USA or India).
 *
 * @param docClass - The document class info.
 * @returns True if the document is a passport and has a barcode on the last page (USA or India), false otherwise.
 */

export function isPassportWithBarcode(
  processResult: BlinkIdVerifyProcessResult,
) {
  return processResult.inputImageAnalysisResult
    .extractionInputImageAnalysisResult.isPassportWithBarcode;
}
/**
 * Checks if the document is a passport without a barcode on the last page (not USA or India).
 *
 * @param docClass - The document class info.
 * @returns True if the document is a passport without a barcode on the last page (not USA or India), false otherwise.
 */

export function isPassportWithoutBarcode(
  processResult: BlinkIdVerifyProcessResult,
) {
  return isPassport(processResult) && !isPassportWithBarcode(processResult);
}

/**
 * Utility type for document pagination types.
 */

export type DocumentPagination =
  | "passport-no-barcode"
  | "passport-with-barcode"
  | "other";
/**
 * Determines the document pagination type based on the document class info.
 *
 * @param docClass - The document class info.
 * @returns The document pagination type.
 */

export function getDocumentPaginationType(
  processResult: BlinkIdVerifyProcessResult,
): DocumentPagination {
  if (isPassportWithBarcode(processResult)) {
    return "passport-with-barcode";
  } else if (isPassportWithoutBarcode(processResult)) {
    return "passport-no-barcode";
  } else {
    return "other";
  }
}
