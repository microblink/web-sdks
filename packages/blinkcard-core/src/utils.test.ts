/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  BlinkCardScanningResult,
  CardAccountResult,
  DateResult,
  SingleSideScanningResult,
} from "@microblink/blinkcard-wasm";
import { describe, expect, it } from "vitest";
import { extractSideInputImage } from "./utils";

const createMockImageData = () => new ImageData(1, 1);

const createMockDateResult = (): DateResult => ({
  day: 1,
  month: 1,
  year: 2030,
  originalString: "01/30",
  filledByDomainKnowledge: false,
  successfullyParsed: true,
});

const createMockCardAccount = (): CardAccountResult => ({
  cardNumber: "4111111111111111",
  cardNumberValid: true,
  cardNumberPrefix: "411111",
  cvv: "123",
  expiryDate: createMockDateResult(),
  fundingType: "DEBIT",
  cardCategory: "PERSONAL",
  issuerName: "Test Bank",
  issuerCountryCode: "USA",
  issuerCountry: "United States",
});

const createMockSingleSideResult = (
  overrides: Partial<SingleSideScanningResult> = {},
): SingleSideScanningResult => {
  const baseResult: SingleSideScanningResult = {
    cardImage: { image: undefined },
    cardLivenessCheckResult: {
      screenCheckResult: "pass",
      photocopyCheckResult: "pass",
      cardHeldInHandCheckResult: "pass",
    },
  };

  return {
    ...baseResult,
    ...overrides,
    cardImage: {
      ...baseResult.cardImage,
      ...overrides.cardImage,
    },
    cardLivenessCheckResult: {
      ...baseResult.cardLivenessCheckResult,
      ...overrides.cardLivenessCheckResult,
    },
  };
};

const createMockBlinkCardScanningResult = (
  overrides: Partial<BlinkCardScanningResult> = {},
): BlinkCardScanningResult => ({
  issuingNetwork: "visa",
  cardAccounts: [createMockCardAccount()],
  iban: undefined,
  cardholderName: undefined,
  overallCardLivenessResult: "pass",
  firstSideResult: createMockSingleSideResult(),
  secondSideResult: createMockSingleSideResult(),
  ...overrides,
});

describe("extractSideInputImage", () => {
  it("returns first side input image", () => {
    const expectedImage = createMockImageData();
    const result = createMockBlinkCardScanningResult({
      firstSideResult: createMockSingleSideResult({
        cardImage: { image: expectedImage },
      }),
    });

    const image = extractSideInputImage(result, "first");

    expect(image).toBe(expectedImage);
  });

  it("returns second side input image", () => {
    const expectedImage = createMockImageData();
    const result = createMockBlinkCardScanningResult({
      secondSideResult: createMockSingleSideResult({
        cardImage: { image: expectedImage },
      }),
    });

    const image = extractSideInputImage(result, "second");

    expect(image).toBe(expectedImage);
  });

  it("returns null when side result is missing", () => {
    const result = createMockBlinkCardScanningResult({
      secondSideResult: undefined,
    });

    const image = extractSideInputImage(result, "second");

    expect(image).toBeNull();
  });

  it("returns null when input image is missing", () => {
    const result = createMockBlinkCardScanningResult({
      firstSideResult: createMockSingleSideResult({
        cardImage: { image: undefined },
      }),
    });

    const image = extractSideInputImage(result, "first");

    expect(image).toBeNull();
  });
});
