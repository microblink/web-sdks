/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type { ResourceFileType, WasmVariant } from "@microblink/blinkcard-wasm";
import sizeManifest from "@microblink/blinkcard-wasm/size-manifest.json";

/**
 * Gets the expected file size for a WASM or data file.
 * @param fileType - The type of file (wasm or data)
 * @param variant - The WASM variant
 * @returns The expected file size in bytes, or undefined if not known
 */
export function getWasmFileSize(
  fileType: ResourceFileType,
  variant: WasmVariant,
): number {
  return sizeManifest[fileType][variant];
}
