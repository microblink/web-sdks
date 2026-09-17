/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { DownloadProgress } from "@microblink/worker-common/downloadResourceBuffer";

import type { BlinkIdOtaResource } from "./otaResources";

// Limit non-terminal progress callbacks to approximately 30 frames per second.
const DOWNLOAD_PROGRESS_UPDATE_INTERVAL = 32;

type OtaResourceProgress = {
  loaded: number;
  contentLength: number;
};

/** Receives aggregate initialization download progress. */
export type ProgressStatusCallback = (progress: DownloadProgress) => void;

/**
 * Aggregates Wasm, data, and OTA downloads into monotonic initialization progress.
 *
 * Manifest sizes provide the initial OTA totals. Response `Content-Length` values replace those estimates when
 * downloads begin. Completion reaches `100` only after the caller confirms all OTA resources were persisted to MEMFS.
 */
export class BlinkIdInitializationProgress {
  readonly #callback: ProgressStatusCallback;
  readonly #otaProgress = new Map<string, OtaResourceProgress>();

  #lastProgress = 0;
  #lastProgressUpdate = 0;
  #wasmLoaded = 0;
  #wasmContentLength = 0;

  constructor(callback: ProgressStatusCallback, otaResources: BlinkIdOtaResource[]) {
    this.#callback = callback;
    this.#setOtaResources(otaResources);
  }

  updateWasm(wasmProgress: DownloadProgress, dataProgress: DownloadProgress, force = false) {
    this.#wasmLoaded = wasmProgress.loaded + dataProgress.loaded;
    this.#wasmContentLength = wasmProgress.contentLength + dataProgress.contentLength;

    this.#emit(this.#calculateProgress(), false, force);
  }

  setSelectedOtaResources(resources: BlinkIdOtaResource[]) {
    this.#setOtaResources(resources);
    this.#emit(this.#calculateProgress(), false, true);
  }

  updateOta(filename: string, progress: DownloadProgress) {
    const current = this.#otaProgress.get(filename);
    if (!current) {
      return;
    }

    const isResponseStart = !progress.finished && progress.loaded === 0;
    if (isResponseStart || progress.finished) {
      current.loaded = progress.loaded;
    } else {
      current.loaded = Math.max(current.loaded, progress.loaded);
    }
    if (progress.contentLength > 0) {
      current.contentLength =
        progress.finished || isResponseStart
          ? progress.contentLength
          : Math.max(current.contentLength, progress.contentLength);
    }

    this.#emit(this.#calculateProgress(), false);
  }

  complete() {
    this.#emit(100, true, true);
  }

  #setOtaResources(resources: BlinkIdOtaResource[]) {
    this.#otaProgress.clear();
    for (const resource of resources) {
      const contentLength = resource.contentLength;
      if (contentLength === undefined || !Number.isSafeInteger(contentLength) || contentLength <= 0) {
        throw new Error(`BlinkID OTA resource ${resource.filename} is missing a valid contentLength`);
      }

      this.#otaProgress.set(resource.filename, {
        loaded: 0,
        contentLength,
      });
    }
  }

  #calculateProgress(): number {
    const otaResources = Array.from(this.#otaProgress.values());
    const otaContentLength = otaResources.reduce((total, resource) => total + resource.contentLength, 0);
    const totalContentLength = this.#wasmContentLength + otaContentLength;
    if (totalContentLength === 0) {
      return 0;
    }

    const otaLoaded = otaResources.reduce(
      (total, resource) => total + Math.min(resource.loaded, resource.contentLength),
      0,
    );
    return Math.min(Math.round(((this.#wasmLoaded + otaLoaded) / totalContentLength) * 100), 100);
  }

  #emit(progress: number, finished: boolean, force = false) {
    const currentTime = performance.now();
    if (!force && currentTime - this.#lastProgressUpdate < DOWNLOAD_PROGRESS_UPDATE_INTERVAL) {
      return;
    }

    this.#lastProgressUpdate = currentTime;
    this.#lastProgress = finished ? 100 : Math.max(this.#lastProgress, Math.min(progress, 99));

    const otaProgress = Array.from(this.#otaProgress.values());
    this.#callback({
      loaded: this.#wasmLoaded + otaProgress.reduce((total, item) => total + item.loaded, 0),
      contentLength: this.#wasmContentLength + otaProgress.reduce((total, item) => total + item.contentLength, 0),
      progress: this.#lastProgress,
      finished,
    });
  }
}
