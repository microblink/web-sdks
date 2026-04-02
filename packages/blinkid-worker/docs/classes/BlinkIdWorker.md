[**@microblink/blinkid-worker**](../README.md)

***

[@microblink/blinkid-worker](../README.md) / BlinkIdWorker

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

> **createBlinkIdScanningSession**(`options?`): `Omit`\<`BlinkIdScanningSession`, `"deleteLater"` \| `"isAliasOf"` \| `"process"`\> & `object` & `ProxyMarked`

Backward-compatible alias for `createScanningSession`.

#### Parameters

##### options?

###### inputImageSource?

`InputImageSource`

The type of image source for the scanning session.

Defines whether the images are sourced from a video stream or a single
photo, as defined by `InputImageSource`. The default is set to `video` for
real-time scanning through a camera feed.

- `video` - Uses continuous camera feed for scanning
- `photo` - Uses a single captured photo for scanning

**Default Value**

`video`

###### scanningMode?

`ScanningMode`

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

`Partial`\<\{ `allowUncertainFrontSideScan`: `boolean`; `anonymizationMode?`: `AnonymizationMode`; `blurDetectionLevel`: `DetectionLevel`; `combineResultsFromMultipleInputImages`: `boolean`; `croppedImageSettings`: `Partial`\<`CroppedImageSettings`\>; `customDocumentAnonymizationSettings`: `DocumentAnonymizationSettings`[]; `customDocumentRules`: `Partial`\<`DocumentRules`\>[]; `enableBarcodeScanOnly`: `boolean`; `enableCharacterValidation`: `boolean`; `glareDetectionLevel`: `DetectionLevel`; `inputImageMargin`: `number`; `maxAllowedMismatchesPerField`: `number`; `recognitionModeFilter`: `Partial`\<`RecognitionModeFilter`\>; `returnInputImages`: `boolean`; `scanCroppedDocumentImage`: `boolean`; `scanPassportDataPageOnly`: `boolean`; `scanUnsupportedBack`: `boolean`; `skipImagesOccludedByHand`: `boolean`; `skipImagesWithBlur`: `boolean`; `skipImagesWithGlare`: `boolean`; `skipImagesWithInadequateLightingConditions`: `boolean`; `tiltDetectionLevel`: `DetectionLevel`; \}\>

#### Returns

#### Deprecated

Use `createScanningSession` instead.

***

### createScanningSession()

> **createScanningSession**(`options?`): `Omit`\<`BlinkIdScanningSession`, `"deleteLater"` \| `"isAliasOf"` \| `"process"`\> & `object` & `ProxyMarked`

This method creates a BlinkID scanning session.

#### Parameters

##### options?

The options for the session.

###### inputImageSource?

`InputImageSource`

The type of image source for the scanning session.

Defines whether the images are sourced from a video stream or a single
photo, as defined by `InputImageSource`. The default is set to `video` for
real-time scanning through a camera feed.

- `video` - Uses continuous camera feed for scanning
- `photo` - Uses a single captured photo for scanning

**Default Value**

`video`

###### scanningMode?

`ScanningMode`

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

`Partial`\<\{ `allowUncertainFrontSideScan`: `boolean`; `anonymizationMode?`: `AnonymizationMode`; `blurDetectionLevel`: `DetectionLevel`; `combineResultsFromMultipleInputImages`: `boolean`; `croppedImageSettings`: `Partial`\<`CroppedImageSettings`\>; `customDocumentAnonymizationSettings`: `DocumentAnonymizationSettings`[]; `customDocumentRules`: `Partial`\<`DocumentRules`\>[]; `enableBarcodeScanOnly`: `boolean`; `enableCharacterValidation`: `boolean`; `glareDetectionLevel`: `DetectionLevel`; `inputImageMargin`: `number`; `maxAllowedMismatchesPerField`: `number`; `recognitionModeFilter`: `Partial`\<`RecognitionModeFilter`\>; `returnInputImages`: `boolean`; `scanCroppedDocumentImage`: `boolean`; `scanPassportDataPageOnly`: `boolean`; `scanUnsupportedBack`: `boolean`; `skipImagesOccludedByHand`: `boolean`; `skipImagesWithBlur`: `boolean`; `skipImagesWithGlare`: `boolean`; `skipImagesWithInadequateLightingConditions`: `boolean`; `tiltDetectionLevel`: `DetectionLevel`; \}\>

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

`BlinkIdSessionSettings`

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
