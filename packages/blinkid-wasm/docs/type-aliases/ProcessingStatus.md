[**@microblink/blinkid-wasm**](../README.md)

***

[@microblink/blinkid-wasm](../README.md) / ProcessingStatus

# Type Alias: ProcessingStatus

> **ProcessingStatus** = `"success"` \| `"detection-failed"` \| `"image-preprocessing-failed"` \| `"stability-test-failed"` \| `"scanning-wrong-side"` \| `"field-identification-failed"` \| `"mandatory-field-missing"` \| `"invalid-characters-found"` \| `"image-return-failed"` \| `"barcode-recognition-failed"` \| `"mrz-parsing-failed"` \| `"unsupported-document"` \| `"awaiting-other-side"` \| `"not-scanned"` \| `"barcode-detection-failed"` \| `"mrz-detection-failed"` \| `"input-image-not-focused"` \| `"canceled"`

Represents the status of the document processing.

ProcessingStatus defines various statuses that can occur during the
processing of a document, indicating the success or failure of different
stages of the recognition and extraction process.

- `success` The document was fully scanned and data was extracted as expected.
- `detection-failed` The document was not found on the image.
- `image-preprocessing-failed` Preprocessing of the input image has failed.
- `stability-test-failed` Stability is achieved when the same document is
  provided on consecutive frames, resulting in a consistent recognition
  between frames prior to data extraction. Valid only for video feed.
- `scanning-wrong-side` The wrong side of the document is scanned. Front side
  scan is completed and back side is expected, but not provided by the
  end-user. Possible also if front is expected at the start of the scanning
  process and back is presented first by the end-user.
- `field-identification-failed` Unexpected fields are present on the document
  and removed from the final result.
- `mandatory-field-missing` Fields expected to appear on the scanned document
  have not been found.
- `invalid-characters-found` One of the extracted fields contains a character
  which does not satisfy the rule defined for that specific field. This
  processing status can only occur if characterValidationEnabled setting is
  set to true.
- `image-return-failed` Failed to return a requested image.
- `barcode-recognition-failed` Reading or parsing of the barcode has failed.
- `mrz-parsing-failed` Parsing of the MRZ has failed.
- `unsupported-document` Document currently not supported by the recognizer.
- `awaiting-other-side` Front side recognition has completed successfully, and
  recognizer is waiting for the other side to be scanned.
- `not-scanned` If front side recognition has not completed successfully, the
  back side is not scanned.
- `barcode-detection-failed` The barcode was not found on the image. This
  processing status can only occur if document has mandatory barcode.
- `mrz-detection-failed` The MRZ was not found on the image. This processing
  status can only occur if document has mandatory MRZ.
- `input-image-not-focused` Input image is not focused.
- `canceled` Scanning was terminated by cancel delegate.
