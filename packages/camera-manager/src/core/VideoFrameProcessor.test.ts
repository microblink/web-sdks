/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { describe, expect, it, vi } from "vitest";

import { nativeCaptureHooks, type CameraCaptureHooks } from "./CameraCaptureHooks";
import { VideoFrameProcessor } from "./VideoFrameProcessor";

function sourceCanvas(): HTMLCanvasElement {
  const source = document.createElement("canvas");
  source.width = 2;
  source.height = 2;

  const context = source.getContext("2d");

  if (!context) {
    throw new Error("2D context unavailable");
  }

  context.fillStyle = "rgb(12, 34, 56)";
  context.fillRect(0, 0, 2, 2);

  return source;
}

describe.each(["2d", "webgl2"] as const)("%s frame extraction", (canvasRenderingMode) => {
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

  it("crops the requested source rectangle", () => {
    const processor = new VideoFrameProcessor({ canvasRenderingMode, fallbackWebGlTo2d: false });
    const source = patternedCanvas(320, 200);
    const area = { x: 40, y: 30, width: 160, height: 100 };

    const frame = processor.getImageData(source, area);

    expect(frame.width).toBe(area.width);
    expect(frame.height).toBe(area.height);
    expect(pixel(frame, 0, 0)).toEqual(sourcePixel(area.x, area.y));
    expect(pixel(frame, area.width - 1, 0)).toEqual(sourcePixel(area.x + area.width - 1, area.y));
    expect(pixel(frame, 0, area.height - 1)).toEqual(sourcePixel(area.x, area.y + area.height - 1));
    expect(pixel(frame, area.width - 1, area.height - 1)).toEqual(
      sourcePixel(area.x + area.width - 1, area.y + area.height - 1),
    );

    processor.dispose();
  });
});

/**
 * Builds a canvas whose color at `(x, y)` is `sourcePixel(x, y)`.
 *
 * @param width - Canvas width.
 * @param height - Canvas height.
 * @returns The painted canvas.
 */
function patternedCanvas(width: number, height: number): HTMLCanvasElement {
  const source = document.createElement("canvas");
  source.width = width;
  source.height = height;

  const context = source.getContext("2d");

  if (!context) {
    throw new Error("2D context unavailable");
  }

  const image = context.createImageData(width, height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const [red, green, blue, alpha] = sourcePixel(x, y);
      const offset = (y * width + x) * 4;
      image.data[offset] = red;
      image.data[offset + 1] = green;
      image.data[offset + 2] = blue;
      image.data[offset + 3] = alpha;
    }
  }

  context.putImageData(image, 0, 0);

  return source;
}

/**
 * Color stored at a source pixel. Each coordinate maps to a unique RGB triple inside 320×200.
 *
 * @param x - Horizontal source coordinate.
 * @param y - Vertical source coordinate.
 * @returns RGBA bytes.
 */
function sourcePixel(x: number, y: number): [number, number, number, number] {
  return [x & 255, y & 255, (x + y) & 255, 255];
}

/**
 * Reads one RGBA pixel from extracted image data.
 *
 * @param image - Extracted frame.
 * @param x - Horizontal coordinate in the frame.
 * @param y - Vertical coordinate in the frame.
 * @returns RGBA bytes.
 */
function pixel(image: ImageData, x: number, y: number): number[] {
  const offset = (y * image.width + x) * 4;

  return [
    image.data[offset] ?? 0,
    image.data[offset + 1] ?? 0,
    image.data[offset + 2] ?? 0,
    image.data[offset + 3] ?? 0,
  ];
}
