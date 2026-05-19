/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Represents the rotation of the document.
 *
 * - `not-available` The rotation is not available.
 * - `zero` The rotation is zero.
 * - `clockwise-90` The rotation is clockwise 90 degrees.
 * - `counter-clockwise-90` The rotation is counter clockwise 90 degrees.
 * - `upside-down` The rotation is upside down.
 */
export type DocumentRotation =
  | "not-available"
  | "zero"
  | "clockwise-90"
  | "counter-clockwise-90"
  | "upside-down";
