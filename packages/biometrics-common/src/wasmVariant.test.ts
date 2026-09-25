/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { describe, expect, it } from "vitest";

import { selectWasmVariant, type WasmCapabilities } from "./wasmVariant";

const supportedCapabilities: WasmCapabilities = {
  minimumFeatures: true,
  relaxedSimd: false,
  threads: true,
  sharedMemory: true,
  worker: true,
  crossOriginIsolated: true,
  safari: false,
};

describe("selectWasmVariant", () => {
  it("selects SIMD threads when all thread capabilities are available", () => {
    expect(selectWasmVariant(supportedCapabilities)).toBe("simd-threads");
  });

  it("selects relaxed SIMD threads when relaxed SIMD and all thread capabilities are available", () => {
    expect(selectWasmVariant({ ...supportedCapabilities, relaxedSimd: true })).toBe("simd-relaxed-threads");
  });

  it.each(["threads", "sharedMemory", "worker", "crossOriginIsolated"] as const)(
    "selects SIMD when %s is unavailable",
    (capability) => {
      expect(
        selectWasmVariant({
          ...supportedCapabilities,
          [capability]: false,
        }),
      ).toBe("simd");
    },
  );

  it.each(["threads", "sharedMemory", "worker", "crossOriginIsolated"] as const)(
    "selects relaxed SIMD when relaxed SIMD is available and %s is unavailable",
    (capability) => {
      expect(
        selectWasmVariant({
          ...supportedCapabilities,
          relaxedSimd: true,
          [capability]: false,
        }),
      ).toBe("simd-relaxed");
    },
  );

  it("selects SIMD on Safari", () => {
    expect(selectWasmVariant({ ...supportedCapabilities, safari: true })).toBe("simd");
  });

  it("selects relaxed SIMD on Safari with relaxed SIMD support", () => {
    expect(selectWasmVariant({ ...supportedCapabilities, relaxedSimd: true, safari: true })).toBe("simd-relaxed");
  });

  it("does not select a variant without minimum WASM features", () => {
    expect(
      selectWasmVariant({
        ...supportedCapabilities,
        relaxedSimd: true,
        minimumFeatures: false,
      }),
    ).toBeUndefined();
  });
});
