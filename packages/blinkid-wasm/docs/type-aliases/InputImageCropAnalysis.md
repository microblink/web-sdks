[**@microblink/blinkid-wasm**](../README.md)

***

[@microblink/blinkid-wasm](../README.md) / InputImageCropAnalysis

# Type Alias: InputImageCropAnalysis

> **InputImageCropAnalysis** = `"not-cropped"` \| `"cropped"` \| `"not-available"` \| `"undetermined"`

Describes the conclusion drawn about whether the input image was already
cropped and perspective-corrected prior to being submitted for recognition.

This analysis is only performed when the document capture module `cropType`
is set to `"unknown"` and the input source is `Photo`. In all other cases the
value is `"not-available"`.

- `"not-cropped"`: The first attempt (treating the image as pre-cropped) did
  not yield a valid result, so the standard detection-and-perspective-
  correction pipeline was executed as a fallback and succeeded. Conclusion:
  the input image was likely not pre-cropped.
- `"cropped"`: The first attempt (treating the image as pre-cropped) yielded a
  valid result without running the document detector. Conclusion: the input
  image was likely already cropped and perspective-corrected.
- `"not-available"`: The two-attempt analysis was not performed because
  `cropType` was `"cropped"` or `"not-cropped"`, or the input source was
  `Video`.
- `"undetermined"`: The analysis does not allow for a conclusion to be drawn
  because a valid stage could not be reached, neither considering the image
  as cropped nor as not cropped.
