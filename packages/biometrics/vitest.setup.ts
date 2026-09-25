/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

class MockImageData implements ImageData {
  readonly data: Uint8ClampedArray;
  readonly width: number;
  readonly height: number;
  readonly colorSpace: "srgb" | "display-p3";

  constructor(widthOrData: number | Uint8ClampedArray, height?: number) {
    if (typeof widthOrData === "number") {
      this.width = widthOrData;
      this.height = height ?? 1;
      this.data = new Uint8ClampedArray(this.width * this.height * 4);
    } else {
      this.data = widthOrData;
      this.width = height ?? 1;
      // oxlint-disable-next-line prefer-rest-params
      this.height = (arguments[2] as number) ?? 1;
    }
    this.colorSpace = "srgb";
  }
}

if (!globalThis.ImageData) {
  globalThis.ImageData = MockImageData;
}
