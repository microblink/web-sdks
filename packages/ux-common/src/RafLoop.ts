/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * A stoppable `requestAnimationFrame` loop with built-in throttling.
 *
 * The callback fires at most once per {@link throttleMs} interval (default: every
 * frame). Calling {@link stop} is guaranteed to prevent any further invocations,
 * even if a frame was already queued by the browser.
 */
export class RafLoop {
  #running = false;
  #callback: FrameRequestCallback;
  #throttleMs: number;
  #lastTimestamp = 0;

  constructor(callback: FrameRequestCallback, throttleMs = 0) {
    this.#callback = callback;
    this.#throttleMs = throttleMs;
  }

  get running() {
    return this.#running;
  }

  start() {
    if (this.#running) return;
    this.#running = true;
    requestAnimationFrame(this.#tick);
  }

  stop() {
    this.#running = false;
  }

  #tick: FrameRequestCallback = (timestamp) => {
    if (!this.#running) return;

    if (timestamp - this.#lastTimestamp >= this.#throttleMs) {
      this.#lastTimestamp = timestamp;
      this.#callback(timestamp);
    }

    if (this.#running) requestAnimationFrame(this.#tick);
  };
}
