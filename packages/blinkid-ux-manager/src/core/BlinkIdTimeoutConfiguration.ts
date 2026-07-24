/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

export type BlinkIdTimeoutConfiguration = {
  /**
   * Maximum allowed inactivity window in milliseconds. The inactivity timer is
   * reset whenever the stabilized BlinkID UI state changes. Set to `null` to
   * disable the inactivity timeout.
   */
  inactivityTimeoutMs: number | null;
  /**
   * Maximum allowed capture duration for a single BlinkID scan step in
   * milliseconds. Set to `null` to disable the scan-step timeout.
   */
  scanStepTimeoutMs: number | null;
  /**
   * Active-capture delay before resolving a barcode step once BlinkID reports a
   * barcode whose parsing is not supported. Set to `null` to disable automatic
   * resolution for partially supported barcodes.
   */
  partiallySupportedBarcodeResolveTimeoutMs: number | null;
};

/**
 * The default BlinkID timeout configuration.
 */
export const defaultBlinkIdTimeoutConfiguration = {
  inactivityTimeoutMs: 10_000,
  scanStepTimeoutMs: 60_000,
  partiallySupportedBarcodeResolveTimeoutMs: 3_000,
} as const satisfies BlinkIdTimeoutConfiguration;

export const defaultBlinkIdDesktopTimeoutConfiguration = {
  inactivityTimeoutMs: 10_000,
  scanStepTimeoutMs: 60_000,
  partiallySupportedBarcodeResolveTimeoutMs: 8_000,
} as const satisfies BlinkIdTimeoutConfiguration;

const resolveTimeoutConfiguration = (
  timeoutConfiguration: Partial<BlinkIdTimeoutConfiguration>,
  isDesktop: boolean,
): BlinkIdTimeoutConfiguration => {
  const defaultConfiguration = isDesktop
    ? defaultBlinkIdDesktopTimeoutConfiguration
    : defaultBlinkIdTimeoutConfiguration;

  return {
    inactivityTimeoutMs:
      timeoutConfiguration.inactivityTimeoutMs === undefined
        ? defaultConfiguration.inactivityTimeoutMs
        : timeoutConfiguration.inactivityTimeoutMs,
    partiallySupportedBarcodeResolveTimeoutMs:
      timeoutConfiguration.partiallySupportedBarcodeResolveTimeoutMs ===
      undefined
        ? defaultConfiguration.partiallySupportedBarcodeResolveTimeoutMs
        : timeoutConfiguration.partiallySupportedBarcodeResolveTimeoutMs,
    scanStepTimeoutMs:
      timeoutConfiguration.scanStepTimeoutMs === undefined
        ? defaultConfiguration.scanStepTimeoutMs
        : timeoutConfiguration.scanStepTimeoutMs,
  };
};

/**
 * Validates the timeout duration.
 */
const validateTimeoutDuration = (
  key: keyof BlinkIdTimeoutConfiguration,
  duration: number | null,
) => {
  if (duration === null) {
    return;
  }

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`${key} must be greater than 0`);
  }
};

/**
 * Normalizes the BlinkID timeout configuration.
 */
export const normalizeBlinkIdTimeoutConfiguration = (
  timeoutConfiguration: Partial<BlinkIdTimeoutConfiguration> = {},
  isDekstop: boolean,
): BlinkIdTimeoutConfiguration => {
  const normalizedTimeoutConfiguration = resolveTimeoutConfiguration(
    timeoutConfiguration,
    isDekstop,
  );

  validateTimeoutDuration(
    "inactivityTimeoutMs",
    normalizedTimeoutConfiguration.inactivityTimeoutMs,
  );
  validateTimeoutDuration(
    "scanStepTimeoutMs",
    normalizedTimeoutConfiguration.scanStepTimeoutMs,
  );
  validateTimeoutDuration(
    "partiallySupportedBarcodeResolveTimeoutMs",
    normalizedTimeoutConfiguration.partiallySupportedBarcodeResolveTimeoutMs,
  );

  return normalizedTimeoutConfiguration;
};
