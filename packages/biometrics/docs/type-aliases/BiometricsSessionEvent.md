[**@microblink/biometrics**](../README.md)

***

[@microblink/biometrics](../README.md) / BiometricsSessionEvent

# Type Alias: BiometricsSessionEvent

> **BiometricsSessionEvent** = \{ `feedback`: [`UnifiedFeedback`](UnifiedFeedback.md); `kind`: `"faceGuidance"`; \} \| \{ `data`: [`CaptureTechnicalData`](CaptureTechnicalData.md); `kind`: `"captureTechnicalData"`; \} \| \{ `kind`: `"captureFinished"`; `result`: [`FaceCaptureResult`](FaceCaptureResult.md); \} \| \{ `kind`: `"captureTimeout"`; \}

Events surfaced by [BiometricsSession](BiometricsSession.md).
