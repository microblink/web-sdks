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
 * Intro state keys for BlinkCard UI.
 *
 * @remarks
 * These states display introductory screens that guide users to scan the correct
 * side of their card. They are NOT directly mappable from a `ProcessResult` —
 * `INTRO_FRONT` is the default initial state, and `INTRO_BACK` is automatically
 * reached via the chained transition after `FLIP_CARD`.
 *
 * Both states restart frame capture when entered (via `#handleUiStateUpdates`
 * in the manager), so the camera resumes scanning the correct side.
 */
export const blinkCardUiIntroStateKeys = ["INTRO_FRONT", "INTRO_BACK"] as const;

export type BlinkCardUiIntroStateKey =
  (typeof blinkCardUiIntroStateKeys)[number];

/**
 * Page transition state keys for BlinkCard UI.
 *
 * @remarks
 * `FLIP_CARD` is a transition state that displays the card-flip animation and
 * instructions after the first side is captured. It is NOT directly mappable from
 * a `ProcessResult` — it is chained automatically from `FIRST_SIDE_CAPTURED`.
 *
 * After the transition animation completes, the flow automatically advances to
 * `INTRO_BACK` to begin scanning the back of the card.
 *
 * **Automatic flow:** `FIRST_SIDE_CAPTURED` → `FLIP_CARD` → `INTRO_BACK`
 */
export const blinkCardPageTransitionKeys = ["FLIP_CARD"] as const;

export type BlinkCardPageTransitionKey =
  (typeof blinkCardPageTransitionKeys)[number];

/**
 * Success state keys for BlinkCard UI.
 *
 * @remarks
 * - `FIRST_SIDE_CAPTURED` — first side successfully scanned; triggers the
 *   `FLIP_CARD` chained transition and stops frame capture.
 * - `CARD_CAPTURED` — both sides fully scanned; triggers result retrieval
 *   and stops frame capture permanently.
 */
export const blinkCardUiSuccessKeys = [
  "FIRST_SIDE_CAPTURED",
  "CARD_CAPTURED",
] as const;

export type BlinkCardUiSuccessKey = (typeof blinkCardUiSuccessKeys)[number];

/**
 * Error state keys for BlinkCard UI. These are all directly mappable from a
 * `ProcessResult`.
 */
export const blinkCardUiErrorStateKeys = [
  "CARD_NOT_IN_FRAME_FRONT",
  "CARD_NOT_IN_FRAME_BACK",
  "BLUR_DETECTED",
  "OCCLUDED",
  "WRONG_SIDE",
  "CARD_FRAMING_CAMERA_TOO_FAR",
  "CARD_FRAMING_CAMERA_TOO_CLOSE",
  "CARD_FRAMING_CAMERA_ANGLE_TOO_STEEP",
  "CARD_TOO_CLOSE_TO_FRAME_EDGE",
] as const;

export type BlinkCardUiErrorStateKey =
  (typeof blinkCardUiErrorStateKeys)[number];

/**
 * Keys directly mappable from a `ProcessResult`.
 */
export type BlinkCardUiMappableKey =
  | BlinkCardUiErrorStateKey
  | BlinkCardUiSuccessKey;

/**
 * The full union of all BlinkCard UI state keys.
 */
export type BlinkCardUiStateKey =
  | BlinkCardUiIntroStateKey
  | BlinkCardPageTransitionKey
  | BlinkCardUiMappableKey;

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

const INTRO_DURATION = 2000;
const TRANSITION_DURATION = 2000;
const SUCCESS_DURATION = 1000;
const ERROR_DURATION = 1500;

/**
 * The UI state map of BlinkCard.
 */
