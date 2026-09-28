# @microblink/blinkid-verify-ux-manager

This package provides user experience management and feedback UI for the BlinkID Verify browser SDK. It parses results from [`@microblink/blinkid-verify-core`](https://www.npmjs.com/package/@microblink/blinkid-verify-core) and guides the user through the scanning process, controlling [`@microblink/camera-manager`](https://www.npmjs.com/package/@microblink/camera-manager) as needed.

<!-- microblink:bundle-size:start -->

## Bundle size

Production consumer bundle sizes for `@microblink/blinkid-verify-ux-manager`:

| Entrypoint | Minified  | Gzip     |
| ---------- | --------- | -------- |
| `root`     | 174.83 kB | 52.36 kB |
| `/core`    | 49.03 kB  | 11.50 kB |
| `/ui`      | 134.99 kB | 43.22 kB |

External packages and runtime assets such as workers, WASM, and models are excluded. Shared code is included in each entrypoint that loads it.

_Generated automatically. Do not edit manually._
<!-- microblink:bundle-size:end -->

## Features

- **Smart UI State Management:** Provides separate core and UI components for user feedback during scanning
- **Camera Integration:** Integrates with BlinkID Verify Core and Camera Manager
- **Haptic Feedback:** Built-in haptic feedback support for enhanced user experience on mobile devices
- **Document Filtering:** Advanced document class filtering capabilities
- **Timeout Management:** Configurable scanning timeouts with automatic state management
- **Localization Support:** Multi-language support with customizable strings
- **Explicit Teardown:** `destroy()` method for deterministic resource cleanup
- **UI State Inspection:** `uiStateKey` (stabilized, visible state) and `mappedUiStateKey` (latest raw candidate before stabilization) getters

## Overview

See the [custom UI example](../../apps/examples/blinkid-verify-custom-ui/) for an application-owned interface built with the `/core` entrypoint.

- Provides separate core and UI entrypoints for user feedback during scanning.
- Integrates with BlinkID Verify Core and Camera Manager.
- Includes haptic feedback system for mobile devices.
- Used by [`@microblink/blinkid-verify`](https://www.npmjs.com/package/@microblink/blinkid-verify) and can be used directly for custom UI integrations.

## Browser Support

The package exports support these browser versions and newer:

| Browser                     | Root | `/core` | `/ui` |
| --------------------------- | ---- | ------- | ----- |
| Chrome / Chromium (desktop) | 96   | 96      | 96    |
| Chrome / Chromium (Android) | 96   | 96      | 96    |
| Edge                        | 96   | 96      | 96    |
| Opera                       | 84   | 84      | 84    |
| Firefox (desktop)           | 132  | 132     | 132   |
| Safari (macOS)              | 16.4 | 16.4    | 16.4  |
| iOS Safari                  | 16.4 | 16.4    | 16.4  |

This package depends on `@microblink/camera-manager` and `@microblink/blinkid-verify-core`.
For the full SDK with camera capture, see `@microblink/blinkid-verify`.

Firefox for Android is not supported for camera-based scanning because camera
device discovery and permission handling are unreliable there; see
[Bugzilla 1611998](https://bugzilla.mozilla.org/show_bug.cgi?id=1611998).

## Installation

Install from npm using your preferred package manager:

```sh
npm install @microblink/blinkid-verify-ux-manager
# or
yarn add @microblink/blinkid-verify-ux-manager
# or
pnpm add @microblink/blinkid-verify-ux-manager
```

Use `@microblink/blinkid-verify-ux-manager/core` for orchestration without UI framework dependencies. Use
`@microblink/blinkid-verify-ux-manager/ui` for the feedback UI. The `/ui` entry requires compatible versions of
`solid-js`, `@ark-ui/solid`, `solid-zustand`, and `@solid-primitives/keyed`. Install them explicitly when using the root
or `/ui` entry; they are optional package peers only so `/core` consumers do not install a Solid runtime:

```sh
npm install solid-js @ark-ui/solid solid-zustand @solid-primitives/keyed
```

The package root continues to export both entrypoints for compatibility until the next major release. New integrations
should use `/core` and `/ui` explicitly.

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
import { createBlinkIdVerifyUxManager, HapticFeedbackManager } from "@microblink/blinkid-verify-ux-manager/core";

// Create UX Manager (haptic feedback enabled by default)
const uxManager = await createBlinkIdVerifyUxManager(cameraManager, scanningSession);

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

You can use `@microblink/blinkid-verify-ux-manager` directly in your project for advanced or custom integrations. For most use cases, use [`@microblink/blinkid-verify`](https://www.npmjs.com/package/@microblink/blinkid-verify) for a simpler setup.

### Creating the UX Manager

Use the async `createBlinkIdVerifyUxManager` factory — direct constructor instantiation is not supported:

```javascript
import { createBlinkIdVerifyUxManager } from "@microblink/blinkid-verify-ux-manager/core";

const uxManager = await createBlinkIdVerifyUxManager(cameraManager, scanningSession);

// When done, release resources explicitly
uxManager.destroy();
```

### Inspecting UI State

Two getters provide visibility into the current UI state:

- `uxManager.uiStateKey` — the stabilized, visible state key (what the UI shows)
- `uxManager.mappedUiStateKey` — the latest raw candidate key from the detector before stabilization (useful for debugging)

> **Note:** Starting in v7.7.0, the manager automatically advances through intermediate transition states after `PAGE_CAPTURED` (e.g. `PAGE_CAPTURED → FLIP_CARD → INTRO_BACK_PAGE` for two-sided IDs). Integrations that depend on exact UI-state key sequences should account for these chained transitions.

### Configuring Help Tooltip Delays

Tooltip delays can be configured via `FeedbackUiOptions` when creating the feedback UI:

```javascript
import { createBlinkIdVerifyFeedbackUi } from "@microblink/blinkid-verify-ux-manager/ui";

createBlinkIdVerifyFeedbackUi(uxManager, cameraUi, {
  showHelpTooltipTimeout: 15000, // ms before tooltip appears
});
```

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

You can customize UI strings when creating the feedback UI:

```typescript
createBlinkIdVerifyFeedbackUi(uxManager, cameraUi, {
  localizationStrings: {
    flashlight_warning_message: "Move your ID to avoid flashlight glare.",
  },
});
```

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
