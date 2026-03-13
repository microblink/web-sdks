/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type { BlinkIdSessionSettings } from "@microblink/blinkid-wasm";
import {
  LicenseError,
  ServerPermissionError,
} from "@microblink/worker-common/errors";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createWasmModuleMock,
  setWasmModuleMock,
} from "@microblink/test-utils/mocks/wasmModuleFactory";
import { createLicenseUnlockResult } from "@microblink/test-utils/mocks/licensing";
import { BlinkIdWasmModule } from "@microblink/blinkid-wasm";

const getCrossOriginWorkerURLMock = vi.fn();
const downloadResourceBufferMock = vi.fn();
const detectWasmFeaturesMock = vi.fn();
const validateLicenseProxyPermissionsMock = vi.fn();
const sanitizeProxyUrlsMock = vi.fn();
const obtainNewServerPermissionMock = vi.fn();

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

    // Deterministic hostname/userAgent so ping payload and runtime context are stable.
    vi.stubGlobal("self", {
      setTimeout: vi.fn(),
      close: vi.fn(),
      location: { hostname: hostName },
      navigator: { userAgent: "Chrome" },
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
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("sends pinglets only after server permission flow completes", async () => {
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
    expect(spies.sendPinglets).toHaveBeenCalledOnce();
    expect(spies.initializeSdk).toHaveBeenCalledOnce();
    // Init pinglet is queued first; license and permission steps must complete before flush.
    expect(spies.queuePinglet.mock.invocationCallOrder[0]).toBeLessThan(
      obtainNewServerPermissionMock.mock.invocationCallOrder[0],
    );
    expect(
      spies.submitServerPermission.mock.invocationCallOrder[0],
    ).toBeLessThan(spies.sendPinglets.mock.invocationCallOrder[0]);
    expect(
      obtainNewServerPermissionMock.mock.invocationCallOrder[0],
    ).toBeLessThan(spies.sendPinglets.mock.invocationCallOrder[0]);
    expect(
      spies.initializeWithLicenseKey.mock.invocationCallOrder[0],
    ).toBeLessThan(spies.sendPinglets.mock.invocationCallOrder[0]);
    expect(spies.initializeSdk.mock.invocationCallOrder[0]).toBeLessThan(
      spies.sendPinglets.mock.invocationCallOrder[0],
    );
  });

  it("sets ping proxy URL before sending pinglets when ping proxy is allowed", async () => {
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
    expect(spies.sendPinglets).toHaveBeenCalledOnce();
    // Ping route must be set before flush so pings go through the proxy.
    expect(spies.setPingProxyUrl.mock.invocationCallOrder[0]).toBeLessThan(
      spies.sendPinglets.mock.invocationCallOrder[0],
    );
  });

  it("uses ping and baltazar proxies and flushes pinglets after permission flow", async () => {
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
    expect(spies.sendPinglets).toHaveBeenCalledOnce();

    // Ping proxy set before flush; permission flow completes before flush.
    expect(spies.setPingProxyUrl.mock.invocationCallOrder[0]).toBeLessThan(
      spies.sendPinglets.mock.invocationCallOrder[0],
    );
    expect(
      obtainNewServerPermissionMock.mock.invocationCallOrder[0],
    ).toBeLessThan(spies.sendPinglets.mock.invocationCallOrder[0]);
    expect(
      spies.submitServerPermission.mock.invocationCallOrder[0],
    ).toBeLessThan(spies.sendPinglets.mock.invocationCallOrder[0]);
    expect(
      spies.initializeWithLicenseKey.mock.invocationCallOrder[0],
    ).toBeLessThan(spies.sendPinglets.mock.invocationCallOrder[0]);
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

  it("throws and does send pinglets when initializeSdk fails", async () => {
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() =>
        createLicenseUnlockResult({
          unlockResult: "requires-server-permission",
        }),
      ),
    });
    setWasmModuleMock(module);
    const worker = new BlinkIdWorker();

    // Flush happens after initializeSdk; failure must leave pinglets buffered.
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
    expect(
      spies.initializeWithLicenseKey.mock.invocationCallOrder[0],
    ).toBeLessThan(spies.queuePinglet.mock.invocationCallOrder[1]);
    expect(spies.initializeSdk.mock.invocationCallOrder[0]).greaterThan(
      spies.queuePinglet.mock.invocationCallOrder[0],
    );
    expect(spies.initializeSdk.mock.invocationCallOrder[0]).toBeLessThan(
      spies.queuePinglet.mock.invocationCallOrder[1],
    );
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
    expect(spies.sendPinglets).toHaveBeenCalledOnce();

    // allowPingProxy is false so ping proxy is not set; permission flow order unchanged.
    expect(
      obtainNewServerPermissionMock.mock.invocationCallOrder[0],
    ).toBeLessThan(spies.sendPinglets.mock.invocationCallOrder[0]);
    expect(
      spies.submitServerPermission.mock.invocationCallOrder[0],
    ).toBeLessThan(spies.sendPinglets.mock.invocationCallOrder[0]);
    expect(
      spies.initializeWithLicenseKey.mock.invocationCallOrder[0],
    ).toBeLessThan(spies.sendPinglets.mock.invocationCallOrder[0]);
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
