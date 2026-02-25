# @microblink/blinkcard-ux-manager

## 3000.0.1

### Patch Changes

- Adds a proper screen-reader title to the dialog when the `camera-manager` component is rendered in a modal, ensuring assistive technologies announce a meaningful dialog title on the capture screen.
- Adds `"result_retrieval_failed"` to `BlinkCardProcessingError`.
- Adds `destroy()` to `BlinkCardUxManager` for explicit teardown.
- Deprecates `rawUiStateKey` and replaces it with two explicit getters: `uiStateKey` returns the stabilized, visible state key (what the UI shows); `mappedUiStateKey` returns the latest raw candidate key from the detector before stabilization (useful for debugging).
- Introduces automatic chained UI state transitions after `FIRST_SIDE_CAPTURED`: the manager advances through `FLIP_CARD` to `INTRO_BACK`, then resumes capture for the back side. Integrations that depend on exact UI-state keys or transition timing should account for these new intermediate states.
- Updated dependencies
  - @microblink/camera-manager@7.3.0
  - @microblink/blinkcard-core@3000.0.1

## 3000.0.0

### Major Changes

- Major release of the BlinkCard UX manager package.

### Patch Changes

- Updated dependencies
  - @microblink/analytics@1.0.0
  - @microblink/blinkcard-core@3000.0.0
  - @microblink/ux-common@1.0.0
