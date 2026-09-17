/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { ResourceFileType, WasmBuildType, WasmVariant } from "@microblink/wasm-common";

import type { GetWasmFileSizeParams } from "./getWasmFileSize";

/** Progress reported during a resource download. */
export type DownloadProgress = {
  /**
   * Number of bytes downloaded for the resources represented by this snapshot.
   *
   * This value can reset or decrease when a resource is retried.
   */
  loaded: number;

  /** Expected total number of bytes. This value can change when authoritative response metadata becomes available. */
  contentLength: number;

  /**
   * Progress percentage reported by the producer.
   *
   * Consumers should prefer this value over deriving a percentage from `loaded` and `contentLength`, because aggregate
   * producers can keep it monotonic while expected totals change.
   */
  progress: number;

  /** Whether every resource represented by this snapshot has completed its required post-download processing. */
  finished: boolean;
};

/**
 * Options for downloading a resource buffer (WASM or data file). `buildType` is optional and used only by packages that
 * have full/lightweight variants (e.g. BlinkID).
 */
export type DownloadResourceBufferOptions = {
  url: string;
  fileType: ResourceFileType;
  variant: WasmVariant;
  buildType?: WasmBuildType;
  progressCallback?: (progress: DownloadProgress) => void;
  /** Maximum time without receiving response headers or body data. */
  timeoutMs?: number;
  /** Human-readable resource name included in download errors. */
  resourceDescription?: string;
};

export class ResourceDownloadError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "ResourceDownloadError";
  }
}

type FetchWithInactivityTimeoutOptions = {
  url: string;
  resourceDescription: string;
  timeoutMs?: number;
  fetchFn?: typeof fetch;
};

/**
 * Fetches a resource and aborts only when no response headers or body data arrive during the configured interval.
 *
 * The timeout resets after every body chunk, so it does not impose a maximum duration on slow downloads.
 */
export async function fetchWithInactivityTimeout({
  url,
  resourceDescription,
  timeoutMs,
  fetchFn = fetch,
}: FetchWithInactivityTimeoutOptions): Promise<Response> {
  if (timeoutMs === undefined) {
    try {
      return await fetchFn(url);
    } catch (error) {
      throw createResourceDownloadError(resourceDescription, error);
    }
  }

  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
    throw new Error(`Invalid resource download timeout: ${timeoutMs}`);
  }

  const abortController = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let timeoutError: ResourceDownloadError | undefined;

  const clearInactivityTimeout = () => {
    if (timeout !== undefined) {
      clearTimeout(timeout);
      timeout = undefined;
    }
  };
  const resetInactivityTimeout = () => {
    clearInactivityTimeout();
    timeout = setTimeout(() => {
      timeoutError = new ResourceDownloadError(
        `Timed out downloading ${resourceDescription} after ${timeoutMs} ms without receiving data`,
      );
      abortController.abort(timeoutError);
    }, timeoutMs);
  };

  resetInactivityTimeout();

  let response: Response;
  try {
    response = await fetchFn(url, {
      signal: abortController.signal,
    });
  } catch (error) {
    clearInactivityTimeout();
    throw timeoutError ?? createResourceDownloadError(resourceDescription, error);
  }

  if (!response.body) {
    clearInactivityTimeout();
    return response;
  }

  resetInactivityTimeout();
  const reader = response.body.getReader();
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          clearInactivityTimeout();
          controller.close();
          return;
        }

        resetInactivityTimeout();
        controller.enqueue(value);
      } catch (error) {
        clearInactivityTimeout();
        controller.error(timeoutError ?? createResourceDownloadError(resourceDescription, error));
      }
    },
    async cancel(reason) {
      clearInactivityTimeout();
      try {
        await reader.cancel(reason);
      } finally {
        abortController.abort(reason);
      }
    },
  });

  return new Response(body, response);
}

function createResourceDownloadError(resourceDescription: string, cause: unknown): ResourceDownloadError {
  const causeMessage = cause instanceof Error && cause.message ? `: ${cause.message}` : "";
  return new ResourceDownloadError(`Failed to download ${resourceDescription}${causeMessage}`, cause);
}

/**
 * Fetches a resource and reports download progress as its body is consumed. The returned response keeps the original
 * status and headers so it remains usable by streaming consumers.
 *
 * @param options - Download options (url, fileType, variant, optional buildType, optional progressCallback).
 * @param getExpectedSize - Function that returns the expected file size in bytes for the given params (e.g. from a size
 *   manifest). Used when Content-Length header is absent.
 * @returns The response whose body reports progress while it is consumed.
 */
export async function fetchResourceWithProgress(
  options: DownloadResourceBufferOptions,
  getExpectedSize: (params: GetWasmFileSizeParams) => number,
): Promise<Response> {
  const { url, fileType, variant, buildType, progressCallback, timeoutMs } = options;
  const resourceDescription = options.resourceDescription;

  const response =
    resourceDescription === undefined && timeoutMs === undefined
      ? await fetch(url)
      : await fetchWithInactivityTimeout({
          url,
          resourceDescription: resourceDescription ?? `${fileType} resource`,
          timeoutMs,
        });

  if (resourceDescription !== undefined && !response.ok) {
    await response.body?.cancel();
    throw new ResourceDownloadError(
      `Failed to download ${resourceDescription}: ${response.status} ${response.statusText}`,
    );
  }

  if (!progressCallback) {
    return response;
  }

  const contentLengthHeader = response.headers.get("Content-Length");

  const contentLength = contentLengthHeader
    ? parseInt(contentLengthHeader, 10)
    : getExpectedSize({ fileType, variant, buildType });

  if (isNaN(contentLength) || contentLength < 0) {
    throw new Error(`Invalid content length for ${fileType} file: ${contentLength}`);
  }

  let loaded = 0;

  const transformStream = new TransformStream({
    transform(chunk: Uint8Array, controller) {
      loaded += chunk.length;

      const progress = Math.min(Math.round((loaded / contentLength) * 100), 100);

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

  return new Response(response.body?.pipeThrough(transformStream), response);
}

/**
 * Downloads a resource buffer with optional progress tracking. When Content-Length is missing and progressCallback is
 * set, uses getExpectedSize to resolve the expected size (e.g. from a size manifest).
 *
 * @param options - Download options (url, fileType, variant, optional buildType, optional progressCallback).
 * @param getExpectedSize - Function that returns the expected file size in bytes for the given params (e.g. from a size
 *   manifest). Used when Content-Length header is absent.
 * @returns The downloaded array buffer.
 */
export async function downloadResourceBuffer(
  options: DownloadResourceBufferOptions,
  getExpectedSize: (params: GetWasmFileSizeParams) => number,
): Promise<ArrayBuffer> {
  const response = await fetchResourceWithProgress(options, getExpectedSize);

  return response.arrayBuffer();
}
