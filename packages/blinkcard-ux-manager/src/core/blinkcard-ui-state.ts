/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  BlinkCardProcessResult,
  ScanningSettings,
} from "@microblink/blinkcard-core";
import { UiState } from "@microblink/feedback-stabilizer";
import { match, P } from "ts-pattern";

/**
 * The type of reticle to display.
 */
export type BlinkCardReticleType =
  | "searching"
  | "processing"
  | "error"
  | "done"
  | "flip";

/**
 * The key of the UI state.
 */
export type BlinkCardUiStateKey =
  | "FLIP_CARD"
  | "CARD_CAPTURED"
  | "SENSING_FRONT"
  | "SENSING_BACK"
  | "CARD_FRAMING_CAMERA_TOO_FAR"
  | "CARD_FRAMING_CAMERA_TOO_CLOSE"
  | "CARD_FRAMING_CAMERA_ANGLE_TOO_STEEP"
  | "CARD_TOO_CLOSE_TO_FRAME_EDGE"
  | "BLUR_DETECTED"
  | "OCCLUDED"
  | "WRONG_SIDE";

/**
 * Extended UI state for BlinkCard.
 *
 * @template K - The key of the UI state.
 */
export type BlinkCardUiStateMap = {
  [K in BlinkCardUiStateKey]: UiState & {
    /** The key of the UI state. */
    key: K;
    /** The type of the reticle. */
    reticleType: BlinkCardReticleType;
  };
};

/**
 * The UI state of BlinkCard.
 */
export type BlinkCardUiState = BlinkCardUiStateMap[keyof BlinkCardUiStateMap];

/**
 * The UI state map of BlinkCard.
 */
export const blinkCardUiStateMap: BlinkCardUiStateMap = {
  SENSING_FRONT: {
    key: "SENSING_FRONT",
    reticleType: "searching",
    minDuration: 1000,
  },
  SENSING_BACK: {
    key: "SENSING_BACK",
    reticleType: "searching",
    minDuration: 1000,
  },
  // card captured, flip to back side
  FLIP_CARD: {
    key: "FLIP_CARD",
    reticleType: "flip",
    minDuration: 2000,
    singleEmit: true,
  },
  // Capturing all sides completed
  CARD_CAPTURED: {
    key: "CARD_CAPTURED",
    reticleType: "done",
    minDuration: 1000,
    singleEmit: true,
  },
  BLUR_DETECTED: {
    key: "BLUR_DETECTED",
    reticleType: "error",
    minDuration: 1500,
  },
  OCCLUDED: {
    key: "OCCLUDED",
    reticleType: "error",
    minDuration: 1500,
  },
  WRONG_SIDE: {
    key: "WRONG_SIDE",
    reticleType: "error",
    minDuration: 1500,
  },
  CARD_FRAMING_CAMERA_TOO_FAR: {
    key: "CARD_FRAMING_CAMERA_TOO_FAR",
    reticleType: "error",
    minDuration: 1500,
  },
  CARD_FRAMING_CAMERA_TOO_CLOSE: {
    key: "CARD_FRAMING_CAMERA_TOO_CLOSE",
    reticleType: "error",
    minDuration: 1500,
  },
  CARD_FRAMING_CAMERA_ANGLE_TOO_STEEP: {
    key: "CARD_FRAMING_CAMERA_ANGLE_TOO_STEEP",
    reticleType: "error",
    minDuration: 1500,
  },
  CARD_TOO_CLOSE_TO_FRAME_EDGE: {
    key: "CARD_TOO_CLOSE_TO_FRAME_EDGE",
    reticleType: "error",
    minDuration: 1500,
  },
} as const;

/**
 * The states that are captured when the first side is captured.
 */
export const firstSideCapturedUiStateKeys: BlinkCardUiStateKey[] = [
  "FLIP_CARD",
] as const;

export type ErrorUiStateKey = Extract<
  BlinkCardUiStateKey,
  | "CARD_FRAMING_CAMERA_TOO_FAR"
  | "CARD_FRAMING_CAMERA_TOO_CLOSE"
  | "CARD_FRAMING_CAMERA_ANGLE_TOO_STEEP"
  | "CARD_TOO_CLOSE_TO_FRAME_EDGE"
  | "BLUR_DETECTED"
  | "OCCLUDED"
  | "WRONG_SIDE"
>;

/**
 * Determines the appropriate UI state key based on the current frame processing
 * result and scanning settings.
 *
 * This function acts as a state machine, translating the low-level analysis and
 * completeness results into a high-level UI state that drives the user
 * interface.
 *
 * @param frameProcessResult - The current (possibly partial) result of frame
 * processing, including image analysis and completeness.
 * @param settings - Optional scanning settings that may influence state
 * selection.
 * @returns The UI state key representing what should be shown to the user.
 */
export function getUiStateKey(
  frameProcessResult: BlinkCardProcessResult,
  settings: ScanningSettings,
) {
  return (
    match<BlinkCardProcessResult, BlinkCardUiStateKey>(frameProcessResult)
      // Success states
      .with(
        {
          resultCompleteness: {
            scanningStatus: "card-scanned",
          },
        },
        () => "CARD_CAPTURED",
      )

      // side scanned
      .with(
        {
          inputImageAnalysisResult: {
            processingStatus: "awaiting-other-side",
          },
        },
        () => "FLIP_CARD",
      )

      // framing
      .with(
        {
          inputImageAnalysisResult: {
            detectionStatus: "camera-angle-too-steep",
          },
        },
        () => "CARD_FRAMING_CAMERA_ANGLE_TOO_STEEP",
      )
      .with(
        {
          inputImageAnalysisResult: {
            detectionStatus: "camera-too-close",
          },
        },
        () => "CARD_FRAMING_CAMERA_TOO_CLOSE",
      )
      .with(
        {
          inputImageAnalysisResult: {
            detectionStatus: "document-too-close-to-camera-edge",
          },
        },
        () => "CARD_TOO_CLOSE_TO_FRAME_EDGE",
      )
      .with(
        {
          inputImageAnalysisResult: {
            detectionStatus: "camera-too-far",
          },
        },
        () => "CARD_FRAMING_CAMERA_TOO_FAR",
      )

      // occluded
      .with(
        {
          inputImageAnalysisResult: {
            detectionStatus: "document-partially-visible",
          },
        },
        () => "OCCLUDED",
      )
      .with(
        {
          inputImageAnalysisResult: {
            processingStatus: "image-return-failed",
          },
        },
        () => "OCCLUDED",
      )
      .with(
        {
          inputImageAnalysisResult: {
            processingStatus: "field-identification-failed",
          },
        },
        () => "OCCLUDED",
      )

      // blur
      .with(
        {
          inputImageAnalysisResult: {
            processingStatus: "image-preprocessing-failed",
            blurDetectionStatus: P.when(
              (status) => status === "detected" && settings.skipImagesWithBlur,
            ),
          },
        },
        () => "BLUR_DETECTED",
      )

      // scan wrong side
      .with(
        {
          inputImageAnalysisResult: {
            processingStatus: "scanning-wrong-side",
          },
        },
        () => "WRONG_SIDE",
      )

      // scan back
      .with(
        {
          inputImageAnalysisResult: {
            scanningSide: "second",
          },
          resultCompleteness: {
            scanningStatus: "scanning-side-in-progress",
          },
        },
        () => "SENSING_BACK",
      )

      // fallback
      .otherwise(() => {
        return "SENSING_FRONT";
      })
  );
}
