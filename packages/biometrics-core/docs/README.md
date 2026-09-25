**@microblink/biometrics-core**

***

# @microblink/biometrics-core

## Classes

- [BiometricsError](classes/BiometricsError.md)
- [ConfigurationError](classes/ConfigurationError.md)
- [LicenseError](classes/LicenseError.md)
- [PermissionError](classes/PermissionError.md)
- [SessionError](classes/SessionError.md)

## Interfaces

- [UADataValues](interfaces/UADataValues.md)

## Type Aliases

- [BiometricsCaptureClient](type-aliases/BiometricsCaptureClient.md)
- [BiometricsCaptureSession](type-aliases/BiometricsCaptureSession.md)
- [BiometricsDiagnosticCallback](type-aliases/BiometricsDiagnosticCallback.md)
- [BiometricsDiagnosticComponent](type-aliases/BiometricsDiagnosticComponent.md)
- [BiometricsDiagnosticEvent](type-aliases/BiometricsDiagnosticEvent.md)
- [BiometricsDiagnosticPhase](type-aliases/BiometricsDiagnosticPhase.md)
- [BiometricsDiagnosticResource](type-aliases/BiometricsDiagnosticResource.md)
- [BiometricsDiagnosticStatus](type-aliases/BiometricsDiagnosticStatus.md)
- [BiometricsErrorCode](type-aliases/BiometricsErrorCode.md)
- [BiometricsErrorComponent](type-aliases/BiometricsErrorComponent.md)
- [BiometricsErrorContext](type-aliases/BiometricsErrorContext.md)
- [BiometricsErrorOptions](type-aliases/BiometricsErrorOptions.md)
- [BiometricsErrorStage](type-aliases/BiometricsErrorStage.md)
- [BiometricsFace](type-aliases/BiometricsFace.md)
- [BiometricsResourceKind](type-aliases/BiometricsResourceKind.md)
- [BiometricsSupportCheck](type-aliases/BiometricsSupportCheck.md)
- [BiometricsSupportCheckId](type-aliases/BiometricsSupportCheckId.md)
- [BiometricsSupportCheckStatus](type-aliases/BiometricsSupportCheckStatus.md)
- [BiometricsSupportReport](type-aliases/BiometricsSupportReport.md)
- [BiometricsUiStateMap](type-aliases/BiometricsUiStateMap.md)
- [BiometricsWorkerResult](type-aliases/BiometricsWorkerResult.md)
- [BoundingBox](type-aliases/BoundingBox.md)
- [BrowserStorageSupport](type-aliases/BrowserStorageSupport.md)
- [CaptureAnalysisResult](type-aliases/CaptureAnalysisResult.md)
- [CaptureAnalyticsSettings](type-aliases/CaptureAnalyticsSettings.md)
- [CaptureConfig](type-aliases/CaptureConfig.md)
- [CapturedImage](type-aliases/CapturedImage.md)
- [CaptureFaceConfig](type-aliases/CaptureFaceConfig.md)
- [CaptureFrame](type-aliases/CaptureFrame.md)
- [CaptureLogLevel](type-aliases/CaptureLogLevel.md)
- [CaptureMode](type-aliases/CaptureMode.md)
- [CaptureSessionContext](type-aliases/CaptureSessionContext.md)
- [CaptureSessionState](type-aliases/CaptureSessionState.md)
- [CaptureSignature](type-aliases/CaptureSignature.md)
- [CaptureStore](type-aliases/CaptureStore.md)
- [CaptureSubscribe](type-aliases/CaptureSubscribe.md)
- [CheckBiometricsSupportOptions](type-aliases/CheckBiometricsSupportOptions.md)
- [DerivedDeviceInfo](type-aliases/DerivedDeviceInfo.md)
- [DeviceInfo](type-aliases/DeviceInfo.md)
- [DeviceScreenInfo](type-aliases/DeviceScreenInfo.md)
- [DownloadProgress](type-aliases/DownloadProgress.md)
- [EnvironmentFeedback](type-aliases/EnvironmentFeedback.md)
- [EnvironmentFeedback](type-aliases/EnvironmentFeedback-1.md)
- [FaceAnalysisSessionSettings](type-aliases/FaceAnalysisSessionSettings.md)
- [FaceCaptureResult](type-aliases/FaceCaptureResult.md)
- [FaceFeedback](type-aliases/FaceFeedback.md)
- [FaceFeedback](type-aliases/FaceFeedback-1.md)
- [FaceImage](type-aliases/FaceImage.md)
- [FaceLandmarks](type-aliases/FaceLandmarks.md)
- [FacePositionThresholds](type-aliases/FacePositionThresholds.md)
- [FormFactor](type-aliases/FormFactor.md)
- [GpuInfo](type-aliases/GpuInfo.md)
- [ImageOrigin](type-aliases/ImageOrigin.md)
- [LandmarkPoint](type-aliases/LandmarkPoint.md)
- [LandmarkStabilityThresholds](type-aliases/LandmarkStabilityThresholds.md)
- [LightingThresholds](type-aliases/LightingThresholds.md)
- [LivenessFrame](type-aliases/LivenessFrame.md)
- [LivenessFrameQuality](type-aliases/LivenessFrameQuality.md)
- [Logger](type-aliases/Logger.md)
- [LogLevel](type-aliases/LogLevel.md)
- [NormalizeBiometricsErrorOptions](type-aliases/NormalizeBiometricsErrorOptions.md)
- [PositionFeedback](type-aliases/PositionFeedback.md)
- [PositionFeedback](type-aliases/PositionFeedback-1.md)
- [ProgressStatusCallback](type-aliases/ProgressStatusCallback.md)
- [SerializedBiometricsError](type-aliases/SerializedBiometricsError.md)
- [UnifiedFeedback](type-aliases/UnifiedFeedback.md)
- [WasmCapabilities](type-aliases/WasmCapabilities.md)
- [WasmVariant](type-aliases/WasmVariant.md)

## Variables

- [biometricsUiStateMap](variables/biometricsUiStateMap.md)
- [WASM\_VARIANTS](variables/WASM_VARIANTS.md)

## Functions

- [checkBiometricsSupport](functions/checkBiometricsSupport.md)
- [createBiometricsCapture](functions/createBiometricsCapture.md)
- [createDerivedDeviceInfo](functions/createDerivedDeviceInfo.md)
- [createLogger](functions/createLogger.md)
- [deserializeBiometricsError](functions/deserializeBiometricsError.md)
- [emitBiometricsDiagnostic](functions/emitBiometricsDiagnostic.md)
- [getBiometricsFaceFromCaptureResult](functions/getBiometricsFaceFromCaptureResult.md)
- [getDeviceInfo](functions/getDeviceInfo.md)
- [getUserAgentData](functions/getUserAgentData.md)
- [isFaceCaptureResult](functions/isFaceCaptureResult.md)
- [isWasmVariant](functions/isWasmVariant.md)
- [normalizeBiometricsError](functions/normalizeBiometricsError.md)
- [sanitizeBiometricsResourceUrl](functions/sanitizeBiometricsResourceUrl.md)
- [selectWasmVariant](functions/selectWasmVariant.md)
- [serializeBiometricsError](functions/serializeBiometricsError.md)
- [unwrapBiometricsWorkerResult](functions/unwrapBiometricsWorkerResult.md)

## References

### BiometricsImage

Renames and re-exports [FaceImage](type-aliases/FaceImage.md)
