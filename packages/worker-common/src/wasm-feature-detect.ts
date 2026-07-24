/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import {
  bulkMemory,
  mutableGlobals,
  referenceTypes,
  saturatedFloatToInt,
  signExtensions,
  simd,
  threads,
} from "wasm-feature-detect";
import type { WasmVariant } from "@microblink/wasm-common";

/**
 * Checks if the browser is Safari.
 *
 * @returns True if the browser is Safari, false otherwise.
 */
export function isSafariForThreads(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes("safari") && !userAgent.includes("chrome");
}

/**
 * Checks if the browser supports WASM threads.
 *
 * @returns True if the browser supports WASM threads, false otherwise.
 *
 * Safari 16 shipped with WASM threads support, but it didn't ship with nested
 * workers support, so an extra check is needed.
 *
 * @see https://github.com/GoogleChromeLabs/squoosh/pull/1325/files#diff-904900db64cd3f48b0e765dbbdc6a218a7ea74a199671bde82a8944a904db86f
 */
export default async function checkThreadsSupport(): Promise<boolean> {
  const supportsWasmThreads = await threads();
  if (!supportsWasmThreads) return false;

  if (!("importScripts" in self)) {
    throw Error("Not implemented");
  }

  // Safari has issues with shared memory
  // https://github.com/emscripten-core/emscripten/issues/19374
  if (isSafariForThreads()) {
    return false;
  }

  return "Worker" in self;
}

/**
 * Detects the WASM features.
 *
 * @returns The WASM variant.
 */
export async function detectWasmFeatures(): Promise<WasmVariant> {
  const minRequiredFeaturesSet = [
    mutableGlobals(),
    referenceTypes(),
    bulkMemory(),
    saturatedFloatToInt(),
    signExtensions(),
    simd(),
  ];

  const supportsMinRequiredFeaturesSet = (
    await Promise.all(minRequiredFeaturesSet)
  ).every(Boolean);

  if (!supportsMinRequiredFeaturesSet) {
    throw new Error("Browser doesn't meet minimum requirements!");
  }

  const supportsThreads = await checkThreadsSupport();

  if (!supportsThreads) {
    return "simd";
  }

  return "simd-threads";
}
