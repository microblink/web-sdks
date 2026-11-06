/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

export class PausableTimeout {
  readonly #durationMs: number;
  readonly #onTimeout: () => void;

  #remainingMs: number;
  #startedAtMs?: number;
  #timeoutId: ReturnType<typeof setTimeout> | undefined;

  constructor(durationMs: number, onTimeout: () => void) {
    this.#durationMs = durationMs;
    this.#remainingMs = durationMs;
    this.#onTimeout = onTimeout;
  }

  get durationMs(): number {
    return this.#durationMs;
  }

  start(): void {
    if (this.#timeoutId !== undefined) {
      return;
    }

    this.#startedAtMs = performance.now();
    this.#timeoutId = setTimeout(() => {
      this.#clear();
      this.#onTimeout();
    }, this.#remainingMs);
  }

  pause(): void {
    if (this.#startedAtMs === undefined) {
      return;
    }

    this.#remainingMs = Math.max(0, this.#remainingMs - (performance.now() - this.#startedAtMs));
    this.#clear();
  }

  reset(): void {
    this.#clear();
    this.#remainingMs = this.#durationMs;
  }

  #clear(): void {
    clearTimeout(this.#timeoutId);
    this.#timeoutId = undefined;
    this.#startedAtMs = undefined;
  }
}
