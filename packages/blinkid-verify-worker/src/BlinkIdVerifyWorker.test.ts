/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { BlinkIdVerifyWasmModule } from "@microblink/blinkid-verify-wasm";
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

vi.mock("comlink", () => ({
  expose: vi.fn(),
  finalizer: Symbol("finalizer"),
  proxy: <T>(value: T) => value,
  transfer: <T>(value: T) => value,
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
