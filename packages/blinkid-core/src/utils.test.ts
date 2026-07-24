/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { BlinkIdScanningResult } from "@microblink/blinkid-wasm";
import { describe, expect, it } from "vitest";
import { createFakeImageData } from "@microblink/test-utils/mocks/imageData";
import {
  extractBarcodeImage,
  extractFaceImage,
  extractSideDocumentImage,
  extractSideInputImage,
  extractSignatureImage,
} from "./utils";

// Mock factory for SingleSideScanningResult
const createMockSingleSideScanningResult = (overrides = {}) => ({
  viz: undefined,
  mrz: undefined,
  barcode: undefined,
  inputImage: createFakeImageData(),
  documentImage: createFakeImageData(),
  faceImage: { image: createFakeImageData() },
  signatureImage: { image: createFakeImageData() },
  barcodeImage: createFakeImageData(),
  ...overrides,
});

// Mock factory for BlinkIdScanningResult
const createMockBlinkIdScanningResult = (
  overrides = {},
): BlinkIdScanningResult => ({
  documentClassInfo: {
    country: { id: "usa", rawValue: "USA" },
    documentType: { id: "id", rawValue: "ID" },
    region: undefined,
    countryName: "",
    isoNumericCountryCode: "",
    isoAlpha2CountryCode: "",
    isoAlpha3CountryCode: "",
  },
  dataMatchResult: undefined,
  additionalAddressInformation: undefined,
  additionalNameInformation: undefined,
  additionalOptionalAddressInformation: undefined,
  additionalPersonalIdNumber: undefined,
  address: undefined,
  bloodType: undefined,
  cardAccessNumber: undefined,
  certificateNumber: undefined,
  countryCode: undefined,
  dateOfBirth: undefined,
  dateOfEntry: undefined,
  dateOfExpiry: undefined,
  dateOfIssue: undefined,
  dependentsInfo: undefined,
  ethnicity: undefined,
  documentAdditionalNumber: undefined,
  documentNumber: undefined,
  documentOptionalAdditionalNumber: undefined,
  documentSubtype: undefined,
  driverLicenseDetailedInfo: undefined,
  effectiveDate: undefined,
  eligibilityCategory: undefined,
  employer: undefined,
  fathersName: undefined,
  firstName: undefined,
  fullName: undefined,
  husbandName: undefined,
  issuingAuthority: undefined,
  lastName: undefined,
  legalStatus: undefined,
  localityCode: undefined,
  maidenName: undefined,
  manufacturingYear: undefined,
  maritalStatus: undefined,
  mothersName: undefined,
  municipalityCode: undefined,
  municipalityOfRegistration: undefined,
  nationalInsuranceNumber: undefined,
  nationality: undefined,
  parentsInfo: undefined,
  personalIdNumber: undefined,
  placeOfBirth: undefined,
  pollingStationCode: undefined,
  profession: undefined,
  race: undefined,
  registrationCenterCode: undefined,
  religion: undefined,
  remarks: undefined,
  residencePermitType: undefined,
  residentialStatus: undefined,
  sectionCode: undefined,
  sex: undefined,
  socialSecurityStatus: undefined,
  specificDocumentValidity: undefined,
  sponsor: undefined,
  stateCode: undefined,
  stateName: undefined,
  vehicleOwner: undefined,
  vehicleType: undefined,
  visaType: undefined,
  workRestriction: undefined,
  dateOfExpiryPermanent: undefined,
  localizedName: undefined,
  inputImagesScanningSide: undefined,
  documentImagesScanningSide: undefined,
  faceImageScanningSide: undefined,
  signatureImageScanningSide: undefined,
  barcodeImageScanningSide: undefined,
  subResults: [
    createMockSingleSideScanningResult(),
    createMockSingleSideScanningResult(),
  ],
  ...overrides,
});

describe("extractSideInputImage", () => {
  it("should extract first side input image", () => {
    const expectedImage = createFakeImageData();
    const result = createMockBlinkIdScanningResult({
      subResults: [
        createMockSingleSideScanningResult({ inputImage: expectedImage }),
        createMockSingleSideScanningResult(),
      ],
    });

    const image = extractSideInputImage(result, "first");

    expect(image).toBe(expectedImage);
  });

  it("should extract second side input image", () => {
    const expectedImage = createFakeImageData();
    const result = createMockBlinkIdScanningResult({
      subResults: [
        createMockSingleSideScanningResult(),
        createMockSingleSideScanningResult({ inputImage: expectedImage }),
      ],
    });

    const image = extractSideInputImage(result, "second");

    expect(image).toBe(expectedImage);
  });

  it("should return null when side index is out of bounds", () => {
    const result = createMockBlinkIdScanningResult({
      subResults: [createMockSingleSideScanningResult()], // Only one side
    });

    const image = extractSideInputImage(result, "second");

    expect(image).toBeNull();
  });

  it("should return null when input image is undefined", () => {
    const result = createMockBlinkIdScanningResult({
      subResults: [
        createMockSingleSideScanningResult({ inputImage: undefined }),
      ],
    });

    const image = extractSideInputImage(result, "first");

    expect(image).toBeNull();
  });
});

