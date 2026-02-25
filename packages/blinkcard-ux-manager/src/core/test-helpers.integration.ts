/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  BlinkCardScanningResult,
  BlinkCardSessionSettings,
  DeviceInfo,
  ProcessResultWithBuffer,
  RemoteScanningSession,
} from "@microblink/blinkcard-core";
import type { CameraManager } from "@microblink/camera-manager";
import {
  createFakeScanningSession,
  type FakeScanningSession,
  FakeCameraManager,
} from "@microblink/test-utils";
import { BlinkCardUxManager } from "./BlinkCardUxManager";
import {
  createDeviceInfo,
  createSessionSettings,
} from "./__testdata/blinkcardTestFixtures";

export type CameraInputState = {
  selectedCamera?: { name: string; facingMode?: "front" | "back" };
  videoResolution?: { width: number; height: number };
  extractionArea?: { x: number; y: number; width: number; height: number };
};

export type BlinkCardCameraHarness = {
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

export const createBlinkCardCameraHarness = (
  fakeCameraOptions?: ConstructorParameters<typeof FakeCameraManager>[0],
): BlinkCardCameraHarness => {
  const fakeCameraManager = new FakeCameraManager(
    fakeCameraOptions ?? {
      initialState: {
        selectedCamera: { name: "default-camera", facingMode: "back" },
        videoResolution: { width: 1920, height: 1080 },
      },
    },
  );

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
  fakeCameraOptions?: ConstructorParameters<typeof FakeCameraManager>[0];
  sessionOverrides?: Partial<BlinkCardSessionMock>;
};

export type BlinkCardIntegrationContext = {
  manager: BlinkCardUxManager;
  fakeCameraManager: FakeCameraManager;
  scanningSession: BlinkCardSessionMock;
};

type CreateBlinkCardSessionMockOptions = {
  sessionSettings?: BlinkCardSessionSettings;
  showDemoOverlay?: boolean;
  showProductionOverlay?: boolean;
  sessionOverrides?: Partial<BlinkCardSessionMock>;
};

export const createBlinkCardSessionMock = (
  options: CreateBlinkCardSessionMockOptions = {},
): BlinkCardSessionMock =>
  createFakeScanningSession<
    ProcessResultWithBuffer,
    BlinkCardSessionSettings,
    BlinkCardScanningResult
  >({
    settings: options.sessionSettings ?? createSessionSettings(),
    showDemoOverlay: options.showDemoOverlay ?? false,
    showProductionOverlay: options.showProductionOverlay ?? false,
    overrides: options.sessionOverrides,
  });

export const createBlinkCardUnitSessionMock = (
  sessionSettings: BlinkCardSessionSettings = createSessionSettings(),
): BlinkCardSessionMock =>
  createBlinkCardSessionMock({
    sessionSettings,
    showDemoOverlay: false,
    showProductionOverlay: true,
  });

type CreateBlinkCardManagerOptions = {
  sessionSettings?: BlinkCardSessionSettings;
  showDemoOverlay?: boolean;
  showProductionOverlay?: boolean;
  deviceInfo?: DeviceInfo;
};

export const createBlinkCardManager = (
  cameraManager: CameraManager,
  scanningSession: BlinkCardSessionMock,
  options: CreateBlinkCardManagerOptions = {},
): BlinkCardUxManager =>
  new BlinkCardUxManager(
    cameraManager,
    scanningSession as unknown as RemoteScanningSession,
    {},
    options.sessionSettings ?? createSessionSettings(),
    options.showDemoOverlay ?? false,
    options.showProductionOverlay ?? false,
    options.deviceInfo ?? createDeviceInfo(),
  );

export const createBlinkCardIntegrationContext = (
  options: CreateBlinkCardIntegrationContextOptions = {},
): BlinkCardIntegrationContext => {
  const cameraHarness = createBlinkCardCameraHarness(options.fakeCameraOptions);
  const scanningSession = createBlinkCardSessionMock({
    sessionSettings: options.sessionSettings,
    showDemoOverlay: options.showDemoOverlay,
    showProductionOverlay: options.showProductionOverlay,
    sessionOverrides: options.sessionOverrides,
  });
  const manager = createBlinkCardManager(
    cameraHarness.cameraManager,
    scanningSession,
    {
      sessionSettings: options.sessionSettings,
      showDemoOverlay: options.showDemoOverlay,
      showProductionOverlay: options.showProductionOverlay,
      deviceInfo: options.deviceInfo,
    },
  );

  return {
    manager,
    fakeCameraManager: cameraHarness.fakeCameraManager,
    scanningSession,
  };
};
