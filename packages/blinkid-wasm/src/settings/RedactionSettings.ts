/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { FieldType } from "../result";
import { RedactionMode } from "./RedactionMode";

/** Represents the document number redaction settings. */
export type DocumentNumberRedactionSettings = {
  /**
   * Defines how many digits at the beginning of the document number remain
   * visible after redaction. Allowed values are `0` to `255`.
   *
   * @default 0
   */
  prefixDigitsVisible: number;

  /**
   * Defines how many digits at the end of the document number remain visible
   * after redaction. Allowed values are `0` to `255`.
   *
   * @default 0
   */
  suffixDigitsVisible: number;
};

/* Represents the custom document redaction settings. */
export type RedactionSettings = {
  /*
   * The mode of redaction applied to the document.
   *
   * @default "full-result"
   */
  mode: RedactionMode;

  /**
   * Fields to be redacted.
   *
   * Using this member to redact MRZ is deprecated. Use `redactMrz` instead.
   *
   * @default [ ]
   */
  fields: FieldType[];

  /**
   * Document number redaction settings.
   *
   * @default undefined
   */
  documentNumberRedactionSettings?: DocumentNumberRedactionSettings;

  /**
   * If true, the whole MRZ will be redacted.
   *
   * This is the recommended way to redact MRZ (replacing the use of `fields`).
   * This setting uses the `mode` member to determine what will be redacted
   * (e.g., full result, image only, etc.).
   *
   * @default false
   */
  redactMrz: boolean;

  /**
   * If true, the whole Barcode result will be redacted.
   *
   * This will redact the barcode result data and remove the 'barcodeImage' from
   * the subresults.
   *
   * This setting uses the `mode` member to determine what will be redacted
   * (e.g., full result, barcode image only, etc.).
   *
   * @default false
   */
  redactBarcode: boolean;
};
