/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import {
  getDeviceInfo,
  type RemoteScanningSession,
} from "@microblink/blinkid-verify-core";
import { CameraManager } from "@microblink/camera-manager";
import { BlinkIdVerifyUxManager } from "./BlinkIdVerifyUxManager";
import { BlinkIdVerifyUiStateKey } from "./blinkid-verify-ui-state";

export type BlinkIdVerifyUxManagerOptions = {
  /**
   * Initial UI state key used by the manager/stabilizer reset flow.
   * Defaults to `INTRO_FRONT_PAGE`.
   */
  initialUiStateKey?: BlinkIdVerifyUiStateKey;
};

/**
 * Creates a BlinkIdVerifyUxManager.
 *
 * @param cameraManager - The camera manager.
 * @param scanningSession - The scanning session.
 * @returns The BlinkIdVerifyUxManager instance.
 */
export const createBlinkIdVerifyUxManager = async (
  cameraManager: CameraManager,
  scanningSession: RemoteScanningSession,
  options: BlinkIdVerifyUxManagerOptions = {},
): Promise<BlinkIdVerifyUxManager> => {
  try {
    const [
      sessionSettings,
      showDemoOverlay,
      showProductionOverlay,
      deviceInfo,
    ] = await Promise.all([
      scanningSession.getSettings(),
      scanningSession.showDemoOverlay(),
      scanningSession.showProductionOverlay(),
      getDeviceInfo(),
    ]);

    return new BlinkIdVerifyUxManager(
      cameraManager,
      scanningSession,
      options,
      sessionSettings,
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
          errorMessage: `ux.createBlinkIdVerifyUxManager: ${
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
