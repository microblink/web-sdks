/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * DocumentImageColor defines possible color statuses determined from scanned
 * image.
 */
export type DocumentImageColor =
  /** Determining image color status was not performed */
  | "not-available"
  /** Black-and-white image scanned */
  | "black-and-white"
  /** Color image scanned */
  | "color";
