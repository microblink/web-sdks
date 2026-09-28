/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createLogger } from "./logger";

describe("createLogger", () => {
  beforeEach(() => {
    vi.spyOn(console, "debug").mockImplementation(vi.fn());
    vi.spyOn(console, "warn").mockImplementation(vi.fn());
    vi.spyOn(console, "error").mockImplementation(vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("prepends namespace to all log calls", () => {
    const logger = createLogger("TestNamespace", "debug");
    logger.debug("msg");
    logger.warn("msg");
    logger.error("msg");

    expect(console.debug).toHaveBeenCalledWith("[TestNamespace]", "msg");
    expect(console.warn).toHaveBeenCalledWith("[TestNamespace]", "msg");
    expect(console.error).toHaveBeenCalledWith("[TestNamespace]", "msg");
  });

  test.each([
    {
      testName: 'default level "warn" suppresses debug',
      level: undefined,
      expected: { debug: 0, warn: 1, error: 1 },
    },
    {
      testName: 'level "error" suppresses debug and warn',
      level: "error" as const,
      expected: { debug: 0, warn: 0, error: 1 },
    },
    {
      testName: 'level "silent" suppresses all methods',
      level: "silent" as const,
      expected: { debug: 0, warn: 0, error: 0 },
    },
  ])("$testName", ({ level, expected }) => {
    const logger = level === undefined ? createLogger("Test") : createLogger("Test", level);

    logger.debug("debug");
    logger.warn("warn");
    logger.error("error");

    expect(console.debug).toHaveBeenCalledTimes(expected.debug);
    expect(console.warn).toHaveBeenCalledTimes(expected.warn);
    expect(console.error).toHaveBeenCalledTimes(expected.error);
  });
});
