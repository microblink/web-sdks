/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { describe, expect, test } from "vitest";
import {
  getBlinkIdExtractionMode,
  type BlinkIdExtractionModeInput,
} from "./extractionMode";

const documentCaptureModule = {} as NonNullable<
  NonNullable<
    BlinkIdExtractionModeInput["scanningSettings"]
  >["documentCaptureModule"]
>;
const barcodeModule = {} as NonNullable<
  NonNullable<BlinkIdExtractionModeInput["scanningSettings"]>["barcodeModule"]
>;
const mandatoryBarcodeModule = { presenceMandatory: true } as NonNullable<
  NonNullable<BlinkIdExtractionModeInput["scanningSettings"]>["barcodeModule"]
>;
const mrzModule = {} as NonNullable<
  NonNullable<BlinkIdExtractionModeInput["scanningSettings"]>["mrzModule"]
>;
const vizModule = {} as NonNullable<
  NonNullable<BlinkIdExtractionModeInput["scanningSettings"]>["vizModule"]
>;

describe("getBlinkIdExtractionMode", () => {
  test.each([
    [
      "document only",
      {
        scanningMode: "automatic",
        scanningSettings: {
          documentCaptureModule,
          barcodeModule: null,
          vizModule,
          mrzModule,
        },
      },
      "full-document",
    ],
    [
      "document and mandatory barcode in single-side mode without MRZ/VIZ",
      {
        scanningMode: "single",
        scanningSettings: {
          documentCaptureModule,
          barcodeModule: mandatoryBarcodeModule,
          mrzModule: null,
          vizModule: null,
        },
      },
      "document-with-barcode",
    ],
    [
      "document and non-mandatory barcode in single-side mode",
      {
        scanningMode: "single",
        scanningSettings: {
          documentCaptureModule,
          barcodeModule,
          mrzModule: null,
          vizModule: null,
        },
      },
      "full-document",
    ],
    [
      "document and mandatory barcode in automatic mode",
      {
        scanningMode: "automatic",
        scanningSettings: {
          documentCaptureModule,
          barcodeModule: mandatoryBarcodeModule,
          mrzModule: null,
          vizModule: null,
        },
      },
      "full-document",
    ],
    [
      "barcode only without MRZ/VIZ",
      {
        scanningMode: "automatic",
        scanningSettings: {
          documentCaptureModule: null,
          barcodeModule,
          mrzModule: null,
          vizModule: null,
        },
      },
      "barcode-only",
    ],
    [
      "document with MRZ",
      {
        scanningMode: "single",
        scanningSettings: {
          documentCaptureModule: documentCaptureModule,
          mrzModule: { presenceMandatory: true },
        },
      },
      "document-with-mrz",
    ],
    [
      "document with MRZ",
      {
        scanningMode: "single",
        scanningSettings: {
          documentCaptureModule: documentCaptureModule,
          mrzModule: { presenceMandatory: false },
        },
      },
      "full-document",
    ],
    [
      "document with MRZ Automatic",
      {
        scanningMode: "automatic",
        scanningSettings: {
          documentCaptureModule: documentCaptureModule,
          mrzModule: { presenceMandatory: true },
        },
      },
      "full-document",
    ],
  ] as const)(
    "returns %s extraction mode",
    (_label, sessionSettings, expected) => {
      expect(getBlinkIdExtractionMode(sessionSettings)).toBe(expected);
    },
  );

  describe("MRZ/VIZ gating for barcode-focused extraction modes", () => {
    test.each([
      [
        "document-with-barcode falls back to full-document when MRZ enabled",
        {
          scanningMode: "single",
          scanningSettings: {
            documentCaptureModule,
            barcodeModule: mandatoryBarcodeModule,
            mrzModule,
            vizModule: null,
          },
        },
      ],
      [
        "document-with-barcode falls back to full-document when VIZ enabled",
        {
          scanningMode: "single",
          scanningSettings: {
            documentCaptureModule,
            barcodeModule: mandatoryBarcodeModule,
            mrzModule: null,
            vizModule,
          },
        },
      ],
      [
        "barcode-only falls back to full-document when MRZ enabled",
        {
          scanningMode: "automatic",
          scanningSettings: {
            documentCaptureModule: null,
            barcodeModule,
            mrzModule,
            vizModule: null,
          },
        },
      ],
      [
        "barcode-only falls back to full-document when VIZ enabled",
        {
          scanningMode: "automatic",
          scanningSettings: {
            documentCaptureModule: null,
            barcodeModule,
            mrzModule: null,
            vizModule,
          },
        },
      ],
    ] as const)("%s", (_label, sessionSettings) => {
      expect(getBlinkIdExtractionMode(sessionSettings)).toBe("full-document");
    });
  });
});
