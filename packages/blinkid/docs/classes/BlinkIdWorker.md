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

### createScanningSession()

> **createScanningSession**(`sessionSettings?`, `options?`): `Omit`\<[`BlinkIdScanningSession`](../type-aliases/BlinkIdScanningSession.md), `"process"` \| `"getResult"` \| `"deleteLater"` \| `"isAliasOf"`\> & `object` & `ProxyMarked`

This method creates a BlinkID scanning session.

#### Parameters

##### sessionSettings?

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

`Partial`\<\{ `barcodeModule`: `Partial`\<`null` \| [`BarcodeModuleSettings`](../type-aliases/BarcodeModuleSettings.md)\>; `documentCaptureModule`: `Partial`\<`null` \| [`DocumentCaptureModuleSettings`](../type-aliases/DocumentCaptureModuleSettings.md)\>; `maxAllowedMismatchesPerField`: `number`; `mrzModule`: `Partial`\<`null` \| [`MrzModuleSettings`](../type-aliases/MrzModuleSettings.md)\>; `vizModule`: `Partial`\<`null` \| [`VizModuleSettings`](../type-aliases/VizModuleSettings.md)\>; \}\>

##### options?

[`BlinkIdCreateScanningSessionOptions`](../type-aliases/BlinkIdCreateScanningSessionOptions.md)

#### Returns

The session.

***

### getDefaultRedactionSettings()

> **getDefaultRedactionSettings**(`documentType`): [`RedactionSettings`](../type-aliases/RedactionSettings.md)

#### Parameters

##### documentType

[`DocumentClassInfo`](../type-aliases/DocumentClassInfo.md)

#### Returns

[`RedactionSettings`](../type-aliases/RedactionSettings.md)

***

### initBlinkId()

> **initBlinkId**(`settings`, `progressCallback?`): `Promise`\<`void`\>

This method initializes everything.

#### Parameters

##### settings

[`BlinkIdWorkerInitSettings`](../type-aliases/BlinkIdWorkerInitSettings.md)

##### progressCallback?

[`ProgressStatusCallback`](../type-aliases/ProgressStatusCallback.md)

#### Returns

`Promise`\<`void`\>

***

### reportPinglet()

> **reportPinglet**(`pinglet`): `void`

#### Parameters

##### pinglet

[`Ping`](../type-aliases/Ping.md)

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
