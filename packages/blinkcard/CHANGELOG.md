# @microblink/blinkcard

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
