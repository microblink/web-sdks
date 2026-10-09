/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { DetectionStatus, ProcessingStatus, ScanningStatus } from "@microblink/blinkid-verify-core";
import { merge } from "merge-anything";
import { describe, expect, test } from "vitest";

import { getUiStateKey, type PartialProcessResult } from "./blinkid-verify-ui-state";

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

const defaultProcessResult = {
  inputImageAnalysisResult: {
    blurDetected: false,
    glareDetected: false,
    occlusionDetected: false,
    tiltDetected: false,
    screenPresenceDetected: false,
    scanningSide: "first" as const,
    hasBarcodeReadingIssue: false,
    extractionInputImageAnalysisResult: {
      documentLocation: {
        upperLeft: { x: 0, y: 0 },
        upperRight: { x: 0, y: 0 },
        lowerLeft: { x: 0, y: 0 },
        lowerRight: { x: 0, y: 0 },
      },
      processingStatus: "success" as ProcessingStatus,
      detectionStatus: "sucess" as DetectionStatus,
      isPassport: false,
      isPassportWithBarcode: false,
      documentOrientation: "horizontal" as const,
      documentRotation: "zero" as const,
    },
  },
  resultCompleteness: {
    scanningStatus: "scanning-first" as ScanningStatus,
  },
};

const createPartialProcessResult = (overrides: DeepPartial<typeof defaultProcessResult> = {}): PartialProcessResult =>
  merge(defaultProcessResult, overrides) as PartialProcessResult;

describe("getUiStateKey", () => {
  test("returns SCREEN_DETECTED when a screen is present on a successfully detected document", () => {
    const result = getUiStateKey(
      createPartialProcessResult({
        inputImageAnalysisResult: {
          screenPresenceDetected: true,
        },
      }),
    );

    expect(result).toBe("SCREEN_DETECTED");
  });

  test("does not return SCREEN_DETECTED while scanning a barcode", () => {
    const result = getUiStateKey(
      createPartialProcessResult({
        inputImageAnalysisResult: {
          screenPresenceDetected: true,
        },
        resultCompleteness: {
          scanningStatus: "scanning-barcode",
        },
      }),
    );

    expect(result).not.toBe("SCREEN_DETECTED");
  });

  test("does not return SCREEN_DETECTED when document detection has failed", () => {
    const result = getUiStateKey(
      createPartialProcessResult({
        inputImageAnalysisResult: {
          screenPresenceDetected: true,
          extractionInputImageAnalysisResult: {
            detectionStatus: "failed",
          },
        },
      }),
    );

    expect(result).not.toBe("SCREEN_DETECTED");
  });

  test("prioritizes SCREEN_DETECTED over GLARE_DETECTED when both flags are set", () => {
    const result = getUiStateKey(
      createPartialProcessResult({
        inputImageAnalysisResult: {
          screenPresenceDetected: true,
          glareDetected: true,
        },
      }),
    );

    expect(result).toBe("SCREEN_DETECTED");
  });

  test("prioritizes GLARE_DETECTED over BLUR_DETECTED when both flags are set", () => {
    const result = getUiStateKey(
      createPartialProcessResult({
        inputImageAnalysisResult: {
          glareDetected: true,
          blurDetected: true,
        },
      }),
    );

    expect(result).toBe("GLARE_DETECTED");
  });

  test("prioritizes framing over SCREEN_DETECTED", () => {
    const result = getUiStateKey(
      createPartialProcessResult({
        inputImageAnalysisResult: {
          screenPresenceDetected: true,
          extractionInputImageAnalysisResult: {
            detectionStatus: "camera-too-far",
          },
        },
      }),
    );

    expect(result).toBe("DOCUMENT_FRAMING_CAMERA_TOO_FAR");
  });
});
