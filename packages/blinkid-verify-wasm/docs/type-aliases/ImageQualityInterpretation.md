[**@microblink/blinkid-verify-wasm**](../README.md)

***

[@microblink/blinkid-verify-wasm](../README.md) / ImageQualityInterpretation

# Type Alias: ImageQualityInterpretation

> **ImageQualityInterpretation** = `"ignore"` \| `"conservative"` \| `"high-assurance"` \| `"high-conversion"` \| `"very-high-conversion"`

Specifies the strictness of the model when marking the quality of the image.
Includes a range of values that allow for more or less conservative
approach.

- `"ignore"`: Ensures that BlinkID Verify returns a `Pass` or `Fail` verdict
  even if image quality is not good enough.
- `"conservative"`: If image quality is not good enough, BlinkID Verify will
  refuse to process the image and a `NotPerformed` verdict will be returned.
  When a `NotPerformed` verdict is returned, BlinkID Verify will prompt the
  user to repeat the capture process. This is indicated by the `Retry` value
  under `RecommendedOutcome` in the response.
- `"high-assurance"`: A `Fail` verdict can be returned even if image quality is
  not good enough, but occasionally a `Pass` verdict will not be returned if
  image quality is not satisfactory.
- `"high-conversion"`: A `Pass` verdict can be returned even if image quality
  is not good enough, but occasionally a `Fail` verdict will not be returned
  if image quality is not satisfactory.
- `"very-high-conversion"`: A `Pass` verdict can be returned even if image
  quality is significantly unsatisfactory, but a `Fail` verdict will not be
  returned if image quality is really poor.
