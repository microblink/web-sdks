[**@microblink/blinkcard**](../README.md)

***

[@microblink/blinkcard](../README.md) / blinkCardUiSuccessKeys

# Variable: blinkCardUiSuccessKeys

> `const` **blinkCardUiSuccessKeys**: readonly \[`"FIRST_SIDE_CAPTURED"`, `"CARD_CAPTURED"`\]

Success state keys for BlinkCard UI.

## Remarks

- `FIRST_SIDE_CAPTURED` — first side successfully scanned; triggers the
  `FLIP_CARD` chained transition and stops frame capture.
- `CARD_CAPTURED` — both sides fully scanned; triggers result retrieval
  and stops frame capture permanently.
