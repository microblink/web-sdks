/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

type CreateFakeImageDataOptions = {
  width?: number;
  height?: number;
};

/**
 * Creates an ImageData-like object for tests.
 */
export const createFakeImageData = (
  options: CreateFakeImageDataOptions = {},
): ImageData => {
  const width = options.width ?? 1;
  const height = options.height ?? 1;

  return {
    data: new Uint8ClampedArray(width * height * 4),
    width,
    height,
    colorSpace: "srgb",
  } as ImageData;
};
