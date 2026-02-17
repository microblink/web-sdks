/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  downloadResourceBuffer,
  type DownloadProgress,
} from "./downloadResourceBuffer";
import type { ResourceFileType, WasmVariant } from "@microblink/blinkcard-wasm";

vi.mock("@microblink/blinkcard-wasm/size-manifest.json", () => ({
  default: {
    wasm: {
      basic: 1000,
      advanced: 1200,
      "advanced-threads": 1300,
    },
    data: {
      basic: 2000,
      advanced: 2100,
      "advanced-threads": 2200,
    },
  },
}));

describe("downloadResourceBuffer", () => {
  const mockUrl = "https://example.com/test.wasm";
  const mockChunks = [
    new Uint8Array([1, 2, 3, 4, 5]),
    new Uint8Array([6, 7, 8, 9, 10]),
    new Uint8Array([11, 12, 13, 14, 15]),
  ];

  const defaultWasmFileType: ResourceFileType = "wasm";
  const defaultWasmVariant: WasmVariant = "basic";

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

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve(createMockResponse({ contentLength: 15 })),
    );
  });

  it("downloads without progress callback", async () => {
    const buffer = await downloadResourceBuffer(
      mockUrl,
      defaultWasmFileType,
      defaultWasmVariant,
    );
    expect(fetch).toHaveBeenCalledWith(mockUrl);
    expect(buffer).toBeInstanceOf(ArrayBuffer);
  });

  it("tracks progress with Content-Length header", async () => {
    const progressCallback = vi.fn() as (progress: DownloadProgress) => void;
    const totalSize = 15;

    await downloadResourceBuffer(
      mockUrl,
      defaultWasmFileType,
      defaultWasmVariant,
      progressCallback,
    );

    expect(progressCallback).toHaveBeenCalledTimes(4);
    expect(progressCallback).toHaveBeenNthCalledWith(1, {
      loaded: 5,
      contentLength: totalSize,
      progress: 33,
      finished: false,
    });
    expect(progressCallback).toHaveBeenNthCalledWith(2, {
      loaded: 10,
      contentLength: totalSize,
      progress: 67,
      finished: false,
    });
    expect(progressCallback).toHaveBeenNthCalledWith(3, {
      loaded: 15,
      contentLength: totalSize,
      progress: 100,
      finished: false,
    });
    expect(progressCallback).toHaveBeenNthCalledWith(4, {
      loaded: 15,
      contentLength: totalSize,
      progress: 100,
      finished: true,
    });
  });

  it("uses expected file size when Content-Length is missing", async () => {
    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(createMockResponse({ contentLength: undefined })),
    );

    const progressCallback = vi.fn() as (progress: DownloadProgress) => void;
    await downloadResourceBuffer(
      mockUrl,
      defaultWasmFileType,
      defaultWasmVariant,
      progressCallback,
    );

    expect(progressCallback).toHaveBeenNthCalledWith(1, {
      loaded: 5,
      contentLength: 1000,
      progress: 1,
      finished: false,
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
        mockUrl,
        defaultWasmFileType,
        defaultWasmVariant,
        progressCallback,
      ),
    ).rejects.toThrow("Invalid content length");
  });

  it("handles empty response", async () => {
    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(createMockResponse({ chunks: [] })),
    );

    const progressCallback = vi.fn() as (progress: DownloadProgress) => void;
    await downloadResourceBuffer(
      mockUrl,
      defaultWasmFileType,
      defaultWasmVariant,
      progressCallback,
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
      downloadResourceBuffer(mockUrl, defaultWasmFileType, defaultWasmVariant),
    ).rejects.toThrow("Network error");
  });
});
