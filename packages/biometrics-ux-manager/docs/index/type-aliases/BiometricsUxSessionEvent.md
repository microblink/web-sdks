[**@microblink/biometrics-ux-manager**](../../README.md)

***

[@microblink/biometrics-ux-manager](../../README.md) / [index](../README.md) / BiometricsUxSessionEvent

# Type Alias: BiometricsUxSessionEvent

> **BiometricsUxSessionEvent** = \{ `feedback`: `UnifiedFeedback`; `kind`: `"faceGuidance"`; \} \| \{ `data`: [`BiometricsCaptureTechnicalData`](BiometricsCaptureTechnicalData.md); `kind`: `"captureTechnicalData"`; \} \| \{ `kind`: `"captureFinished"`; `result`: `FaceCaptureResult`; \} \| \{ `kind`: `"captureTimeout"`; \}
