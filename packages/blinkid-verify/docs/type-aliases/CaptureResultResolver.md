[**@microblink/blinkid-verify**](../README.md)

***

[@microblink/blinkid-verify](../README.md) / CaptureResultResolver

# Type Alias: CaptureResultResolver

> **CaptureResultResolver** = `object`

Lazy accessors for a finished BlinkID Verify capture. None of these methods run until the client calls them.

## Methods

### getCaptureResult()

> **getCaptureResult**(): `Promise`\<[`SessionResult`](SessionResult.md)\>

Generates the session result with serialized parts, images, and typed payload data.

#### Returns

`Promise`\<[`SessionResult`](SessionResult.md)\>

***

### verifyCaptureResult()

> **verifyCaptureResult**(): `Promise`\<[`VerifyCaptureResult`](VerifyCaptureResult.md)\>

Generates the payload in Wasm and POSTs it from the worker. Resolves with the API result or a
[VerifyApiError](../classes/VerifyApiError.md).

#### Returns

`Promise`\<[`VerifyCaptureResult`](VerifyCaptureResult.md)\>
