[**@microblink/blinkid-verify**](../README.md)

***

[@microblink/blinkid-verify](../README.md) / BlinkIdVerifyRequestManualReviewSensitivity

# Type Alias: BlinkIdVerifyRequestManualReviewSensitivity

> **BlinkIdVerifyRequestManualReviewSensitivity** = `"Low"` \| `"Default"` \| `"High"`

Defines the volume of documents that will be sent for manual review as part
of the `UseCase` settings. The outcome depends on the selected policy and
varies according to the overall verification `CertaintyLevel`.

If manual review is not used, this setting is ignored.

- `"Low"`: Only borderline cases are sent for manual review. <br/> Documents
  where certainty is `Low` alongside a `SuspiciousDataCheck` fail will be
  sent for manual review.
- `"Default"`: The manual review process is default.
- `"High"`: The manual review process is high.
