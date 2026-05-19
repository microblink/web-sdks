[**@microblink/blinkid-ux-manager**](../README.md)

***

[@microblink/blinkid-ux-manager](../README.md) / getUiStateKey

# Function: getUiStateKey()

> **getUiStateKey**(`scanningStatus`, `inputImageAnalysisResult`, `scanningSettings`): `undefined` \| [`BlinkIdUiMappableKey`](../type-aliases/BlinkIdUiMappableKey.md)

Determines the appropriate UI state key based on the current frame processing
result and scanning settings.

This function acts as a state machine, translating the low-level analysis and
completeness results into a high-level UI state that drives the user
interface.

## Parameters

### scanningStatus

`ScanningStatus`

### inputImageAnalysisResult

`InputImageAnalysisResult`

### scanningSettings

`ScanningSettings`

## Returns

`undefined` \| [`BlinkIdUiMappableKey`](../type-aliases/BlinkIdUiMappableKey.md)

The UI state key representing what should be shown to the user.
