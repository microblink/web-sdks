/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { afterEach, describe, expect, it, vi } from "vitest";

import { detectMainThreadWasmCapabilities } from "./wasmCapabilityDetection";

const noRelaxedSimd = vi.fn(() => Promise.resolve(false));

describe("detectMainThreadWasmCapabilities", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports minimum SIMD support without threaded capabilities", async () => {
    vi.stubGlobal("Worker", class {});
    vi.stubGlobal("SharedArrayBuffer", undefined);
    vi.stubGlobal("crossOriginIsolated", false);
    vi.stubGlobal("navigator", { userAgent: "Firefox" });

    await expect(
      detectMainThreadWasmCapabilities(
        vi.fn(() => Promise.resolve("simd")),
        noRelaxedSimd,
      ),
    ).resolves.toEqual({
      minimumFeatures: true,
      relaxedSimd: false,
      threads: false,
      sharedMemory: false,
      worker: true,
      crossOriginIsolated: false,
      safari: false,
    });
  });

  it("reports relaxed SIMD support when the browser provides it", async () => {
    vi.stubGlobal("Worker", class {});
    vi.stubGlobal("SharedArrayBuffer", undefined);
    vi.stubGlobal("crossOriginIsolated", false);
    vi.stubGlobal("navigator", { userAgent: "Chrome" });

    await expect(
      detectMainThreadWasmCapabilities(
        vi.fn(() => Promise.resolve("simd-relaxed")),
        vi.fn(() => Promise.resolve(true)),
      ),
    ).resolves.toMatchObject({
      minimumFeatures: true,
      relaxedSimd: true,
      threads: false,
    });
  });

  it("treats any threaded variant as thread support", async () => {
    vi.stubGlobal("Worker", class {});
    vi.stubGlobal("SharedArrayBuffer", class extends ArrayBuffer {});
    vi.stubGlobal("crossOriginIsolated", true);
    vi.stubGlobal("navigator", { userAgent: "Chrome" });

    await expect(
      detectMainThreadWasmCapabilities(
        vi.fn(() => Promise.resolve("simd-relaxed-threads")),
        vi.fn(() => Promise.resolve(true)),
      ),
    ).resolves.toMatchObject({
      minimumFeatures: true,
      relaxedSimd: true,
      threads: true,
    });
  });

  it("recognizes the main-thread handoff after all minimum probes pass", async () => {
    vi.stubGlobal("Worker", class {});
    vi.stubGlobal("SharedArrayBuffer", class extends ArrayBuffer {});
    vi.stubGlobal("crossOriginIsolated", true);
    vi.stubGlobal("navigator", { userAgent: "Chrome" });

    await expect(
      detectMainThreadWasmCapabilities(
        vi.fn(() => Promise.reject(new Error("Not implemented"))),
        noRelaxedSimd,
      ),
    ).resolves.toEqual({
      minimumFeatures: true,
      relaxedSimd: false,
      threads: true,
      sharedMemory: true,
      worker: true,
      crossOriginIsolated: true,
      safari: false,
    });
  });

  it("treats any other detector failure as missing minimum features", async () => {
    vi.stubGlobal("navigator", { userAgent: "Safari" });
    const detectRelaxedSimd = vi.fn(() => Promise.resolve(true));

    await expect(
      detectMainThreadWasmCapabilities(
        vi.fn(() => Promise.reject(new Error("Browser doesn't meet minimum requirements!"))),
        detectRelaxedSimd,
      ),
    ).resolves.toMatchObject({
      minimumFeatures: false,
      relaxedSimd: false,
      threads: false,
      safari: true,
    });
    expect(detectRelaxedSimd).not.toHaveBeenCalled();
  });
});
