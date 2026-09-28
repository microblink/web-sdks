# @microblink/blinkid-verify-ux-manager

## 4000.0.0-next.1

### Major Changes

- Adds separate `/core` and `/ui` entrypoints. The `solid-js`, `@ark-ui/solid`, `solid-zustand`, and
  `@solid-primitives/keyed` UI peers are no longer installed automatically, and each entrypoint publishes one rolled-up
  declaration file.
- Install the UI peer dependencies when you use the root or `/ui` entrypoint. Consumers that do not need the provided UI can migrate from the root entrypoint to `/core` without installing them.

### Minor Changes

- Removes the unimplemented `preserveSdkInstance` option from `FeedbackUiOptions`.
- Updates English localization strings.
  Added:
  - `feedback_messages.screen_detected`: "Move the document to a plain background"
    Updated:
  - `feedback_messages.blur_detected` from "Keep document and phone still" to "Keep the document and phone still"
  - `feedback_messages.camera_angle_too_steep` from "Keep document parallel to phone" to "Keep the document parallel to the phone"
  - `feedback_messages.face_photo_not_fully_visible` from "Keep face photo fully visible" to "Keep the face photo fully visible"
  - `feedback_messages.glare_detected` from "Tilt or move document to remove reflection" to "Tilt or move the document to remove reflection"
  - `feedback_messages.keep_document_parallel` from "Keep document parallel with screen" to "Keep the document parallel to the screen"
  - `feedback_messages.keep_document_still` from "Keep document and device still" to "Keep still"
  - `timeout_modal.cancel_btn` from "Cancel" to "Cancel Scanning"
  - `timeout_modal.details` from "Unable to read the document. Please try again." to "Make sure the document is well lit, fully visible, and free of glare."
  - `timeout_modal.title` from "Scan unsuccessful" to "Unable to read the document"
    Removed: none

### Patch Changes

- Update declaration bundles
- Turning on the flashlight now shows a glare warning message
- Updated package dependencies.
- Fixed an issue where frame processing wouldnt stop if showTimeoutModal was configured to false
- Improves keyboard focus visibility for controls shown over light and dark backgrounds.
- Upgrade to TypeScript 7
- Fixed feedback UI localization merging so partial user string overrides preserve the default nested localized values instead of replacing whole sections.
- Fixed UX manager creation failing when `screen.orientation` is unavailable (e.g. iOS Safari and some WebViews). Device orientation analytics now use a guarded subscription with legacy fallback and log warning when reporting is unavailable.
- Updated dependencies
  - @microblink/camera-manager@8.1.0
  - @microblink/blinkid-verify-core@4000.0.0-next.1

## 3.21.0

### Minor Changes

- Update of internal dependencies in blinkid-verify-wasm

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-verify-core@3.21.0

## 3.20.3

### Patch changes

- Refines English onboarding and feedback strings (for example clearer “a document” wording) and adjusts Arabic locale strings for the same flows.

## 3.20.2

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-verify-core@3.20.2

## 3.20.1

### Patch Changes

- Version bump for consistency with other packages
- Added analytical event logging for when the "Document Not Supported" alert modal is displayed in the feedback UI

## 3.20.0

- Introducing BlinkID Verify web SDK, a capturing solution for perparing the perfect frames from a camera to be sent to the BlinkID verify API
