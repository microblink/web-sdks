/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { describe, expect, it } from "vitest";

import { getWasmFileSize, type SizeManifest } from "./getWasmFileSize";

const twoLevelManifest: SizeManifest = {
  wasm: {
    simd: 1200,
    "simd-threads": 1300,
    "simd-relaxed": 1250,
    "simd-relaxed-threads": 1350,
  },
  data: {
    simd: 2100,
    "simd-threads": 2200,
    "simd-relaxed": 2150,
    "simd-relaxed-threads": 2250,
  },
};

const threeLevelManifest: SizeManifest = {
  wasm: {
    simd: { full: 1200, lightweight: 900 },
    "simd-threads": { full: 1300, lightweight: 950 },
    "simd-relaxed": { full: 1250, lightweight: 925 },
    "simd-relaxed-threads": { full: 1350, lightweight: 975 },
  },
  data: {
    simd: { full: 2100, lightweight: 1700 },
    "simd-threads": { full: 2200, lightweight: 1800 },
    "simd-relaxed": { full: 2150, lightweight: 1750 },
    "simd-relaxed-threads": { full: 2250, lightweight: 1850 },
  },
};

describe("getWasmFileSize", () => {
  describe("two-level manifest (BlinkCard)", () => {
    it("returns correct size for known wasm file", () => {
      const size = getWasmFileSize({ fileType: "wasm", variant: "simd" }, twoLevelManifest);
      expect(typeof size).toBe("number");
      expect(size).toBe(1200);
    });

    it("returns correct size for known data file", () => {
      const size = getWasmFileSize({ fileType: "data", variant: "simd" }, twoLevelManifest);
      expect(typeof size).toBe("number");
      expect(size).toBe(2100);
    });

    it("throws for unknown file type or variant", () => {
      expect(() => {
        getWasmFileSize(
          // @ts-expect-error Testing invalid parameters
          { fileType: "invalid", variant: "simd" },
          twoLevelManifest,
        );
      }).toThrow();
    });
  });

  describe("three-level manifest (BlinkID)", () => {
    it("returns correct size for known wasm file with buildType", () => {
      const size = getWasmFileSize({ fileType: "wasm", variant: "simd", buildType: "full" }, threeLevelManifest);
      expect(typeof size).toBe("number");
      expect(size).toBe(1200);
    });

    it("returns correct size for known data file with lightweight buildType", () => {
      const size = getWasmFileSize({ fileType: "data", variant: "simd", buildType: "lightweight" }, threeLevelManifest);
      expect(typeof size).toBe("number");
      expect(size).toBe(1700);
    });

    it("throws for unknown file type/variant/buildType", () => {
      expect(() => {
        getWasmFileSize(
          // @ts-expect-error Testing invalid parameters
          { fileType: "invalid", variant: "simd", buildType: "full" },
          threeLevelManifest,
        );
      }).toThrow();
    });

    it("throws when build-aware entry is used without buildType", () => {
      expect(() => {
        getWasmFileSize({ fileType: "wasm", variant: "simd" }, threeLevelManifest);
      }).toThrow("buildType is required");
    });
  });
});
