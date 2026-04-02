/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * @packageDocumentation
 * Core functionality of BlinkIdVerify SDK - provides essential document scanning capabilities and worker management.
 * This package serves as the foundation for document scanning, handling WASM initialization, worker communication,
 * and core scanning operations.
 */

import { WorkerScanningSession } from "@microblink/blinkid-verify-worker";
import { Remote } from "comlink";

export type * from "@microblink/blinkid-verify-wasm";
export type * from "@microblink/blinkid-verify-worker";
export { AnalyticService } from "@microblink/analytics/AnalyticService";
export type * from "@microblink/analytics/ping";

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
export * from "./BlinkIdVerifyCore";
export * from "./generatePayloadForBlinkIdVerifyCloudApi";

/** Represents a remote scanning session. */
export type RemoteScanningSession = Remote<WorkerScanningSession>;

// https://newsletter.daishikato.com/p/detecting-dual-module-issues-in-jotai

const testSymbol = Symbol();

declare global {
  /* eslint-disable no-var */
  var __BLINKID_VERIFY_CORE__: typeof testSymbol;
}

globalThis.__BLINKID_VERIFY_CORE__ ||= testSymbol;
if (globalThis.__BLINKID_VERIFY_CORE__ !== testSymbol) {
  console.warn(
    "Detected multiple instances of @microblink/blinkid-core. This can lead to unexpected behavior.",
  );
}