describe("extractBarcodeImage", () => {
  it("should extract barcode image from first side", () => {
    const expectedImage = createFakeImageData();
    const result = createMockBlinkIdScanningResult({
      barcodeImageScanningSide: "first",
      subResults: [
        createMockSingleSideScanningResult({
          barcodeImage: expectedImage,
        }),
        createMockSingleSideScanningResult({ barcodeImage: undefined }),
      ],
    });

    const image = extractBarcodeImage(result);

    expect(image).toBe(expectedImage);
  });

  it("should extract barcode image from second side", () => {
    const expectedImage = createFakeImageData();
    const result = createMockBlinkIdScanningResult({
      barcodeImageScanningSide: "second",
      subResults: [
        createMockSingleSideScanningResult({ barcodeImage: undefined }),
        createMockSingleSideScanningResult({
          barcodeImage: expectedImage,
        }),
      ],
    });

    const image = extractBarcodeImage(result);

    expect(image).toBe(expectedImage);
  });

  it("should return null when no barcode image exists", () => {
    const result = createMockBlinkIdScanningResult({
      subResults: [
        createMockSingleSideScanningResult({ barcodeImage: undefined }),
        createMockSingleSideScanningResult({ barcodeImage: undefined }),
      ],
    });

    const image = extractBarcodeImage(result);

    expect(image).toBeNull();
  });
});

describe("extractSideDocumentImage", () => {
  it("should extract first side document image", () => {
    const expectedImage = createFakeImageData();
    const result = createMockBlinkIdScanningResult({
      subResults: [
        createMockSingleSideScanningResult({ documentImage: expectedImage }),
        createMockSingleSideScanningResult(),
      ],
    });

    const image = extractSideDocumentImage(result, "first");

    expect(image).toBe(expectedImage);
  });

  it("should extract second side document image", () => {
    const expectedImage = createFakeImageData();
    const result = createMockBlinkIdScanningResult({
      subResults: [
        createMockSingleSideScanningResult(),
        createMockSingleSideScanningResult({ documentImage: expectedImage }),
      ],
    });

    const image = extractSideDocumentImage(result, "second");

    expect(image).toBe(expectedImage);
  });

  it("should return null when side index is out of bounds", () => {
    const result = createMockBlinkIdScanningResult({
      subResults: [createMockSingleSideScanningResult()], // Only one side
    });

    const image = extractSideDocumentImage(result, "second");

    expect(image).toBeNull();
  });

  it("should return null when document image is undefined", () => {
    const result = createMockBlinkIdScanningResult({
      subResults: [
        createMockSingleSideScanningResult({ documentImage: undefined }),
      ],
    });

    const image = extractSideDocumentImage(result, "first");

    expect(image).toBeNull();
  });
});

describe("extractFaceImage", () => {
  it("should extract face image from first side", () => {
    const expectedImage = createFakeImageData();
    const result = createMockBlinkIdScanningResult({
      faceImageScanningSide: "first",
      subResults: [
        createMockSingleSideScanningResult({
          faceImage: { image: expectedImage },
        }),
        createMockSingleSideScanningResult({ faceImage: undefined }),
      ],
    });

    const image = extractFaceImage(result);

    expect(image).toBe(expectedImage);
  });

  it("should extract face image from second side", () => {
    const expectedImage = createFakeImageData();
    const result = createMockBlinkIdScanningResult({
      faceImageScanningSide: "second",
      subResults: [
        createMockSingleSideScanningResult({ faceImage: undefined }),
        createMockSingleSideScanningResult({
          faceImage: { image: expectedImage },
        }),
      ],
    });

    const image = extractFaceImage(result);

    expect(image).toBe(expectedImage);
  });

  it("should return null when no face image exists", () => {
    const result = createMockBlinkIdScanningResult({
      subResults: [
        createMockSingleSideScanningResult({ faceImage: undefined }),
        createMockSingleSideScanningResult({ faceImage: undefined }),
      ],
    });

    const image = extractFaceImage(result);

    expect(image).toBeNull();
  });
});

describe("extractSignatureImage", () => {
  it("should extract signature image from first side", () => {
    const expectedImage = createFakeImageData();
    const result = createMockBlinkIdScanningResult({
      signatureImageScanningSide: "first",
      subResults: [
        createMockSingleSideScanningResult({
          signatureImage: { image: expectedImage },
        }),
        createMockSingleSideScanningResult({ signatureImage: undefined }),
      ],
    });

    const image = extractSignatureImage(result);

    expect(image).toBe(expectedImage);
  });

  it("should extract signature image from second side", () => {
    const expectedImage = createFakeImageData();
    const result = createMockBlinkIdScanningResult({
      signatureImageScanningSide: "second",
      subResults: [
        createMockSingleSideScanningResult({ signatureImage: undefined }),
        createMockSingleSideScanningResult({
          signatureImage: { image: expectedImage },
        }),
      ],
    });

    const image = extractSignatureImage(result);

    expect(image).toBe(expectedImage);
  });

  it("should return null when no signature image exists", () => {
    const result = createMockBlinkIdScanningResult({
      signatureImageScanningSide: undefined,
      subResults: [
        createMockSingleSideScanningResult({ signatureImage: undefined }),
        createMockSingleSideScanningResult({ signatureImage: undefined }),
      ],
    });

    const image = extractSignatureImage(result);

    expect(image).toBeNull();
  });
});
