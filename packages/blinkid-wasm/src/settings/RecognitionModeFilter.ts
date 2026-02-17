/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Represents the configuration used to enable/disable recognition of specific
 * document groups.
 *
 * By default, all modes are enabled.
 */
export type RecognitionModeFilter = {
  /** Enable scanning of MRZ IDs. */
  enableMrzId: boolean;

  /** Enable scanning of visa MRZ. */
  enableMrzVisa: boolean;

  /** Enable scanning of Passport MRZ. */
  enableMrzPassport: boolean;

  /** Enable scanning of Photo ID. */
  enablePhotoId: boolean;

  /** Enable scanning of barcode IDs. */
  enableBarcodeId: boolean;

  /** Enable full document recognition. */
  enableFullDocumentRecognition: boolean;
};
