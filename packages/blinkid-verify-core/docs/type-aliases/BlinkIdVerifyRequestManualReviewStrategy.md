[**@microblink/blinkid-verify-core**](../README.md)

***

[@microblink/blinkid-verify-core](../README.md) / BlinkIdVerifyRequestManualReviewStrategy

# Type Alias: BlinkIdVerifyRequestManualReviewStrategy

> **BlinkIdVerifyRequestManualReviewStrategy** = `"Never"` \| `"RejectedAndAccepted"` \| `"RejectedOnly"` \| `"AcceptedOnly"`

Defines the manual review strategy used during document verification as part
of the `UseCase` settings.

- `"Never"`: No documents will be sent for manual review.
- `"RejectedAndAccepted"`: Both rejected and accepted documents will be sent
  for manual review.
- `"RejectedOnly"`: Only rejected documents will be sent for manual review.
- `"AcceptedOnly"`: Only accepted documents will be sent for manual review.
