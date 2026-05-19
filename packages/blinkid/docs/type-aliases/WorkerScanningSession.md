[**@microblink/blinkid**](../README.md)

***

[@microblink/blinkid](../README.md) / WorkerScanningSession

# Type Alias: WorkerScanningSession

> **WorkerScanningSession** = `Omit`\<[`BlinkIdScanningSession`](BlinkIdScanningSession.md), `"process"` \| `"getResult"` \| `"deleteLater"` \| `"isAliasOf"`\> & `object`

The worker scanning session.

## Type declaration

### getResolvedSessionSettings()

> **getResolvedSessionSettings**: () => [`BlinkIdSessionSettings`](BlinkIdSessionSettings.md)

Gets the resolved settings used to configure the recognizer.

#### Returns

[`BlinkIdSessionSettings`](BlinkIdSessionSettings.md)

The resolved settings.

### getResult()

> **getResult**: () => [`BlinkIdScanningResult`](BlinkIdScanningResult.md) \| `Promise`\<[`BlinkIdScanningResult`](BlinkIdScanningResult.md)\>

Returns the result of the scanning session.

Applies resolved redaction settings when a resolver is configured and the
document class info is available. Otherwise, SDK defaults apply.

#### Returns

[`BlinkIdScanningResult`](BlinkIdScanningResult.md) \| `Promise`\<[`BlinkIdScanningResult`](BlinkIdScanningResult.md)\>

The scanning result.

### getScanningStatus()

> **getScanningStatus**: () => [`ScanningStatus`](ScanningStatus.md)

Gets the scanning status.

#### Returns

[`ScanningStatus`](ScanningStatus.md)

The scanning status.

### getSettings()

> **getSettings**: () => [`BlinkIdSessionSettings`](BlinkIdSessionSettings.md)

Gets the settings.

#### Returns

[`BlinkIdSessionSettings`](BlinkIdSessionSettings.md)

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
