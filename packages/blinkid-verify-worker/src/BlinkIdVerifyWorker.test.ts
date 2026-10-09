/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type {
  BlinkIdVerifyScanningSession,
  BlinkIdVerifyWasmModule,
  SerializedPayload,
} from "@microblink/blinkid-verify-wasm";
import { createLicenseUnlockResult } from "@microblink/test-utils/mocks/licensing";
import {
  createWasmModuleMock,
  getLastModuleOverrides,
  resetLastModuleOverrides,
  setWasmModuleMock,
} from "@microblink/test-utils/mocks/wasmModuleFactory";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const createWasmInstantiatorMock = vi.hoisted(() => vi.fn());
const downloadAndCompileWasmMock = vi.hoisted(() => vi.fn());
const downloadResourceBufferMock = vi.hoisted(() => vi.fn());
const getCrossOriginWorkerURLMock = vi.hoisted(() => vi.fn());
const detectWasmFeaturesMock = vi.hoisted(() => vi.fn());
const transferMock = vi.hoisted(() => vi.fn(<T>(value: T) => value));

vi.mock("comlink", () => ({
  expose: vi.fn(),
  finalizer: Symbol("finalizer"),
  proxy: <T>(value: T) => value,
  transfer: transferMock,
  ProxyMarked: class {},
}));

vi.mock("@microblink/blinkid-verify-wasm/size-manifest.json", () => ({
  default: {
    wasm: { simd: 100, "simd-threads": 100, "simd-relaxed": 100, "simd-relaxed-threads": 100 },
    data: { simd: 100, "simd-threads": 100, "simd-relaxed": 100, "simd-relaxed-threads": 100 },
  },
}));

vi.mock("@microblink/worker-common/compileWasm", () => ({
  createWasmInstantiator: createWasmInstantiatorMock,
  downloadAndCompileWasm: downloadAndCompileWasmMock,
}));

vi.mock("@microblink/worker-common/downloadResourceBuffer", () => ({
  downloadResourceBuffer: downloadResourceBufferMock,
}));

vi.mock("@microblink/worker-common/getCrossOriginWorkerURL", () => ({
  getCrossOriginWorkerURL: getCrossOriginWorkerURLMock,
}));

vi.mock("@microblink/worker-common/isSafari", () => ({
  isIOS: vi.fn(() => false),
}));

vi.mock("@microblink/worker-common/mbToWasmPages", () => ({
  mbToWasmPages: vi.fn(() => 1),
}));

vi.mock("@microblink/worker-common/wasm-feature-detect", () => ({
  detectWasmFeatures: detectWasmFeaturesMock,
}));

vi.mock("@microblink/worker-common/workerCrashReporter", () => ({
  installWorkerCrashReporter: vi.fn(() => vi.fn()),
}));

import { BlinkIdVerifyWorker } from "./BlinkIdVerifyWorker";

const baseInitSettings = {
  licenseKey: "test-license",
  resourcesLocation: "https://example.com/",
  userId: "test-user",
  verifyApiBaseUrl: "https://verify.example.com",
};
const compiledWasm = {} as WebAssembly.Module;
const wasmInstantiator = vi.fn();

describe("BlinkIdVerifyWorker Wasm loading", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetLastModuleOverrides();
    detectWasmFeaturesMock.mockResolvedValue("simd");
    downloadAndCompileWasmMock.mockResolvedValue(compiledWasm);
    createWasmInstantiatorMock.mockReturnValue(wasmInstantiator);
    downloadResourceBufferMock.mockResolvedValue(new ArrayBuffer(0));
    getCrossOriginWorkerURLMock.mockResolvedValue(
      new URL("../../test-utils/src/mocks/wasmModuleFactory.ts", import.meta.url).href,
    );
    vi.stubGlobal("self", {
      location: { hostname: "example.com" },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  afterEach(() => {
    setWasmModuleMock(null);
    resetLastModuleOverrides();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("hands the stream-compiled wasm module to Emscripten", async () => {
    const { module } = createWasmModuleMock<BlinkIdVerifyWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdVerifyWorker();
    await worker.initBlinkIdVerify(baseInitSettings);

    expect(downloadAndCompileWasmMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "https://example.com/resources/simd/BlinkIdVerifyModule.wasm",
        fileType: "wasm",
        variant: "simd",
      }),
      expect.any(Function),
    );
    expect(createWasmInstantiatorMock).toHaveBeenCalledWith(compiledWasm);
    expect(getLastModuleOverrides()?.wasmBinary).toBeUndefined();
    expect(getLastModuleOverrides()?.instantiateWasm).toBe(wasmInstantiator);
  });

  it("resolves auxiliary files without duplicating the wasm variant segment", async () => {
    const { module } = createWasmModuleMock<BlinkIdVerifyWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdVerifyWorker();
    await worker.initBlinkIdVerify(baseInitSettings);

    const locateFile = getLastModuleOverrides()?.locateFile as (path: string) => string;

    expect(locateFile("BlinkIdVerifyModule.wasm")).toBe("https://example.com/resources/simd/BlinkIdVerifyModule.wasm");
    // Regression guard: the variant segment must not appear twice.
    expect(locateFile("BlinkIdVerifyModule.wasm")).not.toContain("simd/simd");
  });

  it("fails initialization when the wasm binary cannot be downloaded", async () => {
    const { module, spies } = createWasmModuleMock<BlinkIdVerifyWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
    });
    setWasmModuleMock(module);
    downloadAndCompileWasmMock.mockRejectedValue(new TypeError("Failed to fetch"));

    const worker = new BlinkIdVerifyWorker();
    await expect(worker.initBlinkIdVerify(baseInitSettings)).rejects.toThrow("Failed to fetch");

    expect(getLastModuleOverrides()).toBeUndefined();
    expect(spies.initializeWithLicenseKey).not.toHaveBeenCalled();
  });
});

