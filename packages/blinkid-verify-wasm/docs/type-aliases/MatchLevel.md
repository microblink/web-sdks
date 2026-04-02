[**@microblink/blinkid-verify-wasm**](../README.md)

***

[@microblink/blinkid-verify-wasm](../README.md) / MatchLevel

# Type Alias: MatchLevel

> **MatchLevel** = `"disabled"` \| `"level-1"` \| `"level-2"` \| `"level-3"` \| `"level-4"` \| `"level-5"` \| `"level-6"` \| `"level-7"` \| `"level-8"` \| `"level-9"` \| `"level-10"`

Represents the level of strictness for a matching check during the document
verification process. This enum defines the different levels that can be
configured for various checks, such as photocopy or barcode anomaly
detection. Higher levels indicate stricter requirements, leading to fewer
false positives but potentially more false negatives.

- `"disabled"`: The matching check is disabled, that check will not be
  performed.
- `"level-1" to "level-10"`: Increasing levels of strictness, from least to
  most strict.
