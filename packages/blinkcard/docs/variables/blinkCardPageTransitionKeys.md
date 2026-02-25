[**@microblink/blinkcard**](../README.md)

***

[@microblink/blinkcard](../README.md) / blinkCardPageTransitionKeys

# Variable: blinkCardPageTransitionKeys

> `const` **blinkCardPageTransitionKeys**: readonly \[`"FLIP_CARD"`\]

Page transition state keys for BlinkCard UI.

## Remarks

`FLIP_CARD` is a transition state that displays the card-flip animation and
instructions after the first side is captured. It is NOT directly mappable from
a `ProcessResult` — it is chained automatically from `FIRST_SIDE_CAPTURED`.

After the transition animation completes, the flow automatically advances to
`INTRO_BACK` to begin scanning the back of the card.

**Automatic flow:** `FIRST_SIDE_CAPTURED` → `FLIP_CARD` → `INTRO_BACK`
