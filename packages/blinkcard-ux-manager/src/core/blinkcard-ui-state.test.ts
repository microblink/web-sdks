/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  BlinkCardProcessResult,
  ScanningSettings,
} from "@microblink/blinkcard-core";
import { merge } from "merge-anything";
import { describe, expect, test } from "vitest";
import {
  getUiStateKey,
  type BlinkCardUiMappableKey,
} from "./blinkcard-ui-state";
import { blankProcessResult } from "./__testdata/blankProcessResult";

/**
 * Test file role:
 * - Owns pure mapping rules from process results/settings to BlinkCard UI state keys.
 * - Keep these tests deterministic and data-driven; avoid manager lifecycle concerns.
 */

type PartialProcessResult = Partial<
  Omit<
    BlinkCardProcessResult,
    "inputImageAnalysisResult" | "resultCompleteness"
  >
> & {
  inputImageAnalysisResult?: Partial<
    BlinkCardProcessResult["inputImageAnalysisResult"]
  >;
  resultCompleteness?: Partial<BlinkCardProcessResult["resultCompleteness"]>;
};

const createProcessResult = (
  overrides: PartialProcessResult = {},
): BlinkCardProcessResult => {
  return merge(blankProcessResult, overrides);
};

const defaultScanningSettings: ScanningSettings = {
  skipImagesWithBlur: true,
  tiltDetectionLevel: "off",
  inputImageMargin: 0.02,
  extractionSettings: {
    extractIban: true,
    extractExpiryDate: true,
    extractCardholderName: true,
    extractCvv: true,
    extractInvalidCardNumber: false,
  },
  croppedImageSettings: {
    dotsPerInch: 300,
    extensionFactor: 0,
    returnCardImage: false,
  },
  livenessSettings: {
    handToCardSizeRatio: 0,
    handCardOverlapThreshold: 0,
    enableCardHeldInHandCheck: false,
    screenCheckStrictnessLevel: "disabled",
    photocopyCheckStrictnessLevel: "disabled",
  },
  anonymizationSettings: {
    cardNumberAnonymizationSettings: {
      mode: "none",
      prefixDigitsVisible: 0,
      suffixDigitsVisible: 0,
    },
    cardNumberPrefixAnonymizationMode: "none",
    cvvAnonymizationMode: "none",
    ibanAnonymizationMode: "none",
    cardholderNameAnonymizationMode: "none",
  },
};

const getMergedSettings = (
  overrides: Partial<ScanningSettings> = {},
): ScanningSettings => {
  return merge(defaultScanningSettings, overrides);
};

describe("getUiStateKey", () => {
  test("prioritizes CARD_CAPTURED over detection errors", () => {
    const processResult = createProcessResult({
      resultCompleteness: { scanningStatus: "card-scanned" },
      inputImageAnalysisResult: { detectionStatus: "camera-too-close" },
    });
    const settings = getMergedSettings();

    expect(getUiStateKey(processResult, settings)).toBe<BlinkCardUiMappableKey>(
      "CARD_CAPTURED",
    );
  });

  test("returns FIRST_SIDE_CAPTURED when awaiting other side", () => {
    const processResult = createProcessResult({
      inputImageAnalysisResult: { processingStatus: "awaiting-other-side" },
    });
    const settings = getMergedSettings();

    expect(getUiStateKey(processResult, settings)).toBe<BlinkCardUiMappableKey>(
      "FIRST_SIDE_CAPTURED",
    );
  });

  test.each<{
    detectionStatus: BlinkCardProcessResult["inputImageAnalysisResult"]["detectionStatus"];
    expected: BlinkCardUiMappableKey;
  }>([
    {
      detectionStatus: "camera-too-far",
      expected: "CARD_FRAMING_CAMERA_TOO_FAR",
    },
    {
      detectionStatus: "camera-too-close",
      expected: "CARD_FRAMING_CAMERA_TOO_CLOSE",
    },
    {
      detectionStatus: "camera-angle-too-steep",
      expected: "CARD_FRAMING_CAMERA_ANGLE_TOO_STEEP",
    },
    {
      detectionStatus: "document-too-close-to-camera-edge",
      expected: "CARD_TOO_CLOSE_TO_FRAME_EDGE",
    },
  ])(
    "maps framing errors for $detectionStatus",
    ({ detectionStatus, expected }) => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: { detectionStatus },
      });
      const settings = getMergedSettings();

      expect(
        getUiStateKey(processResult, settings),
      ).toBe<BlinkCardUiMappableKey>(expected);
    },
  );

  test.each<{
    processingStatus: BlinkCardProcessResult["inputImageAnalysisResult"]["processingStatus"];
  }>([
    { processingStatus: "image-return-failed" },
    { processingStatus: "field-identification-failed" },
  ])("maps $processingStatus to OCCLUDED", ({ processingStatus }) => {
    const processResult = createProcessResult({
      inputImageAnalysisResult: { processingStatus },
    });
    const settings = getMergedSettings();

    expect(getUiStateKey(processResult, settings)).toBe<BlinkCardUiMappableKey>(
      "OCCLUDED",
    );
  });

  test("maps document-partially-visible to OCCLUDED", () => {
    const processResult = createProcessResult({
      inputImageAnalysisResult: {
        detectionStatus: "document-partially-visible",
      },
    });
    const settings = getMergedSettings();

    expect(getUiStateKey(processResult, settings)).toBe<BlinkCardUiMappableKey>(
      "OCCLUDED",
    );
  });

  test("maps blur detection to BLUR_DETECTED when skipping blur", () => {
    const settings = getMergedSettings({ skipImagesWithBlur: true });
    const processResult = createProcessResult({
      inputImageAnalysisResult: {
        processingStatus: "image-preprocessing-failed",
        blurDetectionStatus: "detected",
      },
    });

    expect(getUiStateKey(processResult, settings)).toBe<BlinkCardUiMappableKey>(
      "BLUR_DETECTED",
    );
  });

  test("falls back to CARD_NOT_IN_FRAME_FRONT when blur skip disabled", () => {
    const settings = getMergedSettings({ skipImagesWithBlur: false });
    const processResult = createProcessResult({
      inputImageAnalysisResult: {
        processingStatus: "image-preprocessing-failed",
        blurDetectionStatus: "detected",
      },
    });

    expect(getUiStateKey(processResult, settings)).toBe<BlinkCardUiMappableKey>(
      "CARD_NOT_IN_FRAME_FRONT",
    );
  });

  test("maps scanning-wrong-side to WRONG_SIDE", () => {
    const processResult = createProcessResult({
      inputImageAnalysisResult: { processingStatus: "scanning-wrong-side" },
    });
    const settings = getMergedSettings();

    expect(getUiStateKey(processResult, settings)).toBe<BlinkCardUiMappableKey>(
      "WRONG_SIDE",
    );
  });

  test("maps scanning-side-in-progress for second side to CARD_NOT_IN_FRAME_BACK", () => {
    const processResult = createProcessResult({
      inputImageAnalysisResult: { scanningSide: "second" },
      resultCompleteness: { scanningStatus: "scanning-side-in-progress" },
    });
    const settings = getMergedSettings();

    expect(getUiStateKey(processResult, settings)).toBe<BlinkCardUiMappableKey>(
      "CARD_NOT_IN_FRAME_BACK",
    );
  });

  test("falls back to CARD_NOT_IN_FRAME_FRONT", () => {
    const processResult = createProcessResult();
    const settings = getMergedSettings();

    expect(getUiStateKey(processResult, settings)).toBe<BlinkCardUiMappableKey>(
      "CARD_NOT_IN_FRAME_FRONT",
    );
  });
});