describe("BlinkIdVerifyWorker Verify result proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetLastModuleOverrides();
    detectWasmFeaturesMock.mockResolvedValue("simd");
    downloadAndCompileWasmMock.mockResolvedValue(compiledWasm);
    createWasmInstantiatorMock.mockReturnValue(wasmInstantiator);
    downloadResourceBufferMock.mockResolvedValue(new ArrayBuffer(0));
    getCrossOriginWorkerURLMock.mockResolvedValue(
      new URL("../../test-utils/src/mocks/wasmModuleFactory.ts", import.meta.url).href,
    );
    vi.stubGlobal("self", {
      location: { hostname: "example.com" },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  afterEach(() => {
    setWasmModuleMock(null);
    resetLastModuleOverrides();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("caches serialized payload for prepare and submit without transferring JPEGs", async () => {
    const payload: SerializedPayload = {
      configuration: "{}",
      sdkMetadata: "{}",
      imageFirstSide: { jpegBytes: new Uint8Array([1, 2, 3]) },
    };
    const { session, getResult } = createSessionMock(payload);
    const { module } = createWasmModuleMock<BlinkIdVerifyWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
      createScanningSession: vi.fn(() => session),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdVerifyWorker();
    await worker.initBlinkIdVerify({
      ...baseInitSettings,
      verifyApiBaseUrl: "https://default.example.com",
    });
    const remoteSession = worker.createScanningSession();

    expect(session.setVerifyApiBaseUrl).toHaveBeenCalledTimes(1);
    expect(session.setVerifyApiBaseUrl).toHaveBeenCalledWith("https://default.example.com");

    await remoteSession.prepareVerifyRequest();
    await remoteSession.submitResult();

    expect(getResult).toHaveBeenCalledTimes(1);
    expect(session.prepareVerifyRequestFromPayload).toHaveBeenCalledWith(payload);
    expect(session.submitResultFromPayload).toHaveBeenCalledWith(payload);
    expect(transferMock).not.toHaveBeenCalled();

    const serializedResult = remoteSession.getResult();
    expect(serializedResult.serializedPayload.imageFirstSide?.jpegBytes).toEqual(new Uint8Array([1, 2, 3]));
    expect(getResult).toHaveBeenCalledTimes(1);
    expect(transferMock).toHaveBeenCalledTimes(1);
  });

  it("invalidates the payload cache after process and reset", async () => {
    const payload: SerializedPayload = { configuration: "{}", sdkMetadata: "{}" };
    const { session, getResult } = createSessionMock(payload);
    const { module } = createWasmModuleMock<BlinkIdVerifyWasmModule>({
      initializeWithLicenseKey: vi.fn(() => createLicenseUnlockResult()),
      createScanningSession: vi.fn(() => session),
    });
    setWasmModuleMock(module);

    const worker = new BlinkIdVerifyWorker();
    await worker.initBlinkIdVerify(baseInitSettings);
    const remoteSession = worker.createScanningSession();

    expect(session.setVerifyApiBaseUrl).toHaveBeenCalledTimes(1);
    expect(session.setVerifyApiBaseUrl).toHaveBeenCalledWith("https://verify.example.com");

    await remoteSession.submitResult();
    remoteSession.process({ data: new Uint8ClampedArray(4) } as ImageData);
    await remoteSession.submitResult();
    remoteSession.reset();
    await remoteSession.submitResult();

    expect(getResult).toHaveBeenCalledTimes(3);
  });
});

function createSessionMock(payload: SerializedPayload) {
  const getResult = vi.fn(() => ({ serializedPayload: payload }));
  const session = {
    getResult,
    setVerifyApiBaseUrl: vi.fn(),
    prepareVerifyRequestFromPayload: vi.fn().mockResolvedValue({
      url: "https://verify.example.com/verify",
      method: "POST",
      headers: {},
      body: new Uint8Array(),
    }),
    submitResultFromPayload: vi.fn().mockResolvedValue({}),
    process: vi.fn(() => ({ resultCompleteness: {}, inputImageAnalysisResult: {} })),
    reset: vi.fn(),
    getSettings: vi.fn(() => ({})),
    getSessionId: vi.fn(() => "session-id"),
    isDeleted: vi.fn(() => false),
    delete: vi.fn(),
    deleteLater: vi.fn(),
    isAliasOf: vi.fn(),
    clone: vi.fn(),
    allowBarcodeStep: vi.fn(),
  } as unknown as BlinkIdVerifyScanningSession & {
    setVerifyApiBaseUrl: ReturnType<typeof vi.fn>;
    prepareVerifyRequestFromPayload: ReturnType<typeof vi.fn>;
    submitResultFromPayload: ReturnType<typeof vi.fn>;
  };

  return { session, getResult };
}
