/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  ResourceFileType,
  WasmBuildType,
  WasmVariant,
} from "@microblink/wasm-common";
import type { GetWasmFileSizeParams } from "./getWasmFileSize";

/**
 * Progress reported during a resource download.
 */
export type DownloadProgress = {
  loaded: number;
  contentLength: number;
  progress: number;
  finished: boolean;
};

/**
 * Options for downloading a resource buffer (WASM or data file).
 * `buildType` is optional and used only by packages that have full/lightweight variants (e.g. BlinkID).
 */
export type DownloadResourceBufferOptions = {
  url: string;
  fileType: ResourceFileType;
  variant: WasmVariant;
  buildType?: WasmBuildType;
  progressCallback?: (progress: DownloadProgress) => void;
};

/**
 * Downloads a resource buffer with optional progress tracking.
 * When Content-Length is missing and progressCallback is set, uses getExpectedSize to resolve the expected size (e.g. from a size manifest).
 *
 * @param options - Download options (url, fileType, variant, optional buildType, optional progressCallback).
 * @param getExpectedSize - Function that returns the expected file size in bytes for the given params (e.g. from a size manifest). Used when Content-Length header is absent.
 * @returns The downloaded array buffer.
 */
export async function downloadResourceBuffer(
  options: DownloadResourceBufferOptions,
  getExpectedSize: (params: GetWasmFileSizeParams) => number,
): Promise<ArrayBuffer> {
  const { url, fileType, variant, buildType, progressCallback } = options;

  const response = await fetch(url);

  if (!progressCallback) {
    return response.arrayBuffer();
  }

  const contentLengthHeader = response.headers.get("Content-Length");

  const contentLength = contentLengthHeader
    ? parseInt(contentLengthHeader, 10)
    : getExpectedSize({ fileType, variant, buildType });

  if (isNaN(contentLength) || contentLength <= 0) {
    throw new Error(
      `Invalid content length for ${fileType} file: ${contentLength}`,
    );
  }

  let loaded = 0;

  const transformStream = new TransformStream({
    transform(chunk: Uint8Array, controller) {
      loaded += chunk.length;

      const progress = Math.min(
        Math.round((loaded / contentLength) * 100),
        100,
      );

      progressCallback({
        loaded,
        contentLength,
        progress,
        finished: false,
      });

      controller.enqueue(chunk);
    },
    flush() {
      progressCallback({
        loaded,
        contentLength,
        progress: 100,
        finished: true,
      });
    },
  });

  const transformedResponse = new Response(
    response.body?.pipeThrough(transformStream),
    response,
  );

  return transformedResponse.arrayBuffer();
}
