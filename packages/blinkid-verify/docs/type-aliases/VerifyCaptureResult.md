[**@microblink/blinkid-verify**](../README.md)

***

[@microblink/blinkid-verify](../README.md) / VerifyCaptureResult

# Type Alias: VerifyCaptureResult

> **VerifyCaptureResult** = \{ `ok`: `true`; `result`: [`VerifyApiResult`](VerifyApiResult.md); \} \| \{ `error`: [`VerifyApiError`](../classes/VerifyApiError.md); `ok`: `false`; \}

Settled Verify API submit.

API failures resolve as `error` instead of rejecting the promise.
