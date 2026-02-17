[**@microblink/blinkcard-core**](../README.md)

***

[@microblink/blinkcard-core](../README.md) / LivenessSettings

# Type Alias: LivenessSettings

> **LivenessSettings** = `object`

Configuration settings for liveness detection during card scanning.

This structure defines various parameters that control the behavior of
liveness detection, including thresholds for hand detection, screen and
photocopy analysis, and options to skip processing certain frames based on
liveness criteria.

## Properties

### enableCardHeldInHandCheck

> **enableCardHeldInHandCheck**: `boolean`

Enables or disables the check for card held in hand.

When `true`, the liveness detection will include a check to verify that the
card is being held in hand.

***

### handCardOverlapThreshold

> **handCardOverlapThreshold**: `number`

Minimum overlap threshold between detected hand and card regions.

This parameter is used to adjust heuristics that eliminate cases when the
hand is present in the input but it is not holding the card.
`handCardOverlapThreshold` is the minimal ratio of hand pixels inside the
frame surrounding the card and area of that frame. Only pixels inside that
frame are used to ignore false-positive hand segmentations inside the
card.

***

### handToCardSizeRatio

> **handToCardSizeRatio**: `number`

Minimum hand-to-card size ratio for valid hand detection.

This controls how large a hand must appear in the frame relative to the
card to be considered valid. Lower values detect smaller/more distant
hands. Hand scale is calculated as a ratio between area of hand mask and
card mask.

***

### photocopyCheckStrictnessLevel

> **photocopyCheckStrictnessLevel**: [`StrictnessLevel`](StrictnessLevel.md)

Sensitivity level for detecting frames where the presented card is a
photocopy.

Higher levels provide better security by being more strict in detecting
photocopied cards, but may increase false positives.

***

### screenCheckStrictnessLevel

> **screenCheckStrictnessLevel**: [`StrictnessLevel`](StrictnessLevel.md)

Sensitivity level for detecting frames where the card is displayed on a
screen.

Higher levels provide better security by being more strict in detecting
screen-displayed cards, but may increase false positives.
