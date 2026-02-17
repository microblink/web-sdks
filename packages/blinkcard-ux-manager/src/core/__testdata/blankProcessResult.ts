/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { BlinkCardProcessResult } from "@microblink/blinkcard-core";

export const blankProcessResult: BlinkCardProcessResult = {
  inputImageAnalysisResult: {
    processingStatus: "detection-failed",
    scanningSide: "first",
    detectionStatus: "failed",
    cardLocation: undefined,
    blurDetectionStatus: "not-available",
    cardRotation: "zero",
  },
  resultCompleteness: {
    scanningStatus: "scanning-side-in-progress",
    cardNumberExtractionStatus: "not-available",
    cardNumberPrefixExtractionStatus: "not-available",
    expiryDateExtractionStatus: "not-available",
    cardholderNameExtractionStatus: "not-available",
    cvvExtractionStatus: "not-available",
    ibanExtractionStatus: "not-available",
    cardImageExtractionStatus: "not-available",
  },
};
