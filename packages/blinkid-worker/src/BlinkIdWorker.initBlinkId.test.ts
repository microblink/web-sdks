/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  BlinkIdProcessResult,
  BlinkIdScanningSession,
  BlinkIdSessionSettings,
  DocumentClassInfo,
  RedactionSettings,
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
import { type RedactionSettingsResolver } from "./BlinkIdWorker";
import type { BlinkIdOtaResource } from "./otaResources";

const getCrossOriginWorkerURLMock = vi.fn();
const downloadResourceBufferMock = vi.fn();
const detectWasmFeaturesMock = vi.fn();
const validateLicenseProxyPermissionsMock = vi.fn();
const sanitizeProxyUrlsMock = vi.fn();
const obtainNewServerPermissionMock = vi.fn();
const resolveBlinkIdOtaResourcesMock = vi.fn();
const resolveBlinkIdOtaResourcesFromLocationMock = vi.fn();
const selectBlinkIdOtaResourcesMock = vi.fn();
const writeBlinkIdOtaResourcesToMemfsMock = vi.fn();
let workerEventListeners = new Map<string, EventListener[]>();

/** Deterministic values for stubbed globals and mock return shapes. */
const hostName = "example.com" as const;
const userId = "test-user" as const;
const wasmVariant = "simd-threads" as const;
const otaResourcesPath = "/microblink/blinkid-ota" as const;
const defaultOtaProviderUrl = "https://blinkid-ota.microblink.com";

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

vi.mock(
  "@microblink/worker-common/proxy-url-validator",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("@microblink/worker-common/proxy-url-validator")
      >();
    return {
      ...actual,
      validateLicenseProxyPermissions: validateLicenseProxyPermissionsMock,
      sanitizeProxyUrls: sanitizeProxyUrlsMock,
    };
  },
);

vi.mock("@microblink/worker-common/licencing", () => ({
  obtainNewServerPermission: obtainNewServerPermissionMock,
}));

