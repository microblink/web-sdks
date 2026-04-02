[**@microblink/blinkid-verify**](../README.md)

***

[@microblink/blinkid-verify](../README.md) / ImageQualitySettings

# Type Alias: ImageQualitySettings

> **ImageQualitySettings** = `Partial`\<\{ `blurMatchLevel`: [`MatchLevel`](MatchLevel.md); `dpiMatchLevel`: [`MatchLevel`](MatchLevel.md); `glareMatchLevel`: [`MatchLevel`](MatchLevel.md); `handOcclusionMatchLevel`: [`MatchLevel`](MatchLevel.md); `interpretation`: [`ImageQualityInterpretation`](ImageQualityInterpretation.md); `lightingMatchLevel`: [`MatchLevel`](MatchLevel.md); `sharpnessMatchLevel`: [`MatchLevel`](MatchLevel.md); `tiltMatchLevel`: [`MatchLevel`](MatchLevel.md); \}\>

Options for image quality settings. Stricter settings will provide better
quality images as the scan will not complete until they are met. If not
defined internal defaults will be used.
