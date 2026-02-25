/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  BlinkIdScanningResult,
  BlinkIdSessionSettings,
  RemoteScanningSession,
  ScanningSettings,
} from "@microblink/blinkid-core";
import type { CameraManager } from "@microblink/camera-manager";
import {
  createFakeScanningSession,
  type FakeScanningSession,
  FakeCameraManager,
} from "@microblink/test-utils";
import type { BlinkIdUxManager } from "./BlinkIdUxManager";
import {
  createProcessResult,
  createSessionSettings,
} from "./__testdata/blinkidTestFixtures";
import {
  createBlinkIdUxManager,
  type BlinkIdUxManagerOptions,
} from "./createBlinkIdUxManager";

export type CameraInputState = {
  selectedCamera?: { name: string; facingMode?: "front" | "back" };
  videoResolution?: { width: number; height: number };
  extractionArea?: { x: number; y: number; width: number; height: number };
};

export type BlinkIdCameraHarness = {
  cameraManager: CameraManager;
  fakeCameraManager: FakeCameraManager;
  emitPlaybackState: (playbackState: "idle" | "playback" | "capturing") => void;
  emitFrame: (imageData: ImageData) => Promise<ArrayBufferLike | void>;
  emitCameraState: (nextState: Partial<CameraInputState>) => void;
  setIsActive: (value: boolean) => void;
  stopFrameCapture: FakeCameraManager["stopFrameCapture"];
  startFrameCapture: FakeCameraManager["startFrameCapture"];
  startCameraStream: FakeCameraManager["startCameraStream"];
};

export const createBlinkIdCameraHarness = (
  fakeCameraOptions?: ConstructorParameters<typeof FakeCameraManager>[0],
): BlinkIdCameraHarness => {
  const fakeCameraManager = new FakeCameraManager(fakeCameraOptions);
  return {
    cameraManager: fakeCameraManager as unknown as CameraManager,
    fakeCameraManager,
    emitPlaybackState: (playbackState) =>
      fakeCameraManager.emitPlaybackState(playbackState),
    emitFrame: (imageData) => fakeCameraManager.emitFrame(imageData),
    emitCameraState: (nextState) => fakeCameraManager.emitState(nextState),
    setIsActive: (value) => {
      fakeCameraManager.isActive = value;
    },
    stopFrameCapture: fakeCameraManager.stopFrameCapture,
    startFrameCapture: fakeCameraManager.startFrameCapture,
    startCameraStream: fakeCameraManager.startCameraStream,
  };
};

export type BlinkIdSessionMock = FakeScanningSession<
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
  sessionSettings?: BlinkIdSessionSettings;
  showDemoOverlay?: boolean;
  showProductionOverlay?: boolean;
  fakeCameraOptions?: ConstructorParameters<typeof FakeCameraManager>[0];
  sessionOverrides?: Partial<BlinkIdSessionMock>;
};

export type BlinkIdIntegrationContext = {
  manager: BlinkIdUxManager;
  fakeCameraManager: FakeCameraManager;
  scanningSession: BlinkIdSessionMock;
};

type CreateBlinkIdSessionMockOptions = {
  sessionSettings?: BlinkIdSessionSettings;
  showDemoOverlay?: boolean;
  showProductionOverlay?: boolean;
  sessionOverrides?: Partial<BlinkIdSessionMock>;
};

export const createBlinkIdSessionMock = (
  options: CreateBlinkIdSessionMockOptions = {},
): BlinkIdSessionMock =>
  createFakeScanningSession<
    ReturnType<typeof createProcessResult>,
    BlinkIdSessionSettings,
    BlinkIdScanningResult
  >({
    settings: options.sessionSettings ?? createSessionSettings(),
    showDemoOverlay: options.showDemoOverlay ?? false,
    showProductionOverlay: options.showProductionOverlay ?? false,
    overrides: options.sessionOverrides,
  });

export const createBlinkIdUnitSessionMock = (
  overrideSettings?: Partial<ScanningSettings>,
): BlinkIdUnitSessionMock =>
  createFakeScanningSession<
    ReturnType<typeof createProcessResult>,
    { scanningSettings: Partial<ScanningSettings> },
    unknown
  >({
    settings: { scanningSettings: overrideSettings ?? {} },
    showDemoOverlay: false,
    showProductionOverlay: false,
  });

export const createBlinkIdManager = async (
  cameraManager: CameraManager,
  scanningSession: BlinkIdSessionMock | RemoteScanningSession,
  options?: BlinkIdUxManagerOptions,
): Promise<BlinkIdUxManager> =>
  createBlinkIdUxManager(
    cameraManager,
    scanningSession as unknown as RemoteScanningSession,
    options,
  );

export const createBlinkIdIntegrationContext = async (
  options: CreateBlinkIdIntegrationContextOptions = {},
): Promise<BlinkIdIntegrationContext> => {
  const cameraHarness = createBlinkIdCameraHarness(options.fakeCameraOptions);
  const scanningSession = createBlinkIdSessionMock({
    sessionSettings: options.sessionSettings,
    showDemoOverlay: options.showDemoOverlay,
    showProductionOverlay: options.showProductionOverlay,
    sessionOverrides: options.sessionOverrides,
  });
  const manager = await createBlinkIdManager(
    cameraHarness.cameraManager,
    scanningSession,
  );

  return {
    manager,
    fakeCameraManager: cameraHarness.fakeCameraManager,
    scanningSession,
  };
};
