/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { BarcodeResult } from "./barcode";
import { DetailedCroppedImageResult } from "./image";

import { MrzResult } from "./mrz";
import { VizResult } from "./viz";

/*
 * The results of scanning a single side of a document.
 */
export type SingleSideScanningResult = {
  /** The data extracted from the Visual Inspection Zone. */
  viz: VizResult | undefined;

  /** The data extracted from the Machine Readable Zone. */
  mrz: MrzResult | undefined;

  /** The data extracted from the barcode. */
  barcode: BarcodeResult | undefined;

  /** The input image. */
  inputImage: ImageData | undefined;

  /** The input image containing parsable barcode. */
  barcodeImage: ImageData | undefined;

  /** The cropped document image. */
  documentImage: ImageData | undefined;

  /** The cropped face image. */
  faceImage: DetailedCroppedImageResult | undefined;

  /** The cropped signature image. */
  signatureImage: DetailedCroppedImageResult | undefined;
};
