# @microblink/blinkid-ux-manager

## 8001.0.0

### Major Changes

- **Breaking:** `DocumentClassInfo.country`, `region`, and `type` are now wrapper objects (`{ id?, rawValue }`) instead of plain string values. `id` carries the strongly-typed kebab-case value (`Country` / `Region` / `DocumentType`) when the document class is known at build time; `rawValue` always carries the raw classification token from the document knowledge database, including OTA-delivered document classes unknown at build time. Update comparisons such as `documentClassInfo.country === "usa"` to `documentClassInfo.country?.id === "usa"`, and use `id ?? rawValue` when displaying values. This affects `redactionSettingsResolver`, `addDocumentClassFilter`, `addOnDocumentFilteredCallback`, and the `documentClassInfo` fields on process and scanning results.
  - Added the `DocumentClassComponent`, `DocumentClassCountry`, `DocumentClassRegion`, and `DocumentClassDocumentType` types.
  - `countryName` and the ISO country-code fields on `DocumentClassInfo` are unchanged (plain strings, empty when unknown), and `documentClassInfo` on results remains non-optional — an unclassified document still yields `undefined` components and empty strings.
  - Updated the native bindings to the new document classification API (enum identifiers renamed to `CountryID` / `RegionID` / `DocumentTypeID`; document class construction now goes through the document knowledge database). Unrecognized classification strings passed to `getDefaultRedactionSettings` no longer abort the Wasm module; they are forwarded as raw values instead.
- Renamed `DocumentClassInfo.type` to `DocumentClassInfo.documentType` to align with other platforms.
  - Migration: replace `documentClassInfo.type` with `documentClassInfo.documentType`.
- Adds new timeout dialog text
  - Title updated to "Unable to read the document" from "Scan unsuccessful"
  - Details updated from "Unable to read the document. Please try again." to
    "Make sure your camera lens is clean and the document is fully visible, in focus, and well lit." for Desktop
    "Make sure the document is well lit, fully visible, and free of glare." for Mobile
- Adds a new MRZ Extraction mode
- Adds new assets (images) for the MRZ extraction mode along with new feedback messages
- Renames the `keep_document_still` translation key to `keep_still` (used by the `BLUR_DETECTED` UI state), now resolving to `keep_still` on desktop and `blur_detected` on mobile.
    - This is a breaking change. To migrate, rename any override of `keep_document_still` to `keep_still`.
- Improves the default timeout settings in UX Manager by enabling different timeout configurations for desktop and mobile environments.
- Improves analytics granularity when reporting timeout events.
- Updated `BlinkIdProcessingError` to support new timeout types, error "timeout" was removed and two new errors were added: `inactivity_timeout` and `scan_step_timeout`
- ```javascript
      blinkid.addOnErrorCallback(err => {
        // err can no longer be 'timeout', instead it will be one of these two
        if (err === 'inactivity_timeout' || err === 'scan_step_timeout')
      })
  ```
- Fixed feedback UI localization merging so partial user string overrides preserve the default nested localized values instead of replacing whole sections.
- Updated dependencies
  - @microblink/blinkid-core@8001.0.0

## 8000.0.1

### Patch Changes

- Changes reticle type from searching to error for the BARCODE_NOT_IN_FRAME event
- Changed BlinkID UX Manager partially supported barcode step auto-resolution to respect barcodeModule.presenceMandatory.
- Updated dependencies
  - @microblink/blinkid-core@8000.0.1
  - @microblink/camera-manager@7.3.3
- Fixed UX manager creation failing when `screen.orientation` is unavailable (e.g. iOS Safari and some WebViews). Device orientation analytics now use a guarded subscription with legacy fallback and log warning when reporting is unavailable.

## 8000.0.0

### Major Changes

