/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * ImageAnalysisDetectionStatus defines possible states of detection.
 *
 * - `not-available` Detection was not performed.
 * - `not-detected` Not detected on input image.
 * - `detected` Detected on input image.
 */
export type ImageAnalysisDetectionStatus =
  | "not-available"
  | "not-detected"
  | "detected";
