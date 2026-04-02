[**@microblink/blinkid-verify-core**](../README.md)

***

[@microblink/blinkid-verify-core](../README.md) / WorkerScanningSession

# Type Alias: WorkerScanningSession

> **WorkerScanningSession** = `Omit`\<[`BlinkIdVerifyScanningSession`](BlinkIdVerifyScanningSession.md), `"process"` \| `"deleteLater"` \| `"isAliasOf"` \| `"clone"`\> & `object`

The worker scanning session.

## Type declaration

### getSettings()

> **getSettings**: () => [`BlinkIdVerifySessionSettings`](BlinkIdVerifySessionSettings.md)

Gets the settings.

#### Returns

[`BlinkIdVerifySessionSettings`](BlinkIdVerifySessionSettings.md)

The settings.

### ping

> **ping**: [`BlinkIdVerifyWorker`](../classes/BlinkIdVerifyWorker.md)\[`"reportPinglet"`\]

### process()

> **process**: (`image`) => [`ProcessResultWithBuffer`](ProcessResultWithBuffer.md)

#### Parameters

##### image

`ImageData`

#### Returns

[`ProcessResultWithBuffer`](ProcessResultWithBuffer.md)

### sendPinglets

> **sendPinglets**: [`BlinkIdVerifyWorker`](../classes/BlinkIdVerifyWorker.md)\[`"sendPinglets"`\]

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
