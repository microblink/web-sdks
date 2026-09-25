/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { describe, expect, it } from "vitest";

import { resolveFaceAnalysisSessionSettings } from "./settings.js";

describe("resolveFaceAnalysisSessionSettings", () => {
  it("accepts maximum input edges as a pair", () => {
    expect(
      resolveFaceAnalysisSessionSettings({
        maximumInputLongEdge: 1920,
        maximumInputShortEdge: 1080,
      }),
    ).toMatchObject({ maximumInputLongEdge: 1920, maximumInputShortEdge: 1080 });
  });

  it("merges overrides onto base settings and ignores undefined values", () => {
    const base = resolveFaceAnalysisSessionSettings({
      livenessFramesCount: 4,
      lightingThresholds: { tooDarkThreshold: 0.5 },
    });

    expect(
      resolveFaceAnalysisSessionSettings(
        { lightingThresholds: { tooDarkThreshold: undefined, tooBrightThreshold: 0.7 } },
        base,
      ),
    ).toMatchObject({ livenessFramesCount: 4, lightingThresholds: { tooDarkThreshold: 0.5, tooBrightThreshold: 0.7 } });
  });

  it.each([
    { maximumInputLongEdge: 1920 },
    { maximumInputShortEdge: 1080 },
    { maximumInputLongEdge: 0, maximumInputShortEdge: 1080 },
    { maximumInputLongEdge: 1920.5, maximumInputShortEdge: 1080 },
    { maximumInputLongEdge: 65_536, maximumInputShortEdge: 1080 },
    { maximumInputLongEdge: 1080, maximumInputShortEdge: 1920 },
  ])("rejects invalid maximum input edges %#", (settings) => {
    expect(() => resolveFaceAnalysisSessionSettings(settings)).toThrow();
  });

  it.each([0, 1.5, 13])("rejects invalid liveness frames count %s", (livenessFramesCount) => {
    expect(() => resolveFaceAnalysisSessionSettings({ livenessFramesCount })).toThrow();
  });
});
