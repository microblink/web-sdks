/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { UnifiedFeedback } from "@microblink/biometrics-core";

import type { LocalizationStrings } from "./LocalizationContext";

export const feedbackMessages = {
  FACE_NOT_FOUND: "face_not_found",
  OK: "ok",
  MULTIPLE_FACES: "multiple_faces",
  TOO_CLOSE: "too_close",
  TOO_FAR: "too_far",
  ANGLED_ROLL: "angled_roll",
  ANGLED_PITCH: "angled_pitch",
  ANGLED_YAW: "angled_yaw",
  TOO_CLOSE_TO_BORDER: "too_close_to_border",
  NOT_STILL: "not_still",
  TOO_DARK: "too_dark",
  TOO_BRIGHT: "too_bright",
  TOO_BLURRY: "too_blurry",
} satisfies Record<UnifiedFeedback, keyof LocalizationStrings["feedback_messages"]>;
