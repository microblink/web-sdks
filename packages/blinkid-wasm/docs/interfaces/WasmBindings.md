[**@microblink/blinkid-wasm**](../README.md)

***

[@microblink/blinkid-wasm](../README.md) / WasmBindings

# Interface: WasmBindings\<TSessionSettings, TScanningSession\>

## Extended by

- [`WasmModule`](WasmModule.md)

## Type Parameters

### TSessionSettings

`TSessionSettings`

### TScanningSession

`TScanningSession`

## Properties

### arePingRequestsInProgress()

> **arePingRequestsInProgress**: () => `boolean`

#### Returns

`boolean`

***

### createScanningSession()

> **createScanningSession**: (`sessionSettings`, `userId`) => `TScanningSession`

#### Parameters

##### sessionSettings

`TSessionSettings`

##### userId

`string`

#### Returns

`TScanningSession`

***

### getActiveLicenseTokenInfo()

> **getActiveLicenseTokenInfo**: () => [`LicenseUnlockResult`](../type-aliases/LicenseUnlockResult.md)

#### Returns

[`LicenseUnlockResult`](../type-aliases/LicenseUnlockResult.md)

***

### initializeSdk()

> **initializeSdk**: (`userId`) => `void`

#### Parameters

##### userId

`string`

#### Returns

`void`

***

### initializeWithLicenseKey()

> **initializeWithLicenseKey**: (`licenceKey`, `userId`, `allowHelloMessage`) => [`LicenseUnlockResult`](../type-aliases/LicenseUnlockResult.md)

#### Parameters

##### licenceKey

`string`

##### userId

`string`

##### allowHelloMessage

`boolean`

#### Returns

[`LicenseUnlockResult`](../type-aliases/LicenseUnlockResult.md)

***

### isPingEnabled()

> **isPingEnabled**: () => `boolean`

#### Returns

`boolean`

***

### queuePinglet()

> **queuePinglet**: (`data`, `schemaName`, `schemaVersion`, `sessionNumber`) => `void`

#### Parameters

##### data

`string`

##### schemaName

`string`

##### schemaVersion

`string`

##### sessionNumber

`number`

#### Returns

`void`

***

### sendPinglets()

> **sendPinglets**: () => `void`

#### Returns

`void`

***

### setPingProxyUrl()

> **setPingProxyUrl**: (`url`) => `void`

#### Parameters

##### url

`string`

#### Returns

`void`

***

### submitServerPermission()

> **submitServerPermission**: (`serverPermission`) => `undefined` \| `Readonly`\<\{ `error`: [`ServerPermissionErrorReason`](../type-aliases/ServerPermissionErrorReason.md); `lease`: `number`; `networkErrorDescription?`: `string`; \}\>

#### Parameters

##### serverPermission

`string`

#### Returns

`undefined` \| `Readonly`\<\{ `error`: [`ServerPermissionErrorReason`](../type-aliases/ServerPermissionErrorReason.md); `lease`: `number`; `networkErrorDescription?`: `string`; \}\>

***

### terminateSdk()

> **terminateSdk**: () => `void`

#### Returns

`void`
