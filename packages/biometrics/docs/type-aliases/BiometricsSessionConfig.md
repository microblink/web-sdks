[**@microblink/biometrics**](../README.md)

***

[@microblink/biometrics](../README.md) / BiometricsSessionConfig

# Type Alias: BiometricsSessionConfig

> **BiometricsSessionConfig** = `object`

Per-session face capture options.

## Properties

### captureFace?

> `optional` **captureFace?**: `Omit`\<[`CaptureFaceConfig`](CaptureFaceConfig.md), `"timeoutMs"` \| `"onFeedbackChange"` \| `"onStateChange"` \| `"onCapture"` \| `"onTimeout"` \| `"onError"` \| `"onAnalysisResult"`\> & `object`

Additional capture session and attempt options.

#### Type Declaration

##### thresholds?

> `optional` **thresholds?**: `FaceAnalysisSessionSettings`

Native quality thresholds fixed for this session and reused by every capture attempt.

***

### captureTimeoutMs?

> `optional` **captureTimeoutMs?**: `number` \| `null`

Capture timeout in milliseconds. Set to `null` to disable.

#### Default

```ts
60000
```
