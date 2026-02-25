/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { vi } from "vitest";

/**
 * Enables default fake timers.
 */
export const enableFakeTimers = () => {
  vi.useFakeTimers();
};

/**
 * Enables fake timers including RAF and performance timestamps.
 */
export const enableRafAwareFakeTimers = () => {
  vi.useFakeTimers({
    toFake: [
      "setTimeout",
      "clearTimeout",
      "Date",
      "performance",
      "requestAnimationFrame",
      "cancelAnimationFrame",
    ],
  });
};

/**
 * Advances virtual time enough for a typical RAF tick.
 *
 * Use this for fine-grained, step-by-step assertions where you want to
 * control intermediate timing transitions explicitly.
 */
export const tickRaf = async (ms = 40) => {
  await vi.advanceTimersByTimeAsync(ms);
};

/**
 * Ensures at least one throttled RAF update executes.
 *
 * Use this after an interaction when you only care that the next UI RAF
 * cycle has been applied, not the exact intermediate timing.
 */
export const flushUiRaf = async () => {
  await tickRaf(70);
};

/**
 * Advances virtual time and flushes one UI RAF cycle.
 *
 * Use this for integration-style flow steps that need both:
 * 1) advancing clock time (e.g. minDuration windows), and
 * 2) applying resulting RAF-driven UI updates.
 */
export const advanceAndFlushUi: (ms: number) => Promise<void> = async (ms) => {
  await vi.advanceTimersByTimeAsync(ms);
  await flushUiRaf();
};

/**
 * Jumps system time forward and advances one RAF tick.
 */
export const jumpTime = async (ms: number) => {
  vi.setSystemTime(Date.now() + ms);
  await tickRaf();
};