- For the full upgrade guide, see the [BlinkID v8000 migration guide](https://docs.microblink.com/blinkid/migration-v8000).
- Breaks custom localization overrides for the feedback UI. `feedbackUiOptions.localizationStrings` and the third argument to `createBlinkIdFeedbackUi` no longer accept the old flat top-level keys (such as `scan_the_barcode`, `help_modal_title_1`, `alert_cancel_btn`, `onboarding_modal_title`, or `scanning_help`). Overrides must follow the nested object shape in `src/ui/locales/en.ts`: live hints live under `feedback_messages`; help chrome and step copy under `help_modal` with flow branches `full_document`, `document_with_barcode`, and `barcode_only`, each exposing steps `visibility`, `lighting`, and `blur` plus desktop-only `camera_lens` fields where present; onboarding under `onboarding_modal` with the same three branch names plus shared `btn` and `aria`; document and error dialogs under `document_filtered_modal`, `document_not_recognized_modal`, `error_modal`, and `timeout_modal`; the help entry point under `help_button`; and the scanning surface ARIA label under `sdk_aria`. Replace legacy keys `document_scanned` and `front_side_scanned` with `feedback_messages.document_scanned_aria` and `feedback_messages.front_side_scanned_aria`. New feedback keys include `feedback_messages.scan_the_barcode_side` and `feedback_messages.keep_still`. The active `help_modal` and `onboarding_modal` branch matches BlinkID extraction mode: `full-document` uses `full_document`, `document-with-barcode` uses `document_with_barcode`, and `barcode-only` uses `barcode_only`.
- Flat key migration (pre-v8000 → current). Re-key every override from the old flat name to the nested path below. Barcode-only and document-with-barcode help copy also lives under `help_modal.barcode_only`, `help_modal.document_with_barcode`, and matching `onboarding_modal` groups; the table maps the legacy single capture help flow to `help_modal.full_document.*`. For nested key structure, extraction-mode groups, and English copy deltas, see the README under **Internationalization**.
- ```markdown
  | Old flat key                       | New path                                               |
  | ---------------------------------- | ------------------------------------------------------ |
  | `alert_cancel_btn`                 | `error_modal.cancel_btn`                               |
  | `alert_retry_btn`                  | `error_modal.retry_btn`                                |
  | `blur_detected`                    | `feedback_messages.blur_detected`                      |
  | `camera_angle_too_steep`           | `feedback_messages.camera_angle_too_steep`             |
  | `document_filtered`                | `document_filtered_modal.title`                        |
  | `document_filtered_details`        | `document_filtered_modal.details`                      |
  | `document_not_recognized`          | `document_not_recognized_modal.title`                  |
  | `document_not_recognized_details`  | `document_not_recognized_modal.details`                |
  | `document_scanned`                 | `feedback_messages.document_scanned_aria`              |
  | `document_too_close_to_edge`       | `feedback_messages.document_too_close_to_edge`         |
  | `face_photo_not_fully_visible`     | `feedback_messages.face_photo_not_fully_visible`       |
  | `flip_document`                    | `feedback_messages.flip_document`                      |
  | `flip_to_back_side`                | `feedback_messages.flip_to_back_side`                  |
  | `front_side_scanned`               | `feedback_messages.front_side_scanned_aria`            |
  | `glare_detected`                   | `feedback_messages.glare_detected`                     |
  | `help_aria_label`                  | `help_button.aria_label`                               |
  | `help_tooltip`                     | `help_button.tooltip`                                  |
  | `help_modal_back_btn`              | `help_modal.back_btn`                                  |
  | `help_modal_next_btn`              | `help_modal.next_btn`                                  |
  | `help_modal_done_btn`              | `help_modal.done_btn`                                  |
  | `help_modal_title_1`               | `help_modal.full_document.visibility.title`            |
  | `help_modal_details_1`             | `help_modal.full_document.visibility.details`          |
  | `help_modal_title_2`               | `help_modal.full_document.lighting.title`              |
  | `help_modal_details_2`             | `help_modal.full_document.lighting.details`            |
  | `help_modal_title_3`               | `help_modal.full_document.blur.title`                  |
  | `help_modal_details_3`             | `help_modal.full_document.blur.details`                |
  | `help_modal_blur_details_desktop`  | `help_modal.full_document.blur.details_desktop`        |
  | `help_modal_camera_lens_title`     | `help_modal.full_document.camera_lens.title_desktop`   |
  | `help_modal_camera_lens_details`   | `help_modal.full_document.camera_lens.details_desktop` |
  | `keep_document_parallel`           | `feedback_messages.keep_document_parallel`             |
  | `keep_document_still`              | `feedback_messages.keep_document_still`                |
  | `move_closer`                      | `feedback_messages.move_closer`                        |
  | `move_farther`                     | `feedback_messages.move_farther`                       |
  | `move_left`                        | `feedback_messages.move_left`                          |
  | `move_right`                       | `feedback_messages.move_right`                         |
  | `move_top`                         | `feedback_messages.move_top`                           |
  | `occluded`                         | `feedback_messages.occluded`                           |
  | `onboarding_modal_btn`             | `onboarding_modal.btn`                                 |
  | `onboarding_modal_title`           | `onboarding_modal.full_document.title`                 |
  | `onboarding_modal_title_desktop`   | `onboarding_modal.full_document.title_desktop`         |
  | `onboarding_modal_details`         | `onboarding_modal.full_document.details`               |
  | `onboarding_modal_details_desktop` | `onboarding_modal.full_document.details_desktop`       |
  | `resume_scanning`                  | `help_modal.done_btn_aria`                             |
  | `scan_data_page`                   | `feedback_messages.scan_data_page`                     |
  | `scan_last_page_barcode`           | `feedback_messages.scan_last_page_barcode`             |
  | `scan_left_page`                   | `feedback_messages.scan_left_page`                     |
  | `scan_right_page`                  | `feedback_messages.scan_right_page`                    |
  | `scan_the_back_side`               | `feedback_messages.scan_the_back_side`                 |
  | `scan_the_barcode`                 | `feedback_messages.scan_the_barcode`                   |
  | `scan_the_front_side`              | `feedback_messages.scan_the_front_side`                |
  | `scan_top_page`                    | `feedback_messages.scan_top_page`                      |
  | `scan_unsuccessful`                | `timeout_modal.title`                                  |
  | `scan_unsuccessful_details`        | `timeout_modal.details`                                |
  | `scanning_help`                    | `help_modal.aria`                                      |
  | `scanning_instructions`            | `onboarding_modal.aria`                                |
  | `scanning_screen`                  | `sdk_aria`                                             |
  | `too_bright`                       | `feedback_messages.too_bright`                         |
  | `too_dark`                         | `feedback_messages.too_dark`                           |
  | `wrong_left`                       | `feedback_messages.wrong_left`                         |
  | `wrong_right`                      | `feedback_messages.wrong_right`                        |
  | `wrong_top`                        | `feedback_messages.wrong_top`                          |
  ```
- Derives BlinkID UX extraction mode (`full-document`, `document-with-barcode`, or `barcode-only`) from session settings and drives help/onboarding assets and copy per mode. Help and onboarding illustrations were renamed for clarity (`barcode_only`, `document_with_barcode`, and related assets).

### Minor Changes

- Replaces BlinkID's single scan timeout with a two-timer model exposed through `timeoutConfiguration`: `inactivityTimeoutMs` tracks inactivity between stabilized UI-state changes, and `scanStepTimeoutMs` limits total active capture time for the current scan step. Set either value to `null` to disable that timer. The inactivity timer restarts only after the feedback stabilizer applies a new UI state; the per-side timer pauses whenever capture stops and resets when a new intro-anchored scan step begins or when the app returns from the background.
- Adds `getTimeoutConfiguration()` and `setTimeoutConfiguration()` to `BlinkIdUxManager`, and removes the legacy single-timeout API `getTimeoutDuration()` / `setTimeoutDuration()`.
- Adds `BlinkIdProgress`, `BlinkIdProgressTimerState`, `BlinkIdProgressTimerStatus`, and `addOnProgressCallback(...)` for live, RAF-driven progress snapshots (QA tooling and custom debug overlays).
- Adds `partiallySupportedBarcodeResolveTimeoutMs` on `timeoutConfiguration` to control how long the SDK waits before resolving a barcode step when the barcode is only partially supported.
- Exports `BlinkIdFrameProcessCallback` and documents `addOnFrameProcessCallback` (frame-level control with `advanceToNextStep()`, `triggerStepTimeout()`, and `getLastFrame()`).

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-core@8000.0.0

## 7.8.0

### Minor Changes

- Updated dependencies
  - @microblink/blinkid-core@7.8.0

## 7.7.4

### Patch Changes

- Version bump for consistency with other packages
- Added analytical event logging for when the "Document Not Supported" alert modal is displayed in the feedback UI

## 7.7.3

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-core@7.7.3
  - @microblink/camera-manager@7.3.2

## 7.7.2

### Patch Changes

- Keeps the feedback overlay visible whenever no SDK modal is open, preventing it from disappearing during intro, transition, and success states.
- Added non-fatal analytics reporting for UX-manager creation failures, frame-capture failures, `CameraManager` frame-loop errors, and session result retrieval failures.
- Updated dependencies
  - @microblink/camera-manager@7.3.1
  - @microblink/analytics@1.0.1
  - @microblink/blinkid-core@7.7.2

## 7.7.1

### Patch Changes

- Fixed a missing analytics event for the onboarding dialog.
- Fixed missing analytics events for camera permission checks in some cases.
- Updated dependencies
  - @microblink/blinkid-core@7.7.1
  - @microblink/camera-manager@7.3.0

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
- Renames several UI state keys. Integrations that reference state keys by name should update accordingly. Each `SENSING_*` state has been split into a framing-feedback state (`*_NOT_IN_FRAME`) and a new intro guidance state (`INTRO_*`):
  | Old key | New key(s) |
  |---|---|
  | `SENSING_FRONT` | `FRONT_PAGE_NOT_IN_FRAME`, `INTRO_FRONT_PAGE` |
  | `SENSING_BACK` | `BACK_PAGE_NOT_IN_FRAME`, `INTRO_BACK_PAGE` |
  | `SENSING_DATA_PAGE` | `DATA_PAGE_NOT_IN_FRAME`, `INTRO_DATA_PAGE` |
  | `SENSING_TOP_PAGE` | `TOP_PAGE_NOT_IN_FRAME`, `INTRO_TOP_PAGE` |
  | `SENSING_LEFT_PAGE` | `LEFT_PAGE_NOT_IN_FRAME`, `INTRO_LEFT_PAGE` |
  | `SENSING_RIGHT_PAGE` | `RIGHT_PAGE_NOT_IN_FRAME`, `INTRO_RIGHT_PAGE` |
  | `SENSING_LAST_PAGE` | `LAST_PAGE_NOT_IN_FRAME`, `INTRO_LAST_PAGE` |
  | `SCAN_BARCODE` | `PROCESSING_BARCODE` |
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
