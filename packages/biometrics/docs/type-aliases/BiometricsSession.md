[**@microblink/biometrics**](../README.md)

***

[@microblink/biometrics](../README.md) / BiometricsSession

# Type Alias: BiometricsSession

> **BiometricsSession** = `object`

Headless session for one face capture.

## Methods

### finish()

> **finish**(): `void`

#### Returns

`void`

***

### getSessionContext()

> **getSessionContext**(): `Promise`\<[`BiometricsSessionContext`](BiometricsSessionContext.md)\>

#### Returns

`Promise`\<[`BiometricsSessionContext`](BiometricsSessionContext.md)\>

***

### getState()

> **getState**(): [`BiometricsSessionState`](BiometricsSessionState.md)

#### Returns

[`BiometricsSessionState`](BiometricsSessionState.md)

***

### onDiagnostic()

> **onDiagnostic**(`listener`): () => `void`

#### Parameters

##### listener

[`BiometricsDiagnosticCallback`](BiometricsDiagnosticCallback.md)

#### Returns

() => `void`

***

### onError()

> **onError**(`listener`): () => `void`

#### Parameters

##### listener

(`error`) => `void`

#### Returns

() => `void`

***

### onEvent()

> **onEvent**(`listener`): () => `void`

#### Parameters

##### listener

(`event`) => `void`

#### Returns

() => `void`

***

### processFrame()

> **processFrame**(`imageData`): `Promise`\<`ArrayBuffer`\>

Feed camera frames while [BiometricsSession.run](#run) is in progress.

#### Parameters

##### imageData

`ImageData`

#### Returns

`Promise`\<`ArrayBuffer`\>

***

### retry()

> **retry**(): `Promise`\<[`FaceCaptureResult`](FaceCaptureResult.md)\>

#### Returns

`Promise`\<[`FaceCaptureResult`](FaceCaptureResult.md)\>

***

### run()

> **run**(): `Promise`\<[`FaceCaptureResult`](FaceCaptureResult.md)\>

Starts face capture.

#### Returns

`Promise`\<[`FaceCaptureResult`](FaceCaptureResult.md)\>

***

### setCameraSource()

> **setCameraSource**(`videoElement`, `track`): `void`

Set the camera source used by subsequent capture attempts.

#### Parameters

##### videoElement

`HTMLVideoElement` \| `undefined`

##### track

`MediaStreamTrack` \| `undefined`

#### Returns

`void`

***

### setCaptureTimeoutPaused()

> **setCaptureTimeoutPaused**(`paused`): `void`

Pauses or resumes the active capture attempt's timeout.

#### Parameters

##### paused

`boolean`

#### Returns

`void`

***

### subscribe()

> **subscribe**(`listener`): () => `void`

#### Parameters

##### listener

(`state`) => `void`

#### Returns

() => `void`
