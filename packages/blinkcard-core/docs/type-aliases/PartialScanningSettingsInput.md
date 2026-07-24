[**@microblink/blinkcard-core**](../README.md)

***

[@microblink/blinkcard-core](../README.md) / PartialScanningSettingsInput

# Type Alias: PartialScanningSettingsInput

> **PartialScanningSettingsInput** = `Partial`\<`OverrideProperties`\<[`ScanningSettings`](ScanningSettings.md), \{ `croppedImageSettings`: `Partial`\<[`CroppedImageSettings`](CroppedImageSettings.md)\>; `extractionSettings`: `Partial`\<[`ExtractionSettings`](ExtractionSettings.md)\>; `livenessSettings`: `Partial`\<[`LivenessSettings`](LivenessSettings.md)\>; `redactionSettings`: `Partial`\<`OverrideProperties`\<[`RedactionSettings`](RedactionSettings.md), \{ `cardNumberRedactionSettings`: `Partial`\<[`CardNumberRedactionSettings`](CardNumberRedactionSettings.md)\>; \}\>\>; \}\>\>

Partial scanning settings with optional nested objects. Used when passing
partial settings to the Wasm module.
