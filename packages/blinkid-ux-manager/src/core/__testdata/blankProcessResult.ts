/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { BlinkIdProcessResult } from "@microblink/blinkid-core";

export const blankProcessResult: BlinkIdProcessResult = {
  inputImageAnalysisResult: {
    processingStatus: "detection-failed",
    missingMandatoryFields: [],
    extractedFields: [],
    invalidCharacterFields: [],
    extraPresentFields: [],
    imageExtractionFailures: [],
    scanningSide: "first",
    documentDetectionStatus: "failed",
    documentClassInfo: {
      countryName: "",
      isoNumericCountryCode: "",
      isoAlpha2CountryCode: "",
      isoAlpha3CountryCode: "",
    },
    blurDetectionStatus: "not-available",
    glareDetectionStatus: "not-available",
    documentColorStatus: "not-available",
    documentMoireStatus: "not-available",
    faceDetectionStatus: "not-available",
    mrzDetectionStatus: "not-available",
    barcodeDetectionStatus: "not-available",
    realIDDetectionStatus: "not-available",
    documentLightingStatus: "not-available",
    documentHandOcclusionStatus: "not-available",
    documentOrientation: "not-available",
    documentRotation: "not-available",
  },
  resultCompleteness: {
    scanningStatus: "scanning-side-in-progress",
    vizExtracted: false,
    mrzExtracted: false,
    barcodeExtracted: false,
    documentImageExtracted: false,
    faceImageExtracted: false,
    signatureImageExtracted: false,
  },
};
