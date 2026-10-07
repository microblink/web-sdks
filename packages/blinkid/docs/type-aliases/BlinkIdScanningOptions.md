[**@microblink/blinkid**](../README.md)

***

[@microblink/blinkid](../README.md) / BlinkIdScanningOptions

# Type Alias: BlinkIdScanningOptions\<Mode\>

> **BlinkIdScanningOptions**\<`Mode`\> = [`BlinkIdInitSettings`](BlinkIdInitSettings.md) & `Partial`\<`Omit`\<[`BlinkIdSessionSettingsInput`](BlinkIdSessionSettingsInput.md), `"inputImageSource"` \| `"scanningSettings"`\>\> & `Mode` *extends* `"preset"` ? `object` : `object`

Initialization and mutually exclusive scanning configuration for the BlinkID component.

## Type Parameters

### Mode

`Mode` *extends* `"preset"` \| `"settings"` = `"preset"` \| `"settings"`
