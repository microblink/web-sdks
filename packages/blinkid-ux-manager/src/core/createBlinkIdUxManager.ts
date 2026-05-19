/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import {
  getDeviceInfo,
  type RemoteScanningSession,
} from "@microblink/blinkid-core";
import { CameraManager } from "@microblink/camera-manager";
import { BlinkIdUxManager } from "./BlinkIdUxManager";
import {
  BlinkIdUiStateKey,
  getUiStateKeyFromScanningStatus,
} from "./blinkid-ui-state";
import type { BlinkIdTimeoutConfiguration } from "./BlinkIdTimeoutConfiguration";

/**
 * Options for the BlinkIdUxManager.
 */
export type BlinkIdUxManagerOptions = {
  /**
   * Initial UI state key used by the manager/stabilizer reset flow.
   * Defaults to `INTRO_FRONT_PAGE`.
   */
  initialUiStateKey?: BlinkIdUiStateKey;
  /**
   * Configures BlinkID scanning timeout behavior.
   */
  timeoutConfiguration?: Partial<BlinkIdTimeoutConfiguration>;
};

/**
 * Creates a BlinkIdUxManager.
 *
 * @param cameraManager - The camera manager.
 * @param scanningSession - The scanning session.
 * @returns The BlinkIdUxManager instance.
 */
export const createBlinkIdUxManager = async (
  cameraManager: CameraManager,
  scanningSession: RemoteScanningSession,
  options: BlinkIdUxManagerOptions = {},
): Promise<BlinkIdUxManager> => {
  try {
    const [
      resolvedSessionSettings,
      showDemoOverlay,
      showProductionOverlay,
      deviceInfo,
      scanningStatus,
    ] = await Promise.all([
      scanningSession.getResolvedSessionSettings(),
      scanningSession.showDemoOverlay(),
      scanningSession.showProductionOverlay(),
      getDeviceInfo(),
      scanningSession.getScanningStatus(),
    ]);

    const initialUiStateKey =
      getUiStateKeyFromScanningStatus(scanningStatus) ??
      options.initialUiStateKey;
    const managerOptions =
      initialUiStateKey == null
        ? options
        : {
            ...options,
            initialUiStateKey,
          };

    return new BlinkIdUxManager(
      cameraManager,
      scanningSession,
      managerOptions,
      resolvedSessionSettings,
      showDemoOverlay,
      showProductionOverlay,
      deviceInfo,
    );
  } catch (error) {
    try {
      await scanningSession.ping({
        schemaName: "ping.error",
        schemaVersion: "1.0.0",
        data: {
          errorType: "Crash",
          errorMessage: `ux.createBlinkIdUxManager: ${
            error instanceof Error ? error.message : String(error)
          }`,
          stackTrace: error instanceof Error ? error.stack : undefined,
        },
      });
    } catch (pingError) {
      console.warn("Failed to report error pinglet:", pingError);
      throw error;
    }

    try {
      await scanningSession.sendPinglets();
    } catch (sendError) {
      console.warn("Failed to flush error pinglets:", sendError);
    }

    throw error;
  }
};
