/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import {
  InputImageAnalysisResult,
  ResultCompleteness,
  ScanningSettings,
} from "@microblink/blinkid-core";
import { UiState } from "@microblink/feedback-stabilizer";
import { match, P } from "ts-pattern";
import { getChainedUiStateKey } from "./getChainedUiStateKey";
import {
  isPassport,
  isPassportWithBarcode,
  isPassportWithoutBarcode,
} from "./ui-state-utils";

/**
 * The type of reticle to display.
 */
export type BlinkIdReticleType =
  | "searching"
  | "processing"
  | "error"
  | "done"
  | "flip"
  | "move_top"
  | "move_left"
  | "move_right";

/**
 * Intro state keys for BlinkID UI.
 *
 * @remarks
 * These states display introductory screens that guide users to scan the correct
 * side or page of their document. Most intro states are automatically reached
 * during the scanning flow, but `INTRO_DATA_PAGE` requires manual initialization.
 *
 * **Default behavior:**
 * The UX manager defaults to `INTRO_FRONT_PAGE`, assuming users will scan
 * non-passport documents (ID cards, driver's licenses, etc.).
 *
 * **Automatically reachable states:**
 * After capturing a page, the flow automatically transitions through appropriate
 * intro states:
 * - `INTRO_BACK_PAGE` - After flipping an ID card (`FLIP_CARD`)
 * - `INTRO_TOP_PAGE` - After moving to passport top page (`MOVE_TOP`)
 * - `INTRO_LEFT_PAGE` - After moving to passport left page (`MOVE_LEFT`)
 * - `INTRO_RIGHT_PAGE` - After moving to passport right page (`MOVE_RIGHT`)
 * - `INTRO_LAST_PAGE` - After moving to passport barcode page (`MOVE_LAST_PAGE`)
 *
 * **Manual initialization required:**
 * - `INTRO_DATA_PAGE` - Only reachable by overriding the UX manager initial
 *   state. Use this when restricting scanning to passport documents only,
 *   as the SDK assumes non-passport documents by default.
 *
 * @example
 * ```typescript
 * // Limit scanning to passport documents only
 * const uxManager = new BlinkIdUxManager(cameraManager, session);
 * uxManager.setInitialUiStateKey("INTRO_DATA_PAGE", true);
 * ```
 *
 * @see {@link BlinkIdUiIntroStateKey} for the union type of these keys
 * @see {@link getChainedUiStateKey} for the automatic state transition logic
 */
export const blinkIdUiIntroStateKeys = [
  "INTRO_FRONT_PAGE",
  "INTRO_BACK_PAGE",
  "INTRO_DATA_PAGE",
  "INTRO_TOP_PAGE",
  "INTRO_LEFT_PAGE",
  "INTRO_RIGHT_PAGE",
  "INTRO_LAST_PAGE",
] as const;

/**
 * Union type of all intro state keys.
 *
 * @see {@link blinkIdUiIntroStateKeys} for detailed documentation on each state
 */
export type BlinkIdUiIntroStateKey = (typeof blinkIdUiIntroStateKeys)[number];

/**
 * Page transition state keys for BlinkID UI.
 *
 * @remarks
 * These states display transition animations and instructions between scanning
 * different document pages or sides. They are automatically triggered after
 * successfully capturing a page (`PAGE_CAPTURED`) and cannot be manually set.
 *
 * Each transition state corresponds to a specific document type and guides the
 * user to position the document for the next scan:
 * - `FLIP_CARD` - Instructs user to flip ID card to scan the back side
 * - `MOVE_LAST_PAGE` - Instructs user to move to passport's last page (barcode)
 * - `MOVE_TOP` - Instructs user to rotate passport to top orientation (0°)
 * - `MOVE_RIGHT` - Instructs user to rotate passport 90° clockwise
 * - `MOVE_LEFT` - Instructs user to rotate passport 90° counter-clockwise
 *
 * **Automatic flow:**
 * After a transition animation completes, the UI automatically advances to the
 * corresponding intro state to begin scanning the next page:
 * - `FLIP_CARD` → `INTRO_BACK_PAGE`
 * - `MOVE_LAST_PAGE` → `INTRO_LAST_PAGE`
 * - `MOVE_TOP` → `INTRO_TOP_PAGE`
 * - `MOVE_RIGHT` → `INTRO_RIGHT_PAGE`
 * - `MOVE_LEFT` → `INTRO_LEFT_PAGE`
 *
 * @see {@link BlinkIdPageTransitionKey} for the union type of these keys
 * @see {@link getChainedUiStateKey} for the automatic state transition logic
 * @see {@link blinkIdUiIntroStateKeys} for the intro states that follow transitions
 */
