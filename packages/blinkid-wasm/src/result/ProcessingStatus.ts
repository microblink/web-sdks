/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Represents the status of the document processing.
 *
 * ProcessingStatus defines various statuses that can occur during the
 * processing of a document, indicating the success or failure of different
 * stages of the recognition and extraction process.
 */
export type ProcessingStatus =
  /** The document was fully scanned and data was extracted as expected. */
  | "success"
  /** The document was not found on the image. */
  | "detection-failed"
  /** Preprocessing of the input image has failed. */
  | "image-preprocessing-failed"
  /**
   * Stability is achieved when the same document is provided on consecutive
   * frames, resulting in a consistent recognition between frames prior to data
   * extraction. Valid only for video feed.
   */
  | "stability-test-failed"
  /**
   * The wrong side of the document is scanned. Front side scan is completed and
   * back side is expected, but not provided by the end-user. Possible also if
   * front is expected at the start of the scanning process and back is
   * presented first by the end-user.
   */
  | "scanning-wrong-side"
  /**
   * Unexpected fields are present on the document and removed from the final
   * result.
   */
  | "field-identification-failed"
  /** Fields expected to appear on the scanned document have not been found. */
  | "mandatory-field-missing"
  /**
   * One of the extracted fields contains a character which does not satisfy the
   * rule defined for that specific field. This processing status can only occur
   * if enableCharacterValidation setting is set to true.
   */
  | "invalid-characters-found"
  /** Failed to return a requested image. */
  | "image-return-failed"
  /** Reading or parsing of the barcode has failed. */
  | "barcode-recognition-failed"
  /** Parsing of the MRZ has failed. */
  | "mrz-parsing-failed"
  /**
   * Currently scanned document has been filtered out by its document class.
   * Occurrence of this processing status is affected by documentFilter
   * setting.
   */
  | "document-filtered"
  /** Document currently not supported. */
  | "unsupported-document"
  /**
   * Front side recognition has completed successfully, and scanning process is
   * waiting for the other side to be scanned.
   */
  | "awaiting-other-side"
  /**
   * If front side recognition has not completed successfully, the back side is
   * not scanned.
   */
  | "not-scanned"
  /**
   * The barcode was not found on the image. This processing status can only
   * occur if document has mandatory barcode.
   */
  | "barcode-detection-failed";
