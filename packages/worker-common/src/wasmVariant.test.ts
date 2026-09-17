/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { describe, expect, it } from "vitest";

import { isThreadedWasmVariant } from "./wasmVariant";

describe("isThreadedWasmVariant", () => {
  it.each([
    { variant: "simd", expected: false },
    { variant: "simd-relaxed", expected: false },
    { variant: "simd-threads", expected: true },
    { variant: "simd-relaxed-threads", expected: true },
  ] as const)("returns $expected for $variant", ({ variant, expected }) => {
    expect(isThreadedWasmVariant(variant)).toBe(expected);
  });
});
