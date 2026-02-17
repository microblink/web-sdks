/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Represents the overall result of the card processing pipeline.
 *
 * This structure combines the results of input image analysis and processing,
 * including detection, card image quality analysis, along with information
 * about the completeness of the extraction process for the card.
 */
export type BlinkCardProcessResult = {
  /** Result of the processing and analysis of the input image. */
  inputImageAnalysisResult: InputImageAnalysisResult;

  /** Completeness of the extraction process. */
  resultCompleteness: ResultCompleteness;
};

/**
 * Represents the results of processing and analyzing an input image.
 *
 * This structure contains the status of the processing, along with detailed
 * results from detection, and information about the card analysis performed on
 * the input image.
 */
export type InputImageAnalysisResult = {
  /* Status of the processing. */
  processingStatus: ProcessingStatus;

  /* Side of the card being scanned. */
  scanningSide: ScanningSide;

  /* Status of the card detection. */
  detectionStatus: DetectionStatus;

  /* The location of the detected card within the image. */
  cardLocation:
    | {
        upperLeft: { x: number; y: number };
        upperRight: { x: number; y: number };
        lowerRight: { x: number; y: number };
        lowerLeft: { x: number; y: number };
      }
    | undefined;

  /* Status of the blur detection. */
  blurDetectionStatus: ImageAnalysisDetectionStatus;

  /* The rotation of the card. */
  cardRotation: CardRotation;
};

/** Detailed information about the recognition process. */
export type ProcessingStatus =
  /** Recognition was successful. */
  | "success"

  /** Detection of the card failed. */
  | "detection-failed"

  /** Preprocessing of the input image has failed. */
  | "image-preprocessing-failed"

  /** Recognizer has inconsistent results. */
  | "stability-test-failed"

  /** Wrong side of the card has been scanned. */
  | "scanning-wrong-side"

  /** Identification of the fields present on the card has failed. */
  | "field-identification-failed"

  /** Failed to return a requested image. */
  | "image-return-failed"

  /**
   * The first side recognition was successful; waiting for the second side to
   * be scanned.
   */
  | "awaiting-other-side"

  /**
   * The second side was not scanned because the first side recognition did not
   * complete successfully.
   */
  | "not-scanned"

  /** Frame is not focused. Platform specific. * */
  | "frame-not-focused";

/** Represents the side of the document being scanned. */
export type ScanningSide = "first" | "second";

// Represents the rotation of the card.
export type CardRotation =
  | "not-available"
  | "zero"
  | "clockwise-90"
  | "counter-clockwise-90"
  | "upside-down";

/** Represents the completeness of the extraction process for a scanned card. */
export type ResultCompleteness = {
  /** The status of the scanning process. */
  scanningStatus: ScanningStatus;

  /** The status of the card number extraction. */
  cardNumberExtractionStatus: FieldExtractionStatus;

  /** The status of the card number prefix extraction. */
  cardNumberPrefixExtractionStatus: FieldExtractionStatus;

  /** The status of the expiry date extraction. */
  expiryDateExtractionStatus: FieldExtractionStatus;

  /** The status of the cardholder name extraction. */
  cardholderNameExtractionStatus: FieldExtractionStatus;

  /** The status of the CVV extraction. */
  cvvExtractionStatus: FieldExtractionStatus;

  /** The status of the IBAN extraction. */
  ibanExtractionStatus: FieldExtractionStatus;

  /** The status of the card image extraction. */
  cardImageExtractionStatus: ImageExtractionStatus;
};

/**
 * Represents the different states of a scanning process.
 *
 * This type defines the possible statuses that can occur during the scanning
 * operation, specifically for managing the progress of scanning sides and the
 * entire card.
 */
export type ScanningStatus =
  | "scanning-side-in-progress"
  | "side-scanned"
  | "card-scanned";

/** Detailed information about the field extraction process. */
export type FieldExtractionStatus =
  /** Field extraction status is not available. */
  | "not-available"

  /** Field not requested for extraction through user settings. */
  | "not-requested"

  /**
   * The field has not been detected on any scanned side so far. It may still
   * appear on a side that hasn't been scanned yet.
   */
  | "not-present"

  /**
   * The field is visually present on the current side, but could not be
   * extracted (e.g., due to blur, occlusion, or OCR failure). This is a
   * blocking error, user action is required before continuing.
   */
  | "not-extracted"

  /** The field was successfully located and extracted. */
  | "extracted";

/** Represents the status of image extraction. */
export type ImageExtractionStatus =
  /** Image extraction status is not available. */
  | "not-available"

  /** Image not requested for extraction through user settings. */
  | "not-requested"

  /** The image could not be extracted from the current side. */
  | "not-extracted"

  /** The image was successfully extracted from the current side. */
  | "extracted";

export type DetectionStatus =
  /** Detection has failed. */
  | "failed"

  /** Document has been detected. */
  | "success"

  /** Document has been detected but the camera is too far from the document. */
  | "camera-too-far"

  /** Document has been detected but the camera is too close to the document. */
  | "camera-too-close"

  /** Document has been detected but the camera’s angle is too steep. */
  | "camera-angle-too-steep"

  /**
   * Document has been detected but the document is too close to the camera
   * edge.
   */
  | "document-too-close-to-camera-edge"

  /** Only part of the document is visible. */
  | "document-partially-visible";

/** ImageAnalysisDetectionStatus defines possible states of detection. */
export type ImageAnalysisDetectionStatus =
  /** Detection was not performed */
  | "not-available"
  /** Not detected on input image */
  | "not-detected"
  /** Detected on input image */
  | "detected";
