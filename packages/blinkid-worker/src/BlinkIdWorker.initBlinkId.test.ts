/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  BlinkIdScanningSession,
  BlinkIdSessionSettings,
} from "@microblink/blinkid-wasm";
import {
  LicenseError,
  ServerPermissionError,
} from "@microblink/worker-common/errors";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as Comlink from "comlink";
import {
  createWasmModuleMock,
  getLastModuleOverrides,
  resetLastModuleOverrides,
  setWasmModuleMock,
} from "@microblink/test-utils/mocks/wasmModuleFactory";
import { createFakeImageData } from "@microblink/test-utils/mocks/imageData";
import { createLicenseUnlockResult } from "@microblink/test-utils/mocks/licensing";
import { createScanningSessionMock } from "@microblink/test-utils/mocks/scanningSession";
import { BlinkIdWasmModule } from "@microblink/blinkid-wasm";

const getCrossOriginWorkerURLMock = vi.fn();
const downloadResourceBufferMock = vi.fn();
const detectWasmFeaturesMock = vi.fn();
const validateLicenseProxyPermissionsMock = vi.fn();
const sanitizeProxyUrlsMock = vi.fn();
const obtainNewServerPermissionMock = vi.fn();
let workerEventListeners = new Map<string, EventListener[]>();

/** Deterministic values for stubbed globals and mock return shapes. */
const hostName = "example.com" as const;
const userId = "test-user" as const;
const wasmVariant = "advanced-threads" as const;

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

vi.mock("@microblink/worker-common/getCrossOriginWorkerURL", () => ({
  getCrossOriginWorkerURL: getCrossOriginWorkerURLMock,
}));

vi.mock("@microblink/worker-common/downloadResourceBuffer", () => ({
  downloadResourceBuffer: downloadResourceBufferMock,
}));

vi.mock("@microblink/worker-common/wasm-feature-detect", () => ({
  detectWasmFeatures: detectWasmFeaturesMock,
}));

vi.mock("@microblink/worker-common/proxy-url-validator", () => ({
  validateLicenseProxyPermissions: validateLicenseProxyPermissionsMock,
  sanitizeProxyUrls: sanitizeProxyUrlsMock,
}));

vi.mock("@microblink/worker-common/licencing", () => ({
  obtainNewServerPermission: obtainNewServerPermissionMock,
}));

let BlinkIdWorker: typeof import("./BlinkIdWorker").BlinkIdWorker;

const getLatestWorkerListener = (type: string) => {
  const listeners = workerEventListeners.get(type);

  if (!listeners || listeners.length === 0) {
    return undefined;
  }

  return listeners[listeners.length - 1];
};

const getLastQueuedPinglet = (queuePingletMock: ReturnType<typeof vi.fn>) => {
  const serializedPinglet = queuePingletMock.mock.calls[
    queuePingletMock.mock.calls.length - 1
  ]?.[0] as string;

  return JSON.parse(serializedPinglet) as Record<string, unknown>;
};

const getLastQueuedPingletSessionNumber = (
  queuePingletMock: ReturnType<typeof vi.fn>,
): unknown =>
  queuePingletMock.mock.calls[queuePingletMock.mock.calls.length - 1]?.[3];

