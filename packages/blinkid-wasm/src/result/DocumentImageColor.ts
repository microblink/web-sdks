/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * DocumentImageColor defines possible color statuses determined from scanned
 * image.
 *
 * - `not-available` Determining image color status was not performed.
 * - `black-and-white` Black-and-white image scanned.
 * - `color` Color image scanned.
 */
export type DocumentImageColor = "not-available" | "black-and-white" | "color";
