[**@microblink/blinkid-ux-manager**](../README.md)

***

[@microblink/blinkid-ux-manager](../README.md) / BlinkIdProgress

# Type Alias: BlinkIdProgress

> **BlinkIdProgress** = `object`

## Properties

### inactivity

> **inactivity**: [`BlinkIdProgressTimerState`](BlinkIdProgressTimerState.md)

Remaining state for the inactivity timeout.

***

### inactivityResetUiStateKey?

> `optional` **inactivityResetUiStateKey**: [`BlinkIdUiStateKey`](BlinkIdUiStateKey.md)

Stabilized UI state key that last reset the inactivity timeout.

***

### isTimingActiveScanStep

> **isTimingActiveScanStep**: `boolean`

Whether BlinkID is currently timing an active scan step.

***

### mappedUiStateKey

> **mappedUiStateKey**: [`BlinkIdUiStateKey`](BlinkIdUiStateKey.md)

Latest raw mapped BlinkID UI key.

***

### partiallySupportedBarcodeResolve

> **partiallySupportedBarcodeResolve**: [`BlinkIdProgressTimerState`](BlinkIdProgressTimerState.md)

Remaining state for partially supported barcode auto-resolution.

***

### perSide

> **perSide**: [`BlinkIdProgressTimerState`](BlinkIdProgressTimerState.md)

Remaining state for the scan-step timeout.

***

### playbackState

> **playbackState**: `"idle"` \| `"playback"` \| `"capturing"`

Current camera playback state that controls timer pause/resume.

***

### uiStateKey

> **uiStateKey**: [`BlinkIdUiStateKey`](BlinkIdUiStateKey.md)

Currently stabilized BlinkID UI state key.
