[**@microblink/blinkid-verify-ux-manager**](../README.md)

***

[@microblink/blinkid-verify-ux-manager](../README.md) / getUiStateKey

# Function: getUiStateKey()

> **getUiStateKey**(`frameProcessResult`): `undefined` \| [`BlinkIdVerifyUiMappableKey`](../type-aliases/BlinkIdVerifyUiMappableKey.md)

Determines the appropriate UI state key based on the current frame processing
result and scanning settings.

This function acts as a state machine, translating the low-level analysis and
completeness results into a high-level UI state that drives the user
interface.

## Parameters

### frameProcessResult

[`PartialProcessResult`](../type-aliases/PartialProcessResult.md)

The current (possibly partial) result of frame
processing, including image analysis and completeness.

## Returns

`undefined` \| [`BlinkIdVerifyUiMappableKey`](../type-aliases/BlinkIdVerifyUiMappableKey.md)

The UI state key representing what should be shown to the user.
