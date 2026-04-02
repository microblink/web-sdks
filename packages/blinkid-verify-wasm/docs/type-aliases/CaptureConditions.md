[**@microblink/blinkid-verify-wasm**](../README.md)

***

[@microblink/blinkid-verify-wasm](../README.md) / CaptureConditions

# Type Alias: CaptureConditions

> **CaptureConditions** = `"no-control"` \| `"basic"` \| `"hybrid"`

Defines the conditions under which the document is captured as part of the
`UseCase` settings.

- `"no-control"`: _Deprecated_: Is the same as `"basic"`, it will be removed in
  the future.
- `"basic"`: Allows for processing of fully cropped documents. The integrator
  has no control over the capture process on the user's side and is limited
  by the lack of a robust SDK. It is not possible for a cropped document to
  get a `Pass` or `Accept` in the overall result. Liveness checks will not be
  performed if the document is fully cropped.
- `"hybrid"`: Allows for processing of fully cropped documents. The integrator
  has no control over the capture process on the user's side and is limited
  by the lack of a robust SDK. It is possible for a cropped document to get a
  `Pass` or `Accept` in the overall result. Liveness checks will not be
  performed if the document is fully cropped.
