[**@microblink/biometrics**](../README.md)

***

[@microblink/biometrics](../README.md) / BiometricsSessionState

# Type Alias: BiometricsSessionState

> **BiometricsSessionState** = \{ `phase`: `"idle"`; \} \| \{ `capture`: \{ `feedback`: [`UnifiedFeedback`](UnifiedFeedback.md); `sessionState`: `CaptureSessionState`; `technicalData?`: [`CaptureTechnicalData`](CaptureTechnicalData.md); \}; `phase`: `"capturing"`; \} \| \{ `error`: [`BiometricsError`](../classes/BiometricsError.md); `phase`: `"failed"`; `stage`: `"capture"`; \} \| \{ `phase`: `"succeeded"`; `result`: [`FaceCaptureResult`](FaceCaptureResult.md); \} \| \{ `phase`: `"finished"`; \}
