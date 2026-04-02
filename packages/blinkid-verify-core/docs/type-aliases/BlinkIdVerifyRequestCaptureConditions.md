[**@microblink/blinkid-verify-core**](../README.md)

***

[@microblink/blinkid-verify-core](../README.md) / BlinkIdVerifyRequestCaptureConditions

# Type Alias: BlinkIdVerifyRequestCaptureConditions

> **BlinkIdVerifyRequestCaptureConditions** = `"NoControl"` \| `"Basic"` \| `"Hybrid"`

Defines the conditions under which the document is captured as part of the
`UseCase` settings.

- `"NoControl"`: Is the same as `"Basic"`, it will be removed in
  the future.
- `"Basic"`: Allows for processing of fully cropped documents. The integrator
  has no control over the capture process on the user's side and is limited
  by the lack of a robust SDK. It is not possible for a cropped document to
  get a `Pass` or `Accept` in the overall result. Liveness checks will not be
  performed if the document is fully cropped.
- `"Hybrid"`: Allows for processing of fully cropped documents. The integrator
  has no control over the capture process on the user's side and is limited
  by the lack of a robust SDK. It is possible for a cropped document to get a
  `Pass` or `Accept` in the overall result. Liveness checks will not be
  performed if the document is fully cropped.
