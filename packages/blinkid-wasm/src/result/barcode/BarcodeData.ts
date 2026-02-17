/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/** Represents the type of scanned barcode */
export type BarcodeType =
  /** Indicates that QR code has been detected. */
  | "qr-code"
  /** Indicates that Data Matrix 2D barcode has been detected. */
  | "data-matrix"
  /** Indicates that UPC E 1D barcode has been detected. */
  | "upc-e"
  /** Indicates that UPC A 1D barcode has been detected. */
  | "upc-a"
  /** Indicates that EAN 8 1D barcode has been detected. */
  | "ean-8"
  /** Indicates that EAN 13 1D barcode has been detected. */
  | "ean-13"
  /** Indicates that Code 128 1D barcode has been detected. */
  | "code-128"
  /** Indicates that Code 39 1D barcode has been detected. */
  | "code-39"
  /** Indicates that ITF 1D barcode has been detected. */
  | "itf"
  /** Indicates that Aztec 2D barcode has been detected. */
  | "aztec-barcode"
  /** Indicates that PDF417 2D barcode has been detected. */
  | "pdf417-barcode";

/** Data extracted from barcode. */
export type BarcodeData = {
  /** Format of recognized barcode. */
  barcodeType: BarcodeType;

  /**
   * True if returned result is uncertain, i.e. if scanned barcode was
   * incomplete (has parts of it missing).
   */
  uncertain: boolean;

  /** String representation of data inside barcode. */
  stringData: string;

  /** The raw bytes contained inside barcode. */
  rawData: Uint8Array;
};
