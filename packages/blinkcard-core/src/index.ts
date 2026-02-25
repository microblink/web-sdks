/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * @packageDocumentation
 * Core functionality of BlinkCard SDK - provides essential document scanning capabilities and worker management.
 * This package serves as the foundation for document scanning, handling WASM initialization, worker communication,
 * and core scanning operations.
 */

import type { WorkerScanningSession } from "@microblink/blinkcard-worker";
import { Remote } from "comlink";

export type * from "@microblink/blinkcard-wasm";
export type * from "@microblink/blinkcard-worker";
export { createProxyWorker } from "@microblink/core-common/createProxyWorker";
export {
  createDerivedDeviceInfo,
  getDeviceInfo,
  getUserAgentData,
  type BrowserStorageSupport,
  type DerivedDeviceInfo,
  type DeviceInfo,
  type DeviceScreenInfo,
  type FormFactor,
  type GpuInfo,
  type UADataValues,
} from "@microblink/core-common/deviceInfo/deviceInfo";
export { getCrossOriginWorkerURL } from "@microblink/core-common/getCrossOriginWorkerURL";
export { getUserId } from "@microblink/core-common/getUserId";
export * from "./loadBlinkCardCore";
export * from "./utils";

/** Represents a remote scanning session. */
export type RemoteScanningSession = Remote<WorkerScanningSession>;

// https://newsletter.daishikato.com/p/detecting-dual-module-issues-in-jotai

const testSymbol = Symbol();

declare global {
  /* eslint-disable no-var */
  var __BLINKCARD_CORE__: typeof testSymbol;
}

globalThis.__BLINKCARD_CORE__ ||= testSymbol;
if (globalThis.__BLINKCARD_CORE__ !== testSymbol) {
  console.warn(
    "Detected multiple instances of @microblink/blinkcard-core. This can lead to unexpected behavior.",
  );
}
