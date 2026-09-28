/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

/** Feedback codes related to face detection status. */
export const FaceFeedback = ["FACE_NOT_FOUND", "MULTIPLE_FACES"] as const;

export type FaceFeedback = (typeof FaceFeedback)[number];

/** Feedback codes related to the position and orientation of the detected face. */
export const PositionFeedback = [
  "TOO_CLOSE",
  "TOO_FAR",
  "ANGLED_ROLL",
  "ANGLED_PITCH",
  "ANGLED_YAW",
  "TOO_CLOSE_TO_BORDER",
  "NOT_STILL",
] as const;

export type PositionFeedback = (typeof PositionFeedback)[number];

/** Feedback codes related to the environment quality for face capture. */
export const EnvironmentFeedback = ["TOO_DARK", "TOO_BRIGHT", "TOO_BLURRY"] as const;

export type EnvironmentFeedback = (typeof EnvironmentFeedback)[number];

/** Union type of all possible feedback codes for face capture evaluation. */
export type UnifiedFeedback = "OK" | FaceFeedback | PositionFeedback | EnvironmentFeedback;
