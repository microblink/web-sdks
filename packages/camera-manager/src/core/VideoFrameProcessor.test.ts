/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { describe, expect, it, vi } from "vitest";

import { nativeCaptureHooks, type CameraCaptureHooks } from "./CameraCaptureHooks";
import { VideoFrameProcessor } from "./VideoFrameProcessor";

function sourceCanvas(): HTMLCanvasElement {
  const source = document.createElement("canvas");
  source.width = 320;
  source.height = 200;

  const context = source.getContext("2d");

  if (!context) {
    throw new Error("2D context unavailable");
  }

  const pixels = context.createImageData(source.width, source.height);

  for (let y = 0; y < source.height; y++) {
    for (let x = 0; x < source.width; x++) {
      pixels.data.set([(12 + x) % 256, (34 + y) % 256, (56 + x + y) % 256, 255], (y * source.width + x) * 4);
    }
  }

  context.putImageData(pixels, 0, 0);

  return source;
}

describe.each(["2d", "webgl2"] as const)("%s frame extraction", (canvasRenderingMode) => {
  it.each([
    { name: "full frame", area: undefined },
    { name: "explicit full frame", area: { x: 0, y: 0, width: 320, height: 200 } },
    { name: "both offsets", area: { x: 40, y: 30, width: 160, height: 100 } },
    { name: "horizontal offset", area: { x: 40, y: 0, width: 240, height: 200 } },
    { name: "vertical offset", area: { x: 0, y: 30, width: 320, height: 140 } },
    { name: "zero offsets", area: { x: 0, y: 0, width: 160, height: 100 } },
  ])("returns the exact source pixels for $name", ({ area }) => {
    const processor = new VideoFrameProcessor({ canvasRenderingMode, fallbackWebGlTo2d: false });
    const source = sourceCanvas();
    const { x, y, width, height } = area ?? { x: 0, y: 0, width: source.width, height: source.height };
    const expected = source.getContext("2d")!.getImageData(x, y, width, height);

    try {
      const frame = processor.getImageData(source, area);

      expect([frame.width, frame.height]).toEqual([width, height]);
      expect(frame.data).toEqual(expected.data);
    } finally {
      processor.dispose();
    }
  });

  it("extracts frames without instrumentation", () => {
    const processor = new VideoFrameProcessor({ canvasRenderingMode, fallbackWebGlTo2d: false });

    const frame = processor.getImageData(sourceCanvas());

    expect(Array.from(frame.data.slice(0, 4))).toEqual([12, 34, 56, 255]);

    processor.dispose();
  });

  it("uses supplied browser operations to extract pixels", () => {
    const processor = new VideoFrameProcessor({ canvasRenderingMode, fallbackWebGlTo2d: false });
    const source = sourceCanvas();
    const extractFrame = vi.fn<CameraCaptureHooks["extractFrame"]>((context, input, extract) => {
      expect(input).toBe(source);

      if (context instanceof CanvasRenderingContext2D) {
        const drawImage = context.drawImage.bind(context);
        const getImageData = context.getImageData.bind(context);

        vi.spyOn(context, "drawImage").mockImplementation(() => {
          throw new Error("replaced drawImage");
        });
        vi.spyOn(context, "getImageData").mockImplementation(() => {
          throw new Error("replaced getImageData");
        });

        return extract({ drawImage, getImageData });
      }

      const texImage2D = context.texImage2D.bind(context);
      const readPixels = context.readPixels.bind(context);

      vi.spyOn(context, "texImage2D").mockImplementation(() => {
        throw new Error("replaced texImage2D");
      });
      vi.spyOn(context, "readPixels").mockImplementation(() => {
        throw new Error("replaced readPixels");
      });

      return extract({ texImage2D, readPixels });
    });

    processor.setCaptureHooks({ ...nativeCaptureHooks, extractFrame });

    const frame = processor.getImageData(source);

    expect(Array.from(frame.data.slice(0, 4))).toEqual([12, 34, 56, 255]);
    expect(extractFrame).toHaveBeenCalledOnce();

    processor.dispose();
  });
});
