/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  downloadResourceBuffer,
  type DownloadProgress,
} from "./downloadResourceBuffer";

describe("downloadResourceBuffer", () => {
  const mockUrl = "https://example.com/test.wasm";
  const mockChunks = [
    new Uint8Array([1, 2, 3, 4, 5]),
    new Uint8Array([6, 7, 8, 9, 10]),
    new Uint8Array([11, 12, 13, 14, 15]),
  ];

  const createMockResponse = (options: {
    contentLength?: number;
    chunks?: Uint8Array[];
  }) => {
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

  const getExpectedSize = vi.fn((params: { fileType: string }) =>
    params.fileType === "wasm" ? 1000 : 2000,
  );

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve(createMockResponse({ contentLength: 15 })),
    );
  });

  it("downloads without progress callback", async () => {
    const buffer = await downloadResourceBuffer(
      {
        url: mockUrl,
        fileType: "wasm",
        variant: "basic",
      },
      getExpectedSize,
    );
    expect(fetch).toHaveBeenCalledWith(mockUrl);
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
        variant: "basic",
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
    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(createMockResponse({ contentLength: undefined })),
    );

    const progressCallback = vi.fn() as (progress: DownloadProgress) => void;
    await downloadResourceBuffer(
      {
        url: mockUrl,
        fileType: "wasm",
        variant: "basic",
        progressCallback,
      },
      getExpectedSize,
    );

    expect(getExpectedSize).toHaveBeenCalledWith({
      fileType: "wasm",
      variant: "basic",
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
    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(createMockResponse({ contentLength: undefined })),
    );

    const progressCallback = vi.fn() as (progress: DownloadProgress) => void;
    await downloadResourceBuffer(
      {
        url: mockUrl,
        fileType: "data",
        variant: "advanced",
        buildType: "lightweight",
        progressCallback,
      },
      getExpectedSize,
    );

    expect(getExpectedSize).toHaveBeenCalledWith({
      fileType: "data",
      variant: "advanced",
      buildType: "lightweight",
    });
  });

  it("throws error for invalid content length", async () => {
    vi.mocked(fetch).mockImplementation(() => {
      const response = createMockResponse({ contentLength: undefined });
      response.headers.set("Content-Length", "0");
      return Promise.resolve(response);
    });

    const progressCallback = vi.fn() as (progress: DownloadProgress) => void;

    await expect(
      downloadResourceBuffer(
        {
          url: mockUrl,
          fileType: "wasm",
          variant: "basic",
          progressCallback,
        },
        getExpectedSize,
      ),
    ).rejects.toThrow("Invalid content length");
  });

  it("handles empty response", async () => {
    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(
        createMockResponse({ contentLength: undefined, chunks: [] }),
      ),
    );

    const progressCallback = vi.fn() as (progress: DownloadProgress) => void;
    await downloadResourceBuffer(
      {
        url: mockUrl,
        fileType: "wasm",
        variant: "basic",
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
    vi.mocked(fetch).mockImplementation(() =>
      Promise.reject(new Error("Network error")),
    );

    await expect(
      downloadResourceBuffer(
        {
          url: mockUrl,
          fileType: "wasm",
          variant: "basic",
        },
        getExpectedSize,
      ),
    ).rejects.toThrow("Network error");
  });
});
