/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { describe, expect, it } from "vitest";
import { getWasmFileSize, type SizeManifest } from "./getWasmFileSize";

const twoLevelManifest: SizeManifest = {
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
};

const threeLevelManifest: SizeManifest = {
  wasm: {
    basic: { full: 1000, lightweight: 800 },
    advanced: { full: 1200, lightweight: 900 },
    "advanced-threads": { full: 1300, lightweight: 950 },
  },
  data: {
    basic: { full: 2000, lightweight: 1600 },
    advanced: { full: 2100, lightweight: 1700 },
    "advanced-threads": { full: 2200, lightweight: 1800 },
  },
};

describe("getWasmFileSize", () => {
  describe("two-level manifest (BlinkCard)", () => {
    it("returns correct size for known wasm file", () => {
      const size = getWasmFileSize(
        { fileType: "wasm", variant: "basic" },
        twoLevelManifest,
      );
      expect(typeof size).toBe("number");
      expect(size).toBe(1000);
    });

    it("returns correct size for known data file", () => {
      const size = getWasmFileSize(
        { fileType: "data", variant: "advanced" },
        twoLevelManifest,
      );
      expect(typeof size).toBe("number");
      expect(size).toBe(2100);
    });

    it("throws for unknown file type or variant", () => {
      expect(() => {
        getWasmFileSize(
          // @ts-expect-error Testing invalid parameters
          { fileType: "invalid", variant: "basic" },
          twoLevelManifest,
        );
      }).toThrow();
    });
  });

  describe("three-level manifest (BlinkID)", () => {
    it("returns correct size for known wasm file with buildType", () => {
      const size = getWasmFileSize(
        { fileType: "wasm", variant: "basic", buildType: "full" },
        threeLevelManifest,
      );
      expect(typeof size).toBe("number");
      expect(size).toBe(1000);
    });

    it("returns correct size for known data file with lightweight buildType", () => {
      const size = getWasmFileSize(
        { fileType: "data", variant: "advanced", buildType: "lightweight" },
        threeLevelManifest,
      );
      expect(typeof size).toBe("number");
      expect(size).toBe(1700);
    });

    it("throws for unknown file type/variant/buildType", () => {
      expect(() => {
        getWasmFileSize(
          // @ts-expect-error Testing invalid parameters
          { fileType: "invalid", variant: "basic", buildType: "full" },
          threeLevelManifest,
        );
      }).toThrow();
    });

    it("throws when build-aware entry is used without buildType", () => {
      expect(() => {
        getWasmFileSize(
          { fileType: "wasm", variant: "basic" },
          threeLevelManifest,
        );
      }).toThrow("buildType is required");
    });
  });
});
