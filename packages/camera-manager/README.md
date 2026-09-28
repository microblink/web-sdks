# @microblink/camera-manager

This package provides camera management for web applications. It handles camera selection, permissions, video stream management, and provides access to video frames for further processing. It is framework-agnostic and can be used with or without a UI.

<!-- microblink:bundle-size:start -->

## Bundle size

Production consumer bundle sizes for `@microblink/camera-manager`:

| Entrypoint | Minified | Gzip     |
| ---------- | -------- | -------- |
| `root`     | 92.41 kB | 26.20 kB |
| `/core`    | 41.72 kB | 12.78 kB |
| `/ui`      | 59.81 kB | 16.48 kB |

External packages and runtime assets such as workers, WASM, and models are excluded. Shared code is included in each entrypoint that loads it.

_Generated automatically. Do not edit manually._
<!-- microblink:bundle-size:end -->

## Overview

See the [custom UI example](../../apps/examples/camera-manager-custom-ui/) for a custom interface built with the `/core` entrypoint.

- Handles camera selection, permissions, and video stream lifecycle.
- Provides access to video frames for downstream processing.
- Can be used standalone or with the included UI components.

## Browser Support

The package exports support these browser versions and newer:

| Browser                     | Root | `/core` | `/ui` |
| --------------------------- | ---- | ------- | ----- |
| Chrome / Chromium (desktop) | 91   | 91      | 91    |
| Chrome / Chromium (Android) | 91   | 91      | 91    |
| Edge                        | 91   | 91      | 91    |
| Opera                       | 84   | 84      | 84    |
| Firefox (desktop)           | 132  | 132     | 132   |
| Safari (macOS)              | 15.4 | 15.4    | 15.4  |
| iOS Safari                  | 15.4 | 15.4    | 15.4  |

The package must run in a
[secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts)
because browsers only expose camera APIs such as `getUserMedia()` on HTTPS or
localhost.

### Firefox for Android

Firefox for Android is not supported for camera-based flows. Its
`navigator.mediaDevices.enumerateDevices()` behavior can hide video input
devices before an active camera capture, which makes camera device discovery and
permission handling unreliable for this package. Mozilla tracks this behavior as
intentional and resolved it as `WONTFIX` because exposing device information
before camera access has fingerprinting implications:
[Bugzilla 1611998](https://bugzilla.mozilla.org/show_bug.cgi?id=1611998).

## Installation

Install from npm using your preferred package manager:

```sh
npm install @microblink/camera-manager
# or
yarn add @microblink/camera-manager
# or
pnpm add @microblink/camera-manager
```

## Usage

Use `/core` for framework-independent camera management and `/ui` for the built-in interface. The package root still
exports both entrypoints for compatibility until the next major release.

### Core API

```js
import { CameraManager } from "@microblink/camera-manager/core";

const cameraManager = new CameraManager();

// Start the camera stream (auto-selects the best camera)
await cameraManager.startCameraStream();

// Optionally, attach the video to a DOM element
const video = document.getElementById("video");
cameraManager.initVideoElement(video);

// Capture frames for processing
const removeCallback = cameraManager.addFrameCaptureCallback((imageData) => {
  // Process imageData (instance of ImageData)
});

// Stop the camera when done
cameraManager.stopStream();
```

See the [`camera-manager` example](../../apps/examples/camera-manager/src/App.tsx) for more usage details.

## API

### `CameraManager` class

- `startCameraStream(options?)`: Starts the camera stream. Options allow selecting a specific camera or facing mode.
- `initVideoElement(videoElement)`: Attaches a video element for preview.
- `addFrameCaptureCallback(callback)`: Registers a callback to receive frames as `ImageData` during capture. Returns a cleanup function.
- `startFrameCapture()`: Starts capturing frames for processing.
- `stopFrameCapture()`: Stops capturing frames but keeps the stream active.
- `stopStream()`: Stops the camera stream and video playback.
- `setResolution(resolution)`: Sets the desired video resolution (e.g., `"1080p"`).
- `setFacingFilter(facingModes)`: Filters available cameras by facing mode (`"front"` or `"back"`).
- `setExcludedCameraNamePatterns(patterns)`: Sets parts of camera names to exclude from available camera lists.
- `getCameraDevices()`: Returns available camera devices.
- `selectCamera(camera)`: Selects a specific camera device.
- `setCameraMirrorX(mirrorX)`: Mirrors the video horizontally if needed.
- `reset()`: Resets the camera manager and stops all streams.

### Camera name filtering

By default, some commonly undesired cameras are excluded. To exclude more cameras while keeping the defaults:

```js
import { CameraManager, defaultExcludedCameraPatterns } from "@microblink/camera-manager/core";

const cameraManager = new CameraManager();
cameraManager.setExcludedCameraNamePatterns([...defaultExcludedCameraPatterns, "other camera name"]);
```

To include all cameras, call `cameraManager.setExcludedCameraNamePatterns([])`.

### UI Integration

The root and `/ui` entries require the UI peer dependencies. Install them explicitly; they are optional package peers
only so `/core` consumers do not install a Solid runtime:

```sh
npm install solid-js @ark-ui/solid solid-zustand @solid-primitives/keyed
```

To use the built-in UI, use:

```js
import { CameraManager } from "@microblink/camera-manager/core";
import { createCameraManagerUi } from "@microblink/camera-manager/ui";

const cameraUi = await createCameraManagerUi(cameraManager, document.body);
// Optionally, add cleanup:
cameraUi.dismount();
```

Camera selector visibility can be configured without changing automatic camera
selection or the `preferredCameraDeviceId` behavior:

```js
const cameraUi = await createCameraManagerUi(cameraManager, document.body, {
  showCameraSelector: false,
});
```

`showCameraSelector` defaults to `true`. The selector appears when the user can choose another camera.

#### Styling

The Camera Manager UI can be branded by setting these CSS custom properties on
its host element:

- `--mb-ui-font`
- `--color-primary`
- `--color-success`
- `--color-error`
- `--color-warning`

The semantic color properties accept space-separated RGB channel values, such
as `--color-primary: 0 98 242`.

The following Shadow Parts are supported customization seams:

- `capture-screen-part`
- `video-element-part`
- `camera-select-part`
- `mirror-camera-button-part`
- `torch-button-part`
- `close-button-part`

For example:

```css
#mb-camera-host {
  --mb-ui-font: "Inter", sans-serif;
  --color-primary: 32 94 224;
}

#mb-camera-host::part(camera-select-part) {
  max-width: 20rem;
}
```

### Internationalization

You can customize UI strings either when creating the camera UI or at runtime:

```typescript
const cameraUi = await createCameraManagerUi(cameraManager, undefined, {
  localizationStrings: {
    selected_camera: "My Updated String",
  },
});
```

At runtime:

```typescript
cameraUi.updateLocalization({
  select_camera: "My updated string",
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
