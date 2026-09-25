**@microblink/biometrics-common**

***

# @microblink/biometrics-common

## Classes

- [BiometricsError](classes/BiometricsError.md)
- [ConfigurationError](classes/ConfigurationError.md)
- [LicenseError](classes/LicenseError.md)
- [PermissionError](classes/PermissionError.md)
- [SessionError](classes/SessionError.md)

## Type Aliases

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
- [BiometricsWorkerResult](type-aliases/BiometricsWorkerResult.md)
- [BoundingBox](type-aliases/BoundingBox.md)
- [CapturedImage](type-aliases/CapturedImage.md)
- [CaptureFrame](type-aliases/CaptureFrame.md)
- [CaptureSignature](type-aliases/CaptureSignature.md)
- [FaceCaptureResult](type-aliases/FaceCaptureResult.md)
- [FaceImage](type-aliases/FaceImage.md)
- [FaceLandmarks](type-aliases/FaceLandmarks.md)
- [LandmarkPoint](type-aliases/LandmarkPoint.md)
- [LivenessFrame](type-aliases/LivenessFrame.md)
- [LivenessFrameQuality](type-aliases/LivenessFrameQuality.md)
- [Logger](type-aliases/Logger.md)
- [LogLevel](type-aliases/LogLevel.md)
- [NormalizeBiometricsErrorOptions](type-aliases/NormalizeBiometricsErrorOptions.md)
- [SerializedBiometricsError](type-aliases/SerializedBiometricsError.md)
- [WasmCapabilities](type-aliases/WasmCapabilities.md)
- [WasmVariant](type-aliases/WasmVariant.md)

## Variables

- [WASM\_VARIANTS](variables/WASM_VARIANTS.md)

## Functions

- [createLogger](functions/createLogger.md)
- [deserializeBiometricsError](functions/deserializeBiometricsError.md)
- [emitBiometricsDiagnostic](functions/emitBiometricsDiagnostic.md)
- [getBiometricsFaceFromCaptureResult](functions/getBiometricsFaceFromCaptureResult.md)
- [isFaceCaptureResult](functions/isFaceCaptureResult.md)
- [isWasmVariant](functions/isWasmVariant.md)
- [normalizeBiometricsError](functions/normalizeBiometricsError.md)
- [sanitizeBiometricsResourceUrl](functions/sanitizeBiometricsResourceUrl.md)
- [selectWasmVariant](functions/selectWasmVariant.md)
- [serializeBiometricsError](functions/serializeBiometricsError.md)
- [unwrapBiometricsWorkerResult](functions/unwrapBiometricsWorkerResult.md)
