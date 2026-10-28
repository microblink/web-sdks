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
});
