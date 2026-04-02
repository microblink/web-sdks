[**@microblink/blinkid-verify-core**](../README.md)

***

[@microblink/blinkid-verify-core](../README.md) / BlinkIdVerifyRequestImageQualityInterpretation

# Type Alias: BlinkIdVerifyRequestImageQualityInterpretation

> **BlinkIdVerifyRequestImageQualityInterpretation** = `"Ignore"` \| `"Conservative"` \| `"HighAssurance"` \| `"HighConversion"` \| `"VeryHighConversion"`

Specifies the strictness of the model when marking the quality of the image.
Includes a range of values that allow for more or less conservative
approach.

- `"Ignore"`: Ensures that BlinkID Verify API returns a `Pass` or `Fail` verdict
  even if image quality is not good enough.
- `"Conservative"`: If image quality is not good enough, BlinkID Verify API will
  refuse to process the image and a `NotPerformed` verdict will be returned.
  When a `NotPerformed` verdict is returned, BlinkID Verify API will prompt the
  user to repeat the capture process. This is indicated by the `Retry` value
  under `RecommendedOutcome` in the response.
- `"HighAssurance"`: A `Fail` verdict can be returned even if image quality is
  not good enough, but occasionally a `Pass` verdict will not be returned if
  image quality is not satisfactory.
- `"HighConversion"`: A `Pass` verdict can be returned even if image quality
  is not good enough, but occasionally a `Fail` verdict will not be returned
  if image quality is not satisfactory.
- `"VeryHighConversion"`: A `Pass` verdict can be returned even if image
  quality is significantly unsatisfactory, but a `Fail` verdict will not be
  returned if image quality is really poor.
