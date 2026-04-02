# @microblink/blinkcard-ux-manager

## 3000.0.4

### Patch Changes

- Updated dependencies
  - @microblink/camera-manager@7.3.2
  - @microblink/blinkcard-core@3000.0.4
  - @microblink/analytics@1.0.2

## 3000.0.3

### Patch Changes

- Keeps the feedback overlay visible whenever no SDK modal is open, preventing it from disappearing during intro, transition, and success states.
- Added non-fatal analytics reporting for UX-manager creation failures, frame-capture failures, `CameraManager` frame-loop errors, and session result retrieval failures.
- Updated dependencies
  - @microblink/camera-manager@7.3.1
  - @microblink/analytics@1.0.1
  - @microblink/blinkcard-core@3000.0.3

## 3000.0.2

### Patch Changes

- Fixed a missing analytics event for the onboarding dialog.
- Fixed missing analytics events for camera permission checks in some cases.
- Updated dependencies
  - @microblink/blinkcard-core@3000.0.2
  - @microblink/camera-manager@7.3.0

## 3000.0.1

### Patch Changes

- Adds a proper screen-reader title to the dialog when the `camera-manager` component is rendered in a modal, ensuring assistive technologies announce a meaningful dialog title on the capture screen.
- Adds `"result_retrieval_failed"` to `BlinkCardProcessingError`.
- Adds `destroy()` to `BlinkCardUxManager` for explicit teardown.
- Deprecates `rawUiStateKey` and replaces it with two explicit getters: `uiStateKey` returns the stabilized, visible state key (what the UI shows); `mappedUiStateKey` returns the latest raw candidate key from the detector before stabilization (useful for debugging).
- Introduces automatic chained UI state transitions after `FIRST_SIDE_CAPTURED`: the manager advances through `FLIP_CARD` to `INTRO_BACK`, then resumes capture for the back side. Integrations that depend on exact UI-state keys or transition timing should account for these new intermediate states.
- Renames several UI state keys. Integrations that reference state keys by name should update accordingly. Each `SENSING_*` state has been split into a framing-feedback state (`CARD_NOT_IN_FRAME_*`) and a new intro guidance state (`INTRO_*`). The old `FLIP_CARD` capture event is now `FIRST_SIDE_CAPTURED`; `FLIP_CARD` continues to exist as a page-transition state:
  | Old key | New key(s) |
  |---|---|
  | `SENSING_FRONT` | `CARD_NOT_IN_FRAME_FRONT`, `INTRO_FRONT` |
  | `SENSING_BACK` | `CARD_NOT_IN_FRAME_BACK`, `INTRO_BACK` |
  | `FLIP_CARD` (capture event) | `FIRST_SIDE_CAPTURED` |
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
