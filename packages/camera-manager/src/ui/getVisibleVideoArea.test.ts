/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { getVisibleVideoArea } from "./getVisibleVideoArea";

describe("getVisibleVideoArea", () => {
  it("should return the entire video area when container and video have the same aspect ratio", () => {
    // 16:9 aspect ratio for both container and video
    const result = getVisibleVideoArea(1600, 900, 1280, 720);
    expect(result).toEqual({ x: 0, y: 0, width: 1280, height: 720 });
  });

  it("should crop height when container is wider than video (scaleX >= scaleY)", () => {
    // Container: 4:3, Video: 1:1 (square)
    const result = getVisibleVideoArea(800, 600, 400, 400);
    expect(result).toEqual({ x: 0, y: 50, width: 400, height: 300 });
  });

  it("should crop width when container is taller than video (scaleX < scaleY)", () => {
    // Container: 3:4, Video: 16:9 (widescreen)
    const result = getVisibleVideoArea(600, 800, 1600, 900);
    // Scale factors: scaleX = 0.375, scaleY = 0.889, s = 0.889
    // visibleNaturalWidth = 600 / 0.889 = 675, x = (1600 - 675) / 2 = 462.5
    expect(result).toEqual({ x: 463, y: 0, width: 675, height: 900 });
  });

  it("should handle extreme aspect ratios - wide container, tall video", () => {
    // Very wide container, very tall video
    const result = getVisibleVideoArea(1000, 200, 400, 800);
    // Scale factors: scaleX = 2.5, scaleY = 0.25, s = 2.5
    // visibleNaturalHeight = 200 / 2.5 = 80, y = (800 - 80) / 2 = 360
    expect(result).toEqual({ x: 0, y: 360, width: 400, height: 80 });
  });

  it("should handle extreme aspect ratios - tall container, wide video", () => {
    // Very tall container, very wide video
    const result = getVisibleVideoArea(200, 1000, 800, 400);
    // Scale factors: scaleX = 0.25, scaleY = 2.5, s = 2.5
    // visibleNaturalWidth = 200 / 2.5 = 80, x = (800 - 80) / 2 = 360
    expect(result).toEqual({ x: 360, y: 0, width: 80, height: 400 });
  });

  it("should handle integer rounding correctly", () => {
    // Case where division results in non-integer values
    const result = getVisibleVideoArea(605, 805, 1601, 901);
    // Scale factors: scaleX = 0.378, scaleY = 0.894, s = 0.894
    // visibleNaturalWidth = 605 / 0.894 = 676.7 (rounds to 677)
    // x = (1601 - 677) / 2 = 462
    expect(result).toEqual({ x: 462, y: 0, width: 677, height: 901 });
  });

  it("should work with small dimensions", () => {
    const result = getVisibleVideoArea(10, 5, 4, 3);
    // Scale factors: scaleX = 2.5, scaleY = 1.667, s = 2.5
    // visibleNaturalHeight = 5 / 2.5 = 2, y = (3 - 2) / 2 = 0.5
    expect(result).toEqual({ x: 0, y: 1, width: 4, height: 2 });
  });
});
