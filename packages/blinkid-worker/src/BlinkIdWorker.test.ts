/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type { Ping } from "@microblink/analytics/ping";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mergeRedactionSettings } from "./utils";
import { RedactionSettings } from "@microblink/blinkid-wasm";

/**
 * Test purpose:
 * - Cover non-init BlinkID worker behavior with deterministic mocks.
 *
 * Mocking procedure used in this file:
 * 1) Replace worker-common/comlink dependencies and set test globals on `self`.
 * 2) Import and instantiate `BlinkIdWorker` directly.
 * 3) Exercise public worker APIs without loading wasm/network resources.
 *
 * Cases covered:
 * - `reportPinglet` / `sendPinglets` throw before wasm is loaded.
 * - Worker termination is graceful when no wasm module exists.
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

let BlinkIdWorker: typeof import("./BlinkIdWorker").BlinkIdWorker;

describe("BlinkIdWorker", () => {
  beforeEach(async () => {
    vi.stubGlobal("self", {
      setTimeout: vi.fn(),
      close: vi.fn(),
      location: { hostname: "example.com" },
      navigator: { userAgent: "Chrome" },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    ({ BlinkIdWorker } = await import("./BlinkIdWorker"));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("throws when reporting pinglet without a loaded module", () => {
    const worker = new BlinkIdWorker();
    const pinglet: Ping = {
      schemaName: "ping.sdk.init.start",
      schemaVersion: "1.3.0",
      sessionNumber: 0,
      data: {
        product: "BlinkID",
        platform: "Emscripten",
        platformDetails: "advanced-threads",
        packageName: "example.com",
        userId: "test-user",
        pingProxyEnabled: false,
        baltazarProxyEnabled: false,
      },
    };
    expect(() => worker.reportPinglet(pinglet)).toThrow(
      "Cannot report pinglet: Wasm module not loaded",
    );
  });

  it("throws when sending pinglets without a loaded module", () => {
    const worker = new BlinkIdWorker();
    expect(() => worker.sendPinglets()).toThrow(
      "Cannot send pinglets: Wasm module not loaded",
    );
  });

  it("terminates gracefully without a loaded module", async () => {
    const worker = new BlinkIdWorker();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
      /* noop */
    });

    await worker.terminate();

    expect(warnSpy).toHaveBeenCalledWith(
      "No Wasm module loaded during worker termination. Skipping cleanup.",
    );
    expect(self.close).toHaveBeenCalled();
  });

  it("verifies expected behaviour of the mergeRedactionSettings function", () => {
    const defaultSettings: RedactionSettings = {
      fields: [],
      mode: "full-result",
      redactBarcode: false,
      redactMrz: false,
    };

    const partialSettings: Partial<RedactionSettings> = {
      mode: "none",
      fields: ["firstName"],
    };

    let mergeResults = mergeRedactionSettings(defaultSettings, partialSettings);

    expect(mergeResults).toStrictEqual({
      ...defaultSettings,
      ...partialSettings,
    });

    const fullSettings: RedactionSettings = {
      mode: "full-result",
      fields: ["firstName"],
      redactBarcode: true,
      redactMrz: false,
      documentNumberRedactionSettings: {
        prefixDigitsVisible: 1,
        suffixDigitsVisible: 1,
      },
    };

    mergeResults = mergeRedactionSettings(defaultSettings, fullSettings);

    expect(mergeResults).toStrictEqual(fullSettings);

    mergeResults = mergeRedactionSettings(defaultSettings, {
      redactBarcode: undefined,
      fields: undefined,
      redactMrz: undefined,
      mode: undefined,
    });

    // Keep default settings when undefined is provided
    expect(mergeResults).toStrictEqual(defaultSettings);
  });
});
