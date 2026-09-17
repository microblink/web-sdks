[**@microblink/blinkid-verify**](../README.md)

***

[@microblink/blinkid-verify](../README.md) / Camera

# Class: Camera

Represents a camera device and its active stream.

## See

https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/getCapabilities for more details.

## Constructors

### Constructor

> **new Camera**(`deviceInfo`): `Camera`

Creates a new Camera instance.

#### Parameters

##### deviceInfo

`InputDeviceInfo`

The device info.

#### Returns

`Camera`

## Properties

### store

> **store**: `Omit`\<`StoreApi`\<`CameraState`\>, `"subscribe"`\> & `object`

The internal state of the camera, implemented as a Zustand store.

#### Type Declaration

##### subscribe

> **subscribe**: \{(`listener`): () => `void`; \<`U`\>(`selector`, `listener`, `options?`): () => `void`; \}

###### Call Signature

> (`listener`): () => `void`

###### Parameters

###### listener

(`selectedState`, `previousSelectedState`) => `void`

###### Returns

() => `void`

###### Call Signature

> \<`U`\>(`selector`, `listener`, `options?`): () => `void`

###### Type Parameters

###### U

`U`

###### Parameters

###### selector

(`state`) => `U`

###### listener

(`selectedState`, `previousSelectedState`) => `void`

###### options?

###### equalityFn?

(`a`, `b`) => `boolean`

###### fireImmediately?

`boolean`

###### Returns

() => `void`

## Accessors

### activeStream

#### Get Signature

> **get** **activeStream**(): `MediaStream` \| `undefined`

##### Returns

`MediaStream` \| `undefined`

***

### deviceInfo

#### Get Signature

> **get** **deviceInfo**(): `InputDeviceInfo`

The device info.

##### Returns

`InputDeviceInfo`

***

### facingMode

#### Get Signature

> **get** **facingMode**(): [`FacingMode`](../type-aliases/FacingMode.md)

##### Returns

[`FacingMode`](../type-aliases/FacingMode.md)

***

### maxSupportedResolution

#### Get Signature

> **get** **maxSupportedResolution**(): `"720p"` \| `"1080p"` \| `"4k"` \| `undefined`

##### Returns

`"720p"` \| `"1080p"` \| `"4k"` \| `undefined`

***

### name

#### Get Signature

> **get** **name**(): `string`

##### Returns

`string`

***

### singleShotSupported

#### Get Signature

> **get** **singleShotSupported**(): `boolean`

##### Returns

`boolean`

***

### streamCapabilities

#### Get Signature

> **get** **streamCapabilities**(): `MediaTrackCapabilities` \| `undefined`

Stream capabilities as reported by the stream.

On iOS it's the same as `deviceCapabilities`. Firefox is only reporting rudimentary capabilities, so we can't rely
on this for picking the right camera.

##### See

https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/getCapabilities

##### Returns

`MediaTrackCapabilities` \| `undefined`

***

### torchEnabled

#### Get Signature

> **get** **torchEnabled**(): `boolean`

##### Returns

`boolean`

***

### torchSupported

#### Get Signature

> **get** **torchSupported**(): `boolean`

##### Returns

`boolean`

## Methods

### getVideoTrack()

> **getVideoTrack**(): `MediaStreamTrack` \| `undefined`

Gets the video track on the camera.

#### Returns

`MediaStreamTrack` \| `undefined`

The video track.

***

### startStream()

> **startStream**(`resolution`): `Promise`\<`MediaStream`\>

Starts a stream with the specified resolution.

#### Parameters

##### resolution

`"720p"` \| `"1080p"` \| `"4k"`

The resolution to start the stream with.

#### Returns

`Promise`\<`MediaStream`\>

The stream.

***

### stopStream()

> **stopStream**(): `void`

Stops the stream on the camera.

#### Returns

`void`

***

### subscribe()

#### Call Signature

> **subscribe**(`listener`): () => `void`

Subscribe to camera state changes.

##### Parameters

###### listener

(`selectedState`, `previousSelectedState`) => `void`

Listener function that gets called when state changes

##### Returns

Unsubscribe function

() => `void`

#### Call Signature

> **subscribe**\<`U`\>(`selector`, `listener`, `options?`): () => `void`

Subscribe to camera state changes with selector.

##### Type Parameters

###### U

`U`

##### Parameters

###### selector

(`state`) => `U`

Function to select specific state slice

###### listener

(`selectedState`, `previousSelectedState`) => `void`

Listener function that gets called when selected state changes

###### options?

Optional subscription options

###### equalityFn?

(`a`, `b`) => `boolean`

###### fireImmediately?

`boolean`

##### Returns

Unsubscribe function

() => `void`

***

### toggleTorch()

> **toggleTorch**(): `Promise`\<`boolean`\>

Toggles the torch on the camera.

#### Returns

`Promise`\<`boolean`\>

The torch status.

***

### unsubscribeAll()

> **unsubscribeAll**(): `void`

#### Returns

`void`
