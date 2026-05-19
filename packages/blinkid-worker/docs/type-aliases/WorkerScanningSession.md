[**@microblink/blinkid-worker**](../README.md)

***

[@microblink/blinkid-worker](../README.md) / WorkerScanningSession

# Type Alias: WorkerScanningSession

> **WorkerScanningSession** = `Omit`\<`BlinkIdScanningSession`, `"process"` \| `"getResult"` \| `"deleteLater"` \| `"isAliasOf"`\> & `object`

The worker scanning session.

## Type declaration

### getResolvedSessionSettings()

> **getResolvedSessionSettings**: () => `BlinkIdSessionSettings`

Gets the resolved settings used to configure the recognizer.

#### Returns

`BlinkIdSessionSettings`

The resolved settings.

### getResult()

> **getResult**: () => `BlinkIdScanningResult` \| `Promise`\<`BlinkIdScanningResult`\>

Returns the result of the scanning session.

Applies resolved redaction settings when a resolver is configured and the
document class info is available. Otherwise, SDK defaults apply.

#### Returns

`BlinkIdScanningResult` \| `Promise`\<`BlinkIdScanningResult`\>

The scanning result.

### getScanningStatus()

> **getScanningStatus**: () => `ScanningStatus`

Gets the scanning status.

#### Returns

`ScanningStatus`

The scanning status.

### getSettings()

> **getSettings**: () => `BlinkIdSessionSettings`

Gets the settings.

#### Returns

`BlinkIdSessionSettings`

The settings.

### ping

> **ping**: [`BlinkIdWorker`](../classes/BlinkIdWorker.md)\[`"reportPinglet"`\]

### process()

> **process**: (`image`) => [`ProcessResultWithBuffer`](ProcessResultWithBuffer.md) \| [`BlinkIdSessionErrorWithBuffer`](BlinkIdSessionErrorWithBuffer.md)

#### Parameters

##### image

`ImageData`

#### Returns

[`ProcessResultWithBuffer`](ProcessResultWithBuffer.md) \| [`BlinkIdSessionErrorWithBuffer`](BlinkIdSessionErrorWithBuffer.md)

### sendPinglets

> **sendPinglets**: [`BlinkIdWorker`](../classes/BlinkIdWorker.md)\[`"sendPinglets"`\]

### showDemoOverlay()

> **showDemoOverlay**: () => `boolean`

Shows the demo overlay.

#### Returns

`boolean`

Whether the demo overlay is shown.

### showProductionOverlay()

> **showProductionOverlay**: () => `boolean`

Shows the production overlay.

#### Returns

`boolean`

Whether the production overlay is shown.
