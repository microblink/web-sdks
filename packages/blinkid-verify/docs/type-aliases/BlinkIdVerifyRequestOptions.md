[**@microblink/blinkid-verify**](../README.md)

***

[@microblink/blinkid-verify](../README.md) / BlinkIdVerifyRequestOptions

# Type Alias: BlinkIdVerifyRequestOptions

> **BlinkIdVerifyRequestOptions** = `object`

Caller-supplied options for the BlinkID Verify Cloud API request.

These options are merged with settings derived from the scanning session to
produce the final BlinkIdVerifyPayload. Only the subset of options
that are relevant to the caller are exposed here.

## Properties

### anonymizationMode?

> `optional` **anonymizationMode**: [`BlinkIdVerifyRequestAnonymizationMode`](BlinkIdVerifyRequestAnonymizationMode.md)

Controls which parts of the result are anonymized in the API response.

***

### generativeAiMatchLevel?

> `optional` **generativeAiMatchLevel**: [`BlinkIdVerifyRequestMatchLevel`](BlinkIdVerifyRequestMatchLevel.md)

Match level threshold for the generative AI–based fraud detection check.

***

### photocopyMatchLevel?

> `optional` **photocopyMatchLevel**: [`BlinkIdVerifyRequestMatchLevel`](BlinkIdVerifyRequestMatchLevel.md)

Match level threshold for detecting photocopy fraud.

***

### photoForgeryMatchLevel?

> `optional` **photoForgeryMatchLevel**: [`BlinkIdVerifyRequestMatchLevel`](BlinkIdVerifyRequestMatchLevel.md)

Match level threshold for detecting photo forgery.

***

### returnFaceImage?

> `optional` **returnFaceImage**: `boolean`

Whether to include the face image in the API response.

***

### returnFullDocumentImage?

> `optional` **returnFullDocumentImage**: `boolean`

Whether to include the full document image in the API response.

***

### returnImageFormat?

> `optional` **returnImageFormat**: [`ReturnImageFormat`](ReturnImageFormat.md)

The image format used for returned images.

***

### returnSignatureImage?

> `optional` **returnSignatureImage**: `boolean`

Whether to include the signature image in the API response.