export const blinkIdPageTransitionKeys = [
  "FLIP_CARD",
  "MOVE_TOP",
  "MOVE_LEFT",
  "MOVE_RIGHT",
  "MOVE_LAST_PAGE",
] as const;

/**
 * Union type of all page transition state keys.
 *
 * @see {@link blinkIdPageTransitionKeys} for detailed documentation on each state
 */
export type BlinkIdPageTransitionKey =
  (typeof blinkIdPageTransitionKeys)[number];

/**
 * The error states for BlinkID. Mappable from `ProcessResult`.
 */
export const blinkIdUiErrorStateKeys = [
  // framing
  "FRONT_PAGE_NOT_IN_FRAME",
  "BACK_PAGE_NOT_IN_FRAME",
  "DATA_PAGE_NOT_IN_FRAME",
  "TOP_PAGE_NOT_IN_FRAME",
  "LEFT_PAGE_NOT_IN_FRAME",
  "RIGHT_PAGE_NOT_IN_FRAME",
  "LAST_PAGE_NOT_IN_FRAME",
  "BARCODE_NOT_IN_FRAME",
  "DOCUMENT_FRAMING_CAMERA_TOO_FAR",
  "DOCUMENT_FRAMING_CAMERA_TOO_CLOSE",
  "DOCUMENT_FRAMING_CAMERA_ANGLE_TOO_STEEP",
  "DOCUMENT_TOO_CLOSE_TO_FRAME_EDGE",
  // image quality
  "BLUR_DETECTED",
  "GLARE_DETECTED",
  "TOO_DARK",
  "TOO_BRIGHT",
  // occlusion
  "OCCLUDED",
  "FACE_PHOTO_OCCLUDED",
  // classification
  "WRONG_SIDE",
  "WRONG_TOP_PAGE",
  "WRONG_LEFT_PAGE",
  "WRONG_RIGHT_PAGE",
  "WRONG_LAST_PAGE",
  "UNSUPPORTED_DOCUMENT",
] as const;

export type BlinkIdUiErrorStateKey = (typeof blinkIdUiErrorStateKeys)[number];

/**
 * These keys represent successful steps in the BlinkID scanning process.
 */
export const blinkIdUiStepSuccessKeys = [
  "PAGE_CAPTURED",
  "DOCUMENT_CAPTURED",
] as const;

export type BlinkIdUiStepSuccessKey = (typeof blinkIdUiStepSuccessKeys)[number];

/**
 * These keys are directly mappable from a `ProcessResult`
 */
export type BlinkIdUiMappableKey =
  | BlinkIdUiErrorStateKey
  // success
  | BlinkIdUiStepSuccessKey
  // "SCANNING_BARCODE" is the only exception as it's an active processing state
  | "PROCESSING_BARCODE";

/**
 * The key of the UI state.
 */
export type BlinkIdUiStateKey =
  // intro states
  | BlinkIdUiIntroStateKey
  // transition states
  | BlinkIdPageTransitionKey
  // states with 1:1 mapping from `ProcessResult`
  | BlinkIdUiMappableKey;

/**
 * Extended UI state for BlinkID.
 *
 * @template K - The key of the UI state.
 */
export type BlinkIdUiStateMap = {
  [K in BlinkIdUiStateKey]: UiState & {
    /** The key of the UI state. */
    key: K;
    /** The type of the reticle. */
    reticleType: BlinkIdReticleType;
  };
};

/**
 * The UI state of BlinkID.
 */
export type BlinkIdUiState = BlinkIdUiStateMap[keyof BlinkIdUiStateMap];

const INTRO_DURATION = 2000;
const ERROR_DURATION = 1500;
const SUCCESS_DURATION = 800;
const TRANSITION_DURATION = 2000;

/**
 * The UI state map of BlinkID.
 */
