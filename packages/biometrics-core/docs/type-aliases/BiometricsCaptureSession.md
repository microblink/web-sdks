[**@microblink/biometrics-core**](../README.md)

***

[@microblink/biometrics-core](../README.md) / BiometricsCaptureSession

# Type Alias: BiometricsCaptureSession

> **BiometricsCaptureSession** = `object`

Capture session that can contain multiple capture attempts.

## Properties

### context

> `readonly` **context**: [`CaptureSessionContext`](CaptureSessionContext.md)

***

### getState

> **getState**: () => [`CaptureStore`](CaptureStore.md)

#### Returns

[`CaptureStore`](CaptureStore.md)

***

### subscribe

> **subscribe**: [`CaptureSubscribe`](CaptureSubscribe.md)

## Methods

### capture()

> **capture**(`config`): `Promise`\<[`FaceCaptureResult`](FaceCaptureResult.md)\>

#### Parameters

##### config

[`CaptureFaceConfig`](CaptureFaceConfig.md)

#### Returns

`Promise`\<[`FaceCaptureResult`](FaceCaptureResult.md)\>

***

### close()

> **close**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### processFrame()

> **processFrame**(`imageData`): `Promise`\<`ArrayBuffer`\>

#### Parameters

##### imageData

`ImageData`

#### Returns

`Promise`\<`ArrayBuffer`\>

***

### setCameraSource()

> **setCameraSource**(`videoElement`, `track`): `void`

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

#### Parameters

##### paused

`boolean`

#### Returns

`void`
