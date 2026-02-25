/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { BarcodeResult } from "./barcode";
import { DetailedCroppedImageResult } from "./image";

import { MrzResult } from "./mrz";
import { VizResult } from "./viz";

/** Results of scanning a single side of a document */
export type SingleSideScanningResult = {
  /** The data extracted from the Visual Inspection Zone */
  viz?: VizResult;

  /** The data extracted from the Machine Readable Zone */
  mrz?: MrzResult;

  /** The data extracted from the barcode */
  barcode?: BarcodeResult;

  /** The input image */
  inputImage?: ImageData;

  /** The input image containing parsable barcode */
  barcodeInputImage?: ImageData;

  /** The cropped document image */
  documentImage?: ImageData;

  /** The cropped face image */
  faceImage?: DetailedCroppedImageResult;

  /** The cropped signature image */
  signatureImage?: DetailedCroppedImageResult;
};
