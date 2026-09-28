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

`Omit`\<`PingBrowserDeviceInfo`, `"sessionNumber"`\> \| `Omit`\<`PingError`, `"sessionNumber"`\> \| `Omit`\<`PingCameraHardwareInfo`, `"sessionNumber"`\> \| `Omit`\<`PingLog`, `"sessionNumber"`\> \| `Omit`\<`PingCameraInputInfo`, `"sessionNumber"`\> \| `Omit`\<`PingCameraPermission`, `"sessionNumber"`\> \| `Omit`\<`PingSdkInitStart`, `"sessionNumber"`\> \| `Omit`\<`PingScanningConditions`, `"sessionNumber"`\> \| `Omit`\<`PingUpload`, `"sessionNumber"`\> \| `Omit`\<`PingUxEvent`, `"sessionNumber"`\> \| `Omit`\<`PingWrapperProductInfo`, `"sessionNumber"`\>

#### Returns

`Promise`\<`void`\>
