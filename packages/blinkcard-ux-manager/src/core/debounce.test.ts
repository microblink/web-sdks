/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { afterEach, describe, expect, test, vi } from "vitest";
import { debounce } from "./debounce";

describe("debounce", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("invokes function only once after delay", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    debounced();
    debounced();

    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("cancel prevents pending invocation", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    debounced.cancel();
    vi.runOnlyPendingTimers();

    expect(fn).not.toHaveBeenCalled();
  });
});
