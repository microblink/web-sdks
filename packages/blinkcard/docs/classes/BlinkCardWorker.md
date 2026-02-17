[**@microblink/blinkcard**](../README.md)

***

[@microblink/blinkcard](../README.md) / BlinkCardWorker

# Class: BlinkCardWorker

The BlinkCard worker.

## Constructors

### Constructor

> **new BlinkCardWorker**(): `BlinkCardWorker`

#### Returns

`BlinkCardWorker`

## Properties

### progressStatusCallback?

> `optional` **progressStatusCallback**: [`ProgressStatusCallback`](../type-aliases/ProgressStatusCallback.md)

The progress status callback.

## Methods

### \[finalizer\]()

> **\[finalizer\]**(): `void`

This method is called when the worker is terminated.

#### Returns

`void`

***

### createProxySession()

> **createProxySession**(`session`): `object` & `object` & `ProxyMarked`

This method creates a proxy session.

#### Parameters

##### session

[`BlinkCardScanningSession`](../type-aliases/BlinkCardScanningSession.md)

The BlinkCard scanning session.

#### Returns

The proxy session.

***

### createScanningSession()

> **createScanningSession**(`sessionSettings?`): `object` & `object` & `ProxyMarked`

This method creates a BlinkCard scanning session.

#### Parameters

##### sessionSettings?

The options for the session.

###### inputImageSource?

[`InputImageSource`](../type-aliases/InputImageSource.md)

The type of image source for the scanning session.

This type is used to indicate whether an image was obtained from a video
stream or a single-source input such as a standalone photo. The default is
set to `Video`.

###### scanningSettings?

`Partial`\<\{ `anonymizationSettings`: `Partial`\<`OverrideProperties`\<[`AnonymizationSettings`](../type-aliases/AnonymizationSettings.md), \{ `cardNumberAnonymizationSettings`: `Partial`\<[`CardNumberAnonymizationSettings`](../type-aliases/CardNumberAnonymizationSettings.md)\>; \}\>\>; `croppedImageSettings`: `Partial`\<[`CroppedImageSettings`](../type-aliases/CroppedImageSettings.md)\>; `extractionSettings`: `Partial`\<[`ExtractionSettings`](../type-aliases/ExtractionSettings.md)\>; `inputImageMargin`: `number`; `livenessSettings`: `Partial`\<[`LivenessSettings`](../type-aliases/LivenessSettings.md)\>; `skipImagesWithBlur`: `boolean`; `tiltDetectionLevel`: [`DetectionLevel`](../type-aliases/DetectionLevel.md); \}\>

#### Returns

The session.

***

### initBlinkCard()

> **initBlinkCard**(`settings`, `progressCallback?`): `Promise`\<`void`\>

This method initializes the BlinkCard Wasm module.

#### Parameters

##### settings

[`BlinkCardWorkerInitSettings`](../type-aliases/BlinkCardWorkerInitSettings.md)

##### progressCallback?

[`ProgressStatusCallback`](../type-aliases/ProgressStatusCallback.md)

#### Returns

`Promise`\<`void`\>

***

### reportPinglet()

> **reportPinglet**(`__namedParameters`): `void`

#### Parameters

##### \_\_namedParameters

`Ping`

#### Returns

`void`

***

### sendPinglets()

> **sendPinglets**(): `void`

#### Returns

`void`

***

### terminate()

> **terminate**(): `Promise`\<`void`\>

Terminates the workers and the Wasm runtime.

#### Returns

`Promise`\<`void`\>
