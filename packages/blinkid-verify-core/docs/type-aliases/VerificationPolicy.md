[**@microblink/blinkid-verify-core**](../README.md)

***

[@microblink/blinkid-verify-core](../README.md) / VerificationPolicy

# Type Alias: VerificationPolicy

> **VerificationPolicy** = `"permissive"` \| `"standard"` \| `"strict"` \| `"very-strict"`

Defines the strictness of checks performed by BlinkID Verify as part of the
`UseCase` settings.

- `"permissive"`: Optimized for letting real users through. In cases of doubt
  or lower confidence, BlinkID Verify will avoid failing the document.
- `"standard"`: Default policy. It is more strict compared to `Permissive` but
  still optimized for accepting real users.
- `"strict"`: Users with damaged documents, bad lighting conditions or lower
  image quality will probably be rejected. In cases of doubt or lower
  confidence, the document will more often be rejected.
- `"very-strict"`: Reasonable only for the most sensitive use cases.
  Significant user friction is added to stop as much fraud as possible.
