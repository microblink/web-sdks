# @microblink/blinkcard-ux-manager

## 3001.0.0

### Major Changes

- Adds separate `/core` and `/ui` entrypoints. The `solid-js`, `@ark-ui/solid`, `solid-zustand`, and
  `@solid-primitives/keyed` UI peers are no longer installed automatically, and each entrypoint publishes one rolled-up
  declaration file.
- Install the UI peer dependencies when you use the root or `/ui` entrypoint. Consumers that do not need the provided UI can migrate from the root entrypoint to `/core` without installing them.
- Replaced the single `BlinkCardUxManager` scan timeout with separate inactivity and scan-step timeouts. Migrate from `getTimeoutDuration()` and `setTimeoutDuration()` to `getTimeoutConfiguration()` and `setTimeoutConfiguration()`, or pass `timeoutConfiguration` when creating the manager. Handle `inactivity_timeout` and `scan_step_timeout` instead of the removed `timeout` error.

### Minor Changes

- Updates English localization strings.
  - Added:
    - `timeout_modal.details_desktop`: "Make sure your camera lens is clean and the card is fully visible, in focus, and well lit."
  - Updated:
    - `feedback_messages.blur_detected` from "Keep card and phone still" to "Keep the card and phone still"
    - `feedback_messages.camera_angle_too_steep` from "Keep card parallel to phone" to "Keep the card parallel to the phone"
    - `feedback_messages.camera_angle_too_steep_desktop` from "Keep card parallel with screen" to "Keep the card parallel to the screen"
    - `timeout_modal.cancel_btn` from "Cancel" to "Cancel Scanning"
    - `timeout_modal.details` from "Unable to read the card. Please try again." to "Make sure the card is well lit, fully visible, and free of glare."
    - `timeout_modal.title` from "Scan unsuccessful" to "Unable to read the card"

### Patch Changes

- Fixed an issue where frame processing wouldn't stop when `showTimeoutModal` was set to `false`.
- Improves keyboard focus visibility for controls shown over light and dark backgrounds.
- Upgraded to TypeScript 7
- Fixed feedback UI localization merging so partial user string overrides preserve the default nested localized values instead of replacing whole sections.
- Updated dependencies
  - @microblink/blinkcard-core@3001.0.0
  - @microblink/camera-manager@8.0.1
  - @microblink/ux-common@1.1.0

## 3000.0.8

### Patch Changes

- Fixed UX manager creation failing when `screen.orientation` is unavailable (e.g. iOS Safari and some WebViews). Device orientation analytics now use a guarded subscription with legacy fallback and log warning when reporting is unavailable.
- Updated dependencies
  - @microblink/blinkcard-core@3000.0.8

## 3000.0.7

### Patch Changes

- Updates Arabic (`ar`) feedback and onboarding strings for consistency with the latest copy.

## 3000.0.6

### Patch Changes

- Updated dependencies
  - @microblink/blinkcard-core@3000.0.6

## 3000.0.5

### Patch Changes

- Version bump for consistency with other packages

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
  | Old key                     | New key(s)                               |
  | --------------------------- | ---------------------------------------- |
  | `SENSING_FRONT`             | `CARD_NOT_IN_FRAME_FRONT`, `INTRO_FRONT` |
  | `SENSING_BACK`              | `CARD_NOT_IN_FRAME_BACK`, `INTRO_BACK`   |
  | `FLIP_CARD` (capture event) | `FIRST_SIDE_CAPTURED`                    |
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
