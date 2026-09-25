/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

/**
 * @packageDocumentation
 *
 *   Public entrypoint for the Biometrics core package.
 */
export { createBiometricsCapture } from "./capture/capture";
export {
  checkBiometricsSupport,
  type BiometricsSupportCheck,
  type BiometricsSupportCheckId,
  type BiometricsSupportCheckStatus,
  type BiometricsSupportReport,
  type CheckBiometricsSupportOptions,
} from "./preflight/checkBiometricsSupport";
export {
  createDerivedDeviceInfo,
  getDeviceInfo,
  getUserAgentData,
  type BrowserStorageSupport,
  type DerivedDeviceInfo,
  type DeviceInfo,
  type DeviceScreenInfo,
  type FormFactor,
  type GpuInfo,
  type UADataValues,
} from "@microblink/core-common/deviceInfo/deviceInfo";
export type {
  BiometricsCaptureClient,
  BiometricsCaptureSession,
  CaptureAnalyticsSettings,
  CaptureAnalysisResult,
  CaptureConfig,
  CaptureFaceConfig,
  CaptureLogLevel,
  CaptureMode,
  CaptureSubscribe,
  CaptureSessionContext,
  FaceAnalysisSessionSettings,
  FacePositionThresholds,
  ImageOrigin,
  LandmarkStabilityThresholds,
  LightingThresholds,
} from "./capture/capture";
export type { DownloadProgress, ProgressStatusCallback } from "@microblink/biometrics-worker";
export * from "@microblink/biometrics-common";
export type { FaceImage as BiometricsImage } from "@microblink/biometrics-common";
export type { CaptureSessionState } from "./session/session";
export type { EnvironmentFeedback, FaceFeedback, PositionFeedback, UnifiedFeedback } from "./analyzer/feedback";
export type { BiometricsUiStateMap } from "./biometricsUiStateMap";
export { biometricsUiStateMap } from "./biometricsUiStateMap";
export type { CaptureStore } from "./capture/captureStore";
