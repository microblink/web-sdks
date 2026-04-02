/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Represents the status of the document processing. This enum defines various
 * statuses that can occur during the processing of a document, indicating the
 * success or failure of different stages of the recognition and extraction
 * process.
 */
export type ProcessingStatus =
  | "success"
  | "detection-failed"
  | "image-preprocessing-failed"
  | "stability-test-failed"
  | "scanning-wrong-side"
  | "field-identification-failed"
  | "mandatory-field-missing"
  | "invalid-characters-found"
  | "image-return-failed"
  | "barcode-recognition-failed"
  | "mrz-parsing-failed"
  | "document-filtered"
  | "unsupported-document"
  | "awaiting-other-side"
  | "not-scanned"
  | "barcode-detection-failed";

/** DetectionStatus defines all possible states of detection */
export type DetectionStatus =
  | "failed"
  | "sucess"
  | "camera-too-far"
  | "camera-too-close"
  | "camera-angle-too-steep"
  | "document-too-close-to-camera-edge"
  | "document-partially-visible";

/**
 * Defines the progression of the scanning state machine. This status determines
 * the instructions and visual cues displayed to the user throughout the
 * multi-step scanning sequence.
 */
export type ScanningStatus =
  | "scanning-first"
  | "scanned-first"
  | "scanning-second"
  | "scanned-second"
  | "scanning-barcode"
  | "document-scanned"
  | "cancelled";

/** Represents a point in 2D space. */
export type Point = {
  x: number;
  y: number;
};

/** Represents a Quadrilateral */
export type Quadrilateral = {
  upperLeft: Point;
  upperRight: Point;
  lowerLeft: Point;
  lowerRight: Point;
};

export type DocumentOrientation = "not-available" | "horizontal" | "vertical";

export type DocumentRotation =
  | "not-available"
  | "zero"
  | "clockwise-90"
  | "counter-clockwise-90"
  | "upside-down";

export type InputImageAnalysisResult = {
  blurDetected: boolean;
  glareDetected: boolean;
  occlusionDetected: boolean;
  tiltDetected: boolean;
  hasBarcodeReadingIssue: boolean;

  /** Information extracted from the currently processed frame */
  extractionInputImageAnalysisResult: {
    /** The location of the document quadrilateral in the frame. */
    documentLocation: Quadrilateral;
    /**
     * The status of the processing. Beeing either `success` or a potential
     * `issue in the scannign process`
     */
    processingStatus: ProcessingStatus;

    /**
     * The status of the detection. This status is used for guidance of the
     * document placement. Giving instructions to the user on how to position
     * the document in the frame.
     */
    detectionStatus: DetectionStatus;

    /** Categorieses the document as a passport */
    isPassport: boolean;

    /** Categorieses the document as a passport with barcode */
    isPassportWithBarcode: boolean;

    documentOrientation: DocumentOrientation;

    documentRotation: DocumentRotation;
  };
};

export type ResultCompleteness = {
  /**
   * The current phase of the scanning state machine, driving the progression
   * toward session completion.
   */
  scanningStatus: ScanningStatus;
};

/**
 * Represents the analysis and processing results of an input frame. Provides
 * real-time feedback on the document's state, identifying any obstacles
 * preventing successful processing. It also contains extracted data used to
 * determine the next steps in the scanning workflow.
 */
export type BlinkIdVerifyProcessResult = {
  /**
   * The result of analyzing the frame. Indicating any issues with the currently
   * processed frame as well as giving some information about the document
   */
  inputImageAnalysisResult: InputImageAnalysisResult;
  /**
   * Tracking information for the scanning lifecycle. Indicates when the session
   * has gathered enough data to produce a final result.
   */
  resultCompleteness: ResultCompleteness;
};
