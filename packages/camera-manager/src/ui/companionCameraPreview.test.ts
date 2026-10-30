/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { afterEach, describe, expect, it } from "vitest";

import { bindCompanionCameraPreview, needsCompanionCameraPreview } from "./companionCameraPreview";

const ipadSafari2701 =
  "Mozilla/5.0 (iPad; CPU OS 27_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0.1 Mobile/15E148 Safari/604.1";
const ipadDesktopSafari27 =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0.1 Safari/605.1.15";
const iphoneSafari26 =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1";
const iphoneChrome27 =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 27_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/140.0.0.0 Mobile/15E148 Safari/604.1";
const chromeMac =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const safari18 =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15";

describe("needsCompanionCameraPreview", () => {
  it.each([
    ["iPadOS 27.0.1 Safari", ipadSafari2701],
    ["desktop-mode Safari 27", ipadDesktopSafari27],
    ["iOS 27 Chrome", iphoneChrome27],
  ])("enables the companion preview for %s", (_name, userAgent) => {
    expect(needsCompanionCameraPreview(userAgent)).toBe(true);
  });

  it.each([
    ["iOS 26 Safari", iphoneSafari26],
    ["desktop Chrome", chromeMac],
    ["Safari 18", safari18],
  ])("leaves %s on the single preview element", (_name, userAgent) => {
    expect(needsCompanionCameraPreview(userAgent)).toBe(false);
  });
});

describe("bindCompanionCameraPreview", () => {
  const appended: HTMLElement[] = [];

  afterEach(() => {
    for (const element of appended.splice(0)) {
      element.remove();
    }
  });

  it("copies the capture stream and reveals the preview once it is playing", () => {
    const capture = document.createElement("video");
    const preview = document.createElement("video");
    document.body.append(capture, preview);
    appended.push(capture, preview);

    const release = bindCompanionCameraPreview(capture, preview);
    const stream = captureStream();

    capture.srcObject = stream;

    expect(preview.srcObject).toBe(stream);
    expect(preview.muted).toBe(true);
    expect(preview.playsInline).toBe(true);
    expect(preview.style.opacity).toBe("0");

    preview.dispatchEvent(new Event("playing"));

    expect(preview.style.opacity).toBe("1");

    capture.srcObject = null;

    expect(preview.srcObject).toBeNull();
    expect(preview.style.opacity).toBe("0");

    release();
    capture.srcObject = stream;

    expect(preview.srcObject).toBeNull();
  });
});

/**
 * Builds a canvas stream. No camera permission is required.
 *
 * @returns A stream with one video track.
 */
function captureStream(): MediaStream {
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("2D context unavailable");
  }

  context.fillStyle = "rgb(10, 20, 30)";
  context.fillRect(0, 0, 16, 16);

  return canvas.captureStream();
}
