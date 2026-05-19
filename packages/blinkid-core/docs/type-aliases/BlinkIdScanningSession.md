[**@microblink/blinkid-core**](../README.md)

***

[@microblink/blinkid-core](../README.md) / BlinkIdScanningSession

# Type Alias: BlinkIdScanningSession

> **BlinkIdScanningSession** = `EmbindObject`\<\{ `getResolvedSessionSettings`: () => [`BlinkIdSessionSettings`](BlinkIdSessionSettings.md); `getResult`: (`redactionSettings?`) => [`BlinkIdScanningResult`](BlinkIdScanningResult.md); `getScanningStatus`: () => [`ScanningStatus`](ScanningStatus.md); `getSessionId`: () => `string`; `getSessionNumber`: () => `number`; `getSettings`: () => [`BlinkIdSessionSettings`](BlinkIdSessionSettings.md); `process`: (`image`) => [`BlinkIdProcessResult`](BlinkIdProcessResult.md); `reset`: () => `void`; `resolveCurrentStep`: () => `void`; \}\>

Represents the scanning session for BlinkID
