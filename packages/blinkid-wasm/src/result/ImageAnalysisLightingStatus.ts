/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/** ImageAnalysisLightingStatus defines possible lighting statuses. */
export type ImageAnalysisLightingStatus =
  /** Status is not available */
  | "not-available"
  /** Document lighting is too bright */
  | "too-bright"
  /** Document lighting is too dark */
  | "too-dark"
  /** Document lighting is normal */
  | "normal";
