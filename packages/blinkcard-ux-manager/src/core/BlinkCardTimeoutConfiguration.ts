/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

export type BlinkCardTimeoutConfiguration = {
  /**
   * Maximum allowed inactivity window in milliseconds. The inactivity timer is reset whenever the stabilized BlinkCard
   * UI state changes. Set to `null` to disable the inactivity timeout.
   */
  inactivityTimeoutMs: number | null;
  /**
   * Maximum allowed capture duration for a single BlinkCard scan step in milliseconds. Set to `null` to disable the
   * scan-step timeout.
   */
  scanStepTimeoutMs: number | null;
};

/** The default BlinkCard timeout configuration. */
export const defaultBlinkCardTimeoutConfiguration = {
  inactivityTimeoutMs: 10_000,
  scanStepTimeoutMs: 60_000,
} as const satisfies BlinkCardTimeoutConfiguration;
