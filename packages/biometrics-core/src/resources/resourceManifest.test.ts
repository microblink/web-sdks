/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { describe, expect, it } from "vitest";

import {
  BIOMETRICS_WASM_RESOURCES,
  getBiometricsRuntimeResourceManifest,
  resolveBiometricsResourcesLocation,
  resolveCaptureResourceBaseUrl,
  resolveRuntimeResourceUrl,
} from "./resourceManifest";

describe("Biometrics resource manifest", () => {
  it("lists every production capture resource", () => {
    expect(getBiometricsRuntimeResourceManifest("simd").map((resource) => resource.path)).toEqual([
      "biometrics-worker.js",
      "simd/biometrics-wasm.js",
      "simd/biometrics-wasm.wasm",
      "simd/biometrics-wasm.data",
    ]);
  });

  it("resolves exactly one native resource triplet per variant", () => {
    expect(Object.values(BIOMETRICS_WASM_RESOURCES["simd-threads"]).map((resource) => resource.path)).toEqual([
      "simd-threads/biometrics-wasm.js",
      "simd-threads/biometrics-wasm.wasm",
      "simd-threads/biometrics-wasm.data",
    ]);
    expect(
      getBiometricsRuntimeResourceManifest("simd-threads")
        .map((resource) => resource.path)
        .filter((path) => path.includes("biometrics-wasm")),
    ).toEqual([
      "simd-threads/biometrics-wasm.js",
      "simd-threads/biometrics-wasm.wasm",
      "simd-threads/biometrics-wasm.data",
    ]);
  });

  it.each(["simd", "simd-threads", "simd-relaxed", "simd-relaxed-threads"] as const)(
    "places %s resources under a directory named after the variant",
    (variant) => {
      expect(
        getBiometricsRuntimeResourceManifest(variant)
          .map((resource) => resource.path)
          .filter((path) => path.includes("biometrics-wasm")),
      ).toEqual([
        `${variant}/biometrics-wasm.js`,
        `${variant}/biometrics-wasm.wasm`,
        `${variant}/biometrics-wasm.data`,
      ]);
    },
  );

  it("lists only common resources without a resolved variant", () => {
    expect(
      getBiometricsRuntimeResourceManifest(undefined).some((resource) => resource.path.includes("biometrics-wasm")),
    ).toBe(false);
  });

  it("uses the same path resolution for runtime and preflight", () => {
    expect(resolveCaptureResourceBaseUrl("https://cdn.test/sdk/resources/")).toBe("https://cdn.test/sdk/resources");
    expect(resolveRuntimeResourceUrl("https://cdn.test/resources", "biometrics-worker.js")).toBe(
      "https://cdn.test/resources/biometrics-worker.js",
    );
    expect(
      resolveBiometricsResourcesLocation(
        "https://cdn.test/sdk/index.html?version=1#section",
        "https://app.test/flow/index.html",
      ),
    ).toBe("https://cdn.test/sdk/resources/");
  });
});
