/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { BlinkCardUxManager } from "./BlinkCardUxManager";
import { CameraManager } from "@microblink/camera-manager";
import {
  type RemoteScanningSession,
  getDeviceInfo,
} from "@microblink/blinkcard-core";

/**
 * Creates a BlinkCardUxManager.
 *
 * @param cameraManager - The camera manager.
 * @param scanningSession - The scanning session.
 * @returns The BlinkCardUxManager instance.
 */
export const createBlinkCardUxManager = async (
  cameraManager: CameraManager,
  scanningSession: RemoteScanningSession,
): Promise<BlinkCardUxManager> => {
  const [sessionSettings, showDemoOverlay, showProductionOverlay, deviceInfo] =
    await Promise.all([
      scanningSession.getSettings(),
      scanningSession.showDemoOverlay(),
      scanningSession.showProductionOverlay(),
      getDeviceInfo(),
    ]);

  return new BlinkCardUxManager(
    cameraManager,
    scanningSession,
    sessionSettings,
    showDemoOverlay,
    showProductionOverlay,
    deviceInfo,
  );
};
