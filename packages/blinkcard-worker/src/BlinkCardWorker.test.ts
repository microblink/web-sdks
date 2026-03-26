/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type { Ping } from "@microblink/analytics/ping";
import type { BlinkCardScanningSession } from "@microblink/blinkcard-wasm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createFakeImageData } from "@microblink/test-utils/mocks/imageData";
import { createScanningSessionMock } from "@microblink/test-utils/mocks/scanningSession";

/**
 * Test purpose:
 * - Cover non-init worker behavior in isolation from real wasm/network.
 *
 * Mocking procedure used in this file:
 * 1) Mock worker-common/comlink dependencies and install deterministic globals (`self`).
 * 2) Import the worker class and instantiate it directly.
 * 3) Use helper-created fake sessions for proxy-session behavior tests.
 *
 * Cases covered:
 * - Guard rails before wasm load (`reportPinglet`/`sendPinglets` throw).
 * - Graceful terminate without a loaded module.
 * - Active session cleanup/replacement for proxy and created sessions.
 * - Proxy session forwards methods and transfers `arrayBuffer`.
 * - Session processing errors are reported as ping error events.
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

let BlinkCardWorker: typeof import("./BlinkCardWorker").BlinkCardWorker;

describe("BlinkCardWorker", () => {
  beforeEach(async () => {
    vi.stubGlobal("self", {
      setTimeout: vi.fn(),
      close: vi.fn(),
      location: { hostname: "example.com" },
      navigator: { userAgent: "Chrome" },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    ({ BlinkCardWorker } = await import("./BlinkCardWorker"));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("sets active session when createScanningSession is called", async () => {
    const worker = new BlinkCardWorker();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
      /* noop */
    });
    let deleted = false;
    const session = createScanningSessionMock<BlinkCardScanningSession>({
      delete: vi.fn().mockImplementation(() => {
        deleted = true;
      }),
      isDeleted: vi.fn().mockReturnValue(deleted),
    });

    // invoke createScanningSession to set active session
    worker.createProxySession(session);
    // invoke terminate to clean up active session
    await worker.terminate();

    expect(session.isDeleted).toHaveBeenCalledTimes(1);
    // we implicitly test that the session is set as active by the worker,
    // since delete is called if this.#activeSession exists.
    expect(session.delete).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      "No Wasm module loaded during worker termination. Skipping cleanup.",
    );
  });

  it("replaces active session when a newer proxy session is created", async () => {
    const worker = new BlinkCardWorker();
    vi.spyOn(console, "warn").mockImplementation(() => {
      /* noop */
    });
    const firstSession = createScanningSessionMock<BlinkCardScanningSession>({
      isDeleted: vi.fn().mockReturnValue(false),
    });
    const secondSession = createScanningSessionMock<BlinkCardScanningSession>({
      isDeleted: vi.fn().mockReturnValue(false),
    });

    const firstProxySession = worker.createProxySession(firstSession);
    worker.createProxySession(secondSession);

    firstProxySession.delete();
    await worker.terminate();

    expect(firstSession.delete).toHaveBeenCalledTimes(1);
    expect(secondSession.delete).toHaveBeenCalledTimes(1);
  });

  it("throws when reporting pinglet without a loaded module", () => {
    const worker = new BlinkCardWorker();
    const pinglet: Ping = {
      schemaName: "ping.sdk.init.start",
      schemaVersion: "1.1.0",
      sessionNumber: 0,
      data: {
        product: "BlinkCard",
        platform: "Emscripten",
        platformDetails: "advanced-threads",
        packageName: "example.com",
        userId: "test-user",
      },
    };
    expect(() => worker.reportPinglet(pinglet)).toThrow(
      "Cannot report pinglet: Wasm module not loaded",
    );
  });

  it("throws when sending pinglets without a loaded module", () => {
    const worker = new BlinkCardWorker();
    expect(() => worker.sendPinglets()).toThrow(
      "Cannot send pinglets: Wasm module not loaded",
    );
  });

  it("terminates gracefully without a loaded module", async () => {
    const worker = new BlinkCardWorker();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
      /* noop */
    });

    await worker.terminate();

    expect(warnSpy).toHaveBeenCalledWith(
      "No Wasm module loaded during worker termination. Skipping cleanup.",
    );
    expect(self.close).toHaveBeenCalled();
  });

  it("creates a proxy session that forwards methods and attaches arrayBuffer", () => {
    const worker = new BlinkCardWorker();
    const processResult = { status: "ok" };
    const session = createScanningSessionMock<BlinkCardScanningSession>({
      process: vi.fn().mockReturnValue(processResult),
    });

    const proxySession = worker.createProxySession(session);
    const image = createFakeImageData();
    const result = proxySession.process(image);
    expect(result).toMatchObject(processResult);
    expect(result.arrayBuffer).toBe(image.data.buffer);
  });

  it("rethrows session process errors without a loaded wasm module", () => {
    const worker = new BlinkCardWorker();
    const error = new Error("boom");
    const session = createScanningSessionMock<BlinkCardScanningSession>({
      process: vi.fn().mockImplementation(() => {
        throw error;
      }),
    });

    const proxySession = worker.createProxySession(session);
    const image = createFakeImageData();

    expect(() => proxySession.process(image)).toThrow(error);
  });
});
