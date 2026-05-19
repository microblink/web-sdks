/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * ImageAnalysisLightingStatus defines possible lighting statuses.
 *
 * - `not-available` status is not available.
 * - `too-bright` status is when the document lighting is too bright.
 * - `too-dark` status is when the document lighting is too dark.
 * - `normal` status is when the document lighting is normal.
 */
export type ImageAnalysisLightingStatus =
  | "not-available"
  | "too-bright"
  | "too-dark"
  | "normal";
