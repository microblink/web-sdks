/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  BlinkIdScanningResult,
  BlinkIdSessionSettings,
  BlinkIdSessionSettingsInput,
  PartialScanningSettingsInput,
  ScanningSettings,
  ScanningStatus,
} from "@microblink/blinkid-core";
import type { CameraManager } from "@microblink/camera-manager";
import {
  createFakeCameraHarness,
  createFakeScanningSession,
  type CreateFakeCameraManagerOptions,
  type FakeCameraHarness,
  type FakeScanningSession,
} from "@microblink/test-utils";
import type { BlinkIdUxManager } from "./BlinkIdUxManager";
import { createProcessResult } from "./__testdata/blinkidTestFixtures";
import { createBlinkIdUxManager } from "./createBlinkIdUxManager";

export type BlinkIdCameraHarness = FakeCameraHarness<CameraManager>;

export const createBlinkIdCameraHarness = (
  fakeCameraOptions?: CreateFakeCameraManagerOptions,
): BlinkIdCameraHarness =>
  createFakeCameraHarness<CameraManager>(fakeCameraOptions);

type BlinkIdSessionMock = FakeScanningSession<
  ReturnType<typeof createProcessResult>,
  BlinkIdSessionSettings,
  BlinkIdScanningResult
>;

export type BlinkIdUnitSessionMock = FakeScanningSession<
  ReturnType<typeof createProcessResult>,
  { scanningSettings: Partial<ScanningSettings> },
  unknown
>;

export type CreateBlinkIdIntegrationContextOptions = {
  sessionSettings?: BlinkIdSessionSettingsInput;
  showDemoOverlay?: boolean;
  showProductionOverlay?: boolean;
  fakeCameraOptions?: CreateFakeCameraManagerOptions;
  sessionOverrides?: Partial<BlinkIdSessionMock>;
};

export const createBlinkIdUnitSessionMock = (
  overrideSettings?: PartialScanningSettingsInput,
): BlinkIdUnitSessionMock =>
  createFakeScanningSession<
    ReturnType<typeof createProcessResult>,
    { scanningSettings: PartialScanningSettingsInput },
    unknown
  >({
    settings: { scanningSettings: overrideSettings ?? {} },
    resolvedSettings: { scanningSettings: overrideSettings ?? {} },
    showDemoOverlay: false,
    showProductionOverlay: false,
  });

export const createBlinkIdIntegrationContext = async (
  options: CreateBlinkIdIntegrationContextOptions = {},
): Promise<{
  manager: BlinkIdUxManager;
  fakeCameraManager: BlinkIdCameraHarness["fakeCameraManager"];
  scanningSession: BlinkIdSessionMock;
}> => {
  const cameraHarness = createBlinkIdCameraHarness(options.fakeCameraOptions);
  const scanningSession = createFakeScanningSession<
    ReturnType<typeof createProcessResult>,
    BlinkIdSessionSettingsInput,
    BlinkIdScanningResult
  >({
    settings: options.sessionSettings ?? {},
    resolvedSettings: options.sessionSettings ?? {},
    showDemoOverlay: options.showDemoOverlay ?? false,
    showProductionOverlay: options.showProductionOverlay ?? false,
    overrides: options.sessionOverrides,
  });
  const manager = await createBlinkIdUxManager(
    cameraHarness.cameraManager,
    scanningSession as unknown as Parameters<typeof createBlinkIdUxManager>[1],
  );

  return {
    manager,
    fakeCameraManager: cameraHarness.fakeCameraManager,
    scanningSession,
  };
};
