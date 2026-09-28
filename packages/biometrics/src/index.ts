/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

/**
 * @packageDocumentation
 *
 *   Biometrics browser SDK for guided and headless face capture.
 */
export { createBiometrics } from "./createBiometrics";
export { createBiometricsUi } from "./createBiometricsUi";
export {
  checkBiometricsSupport,
  createDerivedDeviceInfo,
  getDeviceInfo,
  getUserAgentData,
} from "@microblink/biometrics-core";
export type {
  BiometricsAnalyticsSettings,
  BiometricsAnalyticsEvent,
  BiometricsCaptureSettings,
  BiometricsFeedbackUiOptions,
  BiometricsSdk,
  BiometricsSession,
  BiometricsSessionContext,
  BiometricsSessionConfig,
  BiometricsSessionEvent,
  BiometricsSessionState,
  BiometricsUiEvent,
  BiometricsUi,
  BiometricsUiOptions,
  CaptureTechnicalData,
  DownloadProgress,
  BiometricsSettings,
  ProgressStatusCallback,
} from "./types";

export type {
  BiometricsResourceKind as CaptureBiometricsResourceKind,
  BiometricsSupportCheck,
  BiometricsSupportCheckId,
  BiometricsSupportCheckStatus,
  BiometricsSupportReport,
  BrowserStorageSupport,
  CheckBiometricsSupportOptions,
  CaptureFaceConfig,
  DerivedDeviceInfo,
  DeviceInfo,
  DeviceScreenInfo,
  FormFactor,
  GpuInfo,
  UADataValues,
  UnifiedFeedback,
} from "@microblink/biometrics-core";
export {
  BiometricsError,
  ConfigurationError,
  getBiometricsFaceFromCaptureResult,
  isFaceCaptureResult,
  LicenseError,
  normalizeBiometricsError,
  PermissionError,
  SessionError,
} from "@microblink/biometrics-core";
export type {
  BiometricsDiagnosticCallback,
  BiometricsDiagnosticComponent,
  BiometricsDiagnosticEvent,
  BiometricsDiagnosticPhase,
  BiometricsDiagnosticResource,
  BiometricsDiagnosticStatus,
  BiometricsErrorCode,
  BiometricsErrorComponent,
  BiometricsErrorOptions,
  BiometricsErrorStage,
  BiometricsFace,
  BiometricsResourceKind,
  CapturedImage,
  CaptureSignature,
  FaceCaptureResult,
  FaceLandmarks,
  LivenessFrame,
  LivenessFrameQuality,
  CaptureFrame,
  WasmVariant,
} from "@microblink/biometrics-core";
export type {
  LocalizationStrings,
  LocaleRecord,
  PartialLocalizationStrings,
} from "@microblink/biometrics-ux-manager/ui";
