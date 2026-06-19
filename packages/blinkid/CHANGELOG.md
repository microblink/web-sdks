# @microblink/blinkid

## 8000.0.1

### Patch Changes

- Changes reticle type from searching to error for the BARCODE_NOT_IN_FRAME event
- Changed BlinkID UX Manager partially supported barcode step auto-resolution to respect barcodeModule.presenceMandatory.
- Improves the redaction resolver api by adding a second argument to the resolver function which allows the user the get the SDK default redaction settings for a specific DocumentClassInfo
- Also changes the return type of the resolver to Partial<RedactionSettings> this is so the user doesn't have to specify all the properties if he's only interested in one, we then merge this partial result with the default settings
- Updated dependencies
  - @microblink/blinkid-ux-manager@8000.0.1
  - @microblink/blinkid-core@8000.0.1
  - @microblink/camera-manager@7.3.3

## 8000.0.0

### Major Changes

- For the full upgrade guide, see the [BlinkID v8000 migration guide](https://docs.microblink.com/blinkid/migration-v8000).
- Aligns the all-in-one BlinkID SDK with the v8000 runtime. This is a breaking change for integrations built against the 7.x public surface.
- Replaces `createBlinkIdUi` with `createBlinkId`. Update imports and entry-point usage accordingly. When using `@microblink/blinkid-core` directly, pass session options through `createScanningSession` as before.
- Runtime, result typings, and session API changes (including `barcodeImage`, trimmed exports, and `getResolvedSessionSettings()`) are documented in the `@microblink/blinkid-core` changelog; Wasm binding details are in `@microblink/blinkid-wasm`; worker session and redaction wiring are in `@microblink/blinkid-worker`.
- Replaces 7.x session anonymization settings with a result-time redaction API. Remove `scanningSettings.anonymizationMode` and `scanningSettings.customDocumentAnonymizationSettings` from session settings. Pass an optional `redactionSettingsResolver` on `createBlinkId` (or on `BlinkIdCore.createScanningSession` when using core directly) so redaction is chosen per classified document at `getResult()` time. See `@microblink/blinkid-core` and `@microblink/blinkid-worker` changelogs for `RedactionSettings`, `RedactionMode`, and migration from `DocumentAnonymizationSettings`.
- Breaks custom feedback UI localization overrides: flat top-level keys are no longer accepted. Use the nested shape documented in the `@microblink/blinkid-ux-manager` changelog (flat-key migration table) and README under **Internationalization**.

### Other Changes

- Adds `uxManagerOptions` to `createBlinkId` so you can pass `timeoutConfiguration` and other `BlinkIdUxManagerOptions` through the high-level entry point without manually wiring the UX manager.
- Documents top-level UI customization examples for `targetNode`, `cameraManagerUiOptions`, and `feedbackUiOptions`, including nested feedback localization overrides, camera UI localization, and cleanup through `BlinkIdComponent.destroy()`.
- Documents top-level BlinkID UX extraction modes. The built-in feedback UI now derives `full-document`, `document-with-barcode`, or `barcode-only` from `createBlinkId` session settings, so integrations can configure the UI flow through `scanningMode` and the enabled `documentCaptureModule`, `barcodeModule`, `mrzModule`, and `vizModule` settings.
- Exposes `addOnFrameProcessCallback` on the returned `BlinkIdComponent`, matching `BlinkIdUxManager` for advanced integrations that need frame-level control. The callback receives the current `BlinkIdProcessResult`, `advanceToNextStep()` for manually moving the scan flow forward, `triggerStepTimeout()` for forcing the active step into the timeout path, and `getLastFrame()` for reading the raw `ArrayBuffer` that produced the frame result. This lets integrations finish or advance the scan once the processed frame contains all required extracted data, even if the default flow would keep waiting for an optional barcode step that the user cannot capture reliably on a poor camera.
- Exposes `addOnProgressCallback` on the returned `BlinkIdComponent`, forwarding the RAF-driven BlinkID progress snapshots from the underlying UX manager for debug overlays and custom instrumentation.
- Exposes `addOnUiStateChangedCallback` on the returned `BlinkIdComponent`, forwarding stabilized visible `BlinkIdUiState` updates from the UX manager for integrations that need to react to feedback-state changes.
- Documents all top-level `BlinkIdComponent` callbacks and filters: `addOnResultCallback`, `addOnErrorCallback`, `addOnUiStateChangedCallback`, `addOnFrameProcessCallback`, `addOnProgressCallback`, `addDocumentClassFilter`, and `addOnDocumentFilteredCallback`, including cleanup behavior and when each callback fires.
- Adds optional `redactionSettingsResolver` on `BlinkIdComponentOptions` and forwards it to `BlinkIdCore.createScanningSession`, replacing 7.x `scanningSettings.anonymizationMode` / `customDocumentAnonymizationSettings` configuration. Supply a `RedactionSettingsResolver` from `@microblink/blinkid-worker` (re-exported by `@microblink/blinkid-core`) so redaction is chosen per classified document at `getResult()` time; see the v8000 major release notes for the anonymization-to-redaction migration.
- Documents `partiallySupportedBarcodeResolveTimeoutMs` on `timeoutConfiguration` (via `uxManagerOptions`) so you can control how long the SDK waits before resolving a barcode step when the barcode is only partially supported. Timeout and progress behavior is implemented in `@microblink/blinkid-ux-manager`; see that package's changelog for `timeoutConfiguration`, `addOnProgressCallback`, and related APIs.

- Updated dependencies
  - @microblink/blinkid-core@8000.0.0
  - @microblink/blinkid-ux-manager@8000.0.0

## 7.8.0

### Minor Changes

- Updated dependencies
  - @microblink/blinkid-core@7.8.0
  - @microblink/blinkid-ux-manager@7.8.0

## 7.7.4

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-ux-manager@7.7.4
  - @microblink/blinkid-core@7.7.4

## 7.7.3

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-ux-manager@7.7.3
  - @microblink/camera-manager@7.3.2
  - @microblink/blinkid-core@7.7.3

## 7.7.2

### Patch Changes

- Added crash reporting for failures during `createBlinkId(...)`, including SDK initialization, scanning-session creation, UX-manager setup, and UI startup.
- Updated dependencies
  - @microblink/camera-manager@7.3.1
  - @microblink/blinkid-core@7.7.2
  - @microblink/blinkid-ux-manager@7.7.2

## 7.7.1

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-core@7.7.1
  - @microblink/blinkid-ux-manager@7.7.1

## 7.7.0

### Patch Changes

- Fixes `feedbackUiOptions` being reassigned to an empty object and ignoring passed configuration.
- Removed dead `feedbackLocalization` prop from `BlinkIdComponentOptions`. Localization strings should be passed via `feedbackUiOptions.localizationStrings` instead.
- Updated dependencies
  - @microblink/blinkid-core@7.7.0
  - @microblink/blinkid-ux-manager@7.7.0
  - @microblink/camera-manager@7.3.0

## 7.6.4

### Patch Changes

- Fixed `feedbackUiOptions` being reassigned to an empty object and ignoring passed configuration
- Updated dependencies
  - @microblink/blinkid-core@7.6.4
  - @microblink/blinkid-ux-manager@7.6.4

## 7.6.3

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-ux-manager@7.6.3
  - @microblink/camera-manager@7.2.7
  - @microblink/blinkid-core@7.6.3

## 7.6.2

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-core@7.6.2
  - @microblink/blinkid-ux-manager@7.6.2

## 7.6.1

### Patch Changes

- @microblink/blinkid-core@7.6.1
- @microblink/blinkid-ux-manager@7.6.1

## 7.6.0

### Patch Changes

- Updated dependencies
  - @microblink/camera-manager@7.2.6
  - @microblink/blinkid-ux-manager@7.6.0
  - @microblink/blinkid-core@7.6.0

## 7.5.0

### Minor Changes

- Version skip

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-ux-manager@7.5.0
  - @microblink/blinkid-core@7.5.0

## 7.4.3

### Patch Changes

- Fixed types
- Updated dependencies
  - @microblink/blinkid-core@7.4.3
  - @microblink/blinkid-ux-manager@7.4.3
  - @microblink/camera-manager@7.2.5

## 7.4.2

### Patch Changes

- Updated dependencies
  - @microblink/camera-manager@7.2.4
  - @microblink/blinkid-ux-manager@7.4.2
  - @microblink/blinkid-core@7.4.2

## 7.4.1

### Patch Changes

- Exposed `addDocumentClassFilter` and `addOnDocumentFilteredCallback` on the `BlinkIdComponent` type
- Updated dependencies
  - @microblink/camera-manager@7.2.3
  - @microblink/blinkid-ux-manager@7.4.1
  - @microblink/blinkid-core@7.4.1

## 7.4.0

### Minor Changes

- Improved documentation
- Updated dependencies
  - @microblink/blinkid-core@7.4.0
  - @microblink/blinkid-ux-manager@7.4.0
  - @microblink/camera-manager@7.2.2

## 7.3.2

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-core@7.3.2
  - @microblink/blinkid-ux-manager@7.3.2

## 7.3.1

### Patch Changes

- Updated dependencies
  - @microblink/camera-manager@7.2.1
  - @microblink/blinkid-ux-manager@7.3.1
  - @microblink/blinkid-core@7.3.1

## 7.3.0

### Minor Changes

- Updated dependencies
  - @microblink/camera-manager@7.2.0
  - @microblink/blinkid-ux-manager@7.3.0
  - @microblink/blinkid-core@7.3.0

## 7.2.2

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-core@7.2.2
  - @microblink/blinkid-ux-manager@7.2.2

## 7.2.1

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-core@7.2.1
  - @microblink/blinkid-ux-manager@7.2.1

## 7.2.0

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-ux-manager@7.2.0
  - @microblink/blinkid-core@7.2.0

## 7.1.0

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-core@7.1.0
  - @microblink/blinkid-ux-manager@7.1.0
  - @microblink/camera-manager@7.1.0

## 7.0.1

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-core@7.0.1
  - @microblink/blinkid-ux-manager@7.0.1
  - @microblink/camera-manager@7.0.1
