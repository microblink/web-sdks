/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { describe, expect, test, vi } from "vitest";
import { asError, getAverage, sleep } from "./utils";

describe("utils", () => {
  test("getAverage returns the mean value", () => {
    expect(getAverage([2, 4, 6])).toBe(4);
  });

  test("asError returns Error instances as-is", () => {
    const error = new Error("boom");
    expect(asError(error)).toBe(error);
  });

  test("asError stringifies non-error values", () => {
    const err = asError({ ok: false });
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe(JSON.stringify({ ok: false }));
  });

  test("asError handles circular structures", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    const err = asError(circular);
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe("[object Object]");
  });

  describe("sleep", () => {
    test("resolves after the provided delay", async () => {
      vi.useFakeTimers();
      const onResolved = vi.fn();

      void sleep(200).then(onResolved);
      expect(onResolved).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(200);
      expect(onResolved).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });
});
