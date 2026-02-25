[**@microblink/blinkcard**](../README.md)

***

[@microblink/blinkcard](../README.md) / getUiStateKey

# Function: getUiStateKey()

> **getUiStateKey**(`frameProcessResult`, `settings`): `undefined` \| [`BlinkCardUiMappableKey`](../type-aliases/BlinkCardUiMappableKey.md)

Determines the appropriate UI state key based on the current frame processing
result and scanning settings.

This function acts as a state machine, translating the low-level analysis and
completeness results into a high-level UI state that drives the user interface.

Returns `undefined` for unrecognized frames (e.g. stability checks) — the
manager treats `undefined` as a no-op and does not ingest it into the
feedback stabilizer.

## Parameters

### frameProcessResult

[`BlinkCardProcessResult`](../type-aliases/BlinkCardProcessResult.md)

The current (possibly partial) result of frame
processing, including image analysis and completeness.

### settings

[`ScanningSettings`](../type-aliases/ScanningSettings.md)

Scanning settings that may influence state selection.

## Returns

`undefined` \| [`BlinkCardUiMappableKey`](../type-aliases/BlinkCardUiMappableKey.md)

The UI state key, or `undefined` if no state change is warranted.
