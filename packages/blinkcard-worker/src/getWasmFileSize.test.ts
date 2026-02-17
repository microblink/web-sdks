/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { describe, expect, it, vi } from "vitest";
import { getWasmFileSize } from "./getWasmFileSize";

vi.mock("@microblink/blinkcard-wasm/size-manifest.json", () => ({
  default: {
    wasm: {
      basic: 1000,
      advanced: 1200,
      "advanced-threads": 1300,
    },
    data: {
      basic: 2000,
      advanced: 2100,
      "advanced-threads": 2200,
    },
  },
}));

describe("getWasmFileSize", () => {
  it("returns correct size for known wasm file", () => {
    const size = getWasmFileSize("wasm", "basic");
    expect(typeof size).toBe("number");
    expect(size).toBeGreaterThan(0);
    expect(size).toBe(1000);
  });

  it("returns correct size for known data file", () => {
    const size = getWasmFileSize("data", "advanced");
    expect(typeof size).toBe("number");
    expect(size).toBeGreaterThan(0);
    expect(size).toBe(2100);
  });

  it("throws for unknown file type or variant", () => {
    expect(() => {
      // @ts-expect-error Testing invalid parameters
      getWasmFileSize("invalid", "basic");
    }).toThrowError("Cannot read properties of undefined");
  });
});
