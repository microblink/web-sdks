/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { afterEach, describe, expect, it, vi } from "vitest";

import { compileWasmFromResponse, createWasmInstantiator, downloadAndCompileWasm } from "./compileWasm";
import { ResourceDownloadError, type DownloadProgress } from "./downloadResourceBuffer";

/** Smallest valid WebAssembly binary: magic number and version 1, no sections. */
const emptyWasmModule = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);

const createWasmResponse = (contentType: string | undefined, body: Uint8Array<ArrayBuffer> = emptyWasmModule) => {
  const headers = new Headers();

  if (contentType !== undefined) {
    headers.set("Content-Type", contentType);
  }

  return new Response(body, { headers });
};

describe("compileWasmFromResponse", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("compiles while streaming when the response is served as application/wasm", async () => {
    const compileStreamingSpy = vi.spyOn(WebAssembly, "compileStreaming");
    const compileSpy = vi.spyOn(WebAssembly, "compile");

    const module = await compileWasmFromResponse(createWasmResponse("application/wasm"));

    expect(module).toBeInstanceOf(WebAssembly.Module);
    expect(compileStreamingSpy).toHaveBeenCalledOnce();
    expect(compileSpy).not.toHaveBeenCalled();
  });

  it("falls back to buffered compilation when the content type carries MIME parameters", async () => {
    const compileStreamingSpy = vi.spyOn(WebAssembly, "compileStreaming");

    const module = await compileWasmFromResponse(createWasmResponse("application/wasm; charset=binary"));

    expect(module).toBeInstanceOf(WebAssembly.Module);
    expect(compileStreamingSpy).not.toHaveBeenCalled();
  });

  it("falls back to buffered compilation when the content type is not application/wasm", async () => {
    const compileStreamingSpy = vi.spyOn(WebAssembly, "compileStreaming");
    const compileSpy = vi.spyOn(WebAssembly, "compile");

    const module = await compileWasmFromResponse(createWasmResponse("application/octet-stream"));

    expect(module).toBeInstanceOf(WebAssembly.Module);
    expect(compileStreamingSpy).not.toHaveBeenCalled();
    expect(compileSpy).toHaveBeenCalledOnce();
  });

  it("falls back to buffered compilation when the content type is missing", async () => {
    const compileStreamingSpy = vi.spyOn(WebAssembly, "compileStreaming");

    const module = await compileWasmFromResponse(createWasmResponse(undefined));

    expect(module).toBeInstanceOf(WebAssembly.Module);
    expect(compileStreamingSpy).not.toHaveBeenCalled();
  });

  it("falls back to buffered compilation when streaming compilation is unavailable", async () => {
    vi.stubGlobal("WebAssembly", {
      ...WebAssembly,
      compile: WebAssembly.compile,
      compileStreaming: undefined,
      Module: WebAssembly.Module,
    });

    const module = await compileWasmFromResponse(createWasmResponse("application/wasm"));

    expect(module).toBeInstanceOf(WebAssembly.Module);
  });

  it("refetches a readable response when streaming compilation fails", async () => {
    const streamingError = new WebAssembly.CompileError("streaming failed");
    vi.spyOn(WebAssembly, "compileStreaming").mockRejectedValue(streamingError);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const getFallbackResponse = vi.fn(() => Promise.resolve(createWasmResponse("application/wasm")));

    const module = await compileWasmFromResponse(createWasmResponse("application/wasm"), getFallbackResponse);

    expect(module).toBeInstanceOf(WebAssembly.Module);
    expect(getFallbackResponse).toHaveBeenCalledOnce();
  });

  it("does not retry a resource download failure", async () => {
    const downloadError = new ResourceDownloadError("Timed out downloading Wasm");
    vi.spyOn(WebAssembly, "compileStreaming").mockRejectedValue(downloadError);
    const getFallbackResponse = vi.fn(() => Promise.resolve(createWasmResponse("application/wasm")));

    await expect(compileWasmFromResponse(createWasmResponse("application/wasm"), getFallbackResponse)).rejects.toBe(
      downloadError,
    );
    expect(getFallbackResponse).not.toHaveBeenCalled();
  });

  it("keeps progress monotonic across a streaming fallback and finishes after compilation", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(createWasmResponse("application/wasm"))
      .mockResolvedValueOnce(createWasmResponse("application/wasm"));
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(WebAssembly, "compileStreaming").mockImplementation(async (response) => {
      await (await response).arrayBuffer();
      throw new WebAssembly.CompileError("streaming failed");
    });
    const progressCallback = vi.fn<(progress: DownloadProgress) => void>();

    const module = await downloadAndCompileWasm(
      {
        url: "https://example.com/module.wasm",
        fileType: "wasm",
        variant: "simd",
        progressCallback,
      },
      () => emptyWasmModule.byteLength,
    );

    expect(module).toBeInstanceOf(WebAssembly.Module);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const snapshots = progressCallback.mock.calls.map(([progress]) => progress);
    expect(snapshots.at(-1)).toEqual({
      loaded: emptyWasmModule.byteLength,
      contentLength: emptyWasmModule.byteLength,
      progress: 100,
      finished: true,
    });
    expect(snapshots.slice(0, -1).every((progress) => !progress.finished)).toBe(true);
    expect(snapshots.every((progress, index) => index === 0 || progress.loaded >= snapshots[index - 1]!.loaded)).toBe(
      true,
    );
  });

  it("surfaces a Wasm download failure", async () => {
    const downloadError = new TypeError("Failed to fetch");
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockRejectedValue(downloadError));

    await expect(
      downloadAndCompileWasm(
        {
          url: "https://example.com/module.wasm",
          fileType: "wasm",
          variant: "simd",
        },
        () => emptyWasmModule.byteLength,
      ),
    ).rejects.toBe(downloadError);
  });

  it("creates a synchronous Emscripten instantiation hook", async () => {
    const compiledWasm = await WebAssembly.compile(emptyWasmModule);
    const instantiateWasm = createWasmInstantiator(compiledWasm);
    const successCallback = vi.fn<(instance: WebAssembly.Instance, module?: WebAssembly.Module) => void>();

    const exports = instantiateWasm({}, successCallback);

    expect(successCallback).toHaveBeenCalledWith(expect.any(WebAssembly.Instance), compiledWasm);
    const [instance] = successCallback.mock.calls[0] ?? [];
    expect(exports).toBe(instance?.exports);
  });

  it("rejects when the binary is not a valid wasm module", async () => {
    const invalidBinary = new Uint8Array([1, 2, 3, 4]);

    await expect(compileWasmFromResponse(createWasmResponse("application/wasm", invalidBinary))).rejects.toThrow(
      WebAssembly.CompileError,
    );
  });
});
