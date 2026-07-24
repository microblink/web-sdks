/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import {
  Country,
  DetectionStatus,
  DocumentRotation,
  FieldType,
  ImageAnalysisLightingStatus,
  PartialScanningSettingsInput,
  ScanningSettings,
  ScanningSide,
} from "@microblink/blinkid-core";
import { describe, expect, test } from "vitest";
import { BlinkIdUiStateKey, getUiStateKey } from "./blinkid-ui-state";
import { createProcessResult } from "./__testdata/blinkidTestFixtures";
import {
  isPassport,
  isPassportWithBarcode,
  isPassportWithoutBarcode,
} from "./ui-state-utils";
import { merge } from "merge-anything";
import { createDocumentClassInfo } from "./test-utils";

const getMergedScanningSettings = (
  overrides: PartialScanningSettingsInput = {},
): ScanningSettings => {
  return merge({}, overrides) as ScanningSettings;
};

/**
 * Test file role:
 * - Owns pure mapping rules from process results/settings to BlinkId UI state keys.
 * - Keep these tests deterministic and data-driven; avoid manager lifecycle concerns.
 */

describe("Passport utils", () => {
  describe("isPassport", () => {
    test("should return true for passport documents", () => {
      expect(
        isPassport(
          createDocumentClassInfo({ type: "passport", country: "croatia" }),
        ),
      ).toBe(true);
    });

    test("should return false for non-passport documents", () => {
      expect(
        isPassport(createDocumentClassInfo({ type: "id", country: "croatia" })),
      ).toBe(false);
      expect(
        isPassport(createDocumentClassInfo({ type: "dl", country: "croatia" })),
      ).toBe(false);
    });

    test("should return false when classification is missing", () => {
      expect(isPassport(undefined)).toBe(false);
    });
  });

  describe("isPassportWithBarcode", () => {
    test("should return true for USA passport", () => {
      expect(
        isPassportWithBarcode(
          createDocumentClassInfo({ type: "passport", country: "usa" }),
        ),
      ).toBe(true);
    });

    test("should return true for India passport", () => {
      expect(
        isPassportWithBarcode(
          createDocumentClassInfo({ type: "passport", country: "india" }),
        ),
      ).toBe(true);
    });

    test("should return false for other passports", () => {
      expect(
        isPassportWithBarcode(
          createDocumentClassInfo({ type: "passport", country: "croatia" }),
        ),
      ).toBe(false);
    });

    test("should return false for non-passport documents", () => {
      expect(
        isPassportWithBarcode(
          createDocumentClassInfo({ type: "id", country: "usa" }),
        ),
      ).toBe(false);
    });

    test("should return false when classification is missing", () => {
      expect(isPassportWithBarcode(undefined)).toBe(false);
    });
  });

  describe("isPassportWithoutBarcode", () => {
    test("should return true for non-barcode passports", () => {
      expect(
        isPassportWithoutBarcode(
          createDocumentClassInfo({ type: "passport", country: "croatia" }),
        ),
      ).toBe(true);
    });

    test("should return false for USA passport", () => {
      expect(
        isPassportWithoutBarcode(
          createDocumentClassInfo({ type: "passport", country: "usa" }),
        ),
      ).toBe(false);
    });

    test("should return false for India passport", () => {
      expect(
        isPassportWithoutBarcode(
          createDocumentClassInfo({ type: "passport", country: "india" }),
        ),
      ).toBe(false);
    });

    test("should return false for non-passport documents", () => {
      expect(
        isPassportWithoutBarcode(
          createDocumentClassInfo({ type: "id", country: "croatia" }),
        ),
      ).toBe(false);
    });

    test("should return false when classification is missing", () => {
      expect(isPassportWithoutBarcode(undefined)).toBe(false);
    });
  });
});

