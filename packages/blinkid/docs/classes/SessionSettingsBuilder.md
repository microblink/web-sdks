[**@microblink/blinkid**](../README.md)

***

[@microblink/blinkid](../README.md) / SessionSettingsBuilder

# Class: SessionSettingsBuilder

## Constructors

### Constructor

> **new SessionSettingsBuilder**(`core`): `SessionSettingsBuilder`

#### Parameters

##### core

###### progressStatusCallback?

`Promise`\<`undefined`\> \| `Remote`\<[`ProgressStatusCallback`](../type-aliases/ProgressStatusCallback.md)\>

Progress callback used during initialization.

###### buildDocumentPhotoSettings

###### buildDocumentVideoSettings

###### buildStandaloneBarcodeSettings

###### buildVerifyCaptureSettings

###### createScanningSession

###### getDefaultRedactionSettings

###### initBlinkId

###### reportPinglet

###### sendPinglets

###### terminate

#### Returns

`SessionSettingsBuilder`

## Methods

### buildDocumentPhotoSettings()

> **buildDocumentPhotoSettings**(`useCase?`): `Promise`\<[`NonNullSessionSettings`](../type-aliases/NonNullSessionSettings.md)\>

#### Parameters

##### useCase?

[`DocumentPhotoUseCase`](../type-aliases/DocumentPhotoUseCase.md)

#### Returns

`Promise`\<[`NonNullSessionSettings`](../type-aliases/NonNullSessionSettings.md)\>

***

### buildDocumentVideoSettings()

> **buildDocumentVideoSettings**(`useCase?`): `Promise`\<[`NonNullSessionSettings`](../type-aliases/NonNullSessionSettings.md)\>

#### Parameters

##### useCase?

[`DocumentVideoUseCase`](../type-aliases/DocumentVideoUseCase.md)

#### Returns

`Promise`\<[`NonNullSessionSettings`](../type-aliases/NonNullSessionSettings.md)\>

***

### buildStandaloneBarcodeSettings()

> **buildStandaloneBarcodeSettings**(): `Promise`\<[`NonNullSessionSettings`](../type-aliases/NonNullSessionSettings.md)\>

#### Returns

`Promise`\<[`NonNullSessionSettings`](../type-aliases/NonNullSessionSettings.md)\>

***

### buildVerifyCaptureSettings()

> **buildVerifyCaptureSettings**(): `Promise`\<[`NonNullSessionSettings`](../type-aliases/NonNullSessionSettings.md)\>

#### Returns

`Promise`\<[`NonNullSessionSettings`](../type-aliases/NonNullSessionSettings.md)\>
