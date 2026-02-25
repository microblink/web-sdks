/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import {
  getDeviceInfo,
  type RemoteScanningSession,
} from "@microblink/blinkcard-core";
import { CameraManager } from "@microblink/camera-manager";
import { BlinkCardUxManager } from "./BlinkCardUxManager";
import { BlinkCardUiStateKey } from "./blinkcard-ui-state";

export type BlinkCardUxManagerOptions = {
  /**
   * Initial UI state key used by the manager/stabilizer.
   * Defaults to `INTRO_FRONT`.
   */
  initialUiStateKey?: BlinkCardUiStateKey;
};

/**
 * Creates a BlinkCardUxManager.
 *
 * @param cameraManager - The camera manager.
 * @param scanningSession - The scanning session.
 * @param options - Optional manager configuration.
 * @returns The BlinkCardUxManager instance.
 */
export const createBlinkCardUxManager = async (
  cameraManager: CameraManager,
  scanningSession: RemoteScanningSession,
  options: BlinkCardUxManagerOptions = {},
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
    options,
    sessionSettings,
    showDemoOverlay,
    showProductionOverlay,
    deviceInfo,
  );
};
