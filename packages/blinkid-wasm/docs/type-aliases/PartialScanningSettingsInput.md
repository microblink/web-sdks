[**@microblink/blinkid-wasm**](../README.md)

***

[@microblink/blinkid-wasm](../README.md) / PartialScanningSettingsInput

# Type Alias: PartialScanningSettingsInput

> **PartialScanningSettingsInput** = `Partial`\<`OverrideProperties`\<[`ScanningSettings`](ScanningSettings.md), \{ `barcodeModule`: `Partial`\<[`ScanningSettings`](ScanningSettings.md)\[`"barcodeModule"`\]\>; `documentCaptureModule`: `Partial`\<[`ScanningSettings`](ScanningSettings.md)\[`"documentCaptureModule"`\]\>; `mrzModule`: `Partial`\<[`ScanningSettings`](ScanningSettings.md)\[`"mrzModule"`\]\>; `vizModule`: `Partial`\<[`ScanningSettings`](ScanningSettings.md)\[`"vizModule"`\]\>; \}\>\>

Partial scanning settings input. Used when passing partial settings to the
Wasm module. All fields are optional; the C++ layer merges with defaults.

## See

`ScanningSettings` for detailed configuration options
