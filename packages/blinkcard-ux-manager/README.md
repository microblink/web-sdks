# @microblink/blinkcard-ux-manager

This package provides user experience management and feedback UI for the BlinkCard browser SDK. It parses results from [`@microblink/blinkcard-core`](https://www.npmjs.com/package/@microblink/blinkcard-core) and guides the user through the scanning process, controlling [`@microblink/camera-manager`](https://www.npmjs.com/package/@microblink/camera-manager) as needed.

<!-- microblink:bundle-size:start -->

## Bundle size

Production consumer bundle sizes for `@microblink/blinkcard-ux-manager`:

| Entrypoint | Minified  | Gzip     |
| ---------- | --------- | -------- |
| `root`     | 180.62 kB | 55.20 kB |
| `/core`    | 38.35 kB  | 10.21 kB |
| `/ui`      | 148.86 kB | 47.21 kB |

External packages and runtime assets such as workers, WASM, and models are excluded. Shared code is included in each entrypoint that loads it.

_Generated automatically. Do not edit manually._
<!-- microblink:bundle-size:end -->

## Features

- **Smart UI State Management:** Provides both headless and UI components for user feedback during scanning
- **Camera Integration:** Integrates with BlinkCard Core and Camera Manager
- **Haptic Feedback:** Built-in haptic feedback support for enhanced user experience on mobile devices
- **Card Filtering:** Advanced card type filtering capabilities
- **Timeout Management:** Configurable scanning timeouts with automatic state management
- **Localization Support:** Multi-language support with customizable strings

## Overview

See the [custom UI example](../../apps/examples/blinkcard-custom-ui/) for an application-owned interface built with the `/core` entrypoint.

- Provides both headless and UI components for user feedback during scanning.
- Integrates with BlinkCard Core and Camera Manager.
- Includes haptic feedback system for mobile devices.
- Used by [`@microblink/blinkcard`](https://www.npmjs.com/package/@microblink/blinkcard) and can be used directly for custom UI integrations.

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

This package depends on `@microblink/camera-manager` and `@microblink/blinkcard-core`.
For the full SDK with camera capture, see `@microblink/blinkcard`.

Firefox for Android is not supported for camera-based scanning because camera
device discovery and permission handling are unreliable there; see
[Bugzilla 1611998](https://bugzilla.mozilla.org/show_bug.cgi?id=1611998).

## Installation

Install from npm using your preferred package manager:

```sh
npm install @microblink/blinkcard-ux-manager
# or
yarn add @microblink/blinkcard-ux-manager
# or
pnpm add @microblink/blinkcard-ux-manager
```

## Entrypoints

Use `@microblink/blinkcard-ux-manager/core` for scanning orchestration without the packaged UI. Use
`@microblink/blinkcard-ux-manager/ui` for the feedback UI and localization APIs. The root entry remains available for
compatibility until the next major release and includes both.

The `/ui` entry requires `solid-js`, `@ark-ui/solid`, `solid-zustand`, and `@solid-primitives/keyed` as peer
dependencies. Install them explicitly when using the root or `/ui` entry; they are optional package peers only so
`/core` consumers do not install a Solid runtime:

```sh
npm install solid-js @ark-ui/solid solid-zustand @solid-primitives/keyed
```

## Haptic Feedback

The UX Manager includes a comprehensive haptic feedback system that provides tactile responses during the card scanning process. **This feature is primarily designed for Android devices using Chrome browser**, where it works reliably to enhance the scanning experience.

### Haptic Feedback Types

| Event              | Duration | Type  | Description                               |
| ------------------ | -------- | ----- | ----------------------------------------- |
| First Side Success | 100ms    | Short | When the card is first captured           |
| Final Success      | 300ms    | Long  | When card scanning is completed           |
| Error States       | 100ms    | Short | Quality issues (blur, glare, positioning) |
| Error Dialogs      | 300ms    | Long  | Timeout or critical errors                |
| Flashlight Toggle  | 100ms    | Short | When camera flashlight is activated       |
| Warning States     | 100ms    | Short | During sensing phases (with 1s cooldown)  |

### Haptic Feedback Usage

```javascript
import { createBlinkCardUxManager, HapticFeedbackManager } from "@microblink/blinkcard-ux-manager/core";

// Create UX Manager (haptic feedback enabled by default)
const uxManager = await createBlinkCardUxManager(cameraManager, scanningSession);

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

## Usage

You can use `@microblink/blinkcard-ux-manager` directly in your project for advanced or custom integrations. For most use cases, use [`@microblink/blinkcard`](https://www.npmjs.com/package/@microblink/blinkcard) for a simpler setup.

See the example apps in the `apps/examples` directory in the GitHub repository for usage details.

### Timeout configuration

BlinkCard uses two independent capture timers: a 10-second inactivity timeout that restarts after each stabilized UI-state
change, and a 60-second timeout for the current card side. Configure them when creating the UX manager:

```typescript
const uxManager = await createBlinkCardUxManager(cameraManager, scanningSession, {
  timeoutConfiguration: {
    inactivityTimeoutMs: 15_000,
    scanStepTimeoutMs: 90_000,
  },
});
```

Set either value to `null` to disable that timer independently. The active configuration can be read or updated at
runtime:

```typescript
uxManager.getTimeoutConfiguration();
uxManager.setTimeoutConfiguration({ inactivityTimeoutMs: null });
```

Timeouts are reported through `addOnErrorCallback` as `"inactivity_timeout"` or `"scan_step_timeout"`.

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
import { createBlinkCardFeedbackUi } from "@microblink/blinkcard-ux-manager/ui";

createBlinkCardFeedbackUi(uxManager, cameraUi, {
  localizationStrings: {
    scan_the_barcode: "Please scan the barcode",
    flashlight_warning_message: "Move your card to avoid flashlight glare.",
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
