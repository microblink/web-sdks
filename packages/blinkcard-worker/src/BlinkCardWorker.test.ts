/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { Ping } from "@microblink/analytics/ping";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Test purpose:
 *
 * - Cover non-init worker behavior in isolation from real wasm/network.
 *
 * Mocking procedure used in this file:
 *
 * 1. Mock worker-common/comlink dependencies and install deterministic globals (`self`).
 * 2. Import the worker class and instantiate it directly.
 * 3. Exercise public worker APIs without loading wasm/network resources.
 *
 * Cases covered:
 *
 * - Guard rails before wasm load (`reportPinglet`/`sendPinglets` throw).
 * - Graceful terminate without a loaded module.
 * - Tightening helper privacy does not affect public guard-rail behavior.
 */
vi.mock("comlink", () => {
  const finalizer = Symbol("finalizer");
  return {
    expose: vi.fn(),
    finalizer,
    proxy: <T>(value: T) => value,
    transfer: <T>(value: T) => value,
    ProxyMarked: class {},
  };
});

vi.mock("@microblink/blinkcard-wasm/size-manifest.json", () => ({
  default: {
    wasm: { simd: 100, "simd-threads": 100, "simd-relaxed": 100, "simd-relaxed-threads": 100 },
    data: { simd: 100, "simd-threads": 100, "simd-relaxed": 100, "simd-relaxed-threads": 100 },
  },
}));

vi.mock("@microblink/worker-common/workerCrashReporter", () => ({
  installWorkerCrashReporter: vi.fn(() => vi.fn()),
}));

import { BlinkCardWorker } from "./BlinkCardWorker";

describe("BlinkCardWorker", () => {
  beforeEach(() => {
    vi.stubGlobal("self", {
      setTimeout: vi.fn(),
      close: vi.fn(),
      location: { hostname: "example.com" },
      navigator: { userAgent: "Chrome" },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("throws when reporting pinglet without a loaded module", () => {
    const worker = new BlinkCardWorker();
    const pinglet: Ping = {
      schemaName: "ping.sdk.init.start",
      schemaVersion: "3.0.0",
      sessionNumber: 0,
      data: {
        product: "BlinkCard",
        platform: "Emscripten",
        platformDetails: "simd-threads",
        packageName: "example.com",
        userId: "test-user",
        pingProxyEnabled: false,
        baltazarProxyEnabled: false,
      },
    };
    expect(() => worker.reportPinglet(pinglet)).toThrow("Cannot report pinglet: Wasm module not loaded");
  });

  it("throws when sending pinglets without a loaded module", () => {
    const worker = new BlinkCardWorker();
    expect(() => worker.sendPinglets()).toThrow("Cannot send pinglets: Wasm module not loaded");
  });

  it("terminates gracefully without a loaded module", async () => {
    const worker = new BlinkCardWorker();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
      /* noop */
    });

    await worker.terminate();

    expect(warnSpy).toHaveBeenCalledWith("No Wasm module loaded during worker termination. Skipping cleanup.");
    expect(self.close).toHaveBeenCalled();
  });
});
