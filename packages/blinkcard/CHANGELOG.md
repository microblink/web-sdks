# @microblink/blinkcard

## 3001.0.0-next.0

### Minor Changes

- Adds the `simd-relaxed` and `simd-relaxed-threads` WebAssembly variants. Browsers that support relaxed SIMD now load these faster builds automatically, while other browsers keep using `simd` or `simd-threads`. The `wasmVariant` setting accepts the new variant names, and the shipped `resources/` tree contains the new variant directories.
- Updates English localization strings.
  Added:
  - `timeout_modal.details_desktop`: "Make sure your camera lens is clean and the card is fully visible, in focus, and well lit."
    Updated:
  - `feedback_messages.blur_detected` from "Keep card and phone still" to "Keep the card and phone still"
  - `feedback_messages.camera_angle_too_steep` from "Keep card parallel to phone" to "Keep the card parallel to the phone"
  - `feedback_messages.camera_angle_too_steep_desktop` from "Keep card parallel with screen" to "Keep the card parallel to the screen"
  - `timeout_modal.cancel_btn` from "Cancel" to "Cancel Scanning"
  - `timeout_modal.details` from "Unable to read the card. Please try again." to "Make sure the card is well lit, fully visible, and free of glare."
  - `timeout_modal.title` from "Scan unsuccessful" to "Unable to read the card"
    Removed: none
- Updated the minimum browser requirements after removing the non-SIMD `basic` Wasm build. The SDKs now require WebAssembly SIMD support: Chrome/Edge 91+, Firefox 89+, Safari/iOS Safari 16.4+, and Samsung Internet 16+.

### Patch Changes

- Updated package dependencies.
- Fixed an issue where frame processing wouldnt stop if showTimeoutModal was configured to false
- Speeds up BlinkCard initialization by compiling WebAssembly while it downloads. Resources served without the `application/wasm` content type or environments without streaming compilation continue to use buffered compilation.
- Upgrade to TypeScript 7
- Updated dependencies
  - @microblink/blinkcard-core@3001.0.0-next.0
  - @microblink/blinkcard-ux-manager@3001.0.0-next.0
  - @microblink/camera-manager@8.0.0

## 3000.0.8

### Patch Changes

- Updated dependencies
  - @microblink/blinkcard-ux-manager@3000.0.8
  - @microblink/blinkcard-core@3000.0.8

## 3000.0.7

### Patch Changes

- Updated dependencies
  - @microblink/blinkcard-ux-manager@3000.0.7
  - @microblink/blinkcard-core@3000.0.7

## 3000.0.6

### Patch Changes

- Updated dependencies
  - @microblink/blinkcard-core@3000.0.6
  - @microblink/blinkcard-ux-manager@3000.0.6

## 3000.0.5

### Patch Changes

- Updated dependencies
  - @microblink/blinkcard-core@3000.0.5
  - @microblink/blinkcard-ux-manager@3000.0.5

## 3000.0.4

### Patch Changes

- Updated dependencies
  - @microblink/blinkcard-ux-manager@3000.0.4
  - @microblink/camera-manager@7.3.2
  - @microblink/blinkcard-core@3000.0.4

## 3000.0.3

### Patch Changes

- Added crash reporting for failures during `createBlinkCard(...)`, including SDK initialization, scanning-session creation, UX-manager setup, and UI startup.
- Updated dependencies
  - @microblink/camera-manager@7.3.1
  - @microblink/blinkcard-ux-manager@3000.0.3
  - @microblink/blinkcard-core@3000.0.3

## 3000.0.2

### Patch Changes

- Updated dependencies
  - @microblink/blinkcard-core@3000.0.2
  - @microblink/blinkcard-ux-manager@3000.0.2

## 3000.0.1

### Patch Changes

- Removed dead `feedbackLocalization` prop from `BlinkCardComponentOptions`. Localization strings should be passed via `feedbackUiOptions.localizationStrings` instead.
- Updated dependencies
  - @microblink/blinkcard-ux-manager@3000.0.1
  - @microblink/camera-manager@7.3.0
  - @microblink/blinkcard-core@3000.0.1

## 3000.0.0

### Major Changes

- Major release of the BlinkCard package.

### Patch Changes

- Updated dependencies
  - @microblink/blinkcard-core@3000.0.0
  - @microblink/blinkcard-ux-manager@3000.0.0
