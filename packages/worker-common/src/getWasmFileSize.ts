/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  ResourceFileType,
  WasmBuildType,
  WasmVariant,
} from "@microblink/wasm-common";

/**
 * Parameters for looking up expected WASM/data file size.
 * `buildType` is optional and used only by packages that have full/lightweight variants (e.g. BlinkID).
 */
export type GetWasmFileSizeParams = {
  fileType: ResourceFileType;
  variant: WasmVariant;
  buildType?: WasmBuildType;
};

/**
 * Leaf node in the size manifest.
 * - number: size for manifests without build variants (BlinkCard)
 * - Record<WasmBuildType, number>: size by build variant (BlinkID)
 */
export type SizeManifestLeaf = number | Record<WasmBuildType, number>;

/**
 * Size manifest covering both BlinkCard and BlinkID shapes.
 */
export type SizeManifest = Record<
  ResourceFileType,
  Record<WasmVariant, SizeManifestLeaf>
>;

export function getWasmFileSize(
  params: GetWasmFileSizeParams,
  manifest: SizeManifest,
): number {
  const sizeNode = manifest[params.fileType][params.variant];

  if (typeof sizeNode === "number") {
    return sizeNode;
  }

  if (params.buildType === undefined) {
    throw new Error(
      "buildType is required when size manifest entry is build-aware",
    );
  }

  return sizeNode[params.buildType];
}
