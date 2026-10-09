[**@microblink/blinkid-verify-ux-manager**](../../README.md)

***

[@microblink/blinkid-verify-ux-manager](../../README.md) / [index](../README.md) / VerifyCaptureResult

# Type Alias: VerifyCaptureResult

> **VerifyCaptureResult** = \{ `ok`: `true`; `result`: `VerifyApiResult`; \} \| \{ `error`: `VerifyApiError`; `ok`: `false`; \}

Settled Verify API submit.

API failures resolve as `error` instead of rejecting the promise.
