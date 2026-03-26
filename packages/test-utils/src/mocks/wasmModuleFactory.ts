/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * This is a runtime default factory for the WASM module.
 * It is used when `getCrossOriginWorkerURL` is stubbed to return this module's URL.
 */
import type { WasmModule } from "@microblink/wasm-common";
import { vi } from "vitest";


let wasmModuleMock: WasmModule<any, any> | null = null;
let lastModuleOverrides: Record<string, unknown> | undefined;

export function setWasmModuleMock<T extends WasmModule<any, any>>(
  module: T | null,
): void {
  wasmModuleMock = module;
}

export function getLastModuleOverrides() {
  return lastModuleOverrides;
}

export function resetLastModuleOverrides() {
  lastModuleOverrides = undefined;
}

type WasmModuleSpies<T extends WasmModule<any, any>> = {
  [K in keyof T]: ReturnType<typeof vi.fn>;
};

export function createWasmModuleMock<T extends WasmModule<any, any>>(
  overrides?: Partial<T>,
): {
    spies: WasmModuleSpies<T>;
    module: T;
} {
  const spies: WasmModuleSpies<T> = {
    createScanningSession: vi.fn(),
    initializeWithLicenseKey: vi.fn(),
    submitServerPermission: vi.fn(),
    getActiveLicenseTokenInfo: vi.fn(),
    setPingProxyUrl: vi.fn(),
    initializeSdk: vi.fn(),
    terminateSdk: vi.fn(),
    sendPinglets: vi.fn(),
    arePingRequestsInProgress: vi.fn(),
    queuePinglet: vi.fn(),
    isPingEnabled: vi.fn().mockReturnValue(true),
    ...overrides,
  } as WasmModuleSpies<T>;

  return {
    spies,
    module: {
        ...spies,
    }
  } as unknown as {
    spies: WasmModuleSpies<T>;
    module: T;
  };
}

export function getWasmModuleMock(): Promise<WasmModule<any, any>> {
  if (!wasmModuleMock) {
    throw new Error(
      "Mock WASM module not set. Call setWasmModuleMock in test.",
    );
  }
  return Promise.resolve(wasmModuleMock);
}

/**
 * Default runtime factory for dynamic worker imports in tests.
 * Extra arguments are ignored (worker code passes Emscripten module options).
 */
export default function createMockModule(
  moduleOverrides?: Record<string, unknown>,
): Promise<
  WasmModule<any, any>
> {
  lastModuleOverrides = moduleOverrides;
  if (!wasmModuleMock) {
    throw new Error(
      "Mock WASM module not set. Call setWasmModuleMock in test.",
    );
  }
  return Promise.resolve(wasmModuleMock);
}
