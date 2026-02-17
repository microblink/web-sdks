[**@microblink/blinkcard**](../README.md)

***

[@microblink/blinkcard](../README.md) / getUiStateKey

# Function: getUiStateKey()

> **getUiStateKey**(`frameProcessResult`, `settings`): [`BlinkCardUiStateKey`](../type-aliases/BlinkCardUiStateKey.md)

Determines the appropriate UI state key based on the current frame processing
result and scanning settings.

This function acts as a state machine, translating the low-level analysis and
completeness results into a high-level UI state that drives the user
interface.

## Parameters

### frameProcessResult

[`BlinkCardProcessResult`](../type-aliases/BlinkCardProcessResult.md)

The current (possibly partial) result of frame
processing, including image analysis and completeness.

### settings

[`ScanningSettings`](../type-aliases/ScanningSettings.md)

Optional scanning settings that may influence state
selection.

## Returns

[`BlinkCardUiStateKey`](../type-aliases/BlinkCardUiStateKey.md)

The UI state key representing what should be shown to the user.
