# @microblink/blinkid

The all-in-one BlinkID browser SDK package. It provides a high-level, easy-to-use API for document scanning and recognition in web applications, bundling all required components and resources for a seamless integration experience.

<!-- microblink:bundle-size:start -->

## Bundle size

Production consumer bundle sizes for `@microblink/blinkid`:

| Entrypoint | Minified  | Gzip      |
| ---------- | --------- | --------- |
| `root`     | 675.16 kB | 176.66 kB |

External packages and runtime assets such as workers, WASM, and models are excluded. Shared code is included in each entrypoint that loads it.

_Generated automatically. Do not edit manually._
<!-- microblink:bundle-size:end -->

## Overview

- Combines the BlinkID engine, camera management, user experience (UX) management, and all required resources.
- Handles initialization, licensing, camera selection, scanning, and user feedback UI.
- Suitable for most use cases—just add your license key and start scanning!
- Used in production by leading companies for fast and accurate ID document scanning in the browser.

## What's Included

- [`@microblink/blinkid-core`](https://www.npmjs.com/package/@microblink/blinkid-core): Core scanning engine and low-level API.
- [`@microblink/blinkid-ux-manager`](https://www.npmjs.com/package/@microblink/blinkid-ux-manager): User experience and feedback UI.
- [`@microblink/camera-manager`](https://www.npmjs.com/package/@microblink/camera-manager): Camera selection and video stream management.

## Migration from v7 to v8000

For breaking changes and upgrade steps, see the [BlinkID v8000 migration guide](https://docs.microblink.com/blinkid/migration-v8000).

## Installation

Install from npm using your preferred package manager:

```sh
npm install @microblink/blinkid
# or
yarn add @microblink/blinkid
# or
pnpm add @microblink/blinkid
```

## Usage

A minimal example:

```js
import { createBlinkId } from "@microblink/blinkid";

const blinkid = await createBlinkId({
  licenseKey: import.meta.env.VITE_LICENCE_KEY,
});
```

Mount the UI into a specific element with `targetNode`:

```js
const blinkid = await createBlinkId({
  licenseKey: import.meta.env.VITE_LICENCE_KEY,
  targetNode: document.getElementById("blinkid-root"),
});
```

You can also customize BlinkID's state-based timeout behavior through
`uxManagerOptions.timeoutConfiguration`:

```js
const blinkid = await createBlinkId({
  licenseKey: import.meta.env.VITE_LICENCE_KEY,
  uxManagerOptions: {
    timeoutConfiguration: {
      inactivityTimeoutMs: 15000,
      scanStepTimeoutMs: 90000,
      partiallySupportedBarcodeResolveTimeoutMs: 8000,
    },
  },
});
```

Customize the built-in camera UI with `cameraManagerUiOptions`. These options
control UI chrome only; camera selection is handled by `CameraManager`.

```js
const blinkid = await createBlinkId({
  licenseKey: import.meta.env.VITE_LICENCE_KEY,
  cameraManagerUiOptions: {
    showMirrorCameraButton: true,
    showTorchButton: true,
    showCloseButton: false,
    showCameraErrorModal: true,
    zIndex: 1000,
    localizationStrings: {
      select_camera: "Choose camera",
      camera_error_title: "Camera permission needed",
    },
  },
});
```

Customize the built-in BlinkID feedback UI with `feedbackUiOptions`:

```js
const blinkid = await createBlinkId({
  licenseKey: import.meta.env.VITE_LICENCE_KEY,
  feedbackUiOptions: {
    showOnboardingGuide: false,
    showHelpButton: true,
    helpTooltipShowDelay: null,
    showDocumentFilteredModal: true,
    showTimeoutModal: true,
    showUnsupportedDocumentModal: true,
    localizationStrings: {
      feedback_messages: {
        scan_the_front_side: "Scan the front of your ID",
      },
      timeout_modal: {
        title: "Scan did not finish",
        details: "Please try again.",
      },
    },
  },
});
```

The returned component exposes lower-level instances for advanced integrations
and a `destroy()` method for cleanup:

```js
const blinkid = await createBlinkId({
  licenseKey: import.meta.env.VITE_LICENCE_KEY,
});

console.log(blinkid.blinkIdCore);
console.log(blinkid.blinkIdUxManager);
console.log(blinkid.cameraManager);
console.log(blinkid.cameraUi);

// Release camera, worker, UI, and Wasm resources when done.
await blinkid.destroy();
```

### OTA Document Support Updates

BlinkID can download document-support resources over the air (OTA) during SDK
initialization. This lets Microblink add or update supported document resources
without requiring a new SDK release or an application package update.

Every SDK build ships baseline OTA files under:

```text
{resourcesLocation}/resources/ota-resources/
```

The worker reads `ota-resources.json` from that directory and writes the listed
files into the BlinkID Wasm filesystem before SDK initialization. The manifest
records the version and byte length while preserving the canonical filenames
required by BlinkID:

```jsonc
{
  "resources": [
    {
      "filename": "serialized-embedder-database.bin",
      "version": "1.0.14",
      "url": "serialized-embedder-database.bin",
      "contentLength": 3831312,
    },
  ],
}
```

Every manifest entry must include a positive integer `contentLength`.
Manifests must contain exactly one entry for each canonical file.

By default, BlinkID also asks `https://blinkid-ota.microblink.com` for compatible
updates and uses a provider file only when its semantic version is newer than
the hosted baseline. You can override the baseline and provider locations:

```js
const blinkid = await createBlinkId({
  licenseKey: import.meta.env.VITE_LICENCE_KEY,
  resourceDownloadTimeoutMs: 60_000,
  otaResources: {
    resourcesLocation: "https://cdn.example.com/blinkid-ota",
    otaResourceProviderUrl: "https://your-proxy.example.com/blinkid-ota",
  },
});
```

`resourceDownloadTimeoutMs` applies to Wasm, data, and OTA requests. It is
an inactivity timeout that resets whenever response headers or body data
arrive, so slow downloads are not limited to a fixed total duration. The
default is 60 seconds.

The provider or proxy endpoint must serve the BlinkID OTA versions API:

```text
GET {otaResourceProviderUrl}/api/v1/versions?generic_version={recognizerVersion}
```

The SDK supplies `generic_version` from the recognizer version embedded when the
SDK is built, allowing OTA resolution and downloads to run in parallel with
Wasm loading. The OTA settings are separate from top-level
`resourcesLocation`, which points to the static SDK `resources` directory, and
from `microblinkProxyUrl`, which proxies licensing and analytics traffic.
Provider failures fall back to the hosted baseline unless `strict: true` is
set. The hosted baseline is required because these files are not embedded in
`BlinkIdModule.data`.

To load the hosted baseline without contacting the provider, set
`checkForUpdates: false`:

```js
const blinkid = await createBlinkId({
  licenseKey: import.meta.env.VITE_LICENCE_KEY,
  otaResources: {
    checkForUpdates: false,
  },
});
```

### UX Extraction Modes

BlinkID chooses the feedback UI flow automatically from the session settings you
pass to `createBlinkId`. There is no separate UI option for this: the UX manager
derives an extraction mode from `scanningMode` and the enabled extraction
modules.

| UX extraction mode      | When it is used                                                                                                                                        | UI behavior                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `full-document`         | Default document capture flow, including document capture, optional MRZ, VIZ, mixed extraction, optional barcode, or multi-side extraction.            | Shows standard document capture guidance.                                             |
| `document-with-barcode` | `scanningMode: "single"` with `documentCaptureModule` enabled, `barcodeModule.presenceMandatory: true`, and both `mrzModule` and `vizModule` disabled. | Shows document capture guidance focused on scanning the barcode side of the document. |
| `document-with-mrz`     | `scanningMode: "single"` with `documentCaptureModule` enabled, `mrzModule.presenceMandatory: true`, and both `barcodeModule` and `vizModule` disabled. | Shows document capture guidance focused on scanning the MRZ side of the document.     |
| `barcode-only`          | `documentCaptureModule`, `mrzModule`, and `vizModule` are disabled, while `barcodeModule` is enabled.                                                  | Shows barcode-only onboarding, help, and feedback copy.                               |

Example: single-side document capture where barcode presence is mandatory:

```js
const blinkid = await createBlinkId({
  licenseKey: import.meta.env.VITE_LICENCE_KEY,
  scanningMode: "single",
  scanningSettings: {
    documentCaptureModule: {},
    barcodeModule: {
      presenceMandatory: true,
    },
    mrzModule: null,
    vizModule: null,
  },
});
```

Example: single-side document capture where MRZ presence is mandatory:

```js
const blinkid = await createBlinkId({
  licenseKey: import.meta.env.VITE_LICENCE_KEY,
  scanningMode: "single",
  scanningSettings: {
    documentCaptureModule: {},
    mrzModule: {
      presenceMandatory: true,
    },
    barcodeModule: null,
    vizModule: null,
  },
});
```

Example: barcode-only flow:

```js
const blinkid = await createBlinkId({
  licenseKey: import.meta.env.VITE_LICENCE_KEY,
  scanningSettings: {
    documentCaptureModule: null,
    barcodeModule: {},
    mrzModule: null,
    vizModule: null,
  },
});
```

The selected extraction mode controls feedback messages, onboarding content,
help modal copy, and extraction-specific illustrations in the built-in UI.

### Redaction Settings

You can choose result redaction per classified document with
`redactionSettingsResolver`:

```js
const blinkid = await createBlinkId({
  licenseKey: import.meta.env.VITE_LICENCE_KEY,
  redactionSettingsResolver: async (documentClassInfo, getDefaultSettings) => {
    if (documentClassInfo.country?.id === "germany" && documentClassInfo.type?.id === "id") {
      // Optionally use the SDK defaults for this document class.
      const defaults = await getDefaultSettings(documentClassInfo);

      return {
        mode: "full-result",
        fields: ["documentNumber"],
        documentNumberRedactionSettings: {
          prefixDigitsVisible: 0,
          suffixDigitsVisible: 4,
        },
        redactMrz: true,
        redactBarcode: defaults.redactBarcode,
      };
    }

    // Return null to keep SDK default redaction settings.
    return null;
  },
});
```

`redactionSettingsResolver` replaces the v7 session-level anonymization
settings (`scanningSettings.anonymizationMode` and
`scanningSettings.customDocumentAnonymizationSettings`). The resolver receives
the classified `DocumentClassInfo`; return `RedactionSettings` for custom
redaction or `null` to keep the SDK defaults. The `country`, `region`, and
`type` fields are wrapper objects: `id` holds the strongly-typed value when the
document class is known at build time, while `rawValue` always carries the raw
classification token (including OTA-delivered classes without an `id`). See the
[BlinkID v8000 migration guide](https://docs.microblink.com/blinkid/migration-v8000)
for the full migration.

### Available Callbacks and Filters

The returned `BlinkIdComponent` forwards the underlying UX manager callbacks and
filters. Every `addOn...Callback` method returns a cleanup function; call it when
you no longer want to receive updates.

Use `addOnResultCallback` to receive the final `BlinkIdScanningResult`:

```js
const removeOnResult = blinkid.addOnResultCallback((result) => {
  console.log("BlinkID result:", result);
});

// Later, to stop receiving results:
removeOnResult();
```

Use `addOnErrorCallback` to receive UX processing errors such as timeouts or
result retrieval failures:

```js
const removeOnError = blinkid.addOnErrorCallback((error) => {
  console.error("BlinkID processing error:", error);
});

// Later, to stop receiving errors:
removeOnError();
```

Use `addOnUiStateChangedCallback` to observe the stabilized visible feedback UI
state. The callback receives `BlinkIdUiState`, including the state `key` and
reticle metadata used by the built-in UI:

```js
const removeOnUiStateChanged = blinkid.addOnUiStateChangedCallback((uiState) => {
  console.log("BlinkID UI state:", uiState.key);
});

// Later, to stop receiving UI state changes:
removeOnUiStateChanged();
```

Use `addOnFrameProcessCallback` to inspect every processed frame and optionally
control the active scan step. For example, if `frameResult` already contains all
fields your product needs, you can call `advanceToNextStep()` to finish or move
past a remaining barcode step that is not required and is difficult for the user
to capture on a poor camera.

```js
const removeOnFrameProcess = blinkid.addOnFrameProcessCallback(
  (frameResult, advanceToNextStep, triggerStepTimeout, getLastFrame) => {
    console.log(frameResult.inputImageAnalysisResult);

    if (hasAllRequiredData(frameResult)) {
      void advanceToNextStep();
      return;
    }

    if (shouldStopStep(frameResult)) {
      triggerStepTimeout();
      return;
    }

    console.log(getLastFrame().byteLength);
  },
);

// Later, to stop receiving frame updates:
removeOnFrameProcess();
```

The callback receives:

- `frameResult` - the `BlinkIdProcessResult` for the current frame, before the
  final `BlinkIdScanningResult` is available.
- `advanceToNextStep` - manually advances the session to the next required scan
  step; this can complete the flow when all required data has already been
  extracted.
- `triggerStepTimeout` - immediately triggers the scan-step timeout path for the
  active step.
- `getLastFrame` - returns the raw `ArrayBuffer` for the frame that produced the
  current `frameResult`.

Use `addOnProgressCallback` to observe the UX manager progress stream:

```js
const removeOnProgress = blinkid.addOnProgressCallback((progress) => {
  console.log(progress.uiStateKey);
  console.log(progress.inactivity.remainingMs);
  console.log(progress.perSide.remainingMs);
  console.log(progress.partiallySupportedBarcodeResolve.remainingMs);
});

// Later, to stop receiving updates:
removeOnProgress();
```

Use `addDocumentClassFilter` to accept or reject a classified document before
BlinkID proceeds to the final result. Return `true` to allow the document and
`false` to stop the flow with the document-filtered UI:

```js
const removeDocumentClassFilter = blinkid.addDocumentClassFilter((documentClassInfo) => {
  return documentClassInfo.country?.id === "usa" && documentClassInfo.type?.id === "dl";
});

// Later, to remove the filter:
removeDocumentClassFilter();
```

Use `addOnDocumentFilteredCallback` to observe when the active document class
filter rejects a document:

```js
const removeOnDocumentFiltered = blinkid.addOnDocumentFilteredCallback((documentClassInfo) => {
  console.log("Document rejected by filter:", documentClassInfo);
});

// Later, to stop receiving filtered-document events:
removeOnDocumentFiltered();
```

For more advanced usage, customization, or integration with your own UI, see the example apps and the documentation for the underlying packages.

## Documentation

Full documentation, API reference, and integration guides are available at [docs.microblink.com](https://docs.microblink.com).

### Supported documents

Supported documents and result fields are available at [docs.microblink.com](https://docs.microblink.com/blinkid/supported-documents).

## Example Apps

Explore example applications in the GitHub repository for ready-to-run demos:

- **[blinkid-simple](https://github.com/microblink/web-sdks/tree/main/apps/examples/blinkid-simple)**: Minimal integration with default UI.
- **[blinkid-core-api](https://github.com/microblink/web-sdks/tree/main/apps/examples/blinkid-core-api)**: Low-level usage of the core API.
- **[blinkid-advanced-setup](https://github.com/microblink/web-sdks/tree/main/apps/examples/blinkid-advanced-setup)**: Custom UI and advanced configuration.
- **[blinkid-ota-setup](https://github.com/microblink/web-sdks/tree/main/apps/examples/blinkid-ota-setup)**: Configuring over-the-air document-support resource updates.
- **[blinkid-preload](https://github.com/microblink/web-sdks/tree/main/apps/examples/blinkid-preload)**: Preloading resources for faster startup.
- **[blinkid-photo-upload](https://github.com/microblink/web-sdks/tree/main/apps/examples/blinkid-photo-upload)**: Uploading photos example.

Each example demonstrates different integration patterns and features.

## Hosting Requirements

- Serve the `public/resources` directory as-is; it contains all required Wasm, worker, and resource files.
- Must be served in a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts).
- For multithreaded builds, your site must be [cross-origin isolated](https://web.dev/articles/why-coop-coep):

  ```http
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
  ```

## License Key

A valid license key is required. Request a free trial at [Microblink Developer Hub](https://developer.microblink.com/register).

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

The output files will be available in the `dist/`, `types/`, and `public/resources/` directories.

## Browser Support

BlinkID supports camera-based scanning in these browser versions and newer:

- Chrome / Chromium 96 (desktop and Android)
- Edge 96
- Opera 84
- Firefox 132 (desktop)
- Safari 16.4 (macOS)
- iOS Safari 16.4

The SDK must run in a
[secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts)
because browsers only expose camera APIs such as `getUserMedia()` on HTTPS or
localhost.

### WebAssembly runtime

The SDK ships four Wasm build variants (`simd`, `simd-threads`, `simd-relaxed`,
and `simd-relaxed-threads`). The runtime selects the best supported variant
automatically: relaxed SIMD variants are preferred when the browser supports
relaxed SIMD, and threaded variants are preferred when the browser supports
Wasm threads.

#### `simd`

Requires the Emscripten-generated Wasm feature set used by the SDK plus
[fixed-width SIMD](https://web-platform-dx.github.io/web-features-explorer/features/wasm-simd/).

#### `simd-threads`

Requires all `simd` features plus
[Wasm threads and atomics](https://caniuse.com/wasm-threads). Multithreaded Wasm
also requires cross-origin isolation headers
(`Cross-Origin-Opener-Policy: same-origin` and
`Cross-Origin-Embedder-Policy: require-corp`).

Safari is excluded from threaded variants even when it reports Wasm thread
support. Emscripten threaded builds use pthreads that spawn workers
from inside a worker, and Safari historically lacked reliable nested worker
support when Wasm threads shipped in Safari 16. There are also known Safari
issues with shared memory in Emscripten pthread builds
([emscripten-core/emscripten#19374](https://github.com/emscripten-core/emscripten/issues/19374)).
For these reasons the runtime falls back to a single-threaded variant on Safari
instead of loading `simd-threads` or `simd-relaxed-threads`.

#### `simd-relaxed` and `simd-relaxed-threads`

Require all `simd` (or `simd-threads`) features plus
[relaxed SIMD](https://webassembly.org/features/). Relaxed SIMD instructions
let the engine pick the fastest hardware implementation for a subset of vector
operations. Browsers without relaxed SIMD support fall back to `simd` or
`simd-threads`.

### Firefox for Android

Firefox for Android is not supported for camera-based scanning. The SDK uses
`@microblink/camera-manager`, and Firefox Android can hide video input devices
from `navigator.mediaDevices.enumerateDevices()` before an active camera
capture. This makes camera device discovery and permission handling unreliable.
Mozilla tracks this behavior as intentional and resolved it as `WONTFIX` because
exposing device information before camera access has fingerprinting
implications:
[Bugzilla 1611998](https://bugzilla.mozilla.org/show_bug.cgi?id=1611998).

## More Information

- [@microblink/blinkid-core](https://www.npmjs.com/package/@microblink/blinkid-core): Core API reference and advanced usage.
- [@microblink/blinkid-ux-manager](https://www.npmjs.com/package/@microblink/blinkid-ux-manager): Custom UX and feedback integration.
- [@microblink/camera-manager](https://www.npmjs.com/package/@microblink/camera-manager): Camera management details.