export const blinkIdUiStateMap: BlinkIdUiStateMap = {
  INTRO_FRONT_PAGE: {
    key: "INTRO_FRONT_PAGE",
    reticleType: "searching",
    minDuration: INTRO_DURATION,
    singleEmit: true,
  },
  INTRO_BACK_PAGE: {
    key: "INTRO_BACK_PAGE",
    reticleType: "searching",
    minDuration: INTRO_DURATION,
    singleEmit: true,
  },
  INTRO_DATA_PAGE: {
    key: "INTRO_DATA_PAGE",
    reticleType: "searching",
    minDuration: INTRO_DURATION,
    singleEmit: true,
  },
  INTRO_TOP_PAGE: {
    key: "INTRO_TOP_PAGE",
    reticleType: "searching",
    minDuration: INTRO_DURATION,
    singleEmit: true,
  },
  INTRO_LEFT_PAGE: {
    key: "INTRO_LEFT_PAGE",
    reticleType: "searching",
    minDuration: INTRO_DURATION,
    singleEmit: true,
  },
  INTRO_RIGHT_PAGE: {
    key: "INTRO_RIGHT_PAGE",
    reticleType: "searching",
    minDuration: INTRO_DURATION,
    singleEmit: true,
  },
  INTRO_LAST_PAGE: {
    key: "INTRO_LAST_PAGE",
    reticleType: "searching",
    minDuration: INTRO_DURATION,
    singleEmit: true,
  },
  // processing states
  PROCESSING_BARCODE: {
    key: "PROCESSING_BARCODE",
    reticleType: "processing",
    minDuration: 1500,
  },
  // framing
  FRONT_PAGE_NOT_IN_FRAME: {
    key: "FRONT_PAGE_NOT_IN_FRAME",
    reticleType: "searching",
    minDuration: ERROR_DURATION,
  },
  BACK_PAGE_NOT_IN_FRAME: {
    key: "BACK_PAGE_NOT_IN_FRAME",
    reticleType: "searching",
    minDuration: ERROR_DURATION,
  },
  DATA_PAGE_NOT_IN_FRAME: {
    key: "DATA_PAGE_NOT_IN_FRAME",
    reticleType: "searching",
    minDuration: ERROR_DURATION,
  },
  TOP_PAGE_NOT_IN_FRAME: {
    key: "TOP_PAGE_NOT_IN_FRAME",
    reticleType: "searching",
    minDuration: ERROR_DURATION,
  },
  LEFT_PAGE_NOT_IN_FRAME: {
    key: "LEFT_PAGE_NOT_IN_FRAME",
    reticleType: "searching",
    minDuration: ERROR_DURATION,
  },
  RIGHT_PAGE_NOT_IN_FRAME: {
    key: "RIGHT_PAGE_NOT_IN_FRAME",
    reticleType: "searching",
    minDuration: ERROR_DURATION,
  },
  LAST_PAGE_NOT_IN_FRAME: {
    key: "LAST_PAGE_NOT_IN_FRAME",
    reticleType: "searching",
    minDuration: ERROR_DURATION,
  },
  BARCODE_NOT_IN_FRAME: {
    key: "BARCODE_NOT_IN_FRAME",
    reticleType: "searching",
    minDuration: ERROR_DURATION,
  },
  DOCUMENT_FRAMING_CAMERA_TOO_FAR: {
    key: "DOCUMENT_FRAMING_CAMERA_TOO_FAR",
    reticleType: "error",
    minDuration: ERROR_DURATION,
  },
  DOCUMENT_FRAMING_CAMERA_TOO_CLOSE: {
    key: "DOCUMENT_FRAMING_CAMERA_TOO_CLOSE",
    reticleType: "error",
    minDuration: ERROR_DURATION,
  },
  DOCUMENT_FRAMING_CAMERA_ANGLE_TOO_STEEP: {
    key: "DOCUMENT_FRAMING_CAMERA_ANGLE_TOO_STEEP",
    reticleType: "error",
    minDuration: ERROR_DURATION,
  },
  DOCUMENT_TOO_CLOSE_TO_FRAME_EDGE: {
    key: "DOCUMENT_TOO_CLOSE_TO_FRAME_EDGE",
    reticleType: "error",
    minDuration: ERROR_DURATION,
  },
  // ID card captured, flip to back side
  FLIP_CARD: {
    key: "FLIP_CARD",
    reticleType: "flip",
    minDuration: TRANSITION_DURATION,
    singleEmit: true,
  },
  // Passport pages captured, move to the next page
  MOVE_TOP: {
    key: "MOVE_TOP",
    reticleType: "move_top",
    minDuration: TRANSITION_DURATION,
    singleEmit: true,
  },
  MOVE_LEFT: {
    key: "MOVE_LEFT",
    reticleType: "move_left",
    minDuration: TRANSITION_DURATION,
    singleEmit: true,
  },
  MOVE_RIGHT: {
    key: "MOVE_RIGHT",
    reticleType: "move_right",
    minDuration: TRANSITION_DURATION,
    singleEmit: true,
  },
  MOVE_LAST_PAGE: {
    key: "MOVE_LAST_PAGE",
    reticleType: "flip",
    minDuration: TRANSITION_DURATION,
    singleEmit: true,
  },
  /**
   * Generic step done state after capturing a side
   */
  PAGE_CAPTURED: {
    key: "PAGE_CAPTURED",
    reticleType: "done",
    minDuration: SUCCESS_DURATION,
    singleEmit: true,
  },

  // Capturing all sides completed
  DOCUMENT_CAPTURED: {
    key: "DOCUMENT_CAPTURED",
    reticleType: "done",
    minDuration: SUCCESS_DURATION,
    singleEmit: true,
  },
  // image quality checks
  BLUR_DETECTED: {
    key: "BLUR_DETECTED",
    reticleType: "error",
    minDuration: ERROR_DURATION,
  },
  GLARE_DETECTED: {
    key: "GLARE_DETECTED",
    reticleType: "error",
    minDuration: ERROR_DURATION,
  },
  TOO_DARK: {
    key: "TOO_DARK",
    reticleType: "error",
    minDuration: ERROR_DURATION,
  },
  TOO_BRIGHT: {
    key: "TOO_BRIGHT",
    reticleType: "error",
    minDuration: ERROR_DURATION,
  },
  // occlusion
  OCCLUDED: {
    key: "OCCLUDED",
    reticleType: "error",
    minDuration: ERROR_DURATION,
  },
  FACE_PHOTO_OCCLUDED: {
    key: "FACE_PHOTO_OCCLUDED",
    reticleType: "error",
    minDuration: ERROR_DURATION,
  },
  // classification
  WRONG_SIDE: {
    key: "WRONG_SIDE",
    reticleType: "error",
    minDuration: ERROR_DURATION,
  },
  WRONG_TOP_PAGE: {
    key: "WRONG_TOP_PAGE",
    reticleType: "error",
    minDuration: ERROR_DURATION,
  },
  WRONG_LEFT_PAGE: {
    key: "WRONG_LEFT_PAGE",
    reticleType: "error",
    minDuration: ERROR_DURATION,
  },
  WRONG_RIGHT_PAGE: {
    key: "WRONG_RIGHT_PAGE",
    reticleType: "error",
    minDuration: ERROR_DURATION,
  },
  WRONG_LAST_PAGE: {
    key: "WRONG_LAST_PAGE",
    reticleType: "error",
    minDuration: ERROR_DURATION,
  },
  UNSUPPORTED_DOCUMENT: {
    key: "UNSUPPORTED_DOCUMENT",
    reticleType: "error",
    minDuration: ERROR_DURATION,
  },
} as const;

