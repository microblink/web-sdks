# @microblink/blinkid-verify

## 4000.0.0-next.1

### Minor Changes

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
- Updated the minimum browser requirements after removing the non-SIMD `basic` Wasm build. The SDKs now require WebAssembly SIMD support: Chrome/Edge 91+, Firefox 89+, Safari/iOS Safari 16.4+, and Samsung Internet 16+.
- Updated dependencies

### Patch Changes

- Update declaration bundles
- Updated package dependencies.
- Fixed an issue where frame processing wouldnt stop if showTimeoutModal was configured to false
- Speeds up BlinkID Verify initialization by compiling WebAssembly while it downloads. Resources served without the `application/wasm` content type or environments without streaming compilation continue to use buffered compilation.
- Upgrade to TypeScript 7
- Updated dependencies
  - @microblink/camera-manager@8.1.0
  - @microblink/blinkid-verify-core@4000.0.0-next.1
  - @microblink/blinkid-verify-ux-manager@4000.0.0-next.1

## 3.21.1

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-verify-ux-manager@3.21.1
  - @microblink/blinkid-verify-core@3.21.1

## 3.21.0

### Minor Changes

- Update of internal dependencies in blinkid-verify-wasm

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-verify-core@3.21.0
  - @microblink/blinkid-verify-ux-manager@3.21.0

## 3.20.3

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-verify-ux-manager@3.20.3
  - @microblink/blinkid-verify-core@3.20.3

## 3.20.2

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-verify-core@3.20.2
  - @microblink/blinkid-verify-ux-manager@3.20.2

## 3.20.1

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-verify-ux-manager@3.20.1
  - @microblink/blinkid-verify-core@3.20.1

## 3.20.0

- Introducing BlinkID Verify web SDK, a capturing solution for perparing the perfect frames from a camera to be sent to the BlinkID verify API
