/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { determineFitMode } from "./determineFitMode";

describe("determineFitMode", () => {
  it('should return "cover" when container and video have the same aspect ratio', () => {
    // Same aspect ratio (16:9)
    expect(determineFitMode(1600, 900, 1280, 720)).toBe("cover");

    // Same aspect ratio (4:3)
    expect(determineFitMode(800, 600, 400, 300)).toBe("cover");

    // Same aspect ratio (1:1)
    expect(determineFitMode(500, 500, 100, 100)).toBe("cover");
  });

  it('should return "cover" when cropped fraction is less than 10%', () => {
    // Container slightly wider than video (small height cropping)
    // Container: 16:9, Video: 16:10
    expect(determineFitMode(1600, 900, 1600, 1000)).toBe("cover");

    // Container slightly taller than video (small width cropping)
    // Container: 9:16, Video: 10:16
    expect(determineFitMode(900, 1600, 1000, 1600)).toBe("cover");
  });

  it('should return "contain" when cropped fraction is greater than 10%', () => {
    // Container much wider than video (large height cropping)
    // Container: 21:9, Video: 16:9
    expect(determineFitMode(2100, 900, 1600, 900)).toBe("contain");

    // Container much taller than video (large width cropping)
    // Container: 9:21, Video: 9:16
    expect(determineFitMode(900, 2100, 900, 1600)).toBe("contain");
  });

  it("should handle the boundary case at exactly 10% cropping", () => {
    // Calculate dimensions that would result in exactly 10% cropping

    // Width-dominant case: 10% cropping on height
    // If we scale by width (Cw/Vw), the visible height is (Cw/Vw) * Vh
    // For 10% cropping: Ch / ((Cw/Vw) * Vh) = 0.9
    // Simplifying: Ch = 0.9 * Cw * Vh / Vw
    const Cw = 1000,
      Vw = 800,
      Vh = 600;
    const Ch = Math.round((0.9 * Cw * Vh) / Vw); // = 675

    // This should return "cover" as it's at the boundary
    expect(determineFitMode(Cw, Ch, Vw, Vh)).toBe("cover");

    // Slightly less than 10% cropping should return "contain"
    expect(determineFitMode(Cw, Ch - 1, Vw, Vh)).toBe("contain");
  });

  it("should handle extreme aspect ratios correctly", () => {
    // Very wide container, normal video
    expect(determineFitMode(3000, 300, 1280, 720)).toBe("contain");

    // Very tall container, normal video
    expect(determineFitMode(300, 3000, 1280, 720)).toBe("contain");

    // Normal container, very wide video
    expect(determineFitMode(1280, 720, 3000, 300)).toBe("contain");

    // Normal container, very tall video
    expect(determineFitMode(1280, 720, 300, 3000)).toBe("contain");
  });

  it("should handle width-dominant cropping correctly", () => {
    // Width is dominant (Cw/Vw > Ch/Vh)
    // Container: 2:1, Video: 16:9
    // Height will overflow and be cropped
    const croppedFraction = 1 - 300 / ((600 / 1600) * 900); // ≈ 0.33
    // Should return "contain" as cropping > 10%
    expect(determineFitMode(600, 300, 1600, 900)).toBe("contain");
  });

  it("should handle height-dominant cropping correctly", () => {
    // Height is dominant (Cw/Vw <= Ch/Vh)
    // Container: 1:2, Video: 9:16
    // Width will overflow and be cropped
    const croppedFraction = 1 - 300 / ((600 / 900) * 1600); // ≈ 0.33
    // Should return "contain" as cropping > 10%
    expect(determineFitMode(300, 600, 900, 1600)).toBe("contain");
  });
});