/**
 * The partial process result.
 */
export type PartialProcessResult = {
  /** The input image analysis result. */
  inputImageAnalysisResult: Partial<InputImageAnalysisResult>;
  /** The result completeness. */
  resultCompleteness: Partial<ResultCompleteness>;
};

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
  frameProcessResult: PartialProcessResult,
  settings?: Partial<ScanningSettings>,
) {
  return (
    match<PartialProcessResult, BlinkIdUiMappableKey | undefined>(
      frameProcessResult,
    )
      // Success states
      .with(
        {
          resultCompleteness: {
            scanningStatus: "document-scanned",
          },
        },
        () => "DOCUMENT_CAPTURED",
      )
      .with(
        {
          resultCompleteness: {
            scanningStatus: "side-scanned",
          },
        },
        () => "PAGE_CAPTURED",
      )

      // Unsupported document
      .with(
        {
          inputImageAnalysisResult: {
            processingStatus: "unsupported-document",
          },
        },
        () => "UNSUPPORTED_DOCUMENT",
      )

      // scan wrong side / page
      .with(
        {
          inputImageAnalysisResult: {
            scanningSide: "second",
            processingStatus: "scanning-wrong-side",
            documentClassInfo: P.when(isPassportWithBarcode),
          },
        },
        () => "WRONG_LAST_PAGE",
      )
      .with(
        {
          inputImageAnalysisResult: {
            scanningSide: "second",
            processingStatus: "scanning-wrong-side",
            documentClassInfo: P.when(isPassportWithoutBarcode),
            documentRotation: "counter-clockwise-90",
          },
        },
        () => "WRONG_LEFT_PAGE",
      )
      .with(
        {
          inputImageAnalysisResult: {
            scanningSide: "second",
            processingStatus: "scanning-wrong-side",
            documentClassInfo: P.when(isPassportWithoutBarcode),
            documentRotation: "clockwise-90",
          },
        },
        () => "WRONG_RIGHT_PAGE",
      )
      .with(
        {
          inputImageAnalysisResult: {
            scanningSide: "second",
            processingStatus: "scanning-wrong-side",
            documentClassInfo: P.when(isPassportWithoutBarcode),
          },
        },
        () => "WRONG_TOP_PAGE",
      )
      .with(
        {
          inputImageAnalysisResult: {
            processingStatus: "scanning-wrong-side",
          },
        },
        () => "WRONG_SIDE",
      )

      // passport not in frame
      .with(
        {
          resultCompleteness: {
            scanningStatus: "scanning-side-in-progress",
          },
          inputImageAnalysisResult: {
            scanningSide: "first",
            documentClassInfo: P.when(isPassportWithBarcode),
          },
        },
        () => "DATA_PAGE_NOT_IN_FRAME",
      )

      // framing
      .with(
        {
          inputImageAnalysisResult: {
            documentDetectionStatus: "camera-angle-too-steep",
          },
        },
        () => "DOCUMENT_FRAMING_CAMERA_ANGLE_TOO_STEEP",
      )
      .with(
        {
          inputImageAnalysisResult: {
            documentDetectionStatus: "camera-too-close",
          },
        },
        () => "DOCUMENT_FRAMING_CAMERA_TOO_CLOSE",
      )
      .with(
        {
          inputImageAnalysisResult: {
            documentDetectionStatus: "camera-too-far",
          },
        },
        () => "DOCUMENT_FRAMING_CAMERA_TOO_FAR",
      )
      .with(
        {
          inputImageAnalysisResult: {
            documentDetectionStatus: "document-too-close-to-camera-edge",
          },
        },
        () => "DOCUMENT_TOO_CLOSE_TO_FRAME_EDGE",
      )

      // lighting
      .with(
        {
          inputImageAnalysisResult: {
            documentLightingStatus: P.when(
              (status) =>
                status === "too-bright" &&
                settings?.skipImagesWithInadequateLightingConditions,
            ),
          },
        },
        () => "TOO_BRIGHT",
      )
      .with(
        {
          inputImageAnalysisResult: {
            documentLightingStatus: P.when(
              (status) =>
                status === "too-dark" &&
                settings?.skipImagesWithInadequateLightingConditions,
            ),
          },
        },
        () => "TOO_DARK",
      )

      // glare
      .with(
        {
          inputImageAnalysisResult: {
            glareDetectionStatus: P.when(
              (status) =>
                status === "detected" && settings?.skipImagesWithGlare,
            ),
          },
        },
        () => "GLARE_DETECTED",
      )

      // occluded
      .with(
        {
          inputImageAnalysisResult: {
            documentDetectionStatus: "document-partially-visible",
          },
        },
        () => "OCCLUDED",
      )
      .with(
        {
          inputImageAnalysisResult: {
            documentHandOcclusionStatus: P.when(
              (status) =>
                status === "detected" && settings?.skipImagesOccludedByHand,
            ),
          },
        },
        () => "OCCLUDED",
      )
      .with(
        {
          inputImageAnalysisResult: {
            missingMandatoryFields: P.when(
              (arr) => Array.isArray(arr) && arr.length > 0,
            ),
          },
        },
        () => "OCCLUDED",
      )
      // technically the same as the previous case
      .with(
        {
          inputImageAnalysisResult: {
            processingStatus: "mandatory-field-missing",
          },
        },
        () => "OCCLUDED",
      )
      .with(
        {
          inputImageAnalysisResult: {
            processingStatus: "invalid-characters-found",
          },
        },
        () => "OCCLUDED",
      )
      .with(
        {
          inputImageAnalysisResult: {
            processingStatus: "mrz-parsing-failed",
          },
        },
        () => "OCCLUDED",
      )

      .with(
        {
          inputImageAnalysisResult: {
            processingStatus: "image-return-failed",
            imageExtractionFailures: P.when(
              (arr) => Array.isArray(arr) && arr.includes("face"),
            ),
          },
        },
        () => "FACE_PHOTO_OCCLUDED",
      )

      // blur
      .with(
        {
          inputImageAnalysisResult: {
            blurDetectionStatus: P.when(
              (status) => status === "detected" && settings?.skipImagesWithBlur,
            ),
          },
        },
        () => "BLUR_DETECTED",
      )

      // document not in frame
      .with(
        {
          inputImageAnalysisResult: {
            scanningSide: "first",
            documentDetectionStatus: "failed",
            documentClassInfo: P.when(isPassportWithBarcode),
          },
        },
        () => "DATA_PAGE_NOT_IN_FRAME",
      )
      .with(
        {
          inputImageAnalysisResult: {
            scanningSide: "second",
            documentDetectionStatus: "failed",
            documentClassInfo: P.when(isPassportWithoutBarcode),
            documentRotation: "counter-clockwise-90",
          },
        },
        () => "LEFT_PAGE_NOT_IN_FRAME",
      )
      .with(
        {
          inputImageAnalysisResult: {
            scanningSide: "second",
            documentDetectionStatus: "failed",
            documentClassInfo: P.when(isPassportWithoutBarcode),
            documentRotation: "clockwise-90",
          },
        },
        () => "RIGHT_PAGE_NOT_IN_FRAME",
      )
      .with(
        {
          inputImageAnalysisResult: {
            scanningSide: "second",
            documentDetectionStatus: "failed",
            documentClassInfo: P.when(isPassportWithoutBarcode),
          },
        },
        () => "TOP_PAGE_NOT_IN_FRAME",
      )
      .with(
        {
          inputImageAnalysisResult: {
            scanningSide: "second",
            documentDetectionStatus: "failed",
            documentClassInfo: P.when(isPassportWithBarcode),
          },
        },
        () => "LAST_PAGE_NOT_IN_FRAME",
      )
      // non-passport not in frame
      .with(
        {
          resultCompleteness: {
            scanningStatus: "scanning-side-in-progress",
          },
          inputImageAnalysisResult: {
            scanningSide: "first",
            documentDetectionStatus: "failed",
            documentClassInfo: P.when((x) => !isPassport(x)),
          },
        },
        () => "FRONT_PAGE_NOT_IN_FRAME",
      )
      .with(
        {
          resultCompleteness: {
            scanningStatus: "scanning-side-in-progress",
          },
          inputImageAnalysisResult: {
            scanningSide: "second",
            documentDetectionStatus: "failed",
            documentClassInfo: P.when((x) => !isPassport(x)),
          },
        },
        () => "BACK_PAGE_NOT_IN_FRAME",
      )
      // barcode
      .with(
        {
          inputImageAnalysisResult: {
            /**
             * This processing status can only occur if document has mandatory barcode,
             * during the VIZ step
             */
            processingStatus: "barcode-detection-failed",
          },
        },
        () => "BARCODE_NOT_IN_FRAME",
      )

      // scan barcode
      .with(
        {
          inputImageAnalysisResult: {
            processingStatus: "barcode-recognition-failed",
          },
        },
        () => "PROCESSING_BARCODE",
      )

      // fallback
      .otherwise(() => {
        // most likely stability test failing which should be a no-op
        return undefined;
      })
  );
}
