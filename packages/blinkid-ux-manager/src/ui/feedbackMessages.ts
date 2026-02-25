/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { BlinkIdUiStateKey } from "../core/blinkid-ui-state";
import { LocalizationStrings } from "./LocalizationContext";

/**
 * The feedback messages.
 */
export const feedbackMessages: Partial<
  Record<BlinkIdUiStateKey, (isDesktop?: boolean) => keyof LocalizationStrings>
> = {
  // intro states
  INTRO_DATA_PAGE: () => "scan_data_page",
  INTRO_FRONT_PAGE: () => "scan_the_front_side",
  INTRO_BACK_PAGE: () => "scan_the_back_side",
  INTRO_TOP_PAGE: () => "scan_top_page",
  INTRO_LEFT_PAGE: () => "scan_left_page",
  INTRO_RIGHT_PAGE: () => "scan_right_page",
  INTRO_LAST_PAGE: () => "scan_last_page_barcode",
  // transition states
  FLIP_CARD: () => "flip_to_back_side",
  WRONG_SIDE: () => "flip_document",
  // processing states
  PROCESSING_BARCODE: () => "scan_the_barcode",
  // passport
  MOVE_TOP: () => "move_top",
  MOVE_LEFT: () => "move_left",
  MOVE_RIGHT: () => "move_right",
  MOVE_LAST_PAGE: () => "scan_last_page_barcode",
  WRONG_TOP_PAGE: () => "wrong_top",
  WRONG_LEFT_PAGE: () => "wrong_left",
  WRONG_RIGHT_PAGE: () => "wrong_right",
  WRONG_LAST_PAGE: () => "scan_last_page_barcode",
  // occlusion
  BLUR_DETECTED: (isDesktop?: boolean) =>
    isDesktop ? "keep_document_still" : "blur_detected",
  GLARE_DETECTED: () => "glare_detected",
  OCCLUDED: () => "occluded",
  // image
  FACE_PHOTO_OCCLUDED: () => "face_photo_not_fully_visible",
  // framing
  DOCUMENT_FRAMING_CAMERA_TOO_CLOSE: () => "move_farther",
  DOCUMENT_FRAMING_CAMERA_TOO_FAR: () => "move_closer",
  DOCUMENT_TOO_CLOSE_TO_FRAME_EDGE: () => "document_too_close_to_edge",
  DOCUMENT_FRAMING_CAMERA_ANGLE_TOO_STEEP: (isDesktop?: boolean) =>
    isDesktop ? "keep_document_parallel" : "camera_angle_too_steep",
  // no document
  FRONT_PAGE_NOT_IN_FRAME: () => "scan_the_front_side",
  BACK_PAGE_NOT_IN_FRAME: () => "scan_the_back_side",
  DATA_PAGE_NOT_IN_FRAME: () => "scan_data_page",
  TOP_PAGE_NOT_IN_FRAME: () => "scan_top_page",
  LEFT_PAGE_NOT_IN_FRAME: () => "scan_left_page",
  RIGHT_PAGE_NOT_IN_FRAME: () => "scan_right_page",
  LAST_PAGE_NOT_IN_FRAME: () => "scan_last_page_barcode",
  // lighting
  TOO_DARK: () => "too_dark",
  TOO_BRIGHT: () => "too_bright",
  // done
  PAGE_CAPTURED: () => "front_side_scanned",
  DOCUMENT_CAPTURED: () => "document_scanned",

  // new stuff
  BARCODE_NOT_IN_FRAME: () => "scan_the_barcode",
};
