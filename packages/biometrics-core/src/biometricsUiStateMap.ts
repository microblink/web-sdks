/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { UnifiedFeedback } from "./analyzer/feedback";

/** UI state definition map keyed by Biometrics feedback codes. */
export type BiometricsUiStateMap = {
  [K in UnifiedFeedback]: {
    key: K;
    minDuration: number;
    initialWeight?: number;
  };
};

const SUCCESS_MIN_DURATION_MS = 300; // 0.3 seconds
const MIN_DURATION_MS = 2000; // 2 seconds

/** Default UI state map used by `FeedbackStabilizer`. */
export const biometricsUiStateMap: BiometricsUiStateMap = {
  OK: {
    key: "OK",
    minDuration: SUCCESS_MIN_DURATION_MS,
  },
  FACE_NOT_FOUND: {
    key: "FACE_NOT_FOUND",
    minDuration: MIN_DURATION_MS,
    initialWeight: 1.2,
  },
  MULTIPLE_FACES: {
    key: "MULTIPLE_FACES",
    minDuration: MIN_DURATION_MS,
    initialWeight: 1.5,
  },
  TOO_CLOSE: {
    key: "TOO_CLOSE",
    minDuration: MIN_DURATION_MS,
    initialWeight: 1.4,
  },
  TOO_FAR: {
    key: "TOO_FAR",
    minDuration: MIN_DURATION_MS,
    initialWeight: 1.4,
  },
  ANGLED_PITCH: {
    key: "ANGLED_PITCH",
    minDuration: MIN_DURATION_MS,
    initialWeight: 1.2,
  },
  ANGLED_ROLL: {
    key: "ANGLED_ROLL",
    minDuration: MIN_DURATION_MS,
    initialWeight: 1.2,
  },
  ANGLED_YAW: {
    key: "ANGLED_YAW",
    minDuration: MIN_DURATION_MS,
    initialWeight: 1.2,
  },
  TOO_CLOSE_TO_BORDER: {
    key: "TOO_CLOSE_TO_BORDER",
    minDuration: MIN_DURATION_MS,
    initialWeight: 1.3,
  },
  NOT_STILL: {
    key: "NOT_STILL",
    minDuration: MIN_DURATION_MS,
    initialWeight: 1.3,
  },
  TOO_BLURRY: {
    key: "TOO_BLURRY",
    minDuration: MIN_DURATION_MS,
    initialWeight: 1.5,
  },
  TOO_DARK: {
    key: "TOO_DARK",
    minDuration: MIN_DURATION_MS,
    initialWeight: 1.4,
  },
  TOO_BRIGHT: {
    key: "TOO_BRIGHT",
    minDuration: MIN_DURATION_MS,
    initialWeight: 1.4,
  },
};
