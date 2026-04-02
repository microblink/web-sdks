[**@microblink/blinkid-verify**](../README.md)

***

[@microblink/blinkid-verify](../README.md) / ManualReviewStrategy

# Type Alias: ManualReviewStrategy

> **ManualReviewStrategy** = `"never"` \| `"rejected-and-accepted"` \| `"rejected-only"` \| `"accepted-only"`

Defines the manual review strategy used during document verification as part
of the `UseCase` settings.

- `"never"`: No documents will be sent for manual review.
- `"rejected-and-accepted"`: Both rejected and accepted documents will be sent
  for manual review.
- `"rejected-only"`: Only rejected documents will be sent for manual review.
- `"accepted-only"`: Only accepted documents will be sent for manual review.
