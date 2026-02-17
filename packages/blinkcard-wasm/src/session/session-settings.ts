/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  AnonymizationSettings,
  CardNumberAnonymizationSettings,
  CroppedImageSettings,
  ExtractionSettings,
  LivenessSettings,
  ScanningSettings,
} from "./scanning-settings";
import type { OverrideProperties } from "type-fest";

/**
 * Represents the configuration settings for a scanning session.
 *
 * This structure holds the settings related to the resources initialization,
 * input image source, and specific scanning configurations that define how the
 * scanning session should behave.
 */
export type BlinkCardSessionSettings = {
  /**
   * The type of image source for the scanning session.
   *
   * This type is used to indicate whether an image was obtained from a video
   * stream or a single-source input such as a standalone photo. The default is
   * set to `Video`.
   */
  inputImageSource: InputImageSource;

  /**
   * The specific scanning settings for the scanning session.
   *
   * Defines various parameters that control the scanning process.
   */
  scanningSettings: ScanningSettings;
};

/**
 * Partial scanning settings with optional nested objects.
 * Used when passing partial settings to the Wasm module.
 */
export type PartialScanningSettingsInput = Partial<
  OverrideProperties<
    ScanningSettings,
    {
      croppedImageSettings: Partial<CroppedImageSettings>;
      extractionSettings: Partial<ExtractionSettings>;
      livenessSettings: Partial<LivenessSettings>;
      anonymizationSettings: Partial<OverrideProperties<AnonymizationSettings, {
        cardNumberAnonymizationSettings: Partial<CardNumberAnonymizationSettings>;
      }>>;
    }
  >
>;

/**
 * Partial session settings accepted by the Wasm module.
 * All fields are optional; the C++ layer merges with defaults.
 */
export type BlinkCardSessionSettingsInput = OverrideProperties<
  Partial<BlinkCardSessionSettings>,
  {
    scanningSettings?: PartialScanningSettingsInput;
  }
>;

/**
 * Represents the source type of an image.
 *
 * This type is used to indicate whether an image was obtained from a video
 * stream or a single-source input such as a standalone photo.
 */
export type InputImageSource = "photo" | "video";
