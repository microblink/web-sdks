/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { ScanningSettings } from "./scanning-settings";

/**
 * The source of the input image.
 *
 * - `photo`: A single image will be provided to the sdk for analysis per side of
 *   document. This feature is currently not supported.
 * - `video`: A consecutive stream of images will be provided to the sdk.
 */
export type InputImageSource = "photo" | "video";

/** Settings configuring the whole session */
export type BlinkIdVerifySessionSettings = Partial<{
  /** Defines the source of the input image. */
  inputImageSource: InputImageSource;

  /**
   * Specific settings for the scanning process. If no settings are provided,
   * defaults will be used.
   */
  scanningSettings: ScanningSettings;
}>;
