[**@microblink/biometrics-ux-manager**](../../README.md)

***

[@microblink/biometrics-ux-manager](../../README.md) / [index](../README.md) / BiometricsUxSession

# Type Alias: BiometricsUxSession\<Result, Event, SessionError, DiagnosticEvent\>

> **BiometricsUxSession**\<`Result`, `Event`, `SessionError`, `DiagnosticEvent`\> = `object`

## Type Parameters

### Result

`Result` = `unknown`

### Event

`Event` = [`BiometricsUxSessionEvent`](BiometricsUxSessionEvent.md)

### SessionError

`SessionError` = [`BiometricsError`](../classes/BiometricsError.md)

### DiagnosticEvent

`DiagnosticEvent` = [`BiometricsDiagnosticEvent`](BiometricsDiagnosticEvent.md)

## Methods

### finish()

> **finish**(): `void`

#### Returns

`void`

***

### getState()

> **getState**(): [`BiometricsUxSessionState`](BiometricsUxSessionState.md)\<`Result`, `SessionError`\>

#### Returns

[`BiometricsUxSessionState`](BiometricsUxSessionState.md)\<`Result`, `SessionError`\>

***

### onDiagnostic()

> **onDiagnostic**(`listener`): () => `void`

#### Parameters

##### listener

(`event`) => `void`

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

#### Parameters

##### imageData

`ImageData`

#### Returns

`Promise`\<`ArrayBuffer`\>

***

### retry()

> **retry**(): `Promise`\<`Result`\>

#### Returns

`Promise`\<`Result`\>

***

### run()

> **run**(): `Promise`\<`Result`\>

#### Returns

`Promise`\<`Result`\>

***

### setCameraSource()?

> `optional` **setCameraSource**(`videoElement`, `track`): `void`

#### Parameters

##### videoElement

`HTMLVideoElement` \| `undefined`

##### track

`MediaStreamTrack` \| `undefined`

#### Returns

`void`

***

### setCaptureTimeoutPaused()?

> `optional` **setCaptureTimeoutPaused**(`paused`): `void`

Pauses or resumes the active capture timeout when supported.

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
