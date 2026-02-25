[**@microblink/blinkid**](../README.md)

***

[@microblink/blinkid](../README.md) / blinkIdUiIntroStateKeys

# Variable: blinkIdUiIntroStateKeys

> `const` **blinkIdUiIntroStateKeys**: readonly \[`"INTRO_FRONT_PAGE"`, `"INTRO_BACK_PAGE"`, `"INTRO_DATA_PAGE"`, `"INTRO_TOP_PAGE"`, `"INTRO_LEFT_PAGE"`, `"INTRO_RIGHT_PAGE"`, `"INTRO_LAST_PAGE"`\]

Intro state keys for BlinkID UI.

## Remarks

These states display introductory screens that guide users to scan the correct
side or page of their document. Most intro states are automatically reached
during the scanning flow, but `INTRO_DATA_PAGE` requires manual initialization.

**Default behavior:**
The UX manager defaults to `INTRO_FRONT_PAGE`, assuming users will scan
non-passport documents (ID cards, driver's licenses, etc.).

**Automatically reachable states:**
After capturing a page, the flow automatically transitions through appropriate
intro states:
- `INTRO_BACK_PAGE` - After flipping an ID card (`FLIP_CARD`)
- `INTRO_TOP_PAGE` - After moving to passport top page (`MOVE_TOP`)
- `INTRO_LEFT_PAGE` - After moving to passport left page (`MOVE_LEFT`)
- `INTRO_RIGHT_PAGE` - After moving to passport right page (`MOVE_RIGHT`)
- `INTRO_LAST_PAGE` - After moving to passport barcode page (`MOVE_LAST_PAGE`)

**Manual initialization required:**
- `INTRO_DATA_PAGE` - Only reachable by overriding the UX manager initial
  state. Use this when restricting scanning to passport documents only,
  as the SDK assumes non-passport documents by default.

## Example

```typescript
// Limit scanning to passport documents only
const uxManager = new BlinkIdUxManager(cameraManager, session);
uxManager.setInitialUiStateKey("INTRO_DATA_PAGE", true);
```

## See

 - [BlinkIdUiIntroStateKey](../type-aliases/BlinkIdUiIntroStateKey.md) for the union type of these keys
 - getChainedUiStateKey for the automatic state transition logic
