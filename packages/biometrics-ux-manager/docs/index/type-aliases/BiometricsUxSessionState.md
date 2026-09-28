[**@microblink/biometrics-ux-manager**](../../README.md)

***

[@microblink/biometrics-ux-manager](../../README.md) / [index](../README.md) / BiometricsUxSessionState

# Type Alias: BiometricsUxSessionState\<Result, SessionError\>

> **BiometricsUxSessionState**\<`Result`, `SessionError`\> = \{ `phase`: `"idle"`; \} \| \{ `capture`: \{ `feedback`: `UnifiedFeedback`; `sessionState`: `CaptureSessionState`; `technicalData?`: [`BiometricsCaptureTechnicalData`](BiometricsCaptureTechnicalData.md); \}; `phase`: `"capturing"`; \} \| \{ `phase`: `"processing"`; \} \| \{ `error`: `SessionError`; `phase`: `"failed"`; `stage`: [`BiometricsUxFailureStage`](BiometricsUxFailureStage.md); \} \| \{ `phase`: `"succeeded"`; `result`: `Result`; \} \| \{ `phase`: `"finished"`; \}

## Type Parameters

### Result

`Result` = `unknown`

### SessionError

`SessionError` = [`BiometricsError`](../classes/BiometricsError.md)

## Union Members

### Type Literal

\{ `phase`: `"idle"`; \}

***

### Type Literal

\{ `capture`: \{ `feedback`: `UnifiedFeedback`; `sessionState`: `CaptureSessionState`; `technicalData?`: [`BiometricsCaptureTechnicalData`](BiometricsCaptureTechnicalData.md); \}; `phase`: `"capturing"`; \}

***

### Type Literal

\{ `phase`: `"processing"`; \}

Capture completed and the session is processing the result before it succeeds or fails.

***

### Type Literal

\{ `error`: `SessionError`; `phase`: `"failed"`; `stage`: [`BiometricsUxFailureStage`](BiometricsUxFailureStage.md); \}

***

### Type Literal

\{ `phase`: `"succeeded"`; `result`: `Result`; \}

***

### Type Literal

\{ `phase`: `"finished"`; \}
