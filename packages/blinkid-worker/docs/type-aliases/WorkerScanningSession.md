[**@microblink/blinkid-worker**](../README.md)

***

[@microblink/blinkid-worker](../README.md) / WorkerScanningSession

# Type Alias: WorkerScanningSession

> **WorkerScanningSession** = `Omit`\<`BlinkIdScanningSession`, `"process"` \| `"deleteLater"` \| `"isAliasOf"`\> & `object`

The worker scanning session.

## Type declaration

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
