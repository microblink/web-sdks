/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Builds a default successful license result and allows test-specific overrides.
 */
import type { LicenseUnlockResult } from "@microblink/wasm-common";

export function createLicenseUnlockResult(
  overrides: Partial<LicenseUnlockResult> = {},
): LicenseUnlockResult {
  return {
    isTrial: false,
    hasPing: true,
    licenseId: "license-id",
    licensee: "licensee",
    applicationIds: [],
    packageName: "package",
    sdkName: "BlinkSdk",
    sdkVersion: "0.0.0-test",
    unlockResult: "valid",
    licenseError: "",
    showDemoOverlay: true,
    showProductionOverlay: true,
    allowBaltazarProxy: false,
    allowPingProxy: false,
    ...overrides,
  };
}
