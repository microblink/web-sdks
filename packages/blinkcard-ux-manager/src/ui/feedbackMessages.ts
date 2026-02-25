/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { BlinkCardUiStateKey } from "../core/blinkcard-ui-state";
import { LocalizationStrings } from "./LocalizationContext";

/**
 * The feedback messages.
 */
export const feedbackMessages: Partial<
  Record<
    BlinkCardUiStateKey,
    (isDesktop?: boolean) => keyof LocalizationStrings["feedback_messages"]
  >
> = {
  INTRO_FRONT: () => "scan_the_front_side",
  INTRO_BACK: () => "scan_the_back_side",
  CARD_NOT_IN_FRAME_FRONT: () => "scan_the_front_side",
  CARD_NOT_IN_FRAME_BACK: () => "scan_the_back_side",
  FLIP_CARD: () => "flip_to_back_side",
  WRONG_SIDE: () => "flip_card",

  // occlusion
  OCCLUDED: () => "occluded",

  // framing
  CARD_FRAMING_CAMERA_TOO_CLOSE: () => "move_farther",
  CARD_FRAMING_CAMERA_TOO_FAR: () => "move_closer",
  CARD_TOO_CLOSE_TO_FRAME_EDGE: () => "document_too_close_to_edge",
  CARD_FRAMING_CAMERA_ANGLE_TOO_STEEP: (isDesktop?: boolean) =>
    isDesktop ? "camera_angle_too_steep_desktop" : "camera_angle_too_steep",
  BLUR_DETECTED: (isDesktop?: boolean) =>
    isDesktop ? "blur_detected_desktop" : "blur_detected",
};
