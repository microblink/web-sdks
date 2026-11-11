[**@microblink/biometrics**](../README.md)

***

[@microblink/biometrics](../README.md) / BiometricsSessionContext

# Type Alias: BiometricsSessionContext

> **BiometricsSessionContext** = `object`

Session-scoped access to the native analytics transport.

## Properties

### sessionId

> `readonly` **sessionId**: `string`

***

### sessionNumber

> `readonly` **sessionNumber**: `number`

***

### traceId

> `readonly` **traceId**: `string`

## Methods

### flush()

> **flush**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### report()

> **report**(`event`): `Promise`\<`void`\>

#### Parameters

##### event

`Omit`\<[`PingBrowserDeviceInfo`](PingBrowserDeviceInfo.md), `"sessionNumber"`\> \| `Omit`\<[`PingError`](PingError.md), `"sessionNumber"`\> \| `Omit`\<[`PingCameraHardwareInfo`](PingCameraHardwareInfo.md), `"sessionNumber"`\> \| `Omit`\<[`PingLog`](PingLog.md), `"sessionNumber"`\> \| `Omit`\<[`PingCameraInputInfo`](PingCameraInputInfo.md), `"sessionNumber"`\> \| `Omit`\<[`PingCameraPermission`](PingCameraPermission.md), `"sessionNumber"`\> \| `Omit`\<[`PingSdkInitStart`](PingSdkInitStart.md), `"sessionNumber"`\> \| `Omit`\<[`PingScanningConditions`](PingScanningConditions.md), `"sessionNumber"`\> \| `Omit`\<[`PingUpload`](PingUpload.md), `"sessionNumber"`\> \| `Omit`\<[`PingUxEvent`](PingUxEvent.md), `"sessionNumber"`\> \| `Omit`\<[`PingWrapperProductInfo`](PingWrapperProductInfo.md), `"sessionNumber"`\>

#### Returns

`Promise`\<`void`\>
