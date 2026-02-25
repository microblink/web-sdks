/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  BlinkIdScanningResult,
  BlinkIdSessionSettings,
  ProcessResultWithBuffer,
  ScanningSettings,
} from "@microblink/blinkid-core";
import { defaultSessionSettings } from "@microblink/blinkid-core";
import { merge } from "merge-anything";
import { type PartialDeep } from "type-fest";
import { blankProcessResult } from "./blankProcessResult";

export const defaultScanningSettings: ScanningSettings =
  defaultSessionSettings.scanningSettings;

export const getMergedSettings = (
  overrides: PartialDeep<ScanningSettings> = {},
): ScanningSettings => {
  return merge(defaultSessionSettings.scanningSettings, overrides);
};

export const createSessionSettings = (
  settingsOverrides: PartialDeep<ScanningSettings> = {},
): BlinkIdSessionSettings => {
  return {
    ...defaultSessionSettings,
    scanningSettings: getMergedSettings(settingsOverrides),
  };
};

export const createScanningResult = (
  overrides: Partial<BlinkIdScanningResult> = {},
): BlinkIdScanningResult => {
  return {
    ...overrides,
  } as BlinkIdScanningResult;
};

/**
 * Utility function to create a BlinkIdProcessResult with specified overrides.
 *
 * Important defaults to take note of:
 * - `documentDetectionStatus` is set to "failed"
 * - `processingStatus` is set to "detection-failed"
 * - `scanningStatus` is set to "scanning-side-in-progress"
 * - `scanningSide` is set to "first"
 */
export const createProcessResult = (
  overrides: PartialDeep<ProcessResultWithBuffer> = {},
): ProcessResultWithBuffer => {
  return merge(blankProcessResult, overrides) as ProcessResultWithBuffer;
};
