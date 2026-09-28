/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type {
  EmscriptenModule,
  EmscriptenModuleFactory,
  LicenseUnlockResult,
  ServerPermissionSubmitError,
} from "@microblink/wasm-common";

import type {
  ImageDataError,
  InputError,
  LoadError,
  NativeFaceFeedback,
  NativeFrameStatus,
  SessionError,
} from "./result.js";
import type { BiometricsWasmSession } from "./session.js";
import type { FaceAnalysisSessionSettings } from "./settings.js";

type WasmEnumConstants<T extends string> = Readonly<Record<T, number>>;

export type BiometricsWasmConstants = {
  loadError: WasmEnumConstants<keyof typeof LoadError>;
  sessionError: WasmEnumConstants<keyof typeof SessionError>;
  frameStatus: WasmEnumConstants<keyof typeof NativeFrameStatus>;
  faceFeedback: WasmEnumConstants<keyof typeof NativeFaceFeedback>;
  imageDataError?: WasmEnumConstants<keyof typeof ImageDataError>;
  inputError?: WasmEnumConstants<keyof typeof InputError>;
};

export type QueuePingletResult = {
  success: boolean;
  error?: string;
};

export type FlushPingletsResult = {
  payload: string;
  pingletCount: number;
};

/**
 * The Biometrics WASM module interface.
 *
 * Sessions are created via the free function `createBiometricsWasmSession` exposed on the module. On success it returns
 * the session; on failure it throws a JS `Error` whose message is a JSON string of shape `{ kind: "loadError", code:
 * LoadError }` — see {@link parseLoadErrorFromThrown}.
 */
export type BiometricsWasmModule = EmscriptenModule & {
  initializeWithLicenseKey(licenseKey: string, userId: string, allowHelloMessage: boolean): LicenseUnlockResult;
  getActiveLicenseTokenInfo(): LicenseUnlockResult;
  submitServerPermission(payload: string): ServerPermissionSubmitError | undefined;
  queuePinglet(data: string, schemaName: string, schemaVersion: string, sessionNumber: number): QueuePingletResult;
  flushPinglets(): FlushPingletsResult;
  isPingEnabled(): boolean;
  traceId(): string;
  reportSdkInitialization(userId: string, osVersion: string, deviceModel: string): void;
  reportSdkTermination(): void;
  getBiometricsWasmConstants(): BiometricsWasmConstants;
  createBiometricsWasmSession(settings: FaceAnalysisSessionSettings, userId: string): BiometricsWasmSession;
};

/** Factory function for creating the Biometrics WASM module. */
export type BiometricsWasmModuleFactory = EmscriptenModuleFactory<BiometricsWasmModule>;
