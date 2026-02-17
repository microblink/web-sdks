[**@microblink/blinkcard-core**](../README.md)

***

[@microblink/blinkcard-core](../README.md) / BlinkCardSessionSettingsInput

# Type Alias: BlinkCardSessionSettingsInput

> **BlinkCardSessionSettingsInput** = `OverrideProperties`\<`Partial`\<[`BlinkCardSessionSettings`](BlinkCardSessionSettings.md)\>, \{ `scanningSettings?`: [`PartialScanningSettingsInput`](PartialScanningSettingsInput.md); \}\>

Partial session settings accepted by the Wasm module.
All fields are optional; the C++ layer merges with defaults.
