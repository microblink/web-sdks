# @microblink/blinkid-ux-manager

## 7.7.0

### Minor Changes

- Replaces the `BlinkIdUxManager` constructor with a `createBlinkIdUxManager` factory, fixing race conditions that could occur during construction. Constructor-based instantiation is no longer supported.
- To migrate, replace `new BlinkIdUxManager(...)` with `await createBlinkIdUxManager(cameraManager, scanningSession, options?)`. The factory is async and returns `Promise<BlinkIdUxManager>`; the `BlinkIdUxManager` type remains exported for typing.
- Exposes configurable help tooltip delays via `FeedbackUiOptions` and deprecates legacy tooltip timeout APIs in `BlinkIdUxManager`.
- Removes the `safelyDeleteScanningSession()` method and the `deleteSession` parameter from `getSessionResult()`. `BlinkIdUxManager` no longer deletes the underlying WASM scanning session on your behalf. If your integration creates more than one `BlinkIdScanningSession` per SDK load, you are now responsible for calling `scanningSession.delete()` on the session object once you are finished with it to free WASM heap memory. Integrations that reuse a single session for the lifetime of the page are unaffected.

### Patch Changes

- Adds a proper screen-reader title to the dialog when the `camera-manager` component is rendered in a modal, ensuring assistive technologies announce a meaningful dialog title on the capture screen.
- Improves the help dialog with device-specific on-screen messages, tailoring copy for desktop and mobile to provide better guidance on each platform.
- Adds `"result_retrieval_failed"` to `BlinkIdProcessingError`.
- Adds `destroy()` to `BlinkIdUxManager` for explicit teardown.
- Deprecates `rawUiStateKey` and replaces it with two explicit getters: `uiStateKey` returns the stabilized, visible state key (what the UI shows); `mappedUiStateKey` returns the latest raw candidate key from the detector before stabilization (useful for debugging).
- Introduces automatic chained UI state transitions after `PAGE_CAPTURED`: the manager advances through a document-type-specific transition state and into the appropriate intro state before resuming capture (e.g. `PAGE_CAPTURED → FLIP_CARD → INTRO_BACK_PAGE` for two-sided IDs, `PAGE_CAPTURED → MOVE_LAST_PAGE → INTRO_LAST_PAGE` for passports with barcode). Integrations that depend on exact UI-state keys or transition timing should account for these new intermediate states.
- Renames several UI state keys (e.g. `SENSING_FRONT` is now `FRONT_PAGE_NOT_IN_FRAME`). Integrations that reference state keys by name should update accordingly.
- Updated dependencies
  - @microblink/blinkid-core@7.7.0
  - @microblink/camera-manager@7.3.0

## 7.6.4

### Patch Changes

- Now uses `@microblink/ux-common` for shared UX utilities (haptic feedback helpers and common utils for user experience logic).
- Updated dependencies
  - @microblink/blinkid-core@7.6.4
  - @microblink/ux-common@1.0.0

## 7.6.3

### Patch Changes

- Updated dependencies
  - @microblink/camera-manager@7.2.7
  - @microblink/blinkid-core@7.6.3

## 7.6.2

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-core@7.6.2

## 7.6.1

### Patch Changes

- @microblink/blinkid-core@7.6.1

## 7.6.0

### Minor Changes

- Improved visual clarity and of feedback UI elements
- Added a new UI state `MOVE_LAST_PAGE` for Indian passports and applicable US passports, as well as the accompanying UI feedback message.
- Implemented ping v3 event handling
- Renamed `#handleUiStateChanges` method to `#updateUiStateFromProcessResult`
- Added missing `showHelpTooltipTimeout` option to the `FeedbackUiOptions`
- Added haptic feedback on supported devices
- Various bug fixes and cleanups

### Patch Changes

- Added translation files for 33 new languages (see [README.md](README.md#provided-translations))
- Updated dependencies
  - @microblink/camera-manager@7.2.6
  - @microblink/blinkid-core@7.6.0

## 7.5.0

### Minor Changes

- Version skip

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-core@7.5.0

## 7.4.3

### Patch Changes

- Fixed types
- Updated dependencies
  - @microblink/blinkid-core@7.4.3
  - @microblink/camera-manager@7.2.5

## 7.4.2

### Patch Changes

- `BlinkIdUxManager` will now clear session object on `DOCUMENT_CAPTURED` event
- Added 2 new methods `getSessionResult` and `safelyDeleteScanningSession`
- Updated dependencies
  - @microblink/camera-manager@7.2.4
  - @microblink/blinkid-core@7.4.2

## 7.4.1

### Patch Changes

- Enhanced reset session behaviour in `BlinkIdUxManager`
  - Exposed new `resetScanningSession` method
  - Enhance `BlinkIdFeedbackUi` with modal visibility controls
  - Added new properties to manage the visibilty of document filtered, timeout, and unsupported document modals in the `BlinkIdUiStore`
- Fixed issue where `ErrorModal` would not close in some cases.
- Fixed issue where UI had stale state after session restart.
- Updated dependencies
  - @microblink/camera-manager@7.2.3
  - @microblink/blinkid-core@7.4.1

## 7.4.0

### Minor Changes

- Improved documentation
- Updated dependencies
  - @microblink/blinkid-core@7.4.0
  - @microblink/camera-manager@7.2.2

## 7.3.2

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-core@7.3.2

## 7.3.1

### Patch Changes

- Updated dependencies
  - @microblink/camera-manager@7.2.1
  - @microblink/blinkid-core@7.3.1

## 7.3.0

### Minor Changes

- Added `showHelpButton` property to `FeedbackUiOptions` for improved UI control.
- Added part attribute `help-button-part` to the help button to enable external styling.
- Added additional control of the help tooltip via `setHelpTooltipShowDelay` and `setHelpTooltipHideDelay` methods on the `BlinkIdUxManager`
- `setTimeoutDuration` now defaultly sets `setHelpTooltipShowDelay` to the 50% duration
- Updated help tooltip default behaviour
- Updated dependencies
  - @microblink/camera-manager@7.2.0
  - @microblink/blinkid-core@7.3.0

## 7.2.2

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-core@7.2.2

## 7.2.1

### Patch Changes

- @microblink/blinkid-core@7.2.1

## 7.2.0

### Minor Changes

- Implemented passport feedback
- Added document filtered callbacks
- Various bug fixes

### Patch Changes

- @microblink/blinkid-core@7.2.0

## 7.1.0

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-core@7.1.0
  - @microblink/camera-manager@7.1.0

## 7.0.1

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-core@7.0.1
  - @microblink/camera-manager@7.0.1
