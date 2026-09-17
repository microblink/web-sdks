/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { WasmVariant } from "@microblink/wasm-common";
import {
  bulkMemory,
  mutableGlobals,
  referenceTypes,
  relaxedSimd,
  saturatedFloatToInt,
  signExtensions,
  simd,
  threads,
} from "wasm-feature-detect";

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
 * @returns True if the browser supports WASM threads, false otherwise. Safari 16 shipped with WASM threads support, but
 *   it didn't ship with nested workers support, so an extra check is needed.
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
 * Checks if the browser supports WASM relaxed SIMD.
 *
 * @returns True if the `simd-relaxed*` variants can run in this browser.
 */
export async function detectRelaxedSimdSupport(): Promise<boolean> {
  return relaxedSimd();
}

/** Options for {@link detectWasmFeatures}. */
export type DetectWasmFeaturesOptions = {
  /**
   * Whether the relaxed SIMD variants may be selected. Products that do not ship `simd-relaxed*` builds must pass
   * `false`.
   *
   * @default true
   */
  allowRelaxedSimd?: boolean;
};

/**
 * Detects the WASM features and selects the fastest supported variant.
 *
 * Fixed-width SIMD is always required. Relaxed SIMD variants are preferred when the browser supports them and the
 * caller allows them; threaded variants are preferred when the browser supports WASM threads.
 *
 * @param options Detection options.
 * @returns The WASM variant.
 */
export async function detectWasmFeatures(options: DetectWasmFeaturesOptions = {}): Promise<WasmVariant> {
  const { allowRelaxedSimd = true } = options;

  const minRequiredFeaturesSet = [
    mutableGlobals(),
    referenceTypes(),
    bulkMemory(),
    saturatedFloatToInt(),
    signExtensions(),
    simd(),
  ];

  const supportsMinRequiredFeaturesSet = (await Promise.all(minRequiredFeaturesSet)).every(Boolean);

  if (!supportsMinRequiredFeaturesSet) {
    throw new Error("Browser doesn't meet minimum requirements!");
  }

  const supportsRelaxedSimd = allowRelaxedSimd && (await detectRelaxedSimdSupport());
  const supportsThreads = await checkThreadsSupport();

  if (supportsRelaxedSimd) {
    return supportsThreads ? "simd-relaxed-threads" : "simd-relaxed";
  }

  return supportsThreads ? "simd-threads" : "simd";
}
