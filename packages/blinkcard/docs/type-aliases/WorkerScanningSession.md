[**@microblink/blinkcard**](../README.md)

***

[@microblink/blinkcard](../README.md) / WorkerScanningSession

# Type Alias: WorkerScanningSession

> **WorkerScanningSession** = `OverrideProperties`\<[`BlinkCardScanningSession`](BlinkCardScanningSession.md), \{ `process`: (`image`) => [`ProcessResultWithBuffer`](ProcessResultWithBuffer.md); \}\> & `object`

The worker scanning session.

## Type declaration

### getSessionId()

> **getSessionId**: () => `string`

Gets the session ID.

#### Returns

`string`

The session ID.

### getSessionNumber()

> **getSessionNumber**: () => `number`

Gets the session number.

#### Returns

`number`

The session number.

### getSettings()

> **getSettings**: () => [`BlinkCardSessionSettings`](BlinkCardSessionSettings.md)

Gets the settings.

#### Returns

[`BlinkCardSessionSettings`](BlinkCardSessionSettings.md)

The settings.

### ping

> **ping**: [`BlinkCardWorker`](../classes/BlinkCardWorker.md)\[`"reportPinglet"`\]

### sendPinglets

> **sendPinglets**: [`BlinkCardWorker`](../classes/BlinkCardWorker.md)\[`"sendPinglets"`\]

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
