/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  BlinkCardScanningResult,
  BlinkCardSessionSettings,
  DeviceInfo,
  ProcessResultWithBuffer,
} from "@microblink/blinkcard-core";
import type { CameraManager } from "@microblink/camera-manager";
import {
  createFakeCameraHarness,
  createFakeScanningSession,
  type CreateFakeCameraManagerOptions,
  type FakeCameraHarness,
  type FakeScanningSession,
} from "@microblink/test-utils";
import { BlinkCardUxManager } from "./BlinkCardUxManager";
import {
  createDeviceInfo,
  createSessionSettings,
} from "./__testdata/blinkcardTestFixtures";

export type BlinkCardCameraHarness = FakeCameraHarness<CameraManager>;

export const createBlinkCardCameraHarness = (
  fakeCameraOptions?: CreateFakeCameraManagerOptions,
): BlinkCardCameraHarness =>
  createFakeCameraHarness<CameraManager>(
    fakeCameraOptions ?? {
      initialState: {
        selectedCamera: { name: "default-camera", facingMode: "back" },
        videoResolution: { width: 1920, height: 1080 },
      },
    },
  );

export type BlinkCardSessionMock = FakeScanningSession<
  ProcessResultWithBuffer,
  BlinkCardSessionSettings,
  BlinkCardScanningResult
>;

export type CreateBlinkCardIntegrationContextOptions = {
  sessionSettings?: BlinkCardSessionSettings;
  showDemoOverlay?: boolean;
  showProductionOverlay?: boolean;
  deviceInfo?: DeviceInfo;
  fakeCameraOptions?: CreateFakeCameraManagerOptions;
  sessionOverrides?: Partial<BlinkCardSessionMock>;
};

export const createBlinkCardUnitSessionMock = (
  sessionSettings: BlinkCardSessionSettings = createSessionSettings(),
): BlinkCardSessionMock =>
  createFakeScanningSession<
    ProcessResultWithBuffer,
    BlinkCardSessionSettings,
    BlinkCardScanningResult
  >({
    settings: sessionSettings,
    showDemoOverlay: false,
    showProductionOverlay: true,
  });

export const createBlinkCardIntegrationContext = (
  options: CreateBlinkCardIntegrationContextOptions = {},
): {
  manager: BlinkCardUxManager;
  fakeCameraManager: BlinkCardCameraHarness["fakeCameraManager"];
  scanningSession: BlinkCardSessionMock;
} => {
  const cameraHarness = createBlinkCardCameraHarness(options.fakeCameraOptions);
  const scanningSession = createFakeScanningSession<
    ProcessResultWithBuffer,
    BlinkCardSessionSettings,
    BlinkCardScanningResult
  >({
    settings: options.sessionSettings ?? createSessionSettings(),
    showDemoOverlay: options.showDemoOverlay ?? false,
    showProductionOverlay: options.showProductionOverlay ?? false,
    overrides: options.sessionOverrides,
  });
  const manager = new BlinkCardUxManager(
    cameraHarness.cameraManager,
    scanningSession as unknown as ConstructorParameters<
      typeof BlinkCardUxManager
    >[1],
    {},
    options.sessionSettings ?? createSessionSettings(),
    options.showDemoOverlay ?? false,
    options.showProductionOverlay ?? false,
    options.deviceInfo ?? createDeviceInfo(),
  );

  return {
    manager,
    fakeCameraManager: cameraHarness.fakeCameraManager,
    scanningSession,
  };
};
