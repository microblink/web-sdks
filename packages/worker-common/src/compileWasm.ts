/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { EmscriptenModule } from "@microblink/wasm-common";

import {
  fetchResourceWithProgress,
  ResourceDownloadError,
  type DownloadProgress,
  type DownloadResourceBufferOptions,
} from "./downloadResourceBuffer";
import type { GetWasmFileSizeParams } from "./getWasmFileSize";

const WASM_MIME_TYPE = "application/wasm";

/**
 * Compiles a WebAssembly module from a response, starting compilation while the body is still downloading whenever the
 * browser allows it.
 *
 * `WebAssembly.compileStreaming` rejects any response that is not served as `application/wasm`. Resources hosted on a
 * misconfigured server are buffered and compiled with `WebAssembly.compile` instead. If streaming fails after it starts
 * consuming the response, `getFallbackResponse` provides a fresh response for buffered compilation.
 *
 * @param response - Response for the `.wasm` file. Its body is consumed by this call.
 * @param getFallbackResponse - Fetches a fresh response when streaming compilation fails after consuming `response`.
 * @returns The compiled module, ready to be instantiated against the caller's imports.
 */
export async function compileWasmFromResponse(
  response: Response,
  getFallbackResponse?: () => Promise<Response>,
): Promise<WebAssembly.Module> {
  if (!canCompileStreaming(response)) {
    return WebAssembly.compile(await response.arrayBuffer());
  }

  try {
    return await WebAssembly.compileStreaming(response);
  } catch (error) {
    if (error instanceof ResourceDownloadError) {
      throw error;
    }

    if (!getFallbackResponse) {
      throw error;
    }

    console.warn("Streaming compilation failed, retrying with buffered compilation", error);
    const fallbackResponse = await getFallbackResponse();
    return WebAssembly.compile(await fallbackResponse.arrayBuffer());
  }
}

/**
 * Downloads and compiles a Wasm resource while keeping retry progress monotonic.
 *
 * The completion event is delayed until compilation succeeds. This prevents a failed streaming attempt from reporting
 * completion before its fallback response has been downloaded and compiled.
 */
export async function downloadAndCompileWasm(
  options: DownloadResourceBufferOptions,
  getExpectedSize: (params: GetWasmFileSizeParams) => number,
): Promise<WebAssembly.Module> {
  let lastProgress: DownloadProgress | undefined;
  const progressCallback = options.progressCallback
    ? (progress: DownloadProgress) => {
        lastProgress = {
          loaded: Math.max(lastProgress?.loaded ?? 0, progress.loaded),
          contentLength: progress.contentLength,
          progress: Math.max(lastProgress?.progress ?? 0, progress.progress),
          finished: false,
        };
        options.progressCallback?.(lastProgress);
      }
    : undefined;

  const fetchWasm = () => fetchResourceWithProgress({ ...options, progressCallback }, getExpectedSize);
  const compiledWasm = await fetchWasm().then((response) => compileWasmFromResponse(response, fetchWasm));

  if (lastProgress && options.progressCallback) {
    options.progressCallback({
      loaded: lastProgress.loaded,
      contentLength: lastProgress.contentLength,
      progress: 100,
      finished: true,
    });
  }

  return compiledWasm;
}

/** Creates the synchronous Emscripten instantiation hook required by pthread-enabled modules. */
export function createWasmInstantiator(compiledWasm: WebAssembly.Module): EmscriptenModule["instantiateWasm"] {
  return (imports, successCallback) => {
    const instance = new WebAssembly.Instance(compiledWasm, imports);
    successCallback(instance, compiledWasm);

    return instance.exports;
  };
}

function canCompileStreaming(response: Response): boolean {
  if (typeof WebAssembly.compileStreaming !== "function") {
    return false;
  }

  // Runtimes disagree on how leniently the type is matched (MIME parameters, letter case), so only the canonical
  // value streams; anything else takes the buffered path rather than risking a rejected response.
  return response.headers.get("Content-Type") === WASM_MIME_TYPE;
}