export const blinkCardUiStateMap: BlinkCardUiStateMap = {
  // --- Intro states ---
  INTRO_FRONT: {
    key: "INTRO_FRONT",
    reticleType: "searching",
    minDuration: INTRO_DURATION,
    singleEmit: true,
  },
  INTRO_BACK: {
    key: "INTRO_BACK",
    reticleType: "searching",
    minDuration: INTRO_DURATION,
    singleEmit: true,
  },

  // --- Transition state ---
  // Instructs user to flip the card; chained from FIRST_SIDE_CAPTURED → FLIP_CARD → INTRO_BACK
  FLIP_CARD: {
    key: "FLIP_CARD",
    reticleType: "flip",
    minDuration: TRANSITION_DURATION,
    singleEmit: true,
  },

  // --- Success states ---
  FIRST_SIDE_CAPTURED: {
    key: "FIRST_SIDE_CAPTURED",
    reticleType: "done",
    minDuration: SUCCESS_DURATION,
    singleEmit: true,
  },
  CARD_CAPTURED: {
    key: "CARD_CAPTURED",
    reticleType: "done",
    minDuration: SUCCESS_DURATION,
    singleEmit: true,
  },

  // --- Error states ---
  CARD_NOT_IN_FRAME_FRONT: {
    key: "CARD_NOT_IN_FRAME_FRONT",
    reticleType: "searching",
    minDuration: ERROR_DURATION,
  },
  CARD_NOT_IN_FRAME_BACK: {
    key: "CARD_NOT_IN_FRAME_BACK",
    reticleType: "searching",
    minDuration: ERROR_DURATION,
  },
  BLUR_DETECTED: {
    key: "BLUR_DETECTED",
    reticleType: "error",
    minDuration: ERROR_DURATION,
  },
  OCCLUDED: {
    key: "OCCLUDED",
    reticleType: "error",
    minDuration: ERROR_DURATION,
  },
  WRONG_SIDE: {
    key: "WRONG_SIDE",
    reticleType: "error",
    minDuration: ERROR_DURATION,
  },
  CARD_FRAMING_CAMERA_TOO_FAR: {
    key: "CARD_FRAMING_CAMERA_TOO_FAR",
    reticleType: "error",
    minDuration: ERROR_DURATION,
  },
  CARD_FRAMING_CAMERA_TOO_CLOSE: {
    key: "CARD_FRAMING_CAMERA_TOO_CLOSE",
    reticleType: "error",
    minDuration: ERROR_DURATION,
  },
  CARD_FRAMING_CAMERA_ANGLE_TOO_STEEP: {
    key: "CARD_FRAMING_CAMERA_ANGLE_TOO_STEEP",
    reticleType: "error",
    minDuration: ERROR_DURATION,
  },
  CARD_TOO_CLOSE_TO_FRAME_EDGE: {
    key: "CARD_TOO_CLOSE_TO_FRAME_EDGE",
    reticleType: "error",
    minDuration: ERROR_DURATION,
  },
} as const;

/**
 * Determines the appropriate UI state key based on the current frame processing
 * result and scanning settings.
 *
 * This function acts as a state machine, translating the low-level analysis and
 * completeness results into a high-level UI state that drives the user interface.
 *
 * Returns `undefined` for unrecognized frames (e.g. stability checks) — the
 * manager treats `undefined` as a no-op and does not ingest it into the
 * feedback stabilizer.
 *
 * @param frameProcessResult - The current (possibly partial) result of frame
 * processing, including image analysis and completeness.
 * @param settings - Scanning settings that may influence state selection.
 * @returns The UI state key, or `undefined` if no state change is warranted.
 */
export function getUiStateKey(
  frameProcessResult: BlinkCardProcessResult,
  settings: ScanningSettings,
): BlinkCardUiMappableKey | undefined {
  return (
    match<BlinkCardProcessResult, BlinkCardUiMappableKey | undefined>(
      frameProcessResult,
    )
      // Success: both sides captured
      .with(
        {
          resultCompleteness: {
            scanningStatus: "card-scanned",
          },
        },
        () => "CARD_CAPTURED",
      )

      // Success: first side captured, awaiting second side
      .with(
        {
          inputImageAnalysisResult: {
            processingStatus: "awaiting-other-side",
          },
        },
        () => "FIRST_SIDE_CAPTURED",
      )

      // Framing errors
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

      // Occlusion
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

      // Blur
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

      // Wrong side
      .with(
        {
          inputImageAnalysisResult: {
            processingStatus: "scanning-wrong-side",
          },
        },
        () => "WRONG_SIDE",
      )

      // Card not in frame — back side (scanning-side-in-progress, second side)
      .with(
        {
          inputImageAnalysisResult: {
            scanningSide: "second",
          },
          resultCompleteness: {
            scanningStatus: "scanning-side-in-progress",
          },
        },
        () => "CARD_NOT_IN_FRAME_BACK",
      )

      // Card not in frame — front side (fallback)
      .otherwise(() => "CARD_NOT_IN_FRAME_FRONT")
  );
}
