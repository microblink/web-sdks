# @microblink/blinkid-ux-manager

This package provides user experience management and feedback UI for the BlinkID browser SDK. It parses results from [`@microblink/blinkid-core`](https://www.npmjs.com/package/@microblink/blinkid-core) and guides the user through the scanning process, controlling [`@microblink/camera-manager`](https://www.npmjs.com/package/@microblink/camera-manager) as needed.

## Features

- **Smart UI State Management:** Provides both headless and UI components for user feedback during scanning
- **Camera Integration:** Integrates with BlinkID Core and Camera Manager
- **Haptic Feedback:** Built-in haptic feedback support for enhanced user experience on mobile devices
- **Document Filtering:** Advanced document class filtering capabilities
- **Timeout Management:** Configurable scanning timeouts with automatic state management
- **Progress Callbacks:** Live progress snapshots for debug overlays and custom tooling
- **Localization Support:** Multi-language support with customizable strings
- **Explicit Teardown:** `destroy()` method for deterministic resource cleanup
- **UI State Inspection:** `uiStateKey` (stabilized, visible state) and `mappedUiStateKey` (latest raw candidate before stabilization) getters

## Overview

- Provides both headless and UI components for user feedback during scanning.
- Integrates with BlinkID Core and Camera Manager.
- Includes haptic feedback system for mobile devices.
- Used by [`@microblink/blinkid`](https://www.npmjs.com/package/@microblink/blinkid) and can be used directly for custom UI integrations.

## Browser Support

This package supports these browser versions and newer:

- Chrome / Chromium 96 (desktop and Android)
- Edge 96
- Opera 84
- Firefox 132 (desktop)
- Safari 16.4 (macOS)
- iOS Safari 16.4

This package depends on `@microblink/camera-manager` and `@microblink/blinkid-core`.
For the full SDK with camera capture, see `@microblink/blinkid`.

Firefox for Android is not supported for camera-based scanning because camera
device discovery and permission handling are unreliable there; see
[Bugzilla 1611998](https://bugzilla.mozilla.org/show_bug.cgi?id=1611998).

## Migration from v7 to v8000

For breaking changes and upgrade steps, see the [BlinkID v8000 migration guide](https://docs.microblink.com/blinkid/migration-v8000).

## Installation

Install from npm using your preferred package manager:

```sh
npm install @microblink/blinkid-ux-manager
# or
yarn add @microblink/blinkid-ux-manager
# or
pnpm add @microblink/blinkid-ux-manager
```

## Haptic Feedback

The UX Manager includes a comprehensive haptic feedback system that provides tactile responses during the document scanning process. **This feature is primarily designed for Android devices using Chrome browser**, where it works reliably to enhance the scanning experience.

### Haptic Feedback Types

| Event              | Duration | Type  | Description                                   |
| ------------------ | -------- | ----- | --------------------------------------------- |
| First Side Success | 100ms    | Short | When the first side of an ID card is captured |
| Final Success      | 300ms    | Long  | When document scanning is completed           |
| Error States       | 100ms    | Short | Quality issues (blur, glare, positioning)     |
| Error Dialogs      | 300ms    | Long  | Timeout or critical errors                    |
| Flashlight Toggle  | 100ms    | Short | When camera flashlight is activated           |
| Warning States     | 100ms    | Short | During sensing phases (with 1s cooldown)      |

### Haptic Feedback Usage

```javascript
import {
  createBlinkIdUxManager,
  HapticFeedbackManager,
} from "@microblink/blinkid-ux-manager";

// Create UX Manager (haptic feedback enabled by default)
const uxManager = await createBlinkIdUxManager(cameraManager, scanningSession);

// Check if haptic feedback is supported
if (uxManager.isHapticFeedbackSupported()) {
  console.log("Device supports haptic feedback");
}

// Enable/disable haptic feedback
uxManager.setHapticFeedbackEnabled(true); // Enable
uxManager.setHapticFeedbackEnabled(false); // Disable

// Access haptic manager directly for manual control
const hapticManager = uxManager.getHapticFeedbackManager();
hapticManager.triggerShort(); // 100ms vibration for short feedback
hapticManager.triggerLong(); // 300ms vibration for long feedback
hapticManager.stop(); // Stop all vibration
```

### Browser Compatibility

**⚠️ Important:** Haptic feedback uses the [Web Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API), which has **limited browser support**:

| Browser             | Support          |
| ------------------- | ---------------- |
| Chrome for Android  | ✅ Supported     |
| Firefox for Android | ✅ Supported     |
| Safari (iOS)        | ❌ Not supported |
| Desktop browsers    | ❌ Not supported |

The API is designed primarily for **Android devices using Chrome**, where it works reliably. On unsupported platforms `isHapticFeedbackSupported()` returns `false` and vibration calls are silently ignored.

## Usage

You can use `@microblink/blinkid-ux-manager` directly in your project for advanced or custom integrations. For most use cases, use [`@microblink/blinkid`](https://www.npmjs.com/package/@microblink/blinkid) for a simpler setup.

### Creating the UX Manager

Use the async `createBlinkIdUxManager` factory — direct constructor instantiation is not supported:

```javascript
import { createBlinkIdUxManager } from "@microblink/blinkid-ux-manager";

const uxManager = await createBlinkIdUxManager(cameraManager, scanningSession);

// When done, release resources explicitly
uxManager.destroy();
```

### Configuring Scan Timeouts

BlinkID uses three timeout windows during capture:

- `inactivityTimeoutMs` restarts when the stabilized BlinkID UI state changes
- `scanStepTimeoutMs` limits the total active capture time for the current scan step
- `partiallySupportedBarcodeResolveTimeoutMs` resolves a barcode step after BlinkID reports a barcode whose parsing is not supported

When the stabilized UI state is `PROCESSING_BARCODE` (the visible "scan the
barcode" step), BlinkID suppresses the inactivity timeout and starts that
barcode step with a fresh `scanStepTimeoutMs` window.

You can override them when creating the manager:

```javascript
const uxManager = await createBlinkIdUxManager(cameraManager, scanningSession, {
  timeoutConfiguration: {
    inactivityTimeoutMs: 15000,
    scanStepTimeoutMs: 90000,
    partiallySupportedBarcodeResolveTimeoutMs: 8000,
  },
});
```

Set any timeout to `null` to disable it:

```javascript
const uxManager = await createBlinkIdUxManager(cameraManager, scanningSession, {
  timeoutConfiguration: {
    inactivityTimeoutMs: null,
    scanStepTimeoutMs: 90000,
    partiallySupportedBarcodeResolveTimeoutMs: null,
  },
});
```

You can also inspect or update the active configuration later:

```javascript
uxManager.getTimeoutConfiguration();
uxManager.setTimeoutConfiguration({
  inactivityTimeoutMs: 20000,
});
```

### Observing Processed Frames

Use `addOnFrameProcessCallback` to inspect each processed frame before a final
result is available or to drive custom scan-step behavior from your own logic.
The callback uses the exported `BlinkIdFrameProcessCallback` type:

```typescript
export type BlinkIdFrameProcessCallback = (
  frameResult: BlinkIdProcessResult,
  advanceToNextStep: () => Promise<void>,
  triggerStepTimeout: () => void,
  getLastFrame: () => ArrayBuffer,
) => void;
```

Callback parameters:

- `frameResult` - the `BlinkIdProcessResult` for the current frame. It contains
  input image analysis and result completeness data for that frame, but it is not
  the final `BlinkIdScanningResult`.
- `advanceToNextStep` - manually advances the session to the next required scan
  step. Use this when your custom frame-level logic decides that the active side
  or barcode step is complete. This can also finish the scan when
  `frameResult` already contains all data your integration needs, even if the
  default flow would keep waiting for a barcode or another optional step that
  the user cannot capture reliably.
- `triggerStepTimeout` - immediately triggers the scan-step timeout path for the
  active step. Use this when custom validation decides the current step should
  fail or stop waiting for more frames.
- `getLastFrame` - returns the raw `ArrayBuffer` for the frame that produced
  `frameResult`, useful for QA overlays, diagnostics, or custom capture tooling.

```typescript
const removeOnFrameProcess = uxManager.addOnFrameProcessCallback(
  (frameResult, advanceToNextStep, triggerStepTimeout, getLastFrame) => {
    if (hasAllRequiredData(frameResult)) {
      void advanceToNextStep();
      return;
    }

    if (shouldStopStep(frameResult)) {
      triggerStepTimeout();
      return;
    }

    const lastFrame = getLastFrame();
    console.debug("Last processed frame bytes:", lastFrame.byteLength);
  },
);

// Later, to stop receiving updates:
removeOnFrameProcess();
```

### Observing Progress

Use `addOnProgressCallback` to receive live BlinkID progress snapshots from the
manager's internal RAF loop, capped at 30 FPS. This is useful for QA overlays,
debug tooling, or custom telemetry.

```javascript
const removeOnProgress = uxManager.addOnProgressCallback((progress) => {
  console.log(progress.uiStateKey);
  console.log(progress.inactivity.remainingMs);
  console.log(progress.perSide.remainingMs);
  console.log(progress.partiallySupportedBarcodeResolve.remainingMs);
});

// Later, to stop receiving updates:
removeOnProgress();
```

Each progress payload includes:

- `uiStateKey` - current stabilized UI state
- `mappedUiStateKey` - latest raw candidate state before stabilization
- `inactivity` - configured, remaining, and status data for the inactivity timer
- `perSide` - configured, remaining, and status data for the scan-step timer
- `partiallySupportedBarcodeResolve` - configured, remaining, and status data for the partially supported barcode resolve timer
- `playbackState` - current camera playback state
- `isTimingActiveScanStep` - whether BlinkID is currently timing an active scan step

### Inspecting UI State

Two getters provide visibility into the current UI state:

- `uxManager.uiStateKey` — the stabilized, visible state key (what the UI shows)
- `uxManager.mappedUiStateKey` — the latest raw candidate key from the detector before stabilization (useful for debugging)

> **Note:** Starting in v7.7.0, the manager automatically advances through intermediate transition states after `PAGE_CAPTURED` (e.g. `PAGE_CAPTURED → FLIP_CARD → INTRO_BACK_PAGE` for two-sided IDs). Integrations that depend on exact UI-state key sequences should account for these chained transitions.

### Configuring Help Tooltip Delays

Tooltip delays can be configured via `FeedbackUiOptions` when creating the feedback UI:

```javascript
createBlinkIdFeedbackUi(uxManager, cameraUi, {
  showHelpTooltipTimeout: 15000, // ms before tooltip appears
});
```

> **Deprecated:** The `setHelpTooltipShowDelay` and `setHelpTooltipHideDelay` methods on `BlinkIdUxManager` are deprecated. Prefer configuring delays through `FeedbackUiOptions` instead.

See the example apps in the `apps/examples` directory in the GitHub repository for full usage details.

## Development

To build the package locally:

1. Install dependencies in the monorepo root:

   ```sh
   pnpm install
   ```

2. Build the package:

   ```sh
   pnpm build
   ```

3. Run tests:

   ```sh
   pnpm test
   ```

The output files will be available in the `dist/` and `types/` directories.

### Internationalization

You can customize UI strings when creating the feedback UI. The canonical key shape is defined by [`src/ui/locales/en.ts`](src/ui/locales/en.ts); `LocalizationStrings` in [`src/ui/LocalizationContext.tsx`](src/ui/LocalizationContext.tsx) follows that object.

#### v8000 breaking change: nested localization keys

Older releases used **flat** top-level keys (for example `scan_the_barcode`, `help_modal_title_1`). Current releases use a **nested** object. Overrides in `feedbackUiOptions.localizationStrings` (or the third argument to `createBlinkIdFeedbackUi`) must use the new paths; flat keys are no longer read. If you overrode flat keys in 7.x, use the **Flat key migration (pre-v8000 → current)** table in the v8000 package `CHANGELOG.md` (from the major release changeset) for the old-key to new-path mapping.

Example override with nested keys:

```typescript
createBlinkIdFeedbackUi(uxManager, cameraUi, {
  localizationStrings: {
    feedback_messages: {
      scan_the_barcode: "Please scan the barcode",
    },
    timeout_modal: {
      title: "Scan did not finish",
    },
  },
});
```

#### Structure overview

Top-level groups in `en.ts`:

- `feedback_messages` — short live feedback strings (blur, glare, scan-this-side hints, success ARIA labels).
- `help_button` — `aria_label`, `tooltip` for the help entry point.
- `help_modal` — shared chrome (`aria`, `back_btn`, `next_btn`, `done_btn`, `done_btn_aria`) plus three **flow groups** (`full_document`, `document_with_barcode`, `barcode_only`). Each group has step objects `visibility`, `lighting`, `blur` with `title`, `title_desktop`, `details`, `details_desktop` as applicable, and `camera_lens` with desktop-only `title_desktop` / `details_desktop` where used.
- `onboarding_modal` — shared `aria`, `btn` plus the same three groups (`full_document`, `document_with_barcode`, `barcode_only`) with `title`, `title_desktop`, `details`, `details_desktop`.
- `error_modal` — `cancel_btn`, `retry_btn` for error flows that expose those actions.
- `document_filtered_modal`, `document_not_recognized_modal` — `title` and `details` for document filtering / unsupported UI.
- `timeout_modal` — `title` and `details` for scan timeout / failure messaging.
- `sdk_aria` — ARIA label for the scanning screen region.

#### Extraction mode and which help/onboarding group is used

`BlinkIdExtractionMode` (see [`src/core/extractionMode.ts`](src/core/extractionMode.ts)) drives which subtree under `help_modal` and `onboarding_modal` is shown. The mapping matches [`helpModalContentByExtractionMode`](src/ui/dialogs/HelpModal.tsx) and [`onboardingModalContentByExtractionMode`](src/ui/dialogs/OnboardingGuideModal.tsx):

| Extraction mode         | `help_modal` / `onboarding_modal` group |
| ----------------------- | --------------------------------------- |
| `full-document`         | `full_document`                         |
| `document-with-barcode` | `document_with_barcode`                 |
| `document-with-mrz`     | `document_with_mrz`                     |
| `barcode-only`          | `barcode_only`                          |

The `document-with-mrz` mode is selected for single-side scanning when document
capture is enabled and `mrzModule.presenceMandatory` is `true`. It provides
MRZ-specific help, onboarding, illustrations, and scanning guidance.

Feedback strings that depend on extraction mode (for example front, barcode,
or MRZ side) are selected in code via
[`src/ui/feedbackMessages.ts`](src/ui/feedbackMessages.ts); new keys include
`scan_the_barcode_side`, `scan_the_mrz_side`, and `keep_still` (used for the
desktop blur path as a shorter “keep still” hint).

#### English copy changes (not just nesting)

- Several `feedback_messages` strings now say “**a** document” instead of “**the** document” where the copy is generic.
- New dedicated copy for **barcode-only**, **document + barcode**, and
  **document + MRZ** paths under `help_modal.barcode_only`,
  `help_modal.document_with_barcode`, `help_modal.document_with_mrz`, and the
  matching `onboarding_modal` groups.
- New feedback keys: `scan_the_barcode_side`, `scan_the_mrz_side`, `keep_still`.

#### Other locales

Every file under [`src/ui/locales/`](src/ui/locales/) follows the same nested structure as `en.ts`. If you maintain a fork or partial override, diff your strings against `en.ts` to pick up new keys and renamed paths.

#### Provided Translations

<details>
<summary>Click to see all available translation files</summary>

- [ak.ts](src/ui/locales/ak.ts)
- [am.ts](src/ui/locales/am.ts)
- [ar.ts](src/ui/locales/ar.ts)
- [bn.ts](src/ui/locales/bn.ts)
- [cs.ts](src/ui/locales/cs.ts)
- [da.ts](src/ui/locales/da.ts)
- [de.ts](src/ui/locales/de.ts)
- [el.ts](src/ui/locales/el.ts)
- [en.ts](src/ui/locales/en.ts)
- [en_GB.ts](src/ui/locales/en_GB.ts)
- [es.ts](src/ui/locales/es.ts)
- [es_MX.ts](src/ui/locales/es_MX.ts)
- [fa-latn.ts](src/ui/locales/fa-latn.ts)
- [fi.ts](src/ui/locales/fi.ts)
- [fil.ts](src/ui/locales/fil.ts)
- [fr.ts](src/ui/locales/fr.ts)
- [fr_CA.ts](src/ui/locales/fr_CA.ts)
- [ha.ts](src/ui/locales/ha.ts)
- [he.ts](src/ui/locales/he.ts)
- [hi.ts](src/ui/locales/hi.ts)
- [hr.ts](src/ui/locales/hr.ts)
- [hu.ts](src/ui/locales/hu.ts)
- [id.ts](src/ui/locales/id.ts)
- [is.ts](src/ui/locales/is.ts)
- [it.ts](src/ui/locales/it.ts)
- [ja.ts](src/ui/locales/ja.ts)
- [ka_GE.ts](src/ui/locales/ka_GE.ts)
- [kk.ts](src/ui/locales/kk.ts)
- [km_KH.ts](src/ui/locales/km_KH.ts)
- [ko.ts](src/ui/locales/ko.ts)
- [lv.ts](src/ui/locales/lv.ts)
- [ms.ts](src/ui/locales/ms.ts)
- [ne.ts](src/ui/locales/ne.ts)
- [nl.ts](src/ui/locales/nl.ts)
- [no.ts](src/ui/locales/no.ts)
- [pl.ts](src/ui/locales/pl.ts)
- [ps_AF.ts](src/ui/locales/ps_AF.ts)
- [pt.ts](src/ui/locales/pt.ts)
- [pt_BR.ts](src/ui/locales/pt_BR.ts)
- [ro.ts](src/ui/locales/ro.ts)
- [ru.ts](src/ui/locales/ru.ts)
- [si.ts](src/ui/locales/si.ts)
- [sk.ts](src/ui/locales/sk.ts)
- [sl.ts](src/ui/locales/sl.ts)
- [sr.ts](src/ui/locales/sr.ts)
- [sv.ts](src/ui/locales/sv.ts)
- [sw.ts](src/ui/locales/sw.ts)
- [th.ts](src/ui/locales/th.ts)
- [tr.ts](src/ui/locales/tr.ts)
- [uk.ts](src/ui/locales/uk.ts)
- [ur.ts](src/ui/locales/ur.ts)
- [uz.ts](src/ui/locales/uz.ts)
- [vi.ts](src/ui/locales/vi.ts)
- [yo.ts](src/ui/locales/yo.ts)
- [zh_CN.ts](src/ui/locales/zh_CN.ts)
- [zh_TW.ts](src/ui/locales/zh_TW.ts)

</details>

---

You can import any of these files directly or use them as a starting point for your own localization.
