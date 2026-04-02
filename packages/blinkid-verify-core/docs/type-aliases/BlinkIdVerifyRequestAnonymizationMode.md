[**@microblink/blinkid-verify-core**](../README.md)

***

[@microblink/blinkid-verify-core](../README.md) / BlinkIdVerifyRequestAnonymizationMode

# Type Alias: BlinkIdVerifyRequestAnonymizationMode

> **BlinkIdVerifyRequestAnonymizationMode** = `"ImageOnly"` \| `"ResultFieldsOnly"` \| `"FullResult"` \| `"None"`

Controls which parts of the verification result are anonymized in the API response.

- `"ImageOnly"` — redacts only the document images.
- `"ResultFieldsOnly"` — redacts only the parsed data fields.
- `"FullResult"` — redacts both images and data fields.
- `"None"` — no anonymization is applied.
