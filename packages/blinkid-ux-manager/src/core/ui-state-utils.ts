/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import {
  BlinkIdProcessResult,
  DocumentClassInfo,
} from "@microblink/blinkid-core";

/**
 * Extracts the document class info from the process result.
 *
 * @param processResult - The process result.
 * @returns The document class info.
 */
export function extractDocumentClassInfo(processResult: BlinkIdProcessResult) {
  return processResult.inputImageAnalysisResult.documentClassInfo;
}

/**
 * Checks if the document class is classified.
 *
 * @param documentClassInfo - The document class info.
 * @returns Whether the document class is classified.
 */
export function isDocumentClassified(
  documentClassInfo: DocumentClassInfo,
): boolean {
  return (
    documentClassInfo?.country !== undefined &&
    documentClassInfo?.type !== undefined
  );
}

export function getDocumentRotation(processResult: BlinkIdProcessResult) {
  return processResult.inputImageAnalysisResult.documentRotation;
}

/**
 * Checks if the document is a passport.
 *
 * @param docClass - The document class info.
 * @returns True if the document is a passport, false otherwise.
 */

export function isPassport(docClass: DocumentClassInfo | undefined) {
  return docClass?.type === "passport";
}
/**
 * Checks if the document is a passport and has a barcode on the last page (USA or India).
 *
 * @param docClass - The document class info.
 * @returns True if the document is a passport and has a barcode on the last page (USA or India), false otherwise.
 */

export function isPassportWithBarcode(docClass: DocumentClassInfo | undefined) {
  return (
    isPassport(docClass) &&
    (docClass?.country === "usa" || docClass?.country === "india")
  );
}
/**
 * Checks if the document is a passport without a barcode on the last page (not USA or India).
 *
 * @param docClass - The document class info.
 * @returns True if the document is a passport without a barcode on the last page (not USA or India), false otherwise.
 */

export function isPassportWithoutBarcode(
  docClass: DocumentClassInfo | undefined,
) {
  return (
    isPassport(docClass) &&
    docClass?.country !== "usa" &&
    docClass?.country !== "india"
  );
} /**
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
  docClass: DocumentClassInfo | undefined,
): DocumentPagination {
  if (isPassportWithBarcode(docClass)) {
    return "passport-with-barcode";
  } else if (isPassportWithoutBarcode(docClass)) {
    return "passport-no-barcode";
  } else {
    return "other";
  }
}
