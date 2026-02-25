[**@microblink/blinkcard**](../README.md)

***

[@microblink/blinkcard](../README.md) / blinkCardUiIntroStateKeys

# Variable: blinkCardUiIntroStateKeys

> `const` **blinkCardUiIntroStateKeys**: readonly \[`"INTRO_FRONT"`, `"INTRO_BACK"`\]

Intro state keys for BlinkCard UI.

## Remarks

These states display introductory screens that guide users to scan the correct
side of their card. They are NOT directly mappable from a `ProcessResult` —
`INTRO_FRONT` is the default initial state, and `INTRO_BACK` is automatically
reached via the chained transition after `FLIP_CARD`.

Both states restart frame capture when entered (via `#handleUiStateUpdates`
in the manager), so the camera resumes scanning the correct side.
