/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type { Ping } from "@microblink/analytics/ping";
import type {
  BlinkCardProcessResult,
  BlinkCardScanningSession,
  BlinkCardSessionSettings,
} from "@microblink/blinkcard-wasm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
  const createSession = (
    overrides: Partial<BlinkCardScanningSession> = {},
  ): BlinkCardScanningSession => {
    const baseSettings = {
      inputImageSource: "video",
      scanningSettings: {},
    } as BlinkCardSessionSettings;

    return {
      getResult: vi.fn(() => ({}) as BlinkCardProcessResult),
      process: vi.fn(() => ({}) as BlinkCardProcessResult),
      ping: vi.fn(),
      sendPinglets: vi.fn(),
      getSettings: vi.fn(() => baseSettings),
      getSessionId: vi.fn(() => "session-id"),
      getSessionNumber: vi.fn(() => 1),
      reset: vi.fn(),
      delete: vi.fn(),
      deleteLater: vi.fn(),
      isDeleted: vi.fn(() => false),
      isAliasOf: vi.fn(() => false),
      ...overrides,
    } as BlinkCardScanningSession;
  };

  beforeEach(async () => {
    vi.stubGlobal("self", {
      setTimeout: vi.fn(),
      close: vi.fn(),
      location: { hostname: "example.com" },
    });

    ({ BlinkCardWorker } = await import("./BlinkCardWorker"));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
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

  it("deletes the active session on terminate", async () => {
    const worker = new BlinkCardWorker();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
      /* noop */
    });
    let deleted = false;
    const session = createSession({
      delete: vi.fn(() => {
        deleted = true;
      }),
      isDeleted: vi.fn(() => deleted),
    });

    worker.createProxySession(session);
    await worker.terminate();

    expect(session.delete).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      "No Wasm module loaded during worker termination. Skipping cleanup.",
    );
  });

  it("does not double-delete when session was already deleted", async () => {
    const worker = new BlinkCardWorker();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
      /* noop */
    });
    let deleted = false;
    const session = createSession({
      delete: vi.fn(() => {
        deleted = true;
      }),
      isDeleted: vi.fn(() => deleted),
    });

    const proxySession = worker.createProxySession(session);
    proxySession.delete();
    await worker.terminate();

    expect(session.delete).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      "No Wasm module loaded during worker termination. Skipping cleanup.",
    );
  });

  it("creates a proxy session that forwards methods and attaches arrayBuffer", () => {
    const worker = new BlinkCardWorker();
    const processResult = { status: "ok" } as unknown as BlinkCardProcessResult;
    const session = createSession({
      process: vi.fn(() => processResult),
    });

    const proxySession = worker.createProxySession(session);

    const image = {
      data: new Uint8ClampedArray([1, 2, 3, 4]),
      width: 1,
      height: 1,
      colorSpace: "srgb",
    } as ImageData;

    const result = proxySession.process(image);
    expect(result).toMatchObject(processResult);
    expect(result.arrayBuffer).toBe(image.data.buffer);
    expect(proxySession.getSessionId()).toBe("session-id");
    expect(proxySession.getSessionNumber()).toBe(1);
    expect(proxySession.getSettings()).toMatchObject({
      inputImageSource: "video",
    });
    expect(proxySession.showDemoOverlay()).toBe(true);
    expect(proxySession.showProductionOverlay()).toBe(true);
  });

  it("reports pinglet on session errors", () => {
    const worker = new BlinkCardWorker();
    const reportPingletSpy = vi
      .spyOn(worker, "reportPinglet")
      .mockImplementation(() => undefined);
    const error = new Error("boom");
    const session = createSession({
      process: vi.fn(() => {
        throw error;
      }),
    });

    const proxySession = worker.createProxySession(session);
    const image = {
      data: new Uint8ClampedArray([1, 2, 3, 4]),
      width: 1,
      height: 1,
      colorSpace: "srgb",
    } as ImageData;

    expect(() => proxySession.process(image)).toThrow(error);
    expect(reportPingletSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        schemaName: "ping.error",
      }),
    );
  });
});
