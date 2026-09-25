/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { describe, expect, test } from "vitest";

import { boxToPercent, faceAnchorPercent, pointToPercent, renderedRect } from "./videoContainProjection";

describe("videoContainProjection", () => {
  test("letterboxes a landscape frame", () => {
    expect(renderedRect({ width: 100, height: 100 }, 200, 100)).toEqual({
      width: 100,
      height: 50,
      offsetX: 0,
      offsetY: 25,
    });
  });

  test("mirrors normalized points", () => {
    const rect = { width: 100, height: 100, offsetX: 0, offsetY: 0 };

    expect(pointToPercent(0.2, 0.4, { width: 100, height: 100 }, rect, true)).toEqual({ left: "80%", top: "40%" });
  });

  test("mirrors bounding boxes around their right edge", () => {
    const rect = { width: 100, height: 100, offsetX: 0, offsetY: 0 };

    const projected = boxToPercent(
      { x: 0.1, y: 0.2, width: 0.3, height: 0.4 },
      { width: 100, height: 100 },
      rect,
      true,
    );

    expect(Number.parseFloat(projected.left)).toBeCloseTo(60);
    expect(projected.top).toBe("20%");
    expect(projected.width).toBe("30%");
    expect(projected.height).toBe("40%");
  });

  test("computes face anchor position and scale from face bounds", () => {
    const anchor = faceAnchorPercent(
      { x: 0.25, y: 0.25, width: 0.5, height: 0.5 },
      { width: 100, height: 100 },
      100,
      100,
      false,
    );

    expect(anchor).toEqual({
      left: "50%",
      top: "50%",
      scale: 1 + (0.5 / 0.45 - 1) * 0.15,
      renderedFaceWidth: 50,
    });
  });

  test("computes rendered face width inside a pillarboxed video", () => {
    const anchor = faceAnchorPercent(
      { x: 0.25, y: 0.25, width: 0.5, height: 0.5 },
      { width: 100, height: 100 },
      100,
      200,
      false,
    );

    expect(anchor).toMatchObject({
      top: "50%",
      renderedFaceWidth: 25,
    });
  });
});
