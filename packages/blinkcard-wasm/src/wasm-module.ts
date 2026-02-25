/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  EmscriptenModule,
  LicenseUnlockResult,
  ServerPermissionSubmitError,
} from "@microblink/wasm-common";
import {
  BlinkCardScanningSession,
  BlinkCardSessionSettingsInput,
} from "./session";

/**
 * The BlinkCard Wasm module.
 *
 * @ignore
 */
export interface BlinkCardWasmModule
  extends BlinkCardBindings, EmscriptenModule {}

/**
 * The BlinkCard bindings.
 *
 * @ignore
 */
export interface BlinkCardBindings {
  createScanningSession: (
    sessionSettings: BlinkCardSessionSettingsInput,
    userId: string,
  ) => BlinkCardScanningSession;
  initializeWithLicenseKey: (
    licenceKey: string,
    userId: string,
    allowHelloMessage: boolean,
  ) => LicenseUnlockResult;
  submitServerPermission: (
    serverPermission: string,
  ) => ServerPermissionSubmitError | undefined;
  getActiveLicenseTokenInfo: () => LicenseUnlockResult;
  setPingProxyUrl: (url: string) => void;
  initializeSdk: (userId: string) => void;
  terminateSdk: () => void;
  sendPinglets: () => void;
  arePingRequestsInProgress: () => boolean;
  queuePinglet: (
    data: string,
    schemaName: string,
    schemaVersion: string,
    sessionNumber: number,
  ) => void;
  isPingEnabled: () => boolean;
}
