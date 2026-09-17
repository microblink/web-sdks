/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  downloadResourceBuffer,
  fetchResourceWithProgress,
  fetchWithInactivityTimeout,
  type DownloadProgress,
} from "./downloadResourceBuffer";

describe("downloadResourceBuffer", () => {
  const mockUrl = "https://example.com/test.wasm";
  const mockChunks = [
    new Uint8Array([1, 2, 3, 4, 5]),
    new Uint8Array([6, 7, 8, 9, 10]),
    new Uint8Array([11, 12, 13, 14, 15]),
  ];

  const createMockResponse = (options: { contentLength?: number; chunks?: Uint8Array[] }) => {
    const { contentLength, chunks = mockChunks } = options;

    const headers = new Headers();

    if (contentLength !== undefined) {
      headers.set("Content-Length", contentLength.toString());
    }

    const stream = new ReadableStream({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(chunk);
        }
        controller.close();
      },
    });

    return new Response(stream, { headers });
  };

  const getExpectedSize = vi.fn((params: { fileType: string }) => (params.fileType === "wasm" ? 1000 : 2000));
  const fetchMock = vi.fn(() => Promise.resolve(createMockResponse({ contentLength: 15 })));

  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockImplementation(() => Promise.resolve(createMockResponse({ contentLength: 15 })));
    vi.stubGlobal("fetch", fetchMock);
  });

  it("downloads without progress callback", async () => {
    const buffer = await downloadResourceBuffer(
      {
        url: mockUrl,
        fileType: "wasm",
        variant: "simd",
      },
      getExpectedSize,
    );
    expect(fetchMock).toHaveBeenCalledWith(mockUrl);
    expect(buffer).toBeInstanceOf(ArrayBuffer);
    expect(getExpectedSize).not.toHaveBeenCalled();
  });

  it("tracks progress with Content-Length header", async () => {
    const progressCallback = vi.fn() as (progress: DownloadProgress) => void;
    const totalSize = 15;

    await downloadResourceBuffer(
      {
        url: mockUrl,
        fileType: "wasm",
        variant: "simd",
        progressCallback,
      },
      getExpectedSize,
    );

    expect(progressCallback).toHaveBeenCalledTimes(4);
    expect(progressCallback).toHaveBeenNthCalledWith(1, {
      loaded: 5,
      contentLength: totalSize,
      progress: 33,
      finished: false,
    });
    expect(progressCallback).toHaveBeenNthCalledWith(4, {
      loaded: 15,
      contentLength: totalSize,
      progress: 100,
      finished: true,
    });
    expect(getExpectedSize).not.toHaveBeenCalled();
  });

  it("uses getExpectedSize when Content-Length is missing", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(createMockResponse({ contentLength: undefined })));

    const progressCallback = vi.fn() as (progress: DownloadProgress) => void;

    await downloadResourceBuffer(
      {
        url: mockUrl,
        fileType: "wasm",
        variant: "simd",
        progressCallback,
      },
      getExpectedSize,
    );

    expect(getExpectedSize).toHaveBeenCalledWith({
      fileType: "wasm",
      variant: "simd",
      buildType: undefined,
    });
    expect(progressCallback).toHaveBeenNthCalledWith(1, {
      loaded: 5,
      contentLength: 1000,
      progress: 1,
      finished: false,
    });
  });

  it("passes buildType to getExpectedSize when provided", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(createMockResponse({ contentLength: undefined })));

    const progressCallback = vi.fn() as (progress: DownloadProgress) => void;

    await downloadResourceBuffer(
      {
        url: mockUrl,
        fileType: "data",
        variant: "simd",
        buildType: "lightweight",
        progressCallback,
      },
      getExpectedSize,
    );

    expect(getExpectedSize).toHaveBeenCalledWith({
      fileType: "data",
      variant: "simd",
      buildType: "lightweight",
    });
  });

  it("throws error for invalid content length", async () => {
    fetchMock.mockImplementation(() => {
      const response = createMockResponse({ contentLength: undefined });
      response.headers.set("Content-Length", "-1");

      return Promise.resolve(response);
    });

    const progressCallback = vi.fn() as (progress: DownloadProgress) => void;

    await expect(
      downloadResourceBuffer(
        {
          url: mockUrl,
          fileType: "wasm",
          variant: "simd",
          progressCallback,
        },
        getExpectedSize,
      ),
    ).rejects.toThrow("Invalid content length");
  });

  it("handles a zero-length resource", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(createMockResponse({ contentLength: 0, chunks: [] })));

    const progressCallback = vi.fn() as (progress: DownloadProgress) => void;

    const buffer = await downloadResourceBuffer(
      {
        url: mockUrl,
        fileType: "data",
        variant: "simd",
        progressCallback,
      },
      getExpectedSize,
    );

    expect(buffer.byteLength).toBe(0);
    expect(progressCallback).toHaveBeenCalledOnce();
    expect(progressCallback).toHaveBeenCalledWith({
      loaded: 0,
      contentLength: 0,
      progress: 100,
      finished: true,
    });
  });

  it("handles empty response", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(createMockResponse({ contentLength: undefined, chunks: [] })));

    const progressCallback = vi.fn() as (progress: DownloadProgress) => void;

    await downloadResourceBuffer(
      {
        url: mockUrl,
        fileType: "wasm",
        variant: "simd",
        progressCallback,
      },
      getExpectedSize,
    );

    expect(progressCallback).toHaveBeenCalledTimes(1);
    expect(progressCallback).toHaveBeenCalledWith({
      loaded: 0,
      contentLength: 1000,
      progress: 100,
      finished: true,
    });
  });

  it("handles network errors", async () => {
    fetchMock.mockImplementation(() => Promise.reject(new Error("Network error")));

    await expect(
      downloadResourceBuffer(
        {
          url: mockUrl,
          fileType: "wasm",
          variant: "simd",
        },
        getExpectedSize,
      ),
    ).rejects.toThrow("Network error");
  });

  it("adds the configured resource description to network errors", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(
      downloadResourceBuffer(
        {
          url: mockUrl,
          fileType: "wasm",
          variant: "simd",
          resourceDescription: "BlinkID Wasm resource",
        },
        getExpectedSize,
      ),
    ).rejects.toThrow("Failed to download BlinkID Wasm resource: Failed to fetch");
  });

  it("times out when no response data arrives", async () => {
    vi.useFakeTimers();

    try {
      const fetchFn = vi.fn<typeof fetch>(
        (_input, init) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => reject(init.signal?.reason), { once: true });
          }),
      );
      const request = fetchWithInactivityTimeout({
        url: mockUrl,
        resourceDescription: "test resource",
        timeoutMs: 100,
        fetchFn,
      });
      const rejection = expect(request).rejects.toThrow(
        "Timed out downloading test resource after 100 ms without receiving data",
      );

      await vi.advanceTimersByTimeAsync(100);
      await rejection;
    } finally {
      vi.useRealTimers();
    }
  });

  it("allows a slow download while data continues to arrive", async () => {
    vi.useFakeTimers();

    try {
      let streamController: ReadableStreamDefaultController<Uint8Array> | undefined;
      const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
        new Response(
          new ReadableStream<Uint8Array>({
            start(controller) {
              streamController = controller;
            },
          }),
        ),
      );
      const response = await fetchWithInactivityTimeout({
        url: mockUrl,
        resourceDescription: "test resource",
        timeoutMs: 100,
        fetchFn,
      });
      const bufferPromise = response.arrayBuffer();

      for (const byte of [1, 2, 3]) {
        await vi.advanceTimersByTimeAsync(90);
        streamController?.enqueue(new Uint8Array([byte]));
        await vi.advanceTimersByTimeAsync(0);
      }
      streamController?.close();

      await expect(bufferPromise).resolves.toEqual(new Uint8Array([1, 2, 3]).buffer);
    } finally {
      vi.useRealTimers();
    }
  });

  describe("fetchResourceWithProgress", () => {
    it("returns the original response when no progress callback is set", async () => {
      const originalResponse = createMockResponse({ contentLength: 15 });
      fetchMock.mockImplementation(() => Promise.resolve(originalResponse));

      const response = await fetchResourceWithProgress(
        {
          url: mockUrl,
          fileType: "wasm",
          variant: "simd",
        },
        getExpectedSize,
      );

      expect(response).toBe(originalResponse);
    });

    it("keeps status and headers so the response stays usable by streaming consumers", async () => {
      const headers = new Headers({ "Content-Type": "application/wasm", "Content-Length": "15" });
      fetchMock.mockImplementation(() => Promise.resolve(new Response(new Uint8Array(15), { status: 200, headers })));

      const response = await fetchResourceWithProgress(
        {
          url: mockUrl,
          fileType: "wasm",
          variant: "simd",
          progressCallback: vi.fn(),
        },
        getExpectedSize,
      );

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("application/wasm");
    });

    it("reports progress only while the body is consumed", async () => {
      const progressCallback = vi.fn() as (progress: DownloadProgress) => void;

      const response = await fetchResourceWithProgress(
        {
          url: mockUrl,
          fileType: "wasm",
          variant: "simd",
          progressCallback,
        },
        getExpectedSize,
      );

      expect(progressCallback).not.toHaveBeenCalled();

      await response.arrayBuffer();

      expect(progressCallback).toHaveBeenLastCalledWith({
        loaded: 15,
        contentLength: 15,
        progress: 100,
        finished: true,
      });
    });
  });
});
