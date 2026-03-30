/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type { Ping } from "@microblink/analytics/ping";
import type {
  BlinkIdProcessResult,
  BlinkIdScanningSession,
  BlinkIdSessionSettings,
} from "@microblink/blinkid-wasm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createFakeImageData } from "@microblink/test-utils/mocks/imageData";
import { createScanningSessionMock } from "@microblink/test-utils/mocks/scanningSession";

/**
 * Test purpose:
 * - Cover non-init BlinkID worker behavior with deterministic mocks.
 *
 * Mocking procedure used in this file:
 * 1) Replace worker-common/comlink dependencies and set test globals on `self`.
 * 2) Import and instantiate `BlinkIdWorker` directly.
 * 3) Use helper-built fake scanning sessions to exercise proxy behavior.
 *
 * Cases covered:
 * - `reportPinglet` / `sendPinglets` throw before wasm is loaded.
 * - Worker termination is graceful when no wasm module exists.
 * - Active session is tracked/replaced for proxy sessions.
 * - Proxy session forwards settings/result and transfers `arrayBuffer`.
 * - BlinkID process error results emit `ping.error` events.
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

  it("sets active session when createScanningSession is called", async () => {
    const sessionSettings = {} as BlinkIdSessionSettings;
    const worker = new BlinkIdWorker();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
      /* noop */
    });
    let deleted = false;
    const session = createScanningSessionMock<BlinkIdScanningSession>({
      delete: vi.fn().mockImplementation(() => {
        deleted = true;
      }),
      isDeleted: vi.fn().mockReturnValue(deleted),
    });

    // invoke createScanningSession to set active session
    worker.createProxySession(session, sessionSettings);
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
    const sessionSettings = {} as BlinkIdSessionSettings;
    const worker = new BlinkIdWorker();
    vi.spyOn(console, "warn").mockImplementation(() => {
      /* noop */
    });
    const firstSession = createScanningSessionMock<BlinkIdScanningSession>({
      isDeleted: vi.fn().mockReturnValue(false),
    });
    const secondSession = createScanningSessionMock<BlinkIdScanningSession>({
      isDeleted: vi.fn().mockReturnValue(false),
    });

    const firstProxySession = worker.createProxySession(
      firstSession,
      sessionSettings,
    );
    worker.createProxySession(secondSession, sessionSettings);

    firstProxySession.delete();
    await worker.terminate();

    expect(firstSession.delete).toHaveBeenCalledTimes(1);
    expect(secondSession.delete).toHaveBeenCalledTimes(1);
  });

  it("throws when reporting pinglet without a loaded module", () => {
    const worker = new BlinkIdWorker();
    const pinglet: Ping = {
      schemaName: "ping.sdk.init.start",
      schemaVersion: "1.1.0",
      sessionNumber: 0,
      data: {
        product: "BlinkID",
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

  it("creates a proxy session that forwards methods and attaches arrayBuffer", () => {
    const worker = new BlinkIdWorker();
    const processResult = {
      inputImageAnalysisResult: {
        documentClassInfo: { type: "" },
        documentRotation: "not-available" as const,
      },
    } as unknown as BlinkIdProcessResult;
    const sessionSettings = {
      inputImageSource: "video" as const,
    } as BlinkIdSessionSettings;
    const session = createScanningSessionMock<BlinkIdScanningSession>({
      process: vi.fn(() => processResult),
    });

    const proxySession = worker.createProxySession(session, sessionSettings);
    const image = createFakeImageData();

    const result = proxySession.process(image);
    expect(result).toMatchObject(processResult);
    expect(result.arrayBuffer).toBe(image.data.buffer);
    expect(proxySession.getSettings()).toMatchObject({
      inputImageSource: "video",
    });
    expect(proxySession.showDemoOverlay()).toBe(true);
    expect(proxySession.showProductionOverlay()).toBe(true);
  });

  it("returns session error results without a loaded wasm module", () => {
    const worker = new BlinkIdWorker();
    const sessionSettings = {} as BlinkIdSessionSettings;
    const session = createScanningSessionMock<BlinkIdScanningSession>({
      process: vi.fn(() => ({ error: "document-scanned" as const })),
    });

    const proxySession = worker.createProxySession(session, sessionSettings);
    const image = createFakeImageData();

    const result = proxySession.process(image);
    expect(result).toMatchObject({ error: "document-scanned" });
    expect(result.arrayBuffer).toBe(image.data.buffer);
  });
});
