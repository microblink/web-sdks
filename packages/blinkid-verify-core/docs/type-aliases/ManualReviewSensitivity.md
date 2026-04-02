[**@microblink/blinkid-verify-core**](../README.md)

***

[@microblink/blinkid-verify-core](../README.md) / ManualReviewSensitivity

# Type Alias: ManualReviewSensitivity

> **ManualReviewSensitivity** = `"low"` \| `"default"` \| `"high"`

Defines the volume of documents that will be sent for manual review as part
of the `UseCase` settings. The outcome depends on the selected policy and
varies according to the overall verification `CertaintyLevel`.

If manual review is not used, this setting is ignored.

- `"low"`: Only borderline cases are sent for manual review. <br/> Documents
  where certainty is `Low` alongside a `SuspiciousDataCheck` fail will be
  sent for manual review.
- `"default"`: The manual review process is default.
- `"high"`: The manual review process is high.