vi.mock("./otaResources", () => ({
  BLINK_ID_OTA_RESOURCES_DIRECTORY: "ota-resources",
  BLINK_ID_OTA_RESOURCES_PATH: otaResourcesPath,
  resolveBlinkIdOtaResources: resolveBlinkIdOtaResourcesMock,
  resolveBlinkIdOtaResourcesFromLocation:
    resolveBlinkIdOtaResourcesFromLocationMock,
  selectBlinkIdOtaResources: selectBlinkIdOtaResourcesMock,
  writeBlinkIdOtaResourcesToMemfs: writeBlinkIdOtaResourcesToMemfsMock,
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

  beforeEach(async () => {
    getCrossOriginWorkerURLMock.mockReset();
    downloadResourceBufferMock.mockReset();
    detectWasmFeaturesMock.mockReset();
    validateLicenseProxyPermissionsMock.mockReset();
    sanitizeProxyUrlsMock.mockReset();
    obtainNewServerPermissionMock.mockReset();
    resolveBlinkIdOtaResourcesMock.mockReset();
    resolveBlinkIdOtaResourcesFromLocationMock.mockReset();
    selectBlinkIdOtaResourcesMock.mockReset();
    writeBlinkIdOtaResourcesToMemfsMock.mockReset();

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
    const providerResources = [
      {
        filename: "template-database.zzip",
        version: "1.0.1",
        url: "provider-template-url",
      },
    ];
    resolveBlinkIdOtaResourcesMock.mockResolvedValue(providerResources);
    const hostedResources = [
      {
        filename: "template-database.zzip",
        version: "1.0.0",
        url: "https://example.com/resources/ota-resources/template-database_1.0.zzip",
      },
    ];
    resolveBlinkIdOtaResourcesFromLocationMock.mockResolvedValue(
      hostedResources,
    );
    selectBlinkIdOtaResourcesMock.mockImplementation(
      (_hosted: BlinkIdOtaResource[], provider: BlinkIdOtaResource[]) =>
        provider,
    );
    writeBlinkIdOtaResourcesToMemfsMock.mockResolvedValue(otaResourcesPath);
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
    await worker.initBlinkId(baseInitSettings);

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
    await worker.initBlinkId({
      ...baseInitSettings,
      microblinkProxyUrl: proxyUrl,
    });

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

  it("loads OTA resources by default using the default provider URL and recognizer version", async () => {
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
      getRecognizerVersion: vi.fn(() => "2.3.4"),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId(baseInitSettings);

    expect(resolveBlinkIdOtaResourcesMock).toHaveBeenCalledWith({
      resourceProviderUrl: defaultOtaProviderUrl,
      genericVersion: "2.3.4",
    });
    expect(resolveBlinkIdOtaResourcesFromLocationMock).toHaveBeenCalledWith({
      resourcesLocation: "https://example.com/resources/ota-resources",
      timeoutMilis: undefined,
    });
    expect(writeBlinkIdOtaResourcesToMemfsMock).toHaveBeenCalledWith({
      module,
      resources: [
        {
          filename: "template-database.zzip",
          version: "1.0.1",
          url: "provider-template-url",
        },
      ],
      directory: otaResourcesPath,
      fallbackOnError: true,
      timeoutMilis: undefined,
    });
    expect(spies.initializeSdk).toHaveBeenCalledOnce();
  });

  it("writes the resources selected from hosted and provider manifests", async () => {
    const selectedResources = [
      {
        filename: "template-database.zzip",
        version: "1.0.2",
        url: "provider-template-url",
        fallbackUrl: "hosted-template-url",
      },
    ];
    selectBlinkIdOtaResourcesMock.mockReturnValue(selectedResources);
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId(baseInitSettings);

    expect(selectBlinkIdOtaResourcesMock).toHaveBeenCalledWith(
      [
        {
          filename: "template-database.zzip",
          version: "1.0.0",
          url: "https://example.com/resources/ota-resources/template-database_1.0.zzip",
        },
      ],
      [
        {
          filename: "template-database.zzip",
          version: "1.0.1",
          url: "provider-template-url",
        },
      ],
    );
    expect(writeBlinkIdOtaResourcesToMemfsMock).toHaveBeenCalledWith({
      module,
      resources: selectedResources,
      directory: otaResourcesPath,
      fallbackOnError: true,
      timeoutMilis: undefined,
    });
    expect(spies.initializeSdk).toHaveBeenCalledOnce();
  });

  it("loads hosted resources without contacting the provider when checkForUpdates is false", async () => {
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId({
      ...baseInitSettings,
      otaResources: {
        checkForUpdates: false,
      },
    });

    expect(resolveBlinkIdOtaResourcesMock).not.toHaveBeenCalled();
    expect(selectBlinkIdOtaResourcesMock).not.toHaveBeenCalled();
    expect(resolveBlinkIdOtaResourcesFromLocationMock).toHaveBeenCalledWith({
      resourcesLocation: "https://example.com/resources/ota-resources",
      timeoutMilis: undefined,
    });
    expect(writeBlinkIdOtaResourcesToMemfsMock).toHaveBeenCalledWith({
      module,
      resources: [
        {
          filename: "template-database.zzip",
          version: "1.0.0",
          url: "https://example.com/resources/ota-resources/template-database_1.0.zzip",
        },
      ],
      directory: otaResourcesPath,
      fallbackOnError: true,
      timeoutMilis: undefined,
    });
    expect(spies.initializeSdk).toHaveBeenCalledOnce();
  });

  it("uses a custom hosted location and still checks the configured provider", async () => {
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId({
      ...baseInitSettings,
      otaResources: {
        checkForUpdates: true,
        resourcesLocation: "  https://cdn.example.com/ota  ",
        otaResourceProviderUrl: "https://ota.example.com",
      },
    });

    expect(resolveBlinkIdOtaResourcesFromLocationMock).toHaveBeenCalledWith({
      resourcesLocation: "https://cdn.example.com/ota",
      timeoutMilis: undefined,
    });
    expect(resolveBlinkIdOtaResourcesMock).toHaveBeenCalledWith({
      resourceProviderUrl: "https://ota.example.com",
      genericVersion: "1.0.0",
    });
    expect(spies.getRecognizerVersion).toHaveBeenCalledOnce();
    expect(spies.initializeSdk).toHaveBeenCalledOnce();
  });

  it("loads OTA resources before initializing the SDK", async () => {
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId({
      ...baseInitSettings,
      otaResources: {
        checkForUpdates: true,
        otaResourceProviderUrl: "https://ota.example.com",
      },
    });

    expect(resolveBlinkIdOtaResourcesMock).toHaveBeenCalledWith({
      resourceProviderUrl: "https://ota.example.com",
      genericVersion: "1.0.0",
    });
    expect(writeBlinkIdOtaResourcesToMemfsMock).toHaveBeenCalledWith({
      module,
      resources: [
        {
          filename: "template-database.zzip",
          version: "1.0.1",
          url: "provider-template-url",
        },
      ],
      directory: otaResourcesPath,
      fallbackOnError: true,
      timeoutMilis: undefined,
    });
    expect(
      writeBlinkIdOtaResourcesToMemfsMock.mock.invocationCallOrder[0],
    ).toBeLessThan(spies.initializeSdk.mock.invocationCallOrder[0]);
  });

  it("trims OTA provider URL and recognizer version before resolving resources", async () => {
    const { module } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
      getRecognizerVersion: vi.fn(() => "  2.3.4  "),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId({
      ...baseInitSettings,
      otaResources: {
        checkForUpdates: true,
        otaResourceProviderUrl: "  https://ota.example.com  ",
      },
    });

    expect(resolveBlinkIdOtaResourcesMock).toHaveBeenCalledWith({
      resourceProviderUrl: "https://ota.example.com",
      genericVersion: "2.3.4",
    });
  });

  it("uses the default OTA provider URL when the override is blank", async () => {
    const { module } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId({
      ...baseInitSettings,
      otaResources: {
        checkForUpdates: true,
        otaResourceProviderUrl: "   ",
      },
    });

    expect(resolveBlinkIdOtaResourcesMock).toHaveBeenCalledWith({
      resourceProviderUrl: defaultOtaProviderUrl,
      genericVersion: "1.0.0",
    });
  });

  it("falls back to hosted resources when recognizer version is blank", async () => {
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
      getRecognizerVersion: vi.fn(() => "   "),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId(baseInitSettings);

    expect(resolveBlinkIdOtaResourcesMock).not.toHaveBeenCalled();
    expect(writeBlinkIdOtaResourcesToMemfsMock).toHaveBeenCalledWith({
      module,
      resources: [
        {
          filename: "template-database.zzip",
          version: "1.0.0",
          url: "https://example.com/resources/ota-resources/template-database_1.0.zzip",
        },
      ],
      directory: otaResourcesPath,
      fallbackOnError: true,
      timeoutMilis: undefined,
    });
    expect(spies.initializeWithLicenseKey).toHaveBeenCalledOnce();
    expect(spies.initializeSdk).toHaveBeenCalledOnce();
  });

  it("does not pass the loaded OTA resources path to created scanning sessions", async () => {
    const session = createScanningSessionMock<BlinkIdScanningSession>();
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
      createScanningSession: vi.fn(() => session),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId({
      ...baseInitSettings,
      otaResources: {
        checkForUpdates: true,
        otaResourceProviderUrl: "https://ota.example.com",
      },
    });
    worker.createScanningSession({ inputImageSource: "photo" });

    expect(spies.createScanningSession).toHaveBeenCalledWith(
      {
        inputImageSource: "photo",
      },
      userId,
    );
  });

  it("falls back to hosted resources when the provider request fails", async () => {
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
    });
    setWasmModuleMock(module);
    resolveBlinkIdOtaResourcesMock.mockRejectedValue(new Error("ota-failed"));

    const worker = new BlinkIdWorker();
    await worker.initBlinkId({
      ...baseInitSettings,
      otaResources: {
        checkForUpdates: true,
        otaResourceProviderUrl: "https://ota.example.com",
      },
    });

    expect(writeBlinkIdOtaResourcesToMemfsMock).toHaveBeenCalledWith({
      module,
      resources: [
        {
          filename: "template-database.zzip",
          version: "1.0.0",
          url: "https://example.com/resources/ota-resources/template-database_1.0.zzip",
        },
      ],
      directory: otaResourcesPath,
      fallbackOnError: true,
      timeoutMilis: undefined,
    });
    expect(spies.initializeWithLicenseKey).toHaveBeenCalledOnce();
    expect(spies.initializeSdk).toHaveBeenCalledOnce();
  });

  it("fails initialization when the hosted manifest is unavailable", async () => {
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
    });
    setWasmModuleMock(module);
    resolveBlinkIdOtaResourcesFromLocationMock.mockRejectedValue(
      new Error("manifest-missing"),
    );

    const worker = new BlinkIdWorker();
    await expect(worker.initBlinkId(baseInitSettings)).rejects.toThrow(
      "manifest-missing",
    );

    expect(resolveBlinkIdOtaResourcesMock).not.toHaveBeenCalled();
    expect(writeBlinkIdOtaResourcesToMemfsMock).not.toHaveBeenCalled();
    expect(spies.initializeWithLicenseKey).not.toHaveBeenCalled();
    expect(spies.initializeSdk).not.toHaveBeenCalled();
  });

  it("fails initialization when strict OTA fails", async () => {
    const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
    });
    setWasmModuleMock(module);
    resolveBlinkIdOtaResourcesMock.mockRejectedValue(new Error("ota-failed"));

    const worker = new BlinkIdWorker();
    await expect(
      worker.initBlinkId({
        ...baseInitSettings,
        otaResources: {
          checkForUpdates: true,
          otaResourceProviderUrl: "https://ota.example.com",
          strict: true,
        },
      }),
    ).rejects.toThrow("ota-failed");

    expect(spies.initializeWithLicenseKey).not.toHaveBeenCalled();
    expect(spies.initializeSdk).not.toHaveBeenCalled();
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
    await worker.initBlinkId({
      ...baseInitSettings,
      microblinkProxyUrl: proxyUrl,
    });

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
    await expect(worker.initBlinkId(baseInitSettings)).rejects.toThrow(Error);

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

    await expect(worker.initBlinkId(baseInitSettings)).rejects.toThrow(
      ServerPermissionError,
    );

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
    await expect(worker.initBlinkId(baseInitSettings)).rejects.toThrow(Error);

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
    await worker.initBlinkId(baseInitSettings);

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
    await worker.initBlinkId(baseInitSettings);

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
    await worker.initBlinkId(baseInitSettings);

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
    await worker.initBlinkId(baseInitSettings);

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
    await worker.initBlinkId(baseInitSettings);

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
    await worker.initBlinkId(baseInitSettings);

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
    await worker.initBlinkId(baseInitSettings);

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

  // todo
  //   it("reports sentinel process results as non-fatal pinglets", async () => {
  //     const session = createScanningSessionMock<BlinkIdScanningSession>({
  //       process: vi.fn(() => {
  //         throw new Error("document-scanned");
  //       }),
  //     });
  //     const { module, spies } = createWasmModuleMock<BlinkIdWasmModule>({
  //       initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
  //       createScanningSession: vi.fn(() => session),
  //     });
  //     setWasmModuleMock(module);

  //     const worker = new BlinkIdWorker();
  //     await worker.initBlinkId(baseInitSettings);

  //     const proxySession = worker.createScanningSession();
  //     spies.queuePinglet.mockClear();
  //     spies.sendPinglets.mockClear();

  //     const result = proxySession.process(createFakeImageData());

  //     expect(result).toMatchObject({ error: "document-scanned" });
  //     expect(spies.queuePinglet).toHaveBeenCalledTimes(1);
  //     expect(spies.sendPinglets).toHaveBeenCalledTimes(1);
  //     expect(getLastQueuedPinglet(spies.queuePinglet)).toMatchObject({
  //       errorType: "NonFatal",
  //       errorMessage: "document-scanned",
  //     });
  //     expect(getLastQueuedPingletSessionNumber(spies.queuePinglet)).toBe(1);
  //   });

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
    await worker.initBlinkId(baseInitSettings);

    const proxySession = worker.createScanningSession();
    spies.queuePinglet.mockClear();
    spies.sendPinglets.mockClear();

    await expect(proxySession.getResult()).rejects.toThrow("get-result-failed");
    expect(spies.queuePinglet).toHaveBeenCalledTimes(1);
    expect(spies.sendPinglets).toHaveBeenCalledTimes(1);
    expect(getLastQueuedPinglet(spies.queuePinglet)).toMatchObject({
      errorType: "NonFatal",
      errorMessage: "get-result-failed",
    });
    expect(getLastQueuedPingletSessionNumber(spies.queuePinglet)).toBe(1);
  });

  it("calls wasm getResult without custom settings when resolver is not configured", async () => {
    const session = createScanningSessionMock<BlinkIdScanningSession>({
      getResult: vi.fn(),
    });
    const { module } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
      createScanningSession: vi.fn(() => session),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId(baseInitSettings);

    const proxySession = worker.createScanningSession();
    await proxySession.getResult();

    expect(session.getResult).toHaveBeenCalledWith();
  });

  it("resolves redaction settings in worker from cached class info before getResult", async () => {
    const documentClassInfo = {
      country: { id: "germany", rawValue: "GERMANY" },
      region: undefined,
      documentType: { id: "id", rawValue: "ID" },
      countryName: "Germany",
      isoNumericCountryCode: "276",
      isoAlpha2CountryCode: "DE",
      isoAlpha3CountryCode: "DEU",
    } satisfies DocumentClassInfo;
    const processResult = {
      inputImageAnalysisResult: {
        documentClassInfo,
        documentRotation: "not-available",
      },
    } as BlinkIdProcessResult;
    const redactionSettings = {
      mode: "result-fields-only",
      fields: ["lastName"],
      redactMrz: false,
      redactBarcode: false,
    } satisfies RedactionSettings;
    const redactionSettingsResolver = vi.fn(() => redactionSettings);
    const session = createScanningSessionMock<BlinkIdScanningSession>({
      process: vi.fn(() => processResult),
      getResult: vi.fn(),
    });
    const { module } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
      createScanningSession: vi.fn(() => session),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId(baseInitSettings);

    const proxySession = worker.createScanningSession(undefined, {
      redactionSettingsResolver,
    });
    proxySession.process(createFakeImageData());
    await proxySession.getResult();

    expect(redactionSettingsResolver).toHaveBeenCalledWith(
      documentClassInfo,
      expect.any(Function),
    );
    expect(session.getResult).toHaveBeenCalledWith(redactionSettings);
  });

  it("keeps SDK default redaction when resolver returns undefined", async () => {
    const documentClassInfo = {
      country: { id: "germany", rawValue: "GERMANY" },
      region: undefined,
      documentType: { id: "id", rawValue: "ID" },
      countryName: "Germany",
      isoNumericCountryCode: "276",
      isoAlpha2CountryCode: "DE",
      isoAlpha3CountryCode: "DEU",
    } satisfies DocumentClassInfo;
    const processResult = {
      inputImageAnalysisResult: {
        documentClassInfo,
        documentRotation: "not-available",
      },
    } as BlinkIdProcessResult;
    const redactionSettingsResolver = vi.fn(() => null);

    const session = createScanningSessionMock<BlinkIdScanningSession>({
      process: vi.fn(() => processResult),
      getResult: vi.fn(),
    });
    const { module } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
      createScanningSession: vi.fn(() => session),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId(baseInitSettings);

    const proxySession = worker.createScanningSession(undefined, {
      redactionSettingsResolver,
    });
    proxySession.process(createFakeImageData());
    await proxySession.getResult();

    expect(redactionSettingsResolver).toHaveBeenCalledWith(
      documentClassInfo,
      expect.any(Function),
    );
    expect(session.getResult).toHaveBeenCalledWith();
  });

  it("does not resolve redaction settings after reset clears cached class info", async () => {
    const documentClassInfo = {
      country: { id: "germany", rawValue: "GERMANY" },
      region: undefined,
      documentType: { id: "id", rawValue: "ID" },
      countryName: "Germany",
      isoNumericCountryCode: "276",
      isoAlpha2CountryCode: "DE",
      isoAlpha3CountryCode: "DEU",
    } satisfies DocumentClassInfo;
    const processResult = {
      inputImageAnalysisResult: {
        documentClassInfo,
        documentRotation: "not-available",
      },
    } as BlinkIdProcessResult;
    const redactionSettings = {
      mode: "result-fields-only",
      fields: ["lastName"],
      redactMrz: false,
      redactBarcode: false,
    } satisfies RedactionSettings;
    const redactionSettingsResolver = vi.fn(() => redactionSettings);
    const session = createScanningSessionMock<BlinkIdScanningSession>({
      process: vi.fn(() => processResult),
      getResult: vi.fn(),
      reset: vi.fn(),
    });
    const { module } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
      createScanningSession: vi.fn(() => session),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId(baseInitSettings);

    const proxySession = worker.createScanningSession(undefined, {
      redactionSettingsResolver,
    });
    proxySession.process(createFakeImageData());
    proxySession.reset();
    await proxySession.getResult();

    expect(redactionSettingsResolver).not.toHaveBeenCalled();
    expect(session.getResult).toHaveBeenCalledWith();
  });

  it("rejects getResult when redaction resolver rejects", async () => {
    const documentClassInfo = {
      country: { id: "germany", rawValue: "GERMANY" },
      region: undefined,
      documentType: { id: "id", rawValue: "ID" },
      countryName: "Germany",
      isoNumericCountryCode: "276",
      isoAlpha2CountryCode: "DE",
      isoAlpha3CountryCode: "DEU",
    } satisfies DocumentClassInfo;
    const processResult = {
      inputImageAnalysisResult: {
        documentClassInfo,
        documentRotation: "not-available",
      },
    } as BlinkIdProcessResult;
    const redactionSettingsResolver = vi.fn(() =>
      Promise.reject(new Error("resolver-failed")),
    );
    const session = createScanningSessionMock<BlinkIdScanningSession>({
      process: vi.fn(() => processResult),
      getResult: vi.fn(),
    });
    const { module } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
      createScanningSession: vi.fn(() => session),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId(baseInitSettings);

    const proxySession = worker.createScanningSession(undefined, {
      redactionSettingsResolver,
    });
    proxySession.process(createFakeImageData());

    await expect(proxySession.getResult()).rejects.toThrow("resolver-failed");
    expect(session.getResult).not.toHaveBeenCalled();
  });

  it("getDefaultRedactionSettings is correctly passed to the resolver by the worker", async () => {
    const documentClassInfo = {
      country: { id: "germany", rawValue: "GERMANY" },
      region: undefined,
      documentType: { id: "id", rawValue: "ID" },
      countryName: "Germany",
      isoNumericCountryCode: "276",
      isoAlpha2CountryCode: "DE",
      isoAlpha3CountryCode: "DEU",
    } satisfies DocumentClassInfo;
    const processResult = {
      inputImageAnalysisResult: {
        documentClassInfo,
        documentRotation: "not-available",
      },
    } as BlinkIdProcessResult;

    const defaultRedactionSettings = {
      fields: ["firstName"],
      mode: "full-result",
      redactBarcode: false,
      redactMrz: false,
    } satisfies RedactionSettings;

    const redactionSettingsResolver = vi.fn<RedactionSettingsResolver>(
      async (classInfo, getDefaultSettings) => {
        const defaultSettings = await getDefaultSettings(classInfo);

        return {
          ...defaultSettings,
          redactBarcode: true,
          fields: [...(defaultSettings?.fields ?? []), "lastName"],
        };
      },
    );

    const session = createScanningSessionMock<BlinkIdScanningSession>({
      process: vi.fn(() => processResult),
      getResult: vi.fn(),
    });
    const { module } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
      createScanningSession: vi.fn(() => session),
      getDefaultRedactionSettings: () => defaultRedactionSettings,
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();

    await worker.initBlinkId(baseInitSettings);

    const proxySession = worker.createScanningSession(undefined, {
      redactionSettingsResolver,
    });
    proxySession.process(createFakeImageData());

    await proxySession.getResult();

    expect(session.getResult).toHaveBeenCalledWith({
      ...defaultRedactionSettings,
      redactBarcode: true,
      fields: ["firstName", "lastName"],
    });
  });

  it("explicit undefined field in redactionSettingsResolver keeps the default", async () => {
    const documentClassInfo = {
      country: { id: "germany", rawValue: "GERMANY" },
      region: undefined,
      documentType: { id: "id", rawValue: "ID" },
      countryName: "Germany",
      isoNumericCountryCode: "276",
      isoAlpha2CountryCode: "DE",
      isoAlpha3CountryCode: "DEU",
    } satisfies DocumentClassInfo;
    const processResult = {
      inputImageAnalysisResult: {
        documentClassInfo,
        documentRotation: "not-available",
      },
    } as BlinkIdProcessResult;

    const defaultRedactionSettings = {
      fields: ["firstName"],
      mode: "full-result",
      redactBarcode: false,
      redactMrz: false,
    } satisfies RedactionSettings;

    const redactionSettingsResolver = vi.fn<RedactionSettingsResolver>(
      async (classInfo, getDefaultSettings) => {
        const defaultSettings = await getDefaultSettings(classInfo);

        return {
          ...defaultSettings,
          mode: undefined,
          redactBarcode: undefined,
          redactMrz: undefined,
        };
      },
    );

    const session = createScanningSessionMock<BlinkIdScanningSession>({
      process: vi.fn(() => processResult),
      getResult: vi.fn(),
    });
    const { module } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
      createScanningSession: vi.fn(() => session),
      getDefaultRedactionSettings: () => defaultRedactionSettings,
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();

    await worker.initBlinkId(baseInitSettings);

    const proxySession = worker.createScanningSession(undefined, {
      redactionSettingsResolver,
    });
    proxySession.process(createFakeImageData());

    await proxySession.getResult();

    expect(session.getResult).toHaveBeenCalledWith({
      ...defaultRedactionSettings,
    });
  });

  it("does not reproject cached class info after a detection-failed document swap", async () => {
    const documentClassInfo = {
      country: { id: "germany", rawValue: "GERMANY" },
      region: undefined,
      documentType: { id: "id", rawValue: "ID" },
      countryName: "Germany",
      isoNumericCountryCode: "276",
      isoAlpha2CountryCode: "DE",
      isoAlpha3CountryCode: "DEU",
    } satisfies DocumentClassInfo;
    const classifiedResult = {
      inputImageAnalysisResult: {
        processingStatus: "awaiting-other-side",
        documentClassInfo,
        documentRotation: "not-available",
      },
    } as unknown as BlinkIdProcessResult;
    const swapResult = {
      inputImageAnalysisResult: {
        processingStatus: "detection-failed",
        documentClassInfo: undefined,
        documentRotation: "not-available",
      },
    } as unknown as BlinkIdProcessResult;
    const session = createScanningSessionMock<BlinkIdScanningSession>({
      process: vi
        .fn()
        .mockReturnValueOnce(classifiedResult)
        .mockReturnValueOnce(swapResult),
    });
    const { module } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
      createScanningSession: vi.fn(() => session),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId(baseInitSettings);

    const proxySession = worker.createScanningSession();
    proxySession.process(createFakeImageData());
    const swapProcessResult = proxySession.process(
      createFakeImageData(),
    ) as BlinkIdProcessResult;

    expect(
      swapProcessResult.inputImageAnalysisResult.documentClassInfo,
    ).toBeUndefined();
  });

  it("does not reproject cached class info after a stability-test-failed document swap", async () => {
    const documentClassInfo = {
      country: { id: "germany", rawValue: "GERMANY" },
      region: undefined,
      documentType: { id: "id", rawValue: "ID" },
      countryName: "Germany",
      isoNumericCountryCode: "276",
      isoAlpha2CountryCode: "DE",
      isoAlpha3CountryCode: "DEU",
    } satisfies DocumentClassInfo;
    const classifiedResult = {
      inputImageAnalysisResult: {
        processingStatus: "awaiting-other-side",
        documentClassInfo,
        documentRotation: "not-available",
      },
    } as unknown as BlinkIdProcessResult;
    const swapResult = {
      inputImageAnalysisResult: {
        processingStatus: "stability-test-failed",
        documentClassInfo: undefined,
        documentRotation: "not-available",
      },
    } as unknown as BlinkIdProcessResult;
    const session = createScanningSessionMock<BlinkIdScanningSession>({
      process: vi
        .fn()
        .mockReturnValueOnce(classifiedResult)
        .mockReturnValueOnce(swapResult),
    });
    const { module } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
      createScanningSession: vi.fn(() => session),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId(baseInitSettings);

    const proxySession = worker.createScanningSession();
    proxySession.process(createFakeImageData());
    const swapProcessResult = proxySession.process(
      createFakeImageData(),
    ) as BlinkIdProcessResult;

    expect(
      swapProcessResult.inputImageAnalysisResult.documentClassInfo,
    ).toBeUndefined();
  });

  it("does not resolve redaction settings when documentClassInfo is absent", async () => {
    const processResult = {
      inputImageAnalysisResult: {
        processingStatus: "detection-failed",
        documentClassInfo: undefined,
        documentRotation: "not-available",
      },
    } as unknown as BlinkIdProcessResult;
    const redactionSettingsResolver = vi.fn();
    const session = createScanningSessionMock<BlinkIdScanningSession>({
      process: vi.fn(() => processResult),
      getResult: vi.fn(),
    });
    const { module } = createWasmModuleMock<BlinkIdWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
      createScanningSession: vi.fn(() => session),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdWorker();
    await worker.initBlinkId(baseInitSettings);

    const proxySession = worker.createScanningSession(undefined, {
      redactionSettingsResolver,
    });
    proxySession.process(createFakeImageData());
    await proxySession.getResult();

    expect(redactionSettingsResolver).not.toHaveBeenCalled();
    expect(session.getResult).toHaveBeenCalledWith();
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
    await worker.initBlinkId(baseInitSettings);

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
    await worker.initBlinkId({
      ...baseInitSettings,
      microblinkProxyUrl: proxyUrl,
    });

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

    await expect(worker.initBlinkId(baseInitSettings)).rejects.toThrow(
      LicenseError,
    );

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
