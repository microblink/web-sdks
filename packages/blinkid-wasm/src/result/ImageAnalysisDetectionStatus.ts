/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/** ImageAnalysisDetectionStatus defines possible states of detection. */
export type ImageAnalysisDetectionStatus =
  /** Detection was not performed */
  | "not-available"
  /** Not detected on input image */
  | "not-detected"
  /** Detected on input image */
  | "detected";
