/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { describe, expect, beforeEach, test } from "vitest";
import { BlinkIdSessionSettings } from "@microblink/blinkid-wasm";
import {
  buildSessionSettings,
  PartialBlinkIdSessionSettings,
} from "./buildSessionSettings";

describe("buildSessionSettings", () => {
  let defaultSessionSettings: BlinkIdSessionSettings;
  beforeEach(() => {
    defaultSessionSettings = {
      inputImageSource: "video",
      scanningMode: "automatic",
      scanningSettings: {
        allowUncertainFrontSideScan: false,
        blurDetectionLevel: "mid",
        glareDetectionLevel: "mid",
        tiltDetectionLevel: "mid",
        skipImagesWithBlur: true,
        skipImagesWithGlare: true,
        skipImagesOccludedByHand: true,
        skipImagesWithInadequateLightingConditions: true,
        combineResultsFromMultipleInputImages: true,
        croppedImageSettings: {
          dotsPerInch: 250,
          extensionFactor: 0,
          returnDocumentImage: false,
          returnFaceImage: false,
          returnSignatureImage: false,
        },
        customDocumentAnonymizationSettings: [],
        customDocumentRules: [],
        enableBarcodeScanOnly: false,
        enableCharacterValidation: true,
        inputImageMargin: 0.02,
        maxAllowedMismatchesPerField: 0,
        recognitionModeFilter: {
          enableBarcodeId: true,
          enableFullDocumentRecognition: true,
          enableMrzId: true,
          enableMrzPassport: true,
          enableMrzVisa: true,
          enablePhotoId: true,
        },
        returnInputImages: false,
        scanCroppedDocumentImage: false,
        scanPassportDataPageOnly: true,
        scanUnsupportedBack: false,
        anonymizationMode: "full-result",
      },
    };
  });

  describe("buildSessionSettings", () => {
    test("should return default settings when no options are provided", () => {
      const result = buildSessionSettings(undefined, defaultSessionSettings);
      expect(result).toStrictEqual(defaultSessionSettings);
    });

    test("should filter out undefined values from options", () => {
      const options: PartialBlinkIdSessionSettings = {
        scanningMode: undefined,
        inputImageSource: undefined,
      };

      const result = buildSessionSettings(options, defaultSessionSettings);

      expect(result.scanningMode).toBe("automatic");
      expect(result.inputImageSource).toBe("video");
    });
  });
});
