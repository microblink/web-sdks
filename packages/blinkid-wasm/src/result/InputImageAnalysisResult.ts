/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { DetectionStatus } from "../session";
import { Quadrilateral } from "../utils";
import { DocumentClassInfo } from "./classinfo";
import { DocumentImageColor } from "./DocumentImageColor";
import { DocumentOrientation } from "./DocumentOrientation";
import { DocumentRotation } from "./DocumentRotation";
import { FieldType } from "./FieldType";
import { ImageAnalysisDetectionStatus } from "./ImageAnalysisDetectionStatus";
import { ImageAnalysisLightingStatus } from "./ImageAnalysisLightingStatus";
import { ImageExtractionType } from "./ImageExtractionType";
import { ProcessingStatus } from "./ProcessingStatus";
import { ScanningSide } from "./ScanningSide";

/**
 * Represents the results of processing and analyzing an input image.
 *
 * This structure contains the status of the processing, along with detailed
 * results from detection, document quality, and information about the document
 * analysis performed on the input image.
 */
export type InputImageAnalysisResult = {
  /** Status of the processing */
  processingStatus: ProcessingStatus;

  /** List of fields that were expected on the document but were missing */
  missingMandatoryFields: FieldType[];

  /** List of fields that were extracted from the document */
  extractedFields: FieldType[];

  /**
   * List of fields that contained characters which were not expected in that
   * field
   */
  invalidCharacterFields: FieldType[];

  /** List of fields that weren't expected on the document but were present */
  extraPresentFields: FieldType[];

  /** List of failed image extractions */
  imageExtractionFailures: ImageExtractionType[];

  /** Side of the document being scanned */
  scanningSide: ScanningSide;

  /** The status of the document detection */
  documentDetectionStatus: DetectionStatus;

  /** The location of the detected document within an image */
  documentLocation?: Quadrilateral;

  /** Information about the document class */
  documentClassInfo: DocumentClassInfo;

  /** The status of blur detection */
  blurDetectionStatus: ImageAnalysisDetectionStatus;

  /** The status of glare detection */
  glareDetectionStatus: ImageAnalysisDetectionStatus;

  /** The color status of the document image */
  documentColorStatus: DocumentImageColor;

  /** The status of moire pattern detection in the document image */
  documentMoireStatus: ImageAnalysisDetectionStatus;

  /** The status of face detection */
  faceDetectionStatus: ImageAnalysisDetectionStatus;

  /** The status of MRZ detection */
  mrzDetectionStatus: ImageAnalysisDetectionStatus;

  /** The status of barcode detection */
  barcodeDetectionStatus: ImageAnalysisDetectionStatus;

  /** The status of real ID detection */
  realIDDetectionStatus: ImageAnalysisDetectionStatus;

  /** The status of lighting conditions in the document image */
  documentLightingStatus: ImageAnalysisLightingStatus;

  /** The status of hand occlusion detection in the document image */
  documentHandOcclusionStatus: ImageAnalysisDetectionStatus;

  /** The orientation of the document */
  documentOrientation: DocumentOrientation;

  /** The rotation of the document in the frame */
  documentRotation: DocumentRotation;
};
