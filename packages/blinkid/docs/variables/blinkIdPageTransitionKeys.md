[**@microblink/blinkid**](../README.md)

***

[@microblink/blinkid](../README.md) / blinkIdPageTransitionKeys

# Variable: blinkIdPageTransitionKeys

> `const` **blinkIdPageTransitionKeys**: readonly \[`"FLIP_CARD"`, `"MOVE_TOP"`, `"MOVE_LEFT"`, `"MOVE_RIGHT"`, `"MOVE_LAST_PAGE"`\]

Page transition state keys for BlinkID UI.

## Remarks

These states display transition animations and instructions between scanning
different document pages or sides. They are automatically triggered after
successfully capturing a page (`PAGE_CAPTURED`) and cannot be manually set.

Each transition state corresponds to a specific document type and guides the
user to position the document for the next scan:
- `FLIP_CARD` - Instructs user to flip ID card to scan the back side
- `MOVE_LAST_PAGE` - Instructs user to move to passport's last page (barcode)
- `MOVE_TOP` - Instructs user to rotate passport to top orientation (0°)
- `MOVE_RIGHT` - Instructs user to rotate passport 90° clockwise
- `MOVE_LEFT` - Instructs user to rotate passport 90° counter-clockwise

**Automatic flow:**
After a transition animation completes, the UI automatically advances to the
corresponding intro state to begin scanning the next page:
- `FLIP_CARD` → `INTRO_BACK_PAGE`
- `MOVE_LAST_PAGE` → `INTRO_LAST_PAGE`
- `MOVE_TOP` → `INTRO_TOP_PAGE`
- `MOVE_RIGHT` → `INTRO_RIGHT_PAGE`
- `MOVE_LEFT` → `INTRO_LEFT_PAGE`

## See

 - [BlinkIdPageTransitionKey](../type-aliases/BlinkIdPageTransitionKey.md) for the union type of these keys
 - getChainedUiStateKey for the automatic state transition logic
 - [blinkIdUiIntroStateKeys](blinkIdUiIntroStateKeys.md) for the intro states that follow transitions