describe("getUiStateKey", () => {
  describe("Document Capture States", () => {
    test("should return DOCUMENT_CAPTURED when document is fully scanned", () => {
      const processResult = createProcessResult();
      const result = getUiStateKey(
        "document-scanned",
        processResult.inputImageAnalysisResult,
        getMergedScanningSettings(),
      );

      expect(result).toBe<BlinkIdUiStateKey>("DOCUMENT_CAPTURED");
    });

    test("should return PAGE_CAPTURED when one side is scanned", () => {
      const processResult = createProcessResult();

      const result = getUiStateKey(
        "side-scanned",
        processResult.inputImageAnalysisResult,
        getMergedScanningSettings(),
      );

      expect(result).toBe<BlinkIdUiStateKey>("PAGE_CAPTURED");
    });

    test("should return PROCESSING_BARCODE when barcode scanning is in progress", () => {
      /**
       * Actual process result returned from the WASM SDK when barcode scanning is
       * in progress.
       */
      const processResult = createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "barcode-recognition-failed",
          scanningSide: "second",
          documentDetectionStatus: "failed",
          documentClassInfo: {},
          blurDetectionStatus: "not-available",
          glareDetectionStatus: "not-available",
          documentColorStatus: "not-available",
          documentMoireStatus: "not-available",
          faceDetectionStatus: "not-available",
          mrzDetectionStatus: "not-available",
          barcodeDetectionStatus: "not-available",
          realIDDetectionStatus: "not-available",
          documentLightingStatus: "not-available",
          documentHandOcclusionStatus: "not-available",
          documentOrientation: "not-available",
          documentRotation: "not-available",
        },
        resultCompleteness: {
          viz: [
            {
              attribute: "mandatory",
              fields: {
                additionalAddressInformation: {
                  latin: {
                    attribute: "mandatory",
                    status: "extracted",
                  },
                },
              },
            },
          ],
          mrz: undefined,
          barcode: undefined,
          faceImage: undefined,
          signatureImage: undefined,
          barcodeImage: undefined,
          documentImages: undefined,
        },
      });

      const result = getUiStateKey(
        "scanning-barcode-in-progress",
        processResult.inputImageAnalysisResult,
        getMergedScanningSettings(),
      );
      expect(result).toBe<BlinkIdUiStateKey>("PROCESSING_BARCODE");
    });
  });

  describe("Document Framing States", () => {
    test.each<{ status: DetectionStatus; expected: BlinkIdUiStateKey }>([
      {
        status: "camera-too-close",
        expected: "DOCUMENT_FRAMING_CAMERA_TOO_CLOSE",
      },
      { status: "camera-too-far", expected: "DOCUMENT_FRAMING_CAMERA_TOO_FAR" },
      {
        status: "camera-angle-too-steep",
        expected: "DOCUMENT_FRAMING_CAMERA_ANGLE_TOO_STEEP",
      },
      {
        status: "document-too-close-to-camera-edge",
        expected: "DOCUMENT_TOO_CLOSE_TO_FRAME_EDGE",
      },
    ])(
      "should return $expected when document detection status is $status",
      ({ status, expected }) => {
        const processResult = createProcessResult({
          inputImageAnalysisResult: {
            documentDetectionStatus: status,
          },
        });

        const result = getUiStateKey(
          "scanning-side-in-progress",
          processResult.inputImageAnalysisResult,
          getMergedScanningSettings(),
        );

        expect(result).toBe<BlinkIdUiStateKey>(expected);
      },
    );
  });

  describe("Image Quality States", () => {
    describe("Blur Detection", () => {
      test.each<{
        imageWithBlurRejected: boolean;
        expected: BlinkIdUiStateKey;
      }>([
        { imageWithBlurRejected: true, expected: "BLUR_DETECTED" },
        // { skipImagesWithBlur: false, expected: "FRONT_PAGE_NOT_IN_FRAME" }, // can't happen alone, needs to be combined with blur or other issue
      ])(
        "should return $expected when blur is detected and imageWithBlurRejected is $imageWithBlurRejected",
        ({ imageWithBlurRejected, expected }) => {
          const processResult = createProcessResult({
            inputImageAnalysisResult: {
              blurDetectionStatus: "detected",
              documentDetectionStatus: "success",
            },
          });

          const result = getUiStateKey(
            "scanning-side-in-progress",
            processResult.inputImageAnalysisResult,
            getMergedScanningSettings({
              documentCaptureModule: { imageWithBlurRejected },
            }),
          );

          expect(result).toBe<BlinkIdUiStateKey>(expected);
        },
      );
    });

    describe("Glare Detection", () => {
      test.each<{
        imageWithGlareRejected: boolean;
        expected: BlinkIdUiStateKey;
      }>([
        { imageWithGlareRejected: true, expected: "GLARE_DETECTED" },
        // { skipImagesWithGlare: false, expected: "FRONT_PAGE_NOT_IN_FRAME" }, // can't happen alone, needs to be combined with blur or other issue
      ])(
        "should return $expected when glare is detected and imageWithGlareRejected is $imageWithGlareRejected",
        ({ imageWithGlareRejected, expected }) => {
          const processResult = createProcessResult({
            inputImageAnalysisResult: {
              glareDetectionStatus: "detected",
              documentDetectionStatus: "success",
            },
          });

          const result = getUiStateKey(
            "scanning-side-in-progress",
            processResult.inputImageAnalysisResult,
            getMergedScanningSettings({
              documentCaptureModule: { imageWithGlareRejected },
            }),
          );

          expect(result).toBe<BlinkIdUiStateKey>(expected);
        },
      );
    });

    /** Can't happen */
    describe.skip("Blur and Glare combined", () => {
      test("should return FRONT_PAGE_NOT_IN_FRAME when both blur and glare are detected but skip settings are disabled", () => {
        const processResult = createProcessResult({
          inputImageAnalysisResult: {
            blurDetectionStatus: "detected",
            glareDetectionStatus: "detected",
            documentDetectionStatus: "success",
          },
        });

        const result = getUiStateKey(
          "scanning-side-in-progress",
          processResult.inputImageAnalysisResult,
          getMergedScanningSettings({
            documentCaptureModule: {
              imageWithBlurRejected: false,
              imageWithGlareRejected: false,
            },
          }),
        );

        expect(result).toBe<BlinkIdUiStateKey>("FRONT_PAGE_NOT_IN_FRAME");
      });
    });

    describe("Lighting Conditions", () => {
      test.each<{
        status: ImageAnalysisLightingStatus;
        expected: BlinkIdUiStateKey;
        imageWithPoorLightingRejected: boolean;
      }>([
        {
          status: "too-dark",
          expected: "TOO_DARK",
          imageWithPoorLightingRejected: true,
        },
        {
          status: "too-dark",
          expected: "FRONT_PAGE_NOT_IN_FRAME",
          imageWithPoorLightingRejected: false,
        },
        {
          status: "too-bright",
          expected: "TOO_BRIGHT",
          imageWithPoorLightingRejected: true,
        },
        {
          status: "too-bright",
          expected: "FRONT_PAGE_NOT_IN_FRAME",
          imageWithPoorLightingRejected: false,
        },
      ])(
        "should return $expected when lighting status is $status and imageWithPoorLightingRejected is $imageWithPoorLightingRejected",
        ({ status, expected, imageWithPoorLightingRejected }) => {
          const processResult = createProcessResult({
            inputImageAnalysisResult: {
              documentLightingStatus: status,
            },
          });

          const result = getUiStateKey(
            "scanning-side-in-progress",
            processResult.inputImageAnalysisResult,
            getMergedScanningSettings({
              documentCaptureModule: { imageWithPoorLightingRejected },
            }),
          );

          expect(result).toBe<BlinkIdUiStateKey>(expected);
        },
      );
    });
  });

  describe("Passport Sensing States", () => {
    test.each<{
      rotation: DocumentRotation;
      expected: BlinkIdUiStateKey;
      country?: Country;
    }>([
      { rotation: "zero", expected: "TOP_PAGE_NOT_IN_FRAME" },
      { rotation: "not-available", expected: "TOP_PAGE_NOT_IN_FRAME" },
      { rotation: "upside-down", expected: "TOP_PAGE_NOT_IN_FRAME" },
      { rotation: "counter-clockwise-90", expected: "LEFT_PAGE_NOT_IN_FRAME" },
      { rotation: "clockwise-90", expected: "RIGHT_PAGE_NOT_IN_FRAME" },
      {
        rotation: "zero",
        expected: "LAST_PAGE_NOT_IN_FRAME",
        country: "india",
      },
      {
        rotation: "not-available",
        expected: "LAST_PAGE_NOT_IN_FRAME",
        country: "india",
      },
      {
        rotation: "upside-down",
        expected: "LAST_PAGE_NOT_IN_FRAME",
        country: "usa",
      },
      {
        rotation: "counter-clockwise-90",
        expected: "LAST_PAGE_NOT_IN_FRAME",
        country: "usa",
      },
      {
        rotation: "clockwise-90",
        expected: "LAST_PAGE_NOT_IN_FRAME",
        country: "usa",
      },
    ])(
      "should return $expected when scanning second side of passport with rotation $rotation and country $country",
      ({ rotation, expected, country }) => {
        const processResult = createProcessResult({
          inputImageAnalysisResult: {
            scanningSide: "second",
            documentClassInfo: {
              documentType: { id: "passport" },
              country: country ? { id: country } : undefined,
            },
            documentRotation: rotation,
          },
        });

        const result = getUiStateKey(
          "scanning-side-in-progress",
          processResult.inputImageAnalysisResult,
          getMergedScanningSettings(),
        );

        expect(result).toBe<BlinkIdUiStateKey>(expected);
      },
    );
  });

  describe("Wrong Passport Page States", () => {
    test.each<{
      rotation: DocumentRotation;
      expected: BlinkIdUiStateKey;
      country?: Country;
    }>([
      { rotation: "zero", expected: "WRONG_TOP_PAGE" },
      { rotation: "upside-down", expected: "WRONG_TOP_PAGE" },
      { rotation: "not-available", expected: "WRONG_TOP_PAGE" },
      { rotation: "counter-clockwise-90", expected: "WRONG_LEFT_PAGE" },
      { rotation: "clockwise-90", expected: "WRONG_RIGHT_PAGE" },
      { rotation: "zero", expected: "WRONG_LAST_PAGE", country: "india" },
      {
        rotation: "upside-down",
        expected: "WRONG_LAST_PAGE",
        country: "india",
      },
      {
        rotation: "not-available",
        expected: "WRONG_LAST_PAGE",
        country: "usa",
      },
      {
        rotation: "counter-clockwise-90",
        expected: "WRONG_LAST_PAGE",
        country: "usa",
      },
      { rotation: "clockwise-90", expected: "WRONG_LAST_PAGE", country: "usa" },
    ])(
      "should return $expected when scanning wrong side with rotation $rotation and country $country",
      ({ rotation, expected, country }) => {
        const processResult = createProcessResult({
          inputImageAnalysisResult: {
            scanningSide: "second",
            processingStatus: "scanning-wrong-side",
            documentClassInfo: {
              documentType: { id: "passport" },
              country: country ? { id: country } : undefined,
            },
            documentRotation: rotation,
            documentDetectionStatus: "success",
          },
        });

        const result = getUiStateKey(
          "scanning-side-in-progress",
          processResult.inputImageAnalysisResult,
          getMergedScanningSettings(),
        );

        expect(result).toBe<BlinkIdUiStateKey>(expected);
      },
    );
  });

  describe("Occlusion States", () => {
    test("should return OCCLUDED when document is partially visible", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: {
          documentDetectionStatus: "document-partially-visible",
        },
      });

      const result = getUiStateKey(
        "scanning-side-in-progress",
        processResult.inputImageAnalysisResult,
        getMergedScanningSettings(),
      );

      expect(result).toBe<BlinkIdUiStateKey>("OCCLUDED");
    });

    test.each<{
      imageWithHandOcclusionRejected: boolean;
      expected: BlinkIdUiStateKey;
    }>([
      { imageWithHandOcclusionRejected: true, expected: "OCCLUDED" },
      {
        imageWithHandOcclusionRejected: false,
        expected: "FRONT_PAGE_NOT_IN_FRAME",
      },
    ])(
      "should return $expected when document is occluded by hand and imageWithHandOcclusionRejected is $imageWithHandOcclusionRejected",
      ({ imageWithHandOcclusionRejected, expected }) => {
        const processResult = createProcessResult({
          inputImageAnalysisResult: { documentHandOcclusionStatus: "detected" },
        });

        const result = getUiStateKey(
          "scanning-side-in-progress",
          processResult.inputImageAnalysisResult,
          getMergedScanningSettings({
            documentCaptureModule: { imageWithHandOcclusionRejected },
          }),
        );

        expect(result).toBe<BlinkIdUiStateKey>(expected);
      },
    );

    test.each<{
      missingMandatoryFields: FieldType[];
      expected: BlinkIdUiStateKey;
    }>([
      {
        missingMandatoryFields: ["firstName", "lastName"],
        expected: "OCCLUDED",
      },
      { missingMandatoryFields: [], expected: "FRONT_PAGE_NOT_IN_FRAME" },
    ])(
      "should return $expected when missingMandatoryFields is $missingMandatoryFields",
      ({ missingMandatoryFields, expected }) => {
        const processResult = createProcessResult({
          inputImageAnalysisResult: { missingMandatoryFields },
        });

        const result = getUiStateKey(
          "scanning-side-in-progress",
          processResult.inputImageAnalysisResult,
          getMergedScanningSettings(),
        );

        expect(result).toBe<BlinkIdUiStateKey>(expected);
      },
    );

    test("should handle multiple occlusion conditions simultaneously", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: {
          documentHandOcclusionStatus: "detected",
          documentDetectionStatus: "document-partially-visible",
          missingMandatoryFields: ["firstName", "lastName"],
        },
      });

      const result = getUiStateKey(
        "scanning-side-in-progress",
        processResult.inputImageAnalysisResult,
        getMergedScanningSettings(),
      );

      expect(result).toBe<BlinkIdUiStateKey>("OCCLUDED");
    });
  });

  describe("Image Extraction Failures", () => {
    test("should return FACE_PHOTO_OCCLUDED when face photo is not fully visible", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "image-return-failed",
          imageExtractionFailures: ["face"],
          documentDetectionStatus: "success",
        },
      });

      const result = getUiStateKey(
        "scanning-side-in-progress",
        processResult.inputImageAnalysisResult,
        getMergedScanningSettings(),
      );

      expect(result).toBe<BlinkIdUiStateKey>("FACE_PHOTO_OCCLUDED");
    });
  });

  describe("Document Side Detection", () => {
    const scanningSides: ScanningSide[] = ["first", "second"];

    test.each(scanningSides)(
      "should return WRONG_SIDE when scanning wrong side ($scanningSide)",
      (scanningSide) => {
        const processResult = createProcessResult({
          inputImageAnalysisResult: {
            scanningSide,
            processingStatus: "scanning-wrong-side",
            documentDetectionStatus: "success",
          },
        });

        const result = getUiStateKey(
          "scanning-side-in-progress",
          processResult.inputImageAnalysisResult,
          getMergedScanningSettings(),
        );

        expect(result).toBe<BlinkIdUiStateKey>("WRONG_SIDE");
      },
    );

    test.each<{
      scanningSide: ScanningSide;
      expected: BlinkIdUiStateKey;
    }>([
      { scanningSide: "first", expected: "FRONT_PAGE_NOT_IN_FRAME" },
      { scanningSide: "second", expected: "BACK_PAGE_NOT_IN_FRAME" },
    ])(
      "should return $expected when sensing $scanningSide side with failed detection",
      ({ scanningSide, expected }) => {
        const processResult = createProcessResult({
          inputImageAnalysisResult: {
            scanningSide,
          },
        });

        const result = getUiStateKey(
          "scanning-side-in-progress",
          processResult.inputImageAnalysisResult,
          getMergedScanningSettings(),
        );

        expect(result).toBe<BlinkIdUiStateKey>(expected);
      },
    );
  });

  describe("Special States", () => {
    test("should return UNSUPPORTED_DOCUMENT when document is unsupported", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: { processingStatus: "unsupported-document" },
      });

      const result = getUiStateKey(
        "scanning-side-in-progress",
        processResult.inputImageAnalysisResult,
        getMergedScanningSettings(),
      );

      expect(result).toBe<BlinkIdUiStateKey>("UNSUPPORTED_DOCUMENT");
    });

    test("should return FRONT_PAGE_NOT_IN_FRAME as fallback when no specific conditions are met", () => {
      const processResult = createProcessResult({});

      const result = getUiStateKey(
        "scanning-side-in-progress",
        processResult.inputImageAnalysisResult,
        getMergedScanningSettings(),
      );

      expect(result).toBe<BlinkIdUiStateKey>("FRONT_PAGE_NOT_IN_FRAME");
    });

    test("should return undefined (no-op) while awaiting more stable input images", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "awaiting-more-stable-input-images",
          documentDetectionStatus: "success",
        },
      });

      const result = getUiStateKey(
        "scanning-side-in-progress",
        processResult.inputImageAnalysisResult,
        getMergedScanningSettings(),
      );

      expect(result).toBeUndefined();
    });
  });

  describe("Priority Rules", () => {
    test("should prioritize DOCUMENT_CAPTURED over framing issues", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: { documentDetectionStatus: "camera-too-far" },
      });

      const result = getUiStateKey(
        "document-scanned",
        processResult.inputImageAnalysisResult,
        getMergedScanningSettings(),
      );

      expect(result).toBe<BlinkIdUiStateKey>("DOCUMENT_CAPTURED");
    });

    test("should prioritize DOCUMENT_CAPTURED over occlusion issues", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: { documentHandOcclusionStatus: "detected" },
      });

      const result = getUiStateKey(
        "document-scanned",
        processResult.inputImageAnalysisResult,
        getMergedScanningSettings(),
      );

      expect(result).toBe<BlinkIdUiStateKey>("DOCUMENT_CAPTURED");
    });

    test("should prioritize DOCUMENT_CAPTURED over blur issues", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: {
          blurDetectionStatus: "detected",
        },
      });

      const result = getUiStateKey(
        "document-scanned",
        processResult.inputImageAnalysisResult,
        getMergedScanningSettings(),
      );

      expect(result).toBe<BlinkIdUiStateKey>("DOCUMENT_CAPTURED");
    });

    test("should prioritize PAGE_CAPTURED over blur detection", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: {
          blurDetectionStatus: "detected",
        },
      });

      const result = getUiStateKey(
        "side-scanned",
        processResult.inputImageAnalysisResult,
        getMergedScanningSettings(),
      );

      expect(result).toBe<BlinkIdUiStateKey>("PAGE_CAPTURED");
    });

    test("should prioritize PAGE_CAPTURED over glare detection", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: { glareDetectionStatus: "detected" },
      });

      const result = getUiStateKey(
        "side-scanned",
        processResult.inputImageAnalysisResult,
        getMergedScanningSettings({
          documentCaptureModule: { imageWithGlareRejected: true },
        }),
      );

      expect(result).toBe<BlinkIdUiStateKey>("PAGE_CAPTURED");
    });

    // This situation can't happen
    test.skip("should prioritize UNSUPPORTED_DOCUMENT over side captured", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: { processingStatus: "unsupported-document" },
      });

      const result = getUiStateKey(
        "side-scanned",
        processResult.inputImageAnalysisResult,
        getMergedScanningSettings(),
      );

      expect(result).toBe<BlinkIdUiStateKey>("UNSUPPORTED_DOCUMENT");
    });

    test("should prioritize lighting issues over GLARE_DETECTED", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: {
          documentLightingStatus: "too-dark",
          glareDetectionStatus: "detected",
          documentDetectionStatus: "success",
        },
      });

      const result = getUiStateKey(
        "scanning-side-in-progress",
        processResult.inputImageAnalysisResult,
        getMergedScanningSettings({
          documentCaptureModule: {
            imageWithGlareRejected: true,
            imageWithPoorLightingRejected: true,
          },
        }),
      );

      expect(result).toBe<BlinkIdUiStateKey>("TOO_DARK");
    });

    test("should prioritize GLARE_DETECTED over BLUR_DETECTED when both are detected", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: {
          blurDetectionStatus: "detected",
          glareDetectionStatus: "detected",
          documentDetectionStatus: "success",
        },
      });

      const result = getUiStateKey(
        "scanning-side-in-progress",
        processResult.inputImageAnalysisResult,
        getMergedScanningSettings({
          documentCaptureModule: {
            imageWithBlurRejected: true,
            imageWithGlareRejected: true,
          },
        }),
      );

      expect(result).toBe<BlinkIdUiStateKey>("GLARE_DETECTED");
    });

    test("should prioritize DOCUMENT_CAPTURED over passport navigation states", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "awaiting-other-side",
          documentClassInfo: { documentType: { id: "passport" } },
          documentRotation: "zero",
        },
      });

      const result = getUiStateKey(
        "document-scanned",
        processResult.inputImageAnalysisResult,
        getMergedScanningSettings(),
      );

      expect(result).toBe<BlinkIdUiStateKey>("DOCUMENT_CAPTURED");
    });

    // Passports are more specific than other documents, so this test is
    // not valid.
    test.skip("should prioritize FLIP_CARD over wrong passport page states", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: {
          scanningSide: "second",
          processingStatus: "scanning-wrong-side",
          documentClassInfo: { documentType: { id: "passport" } },
          documentRotation: "zero",
        },
      });

      const result = getUiStateKey(
        "side-scanned",
        processResult.inputImageAnalysisResult,
        getMergedScanningSettings(),
      );

      expect(result).toBe<BlinkIdUiStateKey>("FLIP_CARD");
    });

    test("should prioritize WRONG_TOP_PAGE over blur detection for passports", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: {
          scanningSide: "second",
          processingStatus: "scanning-wrong-side",
          documentClassInfo: { documentType: { id: "passport" } },
          documentRotation: "zero",
          blurDetectionStatus: "detected",
          documentDetectionStatus: "success",
        },
      });

      const result = getUiStateKey(
        "scanning-side-in-progress",
        processResult.inputImageAnalysisResult,
        getMergedScanningSettings({
          documentCaptureModule: { imageWithBlurRejected: true },
        }),
      );

      expect(result).toBe<BlinkIdUiStateKey>("WRONG_TOP_PAGE");
    });

    test("should prioritize DOCUMENT_CAPTURED over all other issues", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: {
          blurDetectionStatus: "detected",
          glareDetectionStatus: "detected",
          documentHandOcclusionStatus: "detected",
          documentDetectionStatus: "camera-too-far",
          processingStatus: "scanning-wrong-side",
          documentLightingStatus: "too-dark",
        },
      });

      const result = getUiStateKey(
        "document-scanned",
        processResult.inputImageAnalysisResult,
        getMergedScanningSettings(),
      );

      expect(result).toBe<BlinkIdUiStateKey>("DOCUMENT_CAPTURED");
    });
  });
});
