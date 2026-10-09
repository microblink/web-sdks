[**@microblink/blinkid-verify-ux-manager**](../../README.md)

***

[@microblink/blinkid-verify-ux-manager](../../README.md) / [index](../README.md) / VerifyOnScanningCompletionCallbacks

# Type Alias: VerifyOnScanningCompletionCallbacks

> **VerifyOnScanningCompletionCallbacks** = `object`

Success and error callbacks for `verifyOnScanningCompletion`.

## Properties

### onError

> **onError**: [`VerifyOnScanningCompletionErrorCallback`](VerifyOnScanningCompletionErrorCallback.md)

Called with a VerifyApiError and the capture resolver. The client chooses whether to resubmit.

***

### onSuccess

> **onSuccess**: [`VerifyOnScanningCompletionSuccessCallback`](VerifyOnScanningCompletionSuccessCallback.md)

Called with the API result and capture resolver.
