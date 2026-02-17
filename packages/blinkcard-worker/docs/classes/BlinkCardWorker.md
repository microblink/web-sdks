[**@microblink/blinkcard-worker**](../README.md)

***

[@microblink/blinkcard-worker](../README.md) / BlinkCardWorker

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

`BlinkCardScanningSession`

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

`InputImageSource`

The type of image source for the scanning session.

This type is used to indicate whether an image was obtained from a video
stream or a single-source input such as a standalone photo. The default is
set to `Video`.

###### scanningSettings?

`Partial`\<\{ `anonymizationSettings`: `Partial`\<`OverrideProperties`\<`AnonymizationSettings`, \{ `cardNumberAnonymizationSettings`: `Partial`\<`CardNumberAnonymizationSettings`\>; \}\>\>; `croppedImageSettings`: `Partial`\<`CroppedImageSettings`\>; `extractionSettings`: `Partial`\<`ExtractionSettings`\>; `inputImageMargin`: `number`; `livenessSettings`: `Partial`\<`LivenessSettings`\>; `skipImagesWithBlur`: `boolean`; `tiltDetectionLevel`: `DetectionLevel`; \}\>

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
