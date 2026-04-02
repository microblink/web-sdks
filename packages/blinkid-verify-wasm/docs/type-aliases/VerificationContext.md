[**@microblink/blinkid-verify-wasm**](../README.md)

***

[@microblink/blinkid-verify-wasm](../README.md) / VerificationContext

# Type Alias: VerificationContext

> **VerificationContext** = `"remote"` \| `"in-person"`

Defines the context under which document verification is performed as part of
the `UseCase` settings. It describes the setup and conditions in which
verification occurs.

- `"remote"`: Default policy. Document verification is performed in a remote
  setting where a user is scanning the document in their own space,
  unsupervised.
- `"in-person"`: Document verification is performed in an in-person environment
  in which a trained employee is scanning the document. <br/> Document
  liveness checks are not performed when `InPerson` policy is set.
