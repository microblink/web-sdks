/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { DownloadProgress } from "@microblink/worker-common/downloadResourceBuffer";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BlinkIdInitializationProgress } from "./BlinkIdInitializationProgress";
import type { BlinkIdOtaResource } from "./otaResources";

const finishedProgress = (contentLength: number): DownloadProgress => ({
  loaded: contentLength,
  contentLength,
  progress: 100,
  finished: true,
});

const createResource = (contentLength: number): BlinkIdOtaResource => ({
  filename: "template-database.zzip",
  version: "1.0.0",
  url: "template-database.zzip",
  contentLength,
});

describe("BlinkIdInitializationProgress", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses hosted OTA sizes until response content lengths replace them", () => {
    let now = 0;
    vi.spyOn(performance, "now").mockImplementation(() => {
      now += 40;
      return now;
    });

    const events: DownloadProgress[] = [];
    const tracker = new BlinkIdInitializationProgress(
      (progress) => events.push(progress),
      [
        createResource(80),
        { filename: "knowledge-database.zzip", version: "1.0.0", url: "knowledge-database.zzip", contentLength: 720 },
      ],
    );

    tracker.updateWasm(finishedProgress(100), finishedProgress(100), true);
    expect(events.at(-1)).toEqual({
      loaded: 200,
      contentLength: 1_000,
      progress: 20,
      finished: false,
    });

    tracker.updateOta("knowledge-database.zzip", {
      loaded: 0,
      contentLength: 900,
      progress: 0,
      finished: false,
    });
    expect(events.at(-1)).toEqual({
      loaded: 200,
      contentLength: 1_180,
      progress: 20,
      finished: false,
    });
  });

  it("aggregates wasm and OTA bytes while both downloads are in flight", () => {
    let now = 0;
    vi.spyOn(performance, "now").mockImplementation(() => {
      now += 40;
      return now;
    });

    const events: DownloadProgress[] = [];
    const tracker = new BlinkIdInitializationProgress((progress) => events.push(progress), [createResource(100)]);

    tracker.updateWasm(
      { loaded: 50, contentLength: 100, progress: 50, finished: false },
      { loaded: 0, contentLength: 100, progress: 0, finished: false },
      true,
    );
    tracker.updateOta("template-database.zzip", {
      loaded: 40,
      contentLength: 100,
      progress: 40,
      finished: false,
    });

    expect(events.at(-1)).toEqual({
      loaded: 90,
      contentLength: 300,
      progress: 30,
      finished: false,
    });
  });

  it("resets attempt bytes when a failed provider download falls back to the hosted resource", () => {
    let now = 0;
    vi.spyOn(performance, "now").mockImplementation(() => {
      now += 40;
      return now;
    });

    const events: DownloadProgress[] = [];
    const tracker = new BlinkIdInitializationProgress((progress) => events.push(progress), [createResource(100)]);

    tracker.updateWasm(finishedProgress(100), finishedProgress(100), true);
    tracker.updateOta("template-database.zzip", {
      loaded: 60,
      contentLength: 100,
      progress: 60,
      finished: false,
    });
    tracker.updateOta("template-database.zzip", {
      loaded: 0,
      contentLength: 80,
      progress: 0,
      finished: false,
    });

    expect(events.at(-1)).toEqual({
      loaded: 200,
      contentLength: 280,
      progress: 87,
      finished: false,
    });
  });
});
