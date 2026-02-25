/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  BlinkCardScanningResult,
  BlinkCardSessionSettings,
  DeviceInfo,
  ProcessResultWithBuffer,
  ScanningSettings,
} from "@microblink/blinkcard-core";
import { merge } from "merge-anything";
import { blankProcessResult } from "./blankProcessResult";

export type PartialProcessResult = Partial<
  Omit<
    ProcessResultWithBuffer,
    "inputImageAnalysisResult" | "resultCompleteness"
  >
> & {
  inputImageAnalysisResult?: Partial<
    ProcessResultWithBuffer["inputImageAnalysisResult"]
  >;
  resultCompleteness?: Partial<ProcessResultWithBuffer["resultCompleteness"]>;
};

export const defaultScanningSettings: ScanningSettings = {
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

export const createSessionSettings = (
  overrides: Partial<ScanningSettings> = {},
): BlinkCardSessionSettings => ({
  inputImageSource: "video",
  scanningSettings: merge(defaultScanningSettings, overrides),
});

export const createProcessResult = (
  overrides: PartialProcessResult = {},
): ProcessResultWithBuffer => ({
  ...blankProcessResult,
  ...overrides,
  arrayBuffer: new ArrayBuffer(0),
  inputImageAnalysisResult: {
    ...blankProcessResult.inputImageAnalysisResult,
    ...overrides.inputImageAnalysisResult,
  },
  resultCompleteness: {
    ...blankProcessResult.resultCompleteness,
    ...overrides.resultCompleteness,
  },
});

export const createScanningResult = (
  overrides: Partial<BlinkCardScanningResult> = {},
): BlinkCardScanningResult => ({
  issuingNetwork: "test-network",
  cardAccounts: [
    {
      cardNumber: "4111111111111111",
      cardNumberValid: true,
      cardNumberPrefix: undefined,
      cvv: undefined,
      expiryDate: {
        day: undefined,
        month: undefined,
        year: 2030,
        originalString: undefined,
        filledByDomainKnowledge: undefined,
        successfullyParsed: undefined,
      },
      fundingType: undefined,
      cardCategory: undefined,
      issuerName: undefined,
      issuerCountryCode: undefined,
      issuerCountry: undefined,
    },
  ],
  iban: undefined,
  cardholderName: undefined,
  overallCardLivenessResult: "not-available",
  firstSideResult: undefined,
  secondSideResult: undefined,
  ...overrides,
});

export const createDeviceInfo = (userAgent = "test-agent"): DeviceInfo => ({
  userAgent,
  threads: 4,
  screen: {
    screenWidth: 800,
    screenHeight: 600,
    devicePixelRatio: 2,
    physicalScreenWidth: 1600,
    physicalScreenHeight: 1200,
    maxTouchPoints: 0,
  },
  browserStorageSupport: {
    cookieEnabled: true,
    localStorageEnabled: true,
  },
  derivedDeviceInfo: {
    model: "test",
    formFactors: [],
    platform: "",
    browser: {
      brand: "test",
      version: "1",
    },
  },
});
