[**@microblink/blinkid**](../README.md)

***

[@microblink/blinkid](../README.md) / InputImageCropType

# Type Alias: InputImageCropType

> **InputImageCropType** = `"not-cropped"` \| `"unknown"` \| `"cropped"`

Specifies whether the input image is already cropped, likely cropped, or not
cropped.

- `"not-cropped"`: The image is considered raw and goes through document
  detection and perspective correction.
- `"unknown"`: The image may already be cropped. The recognizer first tries
  cropped processing and falls back to detection if extraction fails.
- `"cropped"`: The input image must contain only the cropped and
  perspective-corrected document.