describe("BlinkIdWorker initBlinkId ping flush and proxy ordering", () => {
  const baseInitSettings = {
    licenseKey: "test-license",
    userId,
    resourcesLocation: "https://example.com/",
    useLightweightBuild: false,
  };
  const defaultSessionSettings = {} as BlinkIdSessionSettings;

  beforeEach(async () => {
    getCrossOriginWorkerURLMock.mockReset();
    downloadResourceBufferMock.mockReset();
    detectWasmFeaturesMock.mockReset();
    validateLicenseProxyPermissionsMock.mockReset();
    sanitizeProxyUrlsMock.mockReset();
    obtainNewServerPermissionMock.mockReset();

    workerEventListeners = new Map();

    // Deterministic hostname/userAgent so ping payload and runtime context are stable.
    vi.stubGlobal("self", {
      setTimeout: vi.fn(),
      close: vi.fn(),
      location: { hostname: hostName },
      navigator: { userAgent: "Chrome" },
      addEventListener: vi.fn(
        (type: string, listener: EventListenerOrEventListenerObject) => {
          const listeners = workerEventListeners.get(type) ?? [];
          listeners.push(listener as EventListener);
          workerEventListeners.set(type, listeners);
        },
      ),
      removeEventListener: vi.fn(
        (type: string, listener: EventListenerOrEventListenerObject) => {
          const listeners = workerEventListeners.get(type) ?? [];
          workerEventListeners.set(
            type,
            listeners.filter((entry) => entry !== listener),
          );
        },
      ),
    });

    // Worker loads wasm from this URL; mock factory serves the seeded module.
    const factoryUrl = new URL(
      "../../test-utils/src/mocks/wasmModuleFactory.ts",
      import.meta.url,
    ).href;
    getCrossOriginWorkerURLMock.mockResolvedValue(factoryUrl);
    detectWasmFeaturesMock.mockResolvedValue(wasmVariant);
    downloadResourceBufferMock.mockResolvedValue(new ArrayBuffer(0));
    sanitizeProxyUrlsMock.mockReturnValue({
      ping: "https://proxy.example.com/ping",
      baltazar: "https://proxy.example.com/api/v2/status/check",
    });

    ({ BlinkIdWorker } = await import("./BlinkIdWorker"));
  });

  afterEach(() => {
    setWasmModuleMock(null);
    resetLastModuleOverrides();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("does not flush pinglets after successful server permission flow", async () => {
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() =>
        createLicenseUnlockResult({
          unlockResult: "requires-server-permission",
        }),
      ),
    });
    obtainNewServerPermissionMock.mockResolvedValue("server-permission");
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId(baseInitSettings, defaultSessionSettings);

    expect(obtainNewServerPermissionMock).toHaveBeenCalledOnce();
    expect(spies.submitServerPermission).toHaveBeenCalledOnce();
    expect(spies.queuePinglet).toHaveBeenCalledOnce();
    expect(spies.sendPinglets).not.toHaveBeenCalled();
    expect(spies.initializeSdk).toHaveBeenCalledOnce();
    // Init pinglet is queued first; license and permission steps must complete before SDK init.
    expect(spies.queuePinglet.mock.invocationCallOrder[0]).toBeLessThan(
      obtainNewServerPermissionMock.mock.invocationCallOrder[0],
    );
    expect(
      spies.submitServerPermission.mock.invocationCallOrder[0],
    ).toBeLessThan(spies.initializeSdk.mock.invocationCallOrder[0]);
    expect(
      obtainNewServerPermissionMock.mock.invocationCallOrder[0],
    ).toBeLessThan(spies.initializeSdk.mock.invocationCallOrder[0]);
    expect(
      spies.initializeWithLicenseKey.mock.invocationCallOrder[0],
    ).toBeLessThan(spies.initializeSdk.mock.invocationCallOrder[0]);
    expect(spies.queuePinglet.mock.invocationCallOrder[0]).toBeLessThan(
      spies.initializeSdk.mock.invocationCallOrder[0],
    );
  });

  it("sets ping proxy URL when ping proxy is allowed without flushing pinglets", async () => {
    const proxyUrl = "https://proxy.example.com";
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() =>
        createLicenseUnlockResult({
          allowPingProxy: true,
          hasPing: true,
        }),
      ),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId(
      {
        ...baseInitSettings,
        microblinkProxyUrl: proxyUrl,
      },
      defaultSessionSettings,
    );

    expect(validateLicenseProxyPermissionsMock).toHaveBeenCalled();
    expect(sanitizeProxyUrlsMock).toHaveBeenCalledWith(proxyUrl);
    expect(spies.setPingProxyUrl).toHaveBeenCalledWith(`${proxyUrl}/ping`);
    expect(spies.initializeSdk).toHaveBeenCalledOnce();
    expect(spies.sendPinglets).not.toHaveBeenCalled();
    // Ping route must be set before SDK init so future pings use the proxy.
    expect(spies.setPingProxyUrl.mock.invocationCallOrder[0]).toBeLessThan(
      spies.initializeSdk.mock.invocationCallOrder[0],
    );
  });

  it("uses ping and baltazar proxies without flushing pinglets on successful init", async () => {
    const proxyUrl = "https://proxy.example.com";
    const licenseUnlockResult = createLicenseUnlockResult({
      unlockResult: "requires-server-permission",
      allowPingProxy: true,
      allowBaltazarProxy: true,
    });
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => licenseUnlockResult),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId(
      {
        ...baseInitSettings,
        microblinkProxyUrl: proxyUrl,
      },
      defaultSessionSettings,
    );

    expect(spies.initializeWithLicenseKey).toHaveBeenCalledOnce();
    expect(validateLicenseProxyPermissionsMock).toHaveBeenCalled();
    expect(sanitizeProxyUrlsMock).toHaveBeenCalledWith(proxyUrl);
    expect(spies.setPingProxyUrl).toHaveBeenCalledWith(`${proxyUrl}/ping`);
    const sanitizedBaltazar = "https://proxy.example.com/api/v2/status/check";
    expect(obtainNewServerPermissionMock).toHaveBeenCalledWith(
      licenseUnlockResult,
      sanitizedBaltazar,
    );
    expect(spies.queuePinglet).toHaveBeenCalledOnce();
    expect(obtainNewServerPermissionMock).toHaveBeenCalledOnce();
    expect(spies.submitServerPermission).toHaveBeenCalledOnce();
    expect(spies.initializeSdk).toHaveBeenCalledOnce();
    expect(spies.sendPinglets).not.toHaveBeenCalled();

    // Ping proxy is set before SDK init; permission flow completes before SDK init.
    expect(spies.setPingProxyUrl.mock.invocationCallOrder[0]).toBeLessThan(
      spies.initializeSdk.mock.invocationCallOrder[0],
    );
    expect(
      obtainNewServerPermissionMock.mock.invocationCallOrder[0],
    ).toBeLessThan(spies.initializeSdk.mock.invocationCallOrder[0]);
    expect(
      spies.submitServerPermission.mock.invocationCallOrder[0],
    ).toBeLessThan(spies.initializeSdk.mock.invocationCallOrder[0]);
    expect(
      spies.initializeWithLicenseKey.mock.invocationCallOrder[0],
    ).toBeLessThan(spies.initializeSdk.mock.invocationCallOrder[0]);
  });

  it("throws Error and does not send pinglets when server permission request fails", async () => {
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() =>
        createLicenseUnlockResult({
          unlockResult: "requires-server-permission",
        }),
      ),
    });
    setWasmModuleMock(module);
    const worker = new BlinkIdWorker();
    // obtainNewServerPermission fails (e.g. network); submitServerPermission is never reached.
    obtainNewServerPermissionMock.mockRejectedValue(new Error("network-error"));
    await expect(
      worker.initBlinkId(baseInitSettings, defaultSessionSettings),
    ).rejects.toThrow(Error);

    expect(spies.initializeWithLicenseKey).toHaveBeenCalledOnce();
    expect(spies.queuePinglet).toHaveBeenCalledOnce();
    expect(spies.sendPinglets).not.toHaveBeenCalled();
    expect(spies.submitServerPermission).not.toHaveBeenCalled();
    expect(spies.initializeSdk).not.toHaveBeenCalled();
    expect(
      spies.initializeWithLicenseKey.mock.invocationCallOrder[0],
    ).toBeLessThan(spies.queuePinglet.mock.invocationCallOrder[0]);
  });

  it("throws ServerPermissionError and does not send pinglets when submitServerPermission returns an error", async () => {
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() =>
        createLicenseUnlockResult({
          unlockResult: "requires-server-permission",
        }),
      ),
    });
    setWasmModuleMock(module);
    const worker = new BlinkIdWorker();
    obtainNewServerPermissionMock.mockResolvedValue("server-permission");
    spies.submitServerPermission.mockReturnValue({ error: "server-error" });

    await expect(
      worker.initBlinkId(baseInitSettings, defaultSessionSettings),
    ).rejects.toThrow(ServerPermissionError);

    expect(spies.initializeWithLicenseKey).toHaveBeenCalledOnce();
    expect(spies.queuePinglet).toHaveBeenCalledOnce();
    expect(obtainNewServerPermissionMock).toHaveBeenCalledOnce();
    expect(spies.submitServerPermission).toHaveBeenCalledWith(
      "server-permission",
    );
    expect(spies.sendPinglets).not.toHaveBeenCalled();
    expect(spies.initializeSdk).not.toHaveBeenCalled();
    expect(
      spies.initializeWithLicenseKey.mock.invocationCallOrder[0],
    ).toBeLessThan(spies.queuePinglet.mock.invocationCallOrder[0]);
  });

  it("queues crash pinglet and flushes when initializeSdk fails", async () => {
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() =>
        createLicenseUnlockResult({
          unlockResult: "requires-server-permission",
        }),
      ),
    });
    setWasmModuleMock(module);
    const worker = new BlinkIdWorker();

    // The init start pinglet is already queued; initializeSdk failure adds ping.error
    // and the init catch block flushes after recording the error.
    spies.initializeSdk.mockImplementation(() => {
      throw new Error("initializeSdk-error");
    });
    await expect(
      worker.initBlinkId(baseInitSettings, defaultSessionSettings),
    ).rejects.toThrow(Error);

    expect(spies.initializeWithLicenseKey).toHaveBeenCalledOnce();
    expect(spies.queuePinglet).toHaveBeenCalledTimes(2);
    expect(spies.sendPinglets).toHaveBeenCalledOnce();
    expect(spies.submitServerPermission).toHaveBeenCalledOnce();
    expect(spies.initializeSdk).toHaveBeenCalledOnce();
    expect(
      spies.initializeWithLicenseKey.mock.invocationCallOrder[0],
    ).toBeLessThan(spies.queuePinglet.mock.invocationCallOrder[0]);
    expect(spies.initializeSdk.mock.invocationCallOrder[0]).greaterThan(
      spies.queuePinglet.mock.invocationCallOrder[0],
    );
    expect(getLastQueuedPinglet(spies.queuePinglet)).toMatchObject({
      errorType: "Crash",
      errorMessage: "initializeSdk-error",
    });
  });

  it("reports worker error events as crash pinglets after init", async () => {
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId(baseInitSettings, defaultSessionSettings);

    spies.queuePinglet.mockClear();
    spies.sendPinglets.mockClear();

    getLatestWorkerListener("error")?.({
      error: new Error("boom"),
      message: "boom",
    } as unknown as Event);

    expect(spies.queuePinglet).toHaveBeenCalledTimes(1);
    expect(spies.sendPinglets).toHaveBeenCalledTimes(1);
    expect(getLastQueuedPinglet(spies.queuePinglet)).toMatchObject({
      errorType: "Crash",
      errorMessage: "boom",
    });
  });

  it("reports unhandled rejections as crash pinglets after init", async () => {
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId(baseInitSettings, defaultSessionSettings);

    spies.queuePinglet.mockClear();
    spies.sendPinglets.mockClear();

    getLatestWorkerListener("unhandledrejection")?.({
      reason: new Error("rejected"),
    } as unknown as Event);

    expect(spies.queuePinglet).toHaveBeenCalledTimes(1);
    expect(spies.sendPinglets).toHaveBeenCalledTimes(1);
    expect(getLastQueuedPinglet(spies.queuePinglet)).toMatchObject({
      errorType: "Crash",
      errorMessage: "rejected",
    });
  });

  it("reports Emscripten aborts as crash pinglets after init", async () => {
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId(baseInitSettings, defaultSessionSettings);

    spies.queuePinglet.mockClear();
    spies.sendPinglets.mockClear();

    const moduleOverrides = getLastModuleOverrides();
    expect(moduleOverrides?.onAbort).toEqual(expect.any(Function));

    (moduleOverrides?.onAbort as (what: unknown) => void)("fatal abort");

    expect(spies.queuePinglet).toHaveBeenCalledTimes(1);
    expect(spies.sendPinglets).toHaveBeenCalledTimes(1);
    expect(getLastQueuedPinglet(spies.queuePinglet)).toMatchObject({
      errorType: "Crash",
      errorMessage: "fatal abort",
    });
  });

  it("reports scanning session creation failures as crash pinglets", async () => {
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
      createScanningSession: vi.fn(() => {
        throw new Error("session-create-failed");
      }),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId(baseInitSettings, defaultSessionSettings);

    spies.queuePinglet.mockClear();
    spies.sendPinglets.mockClear();

    expect(() => worker.createScanningSession()).toThrow(
      "session-create-failed",
    );
    expect(spies.queuePinglet).toHaveBeenCalledTimes(1);
    expect(spies.sendPinglets).toHaveBeenCalledTimes(1);
    expect(getLastQueuedPinglet(spies.queuePinglet)).toMatchObject({
      errorType: "Crash",
      errorMessage: "session-create-failed",
    });
  });

  it("reports thrown process calls as non-fatal pinglets", async () => {
    const session = createScanningSessionMock<BlinkIdScanningSession>({
      process: vi.fn(() => {
        throw new Error("process-failed");
      }),
    });
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
      createScanningSession: vi.fn(() => session),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId(baseInitSettings, defaultSessionSettings);

    const proxySession = worker.createScanningSession();
    spies.queuePinglet.mockClear();
    spies.sendPinglets.mockClear();

    expect(() => proxySession.process(createFakeImageData())).toThrow(
      "process-failed",
    );
    expect(spies.queuePinglet).toHaveBeenCalledTimes(1);
    expect(spies.sendPinglets).toHaveBeenCalledTimes(1);
    expect(getLastQueuedPinglet(spies.queuePinglet)).toMatchObject({
      errorType: "NonFatal",
      errorMessage: "process-failed",
    });
    expect(getLastQueuedPingletSessionNumber(spies.queuePinglet)).toBe(1);
  });

  it("reports process failures as non-fatal pinglets", async () => {
    const session = createScanningSessionMock<BlinkIdScanningSession>({
      process: vi.fn(() => {
        throw new Error("RuntimeError: Out of bounds memory access");
      }),
    });
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
      createScanningSession: vi.fn(() => session),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId(baseInitSettings, defaultSessionSettings);

    const proxySession = worker.createScanningSession();
    spies.queuePinglet.mockClear();
    spies.sendPinglets.mockClear();

    expect(() => proxySession.process(createFakeImageData())).toThrow(
      "RuntimeError: Out of bounds memory access",
    );
    expect(spies.queuePinglet).toHaveBeenCalledTimes(1);
    expect(spies.sendPinglets).toHaveBeenCalledTimes(1);
    expect(getLastQueuedPinglet(spies.queuePinglet)).toMatchObject({
      errorType: "NonFatal",
      errorMessage: "RuntimeError: Out of bounds memory access",
    });
    expect(getLastQueuedPingletSessionNumber(spies.queuePinglet)).toBe(1);
  });

  it("reports frame return transfer failures as crash pinglets", async () => {
    const transferSpy = vi
      .spyOn(Comlink, "transfer")
      .mockImplementationOnce(() => {
        throw new Error("buffer-transfer-failed");
      });
    const session = createScanningSessionMock<BlinkIdScanningSession>({
      process: vi.fn(
        () =>
          ({
            inputImageAnalysisResult: {
              documentClassInfo: {},
              documentRotation: "not-available",
            },
          }) as never,
      ),
    });
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
      createScanningSession: vi.fn(() => session),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId(baseInitSettings, defaultSessionSettings);

    const proxySession = worker.createScanningSession();
    spies.queuePinglet.mockClear();
    spies.sendPinglets.mockClear();

    expect(() => proxySession.process(createFakeImageData())).toThrow(
      "Failed to transfer frame from worker: buffer-transfer-failed",
    );
    expect(spies.queuePinglet).toHaveBeenCalledTimes(1);
    expect(spies.sendPinglets).toHaveBeenCalledTimes(1);
    expect(getLastQueuedPinglet(spies.queuePinglet)).toMatchObject({
      errorType: "Crash",
      errorMessage:
        "Failed to transfer frame from worker: buffer-transfer-failed",
    });

    transferSpy.mockRestore();
  });

  it("reports sentinel process results as non-fatal pinglets", async () => {
    const session = createScanningSessionMock<BlinkIdScanningSession>({
      process: vi.fn(() => ({ error: "document-scanned" as const })),
    });
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
      createScanningSession: vi.fn(() => session),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId(baseInitSettings, defaultSessionSettings);

    const proxySession = worker.createScanningSession();
    spies.queuePinglet.mockClear();
    spies.sendPinglets.mockClear();

    const result = proxySession.process(createFakeImageData());

    expect(result).toMatchObject({ error: "document-scanned" });
    expect(spies.queuePinglet).toHaveBeenCalledTimes(1);
    expect(spies.sendPinglets).toHaveBeenCalledTimes(1);
    expect(getLastQueuedPinglet(spies.queuePinglet)).toMatchObject({
      errorType: "NonFatal",
      errorMessage: "document-scanned",
    });
    expect(getLastQueuedPingletSessionNumber(spies.queuePinglet)).toBe(1);
  });

  it("reports getResult failures as non-fatal pinglets", async () => {
    const session = createScanningSessionMock<BlinkIdScanningSession>({
      getResult: vi.fn(() => {
        throw new Error("get-result-failed");
      }),
    });
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
      createScanningSession: vi.fn(() => session),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId(baseInitSettings, defaultSessionSettings);

    const proxySession = worker.createScanningSession();
    spies.queuePinglet.mockClear();
    spies.sendPinglets.mockClear();

    expect(() => proxySession.getResult()).toThrow("get-result-failed");
    expect(spies.queuePinglet).toHaveBeenCalledTimes(1);
    expect(spies.sendPinglets).toHaveBeenCalledTimes(1);
    expect(getLastQueuedPinglet(spies.queuePinglet)).toMatchObject({
      errorType: "NonFatal",
      errorMessage: "get-result-failed",
    });
    expect(getLastQueuedPingletSessionNumber(spies.queuePinglet)).toBe(1);
  });

  it("reports reset failures as non-fatal pinglets", async () => {
    const session = createScanningSessionMock<BlinkIdScanningSession>({
      reset: vi.fn(() => {
        throw new Error("reset-failed");
      }),
    });
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
      createScanningSession: vi.fn(() => session),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId(baseInitSettings, defaultSessionSettings);

    const proxySession = worker.createScanningSession();
    spies.queuePinglet.mockClear();
    spies.sendPinglets.mockClear();

    expect(() => proxySession.reset()).toThrow("reset-failed");
    expect(spies.queuePinglet).toHaveBeenCalledTimes(1);
    expect(spies.sendPinglets).toHaveBeenCalledTimes(1);
    expect(getLastQueuedPinglet(spies.queuePinglet)).toMatchObject({
      errorType: "NonFatal",
      errorMessage: "reset-failed",
    });
    expect(getLastQueuedPingletSessionNumber(spies.queuePinglet)).toBe(1);
  });

  it("uses baltazar proxy for server permission and does not set ping proxy URL", async () => {
    const proxyUrl = "https://proxy.example.com";
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() =>
        createLicenseUnlockResult({
          unlockResult: "requires-server-permission",
          allowBaltazarProxy: true,
        }),
      ),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId(
      {
        ...baseInitSettings,
        microblinkProxyUrl: proxyUrl,
      },
      defaultSessionSettings,
    );

    expect(spies.initializeWithLicenseKey).toHaveBeenCalledOnce();
    expect(validateLicenseProxyPermissionsMock).toHaveBeenCalled();
    expect(sanitizeProxyUrlsMock).toHaveBeenCalledWith(proxyUrl);
    expect(spies.setPingProxyUrl).not.toHaveBeenCalled();
    expect(obtainNewServerPermissionMock).toHaveBeenCalledWith(
      expect.anything(),
      "https://proxy.example.com/api/v2/status/check",
    );
    expect(spies.queuePinglet).toHaveBeenCalledOnce();
    expect(obtainNewServerPermissionMock).toHaveBeenCalledOnce();
    expect(spies.submitServerPermission).toHaveBeenCalledOnce();
    expect(spies.initializeSdk).toHaveBeenCalledOnce();
    expect(spies.sendPinglets).not.toHaveBeenCalled();

    // allowPingProxy is false so ping proxy is not set; permission flow order unchanged.
    expect(
      obtainNewServerPermissionMock.mock.invocationCallOrder[0],
    ).toBeLessThan(spies.initializeSdk.mock.invocationCallOrder[0]);
    expect(
      spies.submitServerPermission.mock.invocationCallOrder[0],
    ).toBeLessThan(spies.initializeSdk.mock.invocationCallOrder[0]);
    expect(
      spies.initializeWithLicenseKey.mock.invocationCallOrder[0],
    ).toBeLessThan(spies.initializeSdk.mock.invocationCallOrder[0]);
  });

  it("throws LicenseError and does not send pinglets when license is invalid", async () => {
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() =>
        createLicenseUnlockResult({
          licenseError: "INVALID_LICENSE",
          unlockResult: "invalid",
        }),
      ),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();

    await expect(
      worker.initBlinkId(baseInitSettings, defaultSessionSettings),
    ).rejects.toThrow(LicenseError);

    expect(spies.initializeWithLicenseKey).toHaveBeenCalledOnce();
    expect(spies.queuePinglet).toHaveBeenCalledOnce();
    expect(spies.sendPinglets).not.toHaveBeenCalled();
    expect(spies.submitServerPermission).not.toHaveBeenCalled();
    expect(spies.initializeSdk).not.toHaveBeenCalled();
    expect(
      spies.initializeWithLicenseKey.mock.invocationCallOrder[0],
    ).toBeLessThan(spies.queuePinglet.mock.invocationCallOrder[0]);
  });
});
