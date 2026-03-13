/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { LicenseUnlockResult, ServerPermissionSubmitError } from "./licensing";
import { EmscriptenModule } from "./emscripten";

export interface WasmModule<TSessionSettings, TScanningSession>
  extends WasmBindings<TSessionSettings, TScanningSession>, EmscriptenModule {}

export interface WasmBindings<TSessionSettings, TScanningSession> {
  createScanningSession: (
    sessionSettings: TSessionSettings,
    userId: string,
  ) => TScanningSession;
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
