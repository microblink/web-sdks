/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const featureMocks = {
  bulkMemory: vi.fn(),
  mutableGlobals: vi.fn(),
  referenceTypes: vi.fn(),
  relaxedSimd: vi.fn(),
  saturatedFloatToInt: vi.fn(),
  signExtensions: vi.fn(),
  simd: vi.fn(),
  threads: vi.fn(),
};

vi.mock("wasm-feature-detect", () => featureMocks);

const { detectWasmFeatures } = await import("./wasm-feature-detect");

const chromeUserAgent = "Mozilla/5.0 (Macintosh) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const safariUserAgent = "Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

function setBrowserFeatures({
  relaxedSimd,
  threads,
  userAgent = chromeUserAgent,
}: {
  relaxedSimd: boolean;
  threads: boolean;
  userAgent?: string;
}) {
  featureMocks.bulkMemory.mockResolvedValue(true);
  featureMocks.mutableGlobals.mockResolvedValue(true);
  featureMocks.referenceTypes.mockResolvedValue(true);
  featureMocks.saturatedFloatToInt.mockResolvedValue(true);
  featureMocks.signExtensions.mockResolvedValue(true);
  featureMocks.simd.mockResolvedValue(true);
  featureMocks.relaxedSimd.mockResolvedValue(relaxedSimd);
  featureMocks.threads.mockResolvedValue(threads);
  vi.stubGlobal("navigator", { userAgent });
}

describe("detectWasmFeatures", () => {
  beforeEach(() => {
    // Worker-only globals used by the threads check.
    vi.stubGlobal("self", { importScripts: () => undefined, Worker: class {} });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetAllMocks();
  });

  it("throws when fixed-width SIMD is unavailable", async () => {
    setBrowserFeatures({ relaxedSimd: false, threads: false });
    featureMocks.simd.mockResolvedValue(false);

    await expect(detectWasmFeatures()).rejects.toThrow("minimum requirements");
  });

  it.each([
    { relaxedSimd: false, threads: false, expected: "simd" },
    { relaxedSimd: false, threads: true, expected: "simd-threads" },
    { relaxedSimd: true, threads: false, expected: "simd-relaxed" },
    { relaxedSimd: true, threads: true, expected: "simd-relaxed-threads" },
  ])(
    "selects $expected when relaxedSimd=$relaxedSimd and threads=$threads",
    async ({ relaxedSimd, threads, expected }) => {
      setBrowserFeatures({ relaxedSimd, threads });

      await expect(detectWasmFeatures()).resolves.toBe(expected);
    },
  );

  it("does not select relaxed variants when the caller disallows them", async () => {
    setBrowserFeatures({ relaxedSimd: true, threads: true });

    await expect(detectWasmFeatures({ allowRelaxedSimd: false })).resolves.toBe("simd-threads");
    expect(featureMocks.relaxedSimd).not.toHaveBeenCalled();
  });

  it("does not select threaded variants on Safari", async () => {
    setBrowserFeatures({ relaxedSimd: true, threads: true, userAgent: safariUserAgent });

    await expect(detectWasmFeatures()).resolves.toBe("simd-relaxed");
  });
});
