[**@microblink/blinkid-core**](../README.md)

***

[@microblink/blinkid-core](../README.md) / WorkerScanningSession

# Type Alias: WorkerScanningSession

> **WorkerScanningSession** = `Omit`\<[`BlinkIdScanningSession`](BlinkIdScanningSession.md), `"process"` \| `"deleteLater"` \| `"isAliasOf"`\> & `object`

The worker scanning session.

## Type declaration

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
