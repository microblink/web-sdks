[**@microblink/blinkid**](../README.md)

***

[@microblink/blinkid](../README.md) / BlinkIdWorker

# Class: BlinkIdWorker

The BlinkID worker.

## Constructors

### Constructor

> **new BlinkIdWorker**(): `BlinkIdWorker`

#### Returns

`BlinkIdWorker`

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

### ~~createBlinkIdScanningSession()~~

> **createBlinkIdScanningSession**(`options?`): `object` & `object` & `ProxyMarked`

Backward-compatible alias for `createScanningSession`.

#### Parameters

##### options?

###### inputImageSource?

[`InputImageSource`](../type-aliases/InputImageSource.md)

The type of image source for the scanning session.

Defines whether the images are sourced from a video stream or a single
photo, as defined by `InputImageSource`. The default is set to `video` for
real-time scanning through a camera feed.

- `video` - Uses continuous camera feed for scanning
- `photo` - Uses a single captured photo for scanning

**Default Value**

`video`

###### scanningMode?

[`ScanningMode`](../type-aliases/ScanningMode.md)

The scanning mode to be used during the scanning session.

Specifies whether the scanning is for a single side of a document or
multiple sides, as defined in `ScanningMode`. The default is set to
`automatic`, which automatically determines the number of sides to scan
based on the detected document type.

- `automatic` - Automatically determines required sides
- `single` - Scans only one side

**Default Value**

`automatic`

###### scanningSettings?

`Partial`\<\{ `allowUncertainFrontSideScan`: `boolean`; `anonymizationMode?`: [`AnonymizationMode`](../type-aliases/AnonymizationMode.md); `blurDetectionLevel`: [`DetectionLevel`](../type-aliases/DetectionLevel.md); `combineResultsFromMultipleInputImages`: `boolean`; `croppedImageSettings`: `Partial`\<[`CroppedImageSettings`](../type-aliases/CroppedImageSettings.md)\>; `customDocumentAnonymizationSettings`: [`DocumentAnonymizationSettings`](../type-aliases/DocumentAnonymizationSettings.md)[]; `customDocumentRules`: `Partial`\<[`DocumentRules`](../type-aliases/DocumentRules.md)\>[]; `enableBarcodeScanOnly`: `boolean`; `enableCharacterValidation`: `boolean`; `glareDetectionLevel`: [`DetectionLevel`](../type-aliases/DetectionLevel.md); `inputImageMargin`: `number`; `maxAllowedMismatchesPerField`: `number`; `recognitionModeFilter`: `Partial`\<[`RecognitionModeFilter`](../type-aliases/RecognitionModeFilter.md)\>; `returnInputImages`: `boolean`; `scanCroppedDocumentImage`: `boolean`; `scanPassportDataPageOnly`: `boolean`; `scanUnsupportedBack`: `boolean`; `skipImagesOccludedByHand`: `boolean`; `skipImagesWithBlur`: `boolean`; `skipImagesWithGlare`: `boolean`; `skipImagesWithInadequateLightingConditions`: `boolean`; `tiltDetectionLevel`: [`DetectionLevel`](../type-aliases/DetectionLevel.md); \}\>

#### Returns

#### Deprecated

Use `createScanningSession` instead.

***

### createProxySession()

> **createProxySession**(`session`, `sessionSettings`): `object` & `object` & `ProxyMarked`

This method creates a proxy session.

#### Parameters

##### session

[`BlinkIdScanningSession`](../type-aliases/BlinkIdScanningSession.md)

The session.

##### sessionSettings

[`BlinkIdSessionSettings`](../type-aliases/BlinkIdSessionSettings.md)

The session settings.

#### Returns

The proxy session.

***

### createScanningSession()

> **createScanningSession**(`options?`): `object` & `object` & `ProxyMarked`

This method creates a BlinkID scanning session.

#### Parameters

##### options?

The options for the session.

###### inputImageSource?

[`InputImageSource`](../type-aliases/InputImageSource.md)

The type of image source for the scanning session.

Defines whether the images are sourced from a video stream or a single
photo, as defined by `InputImageSource`. The default is set to `video` for
real-time scanning through a camera feed.

- `video` - Uses continuous camera feed for scanning
- `photo` - Uses a single captured photo for scanning

**Default Value**

`video`

###### scanningMode?

[`ScanningMode`](../type-aliases/ScanningMode.md)

The scanning mode to be used during the scanning session.

Specifies whether the scanning is for a single side of a document or
multiple sides, as defined in `ScanningMode`. The default is set to
`automatic`, which automatically determines the number of sides to scan
based on the detected document type.

- `automatic` - Automatically determines required sides
- `single` - Scans only one side

**Default Value**

`automatic`

###### scanningSettings?

`Partial`\<\{ `allowUncertainFrontSideScan`: `boolean`; `anonymizationMode?`: [`AnonymizationMode`](../type-aliases/AnonymizationMode.md); `blurDetectionLevel`: [`DetectionLevel`](../type-aliases/DetectionLevel.md); `combineResultsFromMultipleInputImages`: `boolean`; `croppedImageSettings`: `Partial`\<[`CroppedImageSettings`](../type-aliases/CroppedImageSettings.md)\>; `customDocumentAnonymizationSettings`: [`DocumentAnonymizationSettings`](../type-aliases/DocumentAnonymizationSettings.md)[]; `customDocumentRules`: `Partial`\<[`DocumentRules`](../type-aliases/DocumentRules.md)\>[]; `enableBarcodeScanOnly`: `boolean`; `enableCharacterValidation`: `boolean`; `glareDetectionLevel`: [`DetectionLevel`](../type-aliases/DetectionLevel.md); `inputImageMargin`: `number`; `maxAllowedMismatchesPerField`: `number`; `recognitionModeFilter`: `Partial`\<[`RecognitionModeFilter`](../type-aliases/RecognitionModeFilter.md)\>; `returnInputImages`: `boolean`; `scanCroppedDocumentImage`: `boolean`; `scanPassportDataPageOnly`: `boolean`; `scanUnsupportedBack`: `boolean`; `skipImagesOccludedByHand`: `boolean`; `skipImagesWithBlur`: `boolean`; `skipImagesWithGlare`: `boolean`; `skipImagesWithInadequateLightingConditions`: `boolean`; `tiltDetectionLevel`: [`DetectionLevel`](../type-aliases/DetectionLevel.md); \}\>

#### Returns

The session.

***

### initBlinkId()

> **initBlinkId**(`settings`, `defaultSessionSettings`, `progressCallback?`): `Promise`\<`void`\>

This method initializes everything.

#### Parameters

##### settings

[`BlinkIdWorkerInitSettings`](../type-aliases/BlinkIdWorkerInitSettings.md)

##### defaultSessionSettings

[`BlinkIdSessionSettings`](../type-aliases/BlinkIdSessionSettings.md)

##### progressCallback?

[`ProgressStatusCallback`](../type-aliases/ProgressStatusCallback.md)

#### Returns

`Promise`\<`void`\>

***

### reportPinglet()

> **reportPinglet**(`pinglet`): `void`

#### Parameters

##### pinglet

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
