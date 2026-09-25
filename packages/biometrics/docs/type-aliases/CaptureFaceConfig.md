[**@microblink/biometrics**](../README.md)

***

[@microblink/biometrics](../README.md) / CaptureFaceConfig

# Type Alias: CaptureFaceConfig

> **CaptureFaceConfig** = `object`

Configuration options for one face capture attempt.

## Properties

### debugMode?

> `optional` **debugMode?**: `boolean`

Keeps the session in analysis/capturing mode for QA validation.

#### Default

```ts
false
```

***

### initialDelayMs?

> `optional` **initialDelayMs?**: `number`

Minimum time in milliseconds before capture can complete.

#### Default

```ts
1000
```

***

### onAnalysisResult?

> `optional` **onAnalysisResult?**: (`result`) => `void`

Called for every analyzed frame.

#### Parameters

##### result

`CaptureAnalysisResult`

#### Returns

`void`

***

### onCapture?

> `optional` **onCapture?**: (`result`) => `void`

Called when a face is captured successfully.

#### Parameters

##### result

[`FaceCaptureResult`](FaceCaptureResult.md)

#### Returns

`void`

***

### onError?

> `optional` **onError?**: (`error`) => `void`

Called when capture fails.

#### Parameters

##### error

[`BiometricsError`](../classes/BiometricsError.md)

#### Returns

`void`

***

### onFeedbackChange?

> `optional` **onFeedbackChange?**: (`feedback`) => `void`

Called when stabilized feedback changes.

#### Parameters

##### feedback

[`UnifiedFeedback`](UnifiedFeedback.md)

#### Returns

`void`

***

### onStateChange?

> `optional` **onStateChange?**: (`state`) => `void`

Called when the capture session state changes.

#### Parameters

##### state

`CaptureSessionState`

#### Returns

`void`

***

### onTimeout?

> `optional` **onTimeout?**: () => `void`

Called when capture times out.

#### Returns

`void`

***

### quality?

> `optional` **quality?**: `object`

Optional quality settings for the face capture.

#### captureMode?

> `optional` **captureMode?**: `CaptureMode`

"engineFrames" preserves native frames; "single" keeps only the best image.

##### Default

```ts
"engineFrames"
```

***

### timeoutMs?

> `optional` **timeoutMs?**: `number` \| `null`

Maximum capture duration in milliseconds. Set to `null` to disable.

#### Default

```ts
60000
```
