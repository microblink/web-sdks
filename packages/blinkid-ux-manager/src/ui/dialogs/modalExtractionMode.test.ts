/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { describe, expect, test } from "vitest";
import { helpModalContentByExtractionMode } from "./HelpModal";
import { onboardingModalContentByExtractionMode } from "./OnboardingGuideModal";

describe("modal extraction mode content", () => {
  test("maps onboarding extraction modes to locale groups", () => {
    expect(
      Object.fromEntries(
        Object.entries(onboardingModalContentByExtractionMode).map(
          ([extractionMode, content]) => [extractionMode, content.localeGroup],
        ),
      ),
    ).toEqual({
      "full-document": "full_document",
      "document-with-barcode": "document_with_barcode",
      "barcode-only": "barcode_only",
      "document-with-mrz": "document_with_mrz",
    });
  });

  test("maps help extraction modes to locale groups", () => {
    expect(
      Object.fromEntries(
        Object.entries(helpModalContentByExtractionMode).map(
          ([extractionMode, content]) => [extractionMode, content.localeGroup],
        ),
      ),
    ).toEqual({
      "full-document": "full_document",
      "document-with-barcode": "document_with_barcode",
      "barcode-only": "barcode_only",
      "document-with-mrz": "document_with_mrz",
    });
  });

  test("keeps the expected help scan-step order for each extraction mode", () => {
    for (const content of Object.values(helpModalContentByExtractionMode)) {
      expect(content.scanSteps.map(({ localeKey }) => localeKey)).toEqual([
        "visibility",
        "lighting",
        "blur",
      ]);
    }
  });
});

describe("modal image fallbacks", () => {
  test("keeps onboarding illustrations extraction-mode-specific", () => {
    const fullDocument =
      onboardingModalContentByExtractionMode["full-document"];
    const documentWithBarcode =
      onboardingModalContentByExtractionMode["document-with-barcode"];
    const barcodeOnly = onboardingModalContentByExtractionMode["barcode-only"];

    expect(documentWithBarcode.images.mobile).not.toBe(
      fullDocument.images.mobile,
    );
    expect(documentWithBarcode.images.desktop).not.toBe(
      fullDocument.images.desktop,
    );
    expect(barcodeOnly.images.mobile).not.toBe(fullDocument.images.mobile);
    expect(barcodeOnly.images.desktop).not.toBe(fullDocument.images.desktop);
  });

  test("falls back to default help images for missing extraction-mode-specific illustrations", () => {
    const fullDocumentSteps =
      helpModalContentByExtractionMode["full-document"].scanSteps;
    const documentWithBarcodeSteps =
      helpModalContentByExtractionMode["document-with-barcode"].scanSteps;

    expect(documentWithBarcodeSteps[1].image).toBe(fullDocumentSteps[1].image);
    expect(documentWithBarcodeSteps[2].image).toBe(fullDocumentSteps[2].image);
  });

  test("uses extraction-mode-specific help images when available", () => {
    const fullDocumentSteps =
      helpModalContentByExtractionMode["full-document"].scanSteps;
    const documentWithBarcodeSteps =
      helpModalContentByExtractionMode["document-with-barcode"].scanSteps;
    const barcodeOnlySteps =
      helpModalContentByExtractionMode["barcode-only"].scanSteps;

    expect(documentWithBarcodeSteps[0].image).not.toBe(
      fullDocumentSteps[0].image,
    );
    expect(barcodeOnlySteps[0].image).not.toBe(fullDocumentSteps[0].image);
    expect(barcodeOnlySteps[1].image).not.toBe(fullDocumentSteps[1].image);
    expect(barcodeOnlySteps[2].image).not.toBe(fullDocumentSteps[2].image);
  });
});
