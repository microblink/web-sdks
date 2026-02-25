[**@microblink/blinkcard**](../README.md)

***

[@microblink/blinkcard](../README.md) / PartialScanningSettingsInput

# Type Alias: PartialScanningSettingsInput

> **PartialScanningSettingsInput** = `Partial`\<`OverrideProperties`\<[`ScanningSettings`](ScanningSettings.md), \{ `anonymizationSettings`: `Partial`\<`OverrideProperties`\<[`AnonymizationSettings`](AnonymizationSettings.md), \{ `cardNumberAnonymizationSettings`: `Partial`\<[`CardNumberAnonymizationSettings`](CardNumberAnonymizationSettings.md)\>; \}\>\>; `croppedImageSettings`: `Partial`\<[`CroppedImageSettings`](CroppedImageSettings.md)\>; `extractionSettings`: `Partial`\<[`ExtractionSettings`](ExtractionSettings.md)\>; `livenessSettings`: `Partial`\<[`LivenessSettings`](LivenessSettings.md)\>; \}\>\>

Partial scanning settings with optional nested objects. Used when passing
partial settings to the Wasm module.
