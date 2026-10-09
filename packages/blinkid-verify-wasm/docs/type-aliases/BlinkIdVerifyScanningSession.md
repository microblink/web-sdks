[**@microblink/blinkid-verify-wasm**](../README.md)

***

[@microblink/blinkid-verify-wasm](../README.md) / BlinkIdVerifyScanningSession

# Type Alias: BlinkIdVerifyScanningSession

> **BlinkIdVerifyScanningSession** = `EmbindObject`\<\{ `allowBarcodeStep`: `void`; `getResult`: [`SessionResult`](SessionResult.md); `getSessionId`: `string`; `getSettings`: [`BlinkIdVerifySessionSettings`](BlinkIdVerifySessionSettings.md); `prepareVerifyRequest`: `Promise`\<[`PreparedVerifyRequest`](PreparedVerifyRequest.md)\>; `process`: [`BlinkIdVerifyProcessResult`](BlinkIdVerifyProcessResult.md); `reset`: `void`; `setVerifyApiBaseUrl`: `void`; `submitResult`: `Promise`\<[`VerifyApiDocumentVerificationResponse`](../interfaces/VerifyApiDocumentVerificationResponse.md)\>; \}\>

Represents a scanning session for BlinkID Verify.
