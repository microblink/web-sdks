/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { RedactionSettings } from "@microblink/blinkid-wasm";

/**
 * This function merges the user provided redaction settings with the default ones, this covers the case where the user
 * can explicitly return "redactBarcode: undefined", in which case we want to use the default boolean (false) instead
 */
export function mergeRedactionSettings(
  defaultRedactionSettings: RedactionSettings,
  redactionSettings: Partial<RedactionSettings>,
): RedactionSettings {
  return {
    ...redactionSettings,
    redactBarcode:
      redactionSettings.redactBarcode ?? defaultRedactionSettings.redactBarcode,
    redactMrz:
      redactionSettings.redactMrz ?? defaultRedactionSettings.redactMrz,
    fields: redactionSettings.fields ?? defaultRedactionSettings.fields,
    mode: redactionSettings.mode ?? defaultRedactionSettings.mode,
  };
}
