# @microblink/biometrics

Biometrics Web SDK for guided and headless face capture.

<!-- microblink:bundle-size:start -->

## Bundle size

Production consumer bundle sizes for `@microblink/biometrics`:

| Entrypoint | Minified | Gzip    |
| ---------- | -------- | ------- |
| `root`     | 26.28 kB | 7.26 kB |

External packages and runtime assets such as workers, WASM, and models are excluded. Shared code is included in each entrypoint that loads it.

_Generated automatically. Do not edit manually._
<!-- microblink:bundle-size:end -->

## Quickstart

### 1. Install

Install the SDK, the Core package that ships the runtime resources, and the Solid peer dependencies used by the package root:

```sh
npm install @microblink/biometrics @microblink/biometrics-core solid-js @ark-ui/solid solid-zustand @solid-primitives/keyed
```

### 2. Host the resources

The SDK loads a Web Worker, WebAssembly modules, and model data at runtime. Copy them into a directory your application serves as static files:

```sh
mkdir -p public/resources
cp -R node_modules/@microblink/biometrics-core/dist/resources/. public/resources/
```

Deploy the complete `resources/` tree and copy it again whenever you update the SDK. `resourcesLocation` is the parent URL of `resources/`. It defaults to the current page URL.

### 3. Serve the application

Serve the application over HTTPS or from `localhost`, because browsers only expose the camera in a secure context. Send these response headers to enable the faster multithreaded WebAssembly build:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Without them, the SDK uses a single-threaded build.

### 4. Capture a face

```ts
import { createBiometricsUi } from "@microblink/biometrics";

const ui = await createBiometricsUi({
  licenseKey: "<license-key>",
  resourcesLocation: window.location.origin,
  onResult(result) {
    console.log("Captured face", result.bestImage);
    void ui.destroy();
  },
});
```

The SDK opens the front camera, guides the user, and calls `onResult` with a [`FaceCaptureResult`](#capture-result).

## Examples

- [Biometrics Simple](../../apps/examples/biometrics-simple/): guided capture with `createBiometricsUi`.
- [Biometrics Advanced Setup](../../apps/examples/biometrics-advanced-setup/): guided capture composed from the headless SDK, `@microblink/biometrics-ux-manager`, and Camera Manager.
- [Biometrics Custom UI](../../apps/examples/biometrics-custom-ui/): headless capture with `createBiometrics`, Camera Manager, and an application-owned interface.

## Browser Support

Biometrics supports camera capture in these browser versions and newer:

- Chrome / Chromium 96 (desktop and Android)
- Edge 96
- Opera 84
- Firefox 132 (desktop)
- Safari 16.4 (macOS)
- iOS Safari 16.4

The SDK must run on HTTPS or localhost because camera APIs require a secure context. Firefox for Android is not supported.

Call `checkBiometricsSupport({ resourcesLocation })` before loading the SDK to check the browser capabilities and the hosted resources. The report's `supported` flag summarizes the individual `checks`.

## Guided UI

Use `createBiometricsUi` when the SDK should manage the camera, onboarding, help, capture feedback, and retry flow.

```ts
import { createBiometricsUi, type BiometricsUiOptions } from "@microblink/biometrics";

const options: BiometricsUiOptions = {
  licenseKey: "<license-key>",
  resourcesLocation: window.location.origin,
  targetNode: document.getElementById("biometrics-root") ?? undefined,
  captureTimeoutMs: 60_000,
  feedbackUiOptions: {
    showOnboardingGuide: true,
    showHelpButton: true,
  },
  onResult(result) {
    console.log("Captured face", result);
  },
  onError(error) {
    console.error(error.code, error);
  },
  onEvent(event) {
    if (event.kind === "captureTimeout") {
      console.log("The user did not complete capture in time");
    }
  },
};

const ui = await createBiometricsUi(options);

// Later, when leaving the route.
await ui.destroy();
```

`createBiometricsUi` resolves after the SDK is initialized and the camera stream has started. It rejects with a `BiometricsError` when initialization fails.

During capture:

- `onResult` runs once after a successful capture. The capture UI is dismissed, but the SDK stays loaded until you call `destroy()`.
- `onError` reports initialization and capture errors. During capture, the UI shows its own error dialog with retry or cancel actions, so you do not need to present the error yourself.
- `onEvent` forwards face guidance, timeouts, the capture result, and onboarding and help interactions.
- The close button calls `destroy()` for you. Await `destroy()` when your application leaves the capture flow for another reason.

Set `preferredCameraDeviceId` to reopen a previously selected camera. `onSelectedCameraDeviceIdChange` reports the current selection so you can store it.

Set `helpTooltipShowDelay` to `null` to disable the help tooltip.

### UI customization

Use `feedbackUiOptions` for capture guidance and Biometrics localization. Use `cameraManagerUiOptions` for camera controls and Camera Manager localization.

```ts
await createBiometricsUi({
  licenseKey: "<license-key>",
  feedbackUiOptions: {
    localizationStrings: {
      onboarding_modal: {
        title: "Get ready for your selfie",
      },
    },
  },
});
```

Set inherited CSS custom properties on `targetNode` or an ancestor to brand the UI. Supported Shadow Parts include:

- `capture-screen-part`
- `video-element-part`
- `camera-select-part`
- `mirror-camera-button-part`
- `torch-button-part`
- `close-button-part`
- `help-button-part`
- `help-button-tooltip-part`

Internal class names and descendant DOM structure are not public API.

## Headless API

Use `createBiometrics` when your application owns the camera and the interface. The SDK analyzes the frames you supply, emits face guidance, and resolves with a `FaceCaptureResult`.

This example uses the framework-independent Camera Manager `/core` entrypoint to supply frames:

```ts
import { BiometricsError, createBiometrics } from "@microblink/biometrics";
import { CameraManager } from "@microblink/camera-manager/core";

const videoElement = document.querySelector("video")!;

const sdk = await createBiometrics({
  licenseKey: "<license-key>",
  resourcesLocation: window.location.origin,
  onDownloadProgress(progress) {
    console.log(`Loading ${progress.progress}%`);
  },
});

const cameraManager = new CameraManager({ preferredResolution: "1080p" });
cameraManager.initVideoElement(videoElement);

const session = sdk.startSession({ captureTimeoutMs: 60_000 });

session.onEvent((event) => {
  if (event.kind === "faceGuidance") {
    console.log(event.feedback);
  }
});

// Return the promise so Camera Manager waits until the SDK releases the frame buffer.
const removeFrameCallback = cameraManager.addFrameCaptureCallback((frame) => session.processFrame(frame));

try {
  await cameraManager.startCameraStream({ preferredFacing: "front" });
  session.setCameraSource(videoElement, cameraManager.getState().selectedCamera?.getVideoTrack());
  await cameraManager.startFrameCapture();

  const result = await session.run().catch((error: unknown) => {
    if (error instanceof BiometricsError && error.isRetryable) {
      return session.retry();
    }

    throw error;
  });

  console.log(result.bestImage, result.livenessFrames, result.captureFrame);
} finally {
  removeFrameCallback();
  cameraManager.stopStream();
  session.finish();
}

// When the application no longer needs face capture.
await sdk.close();
```

Keep one SDK instance for the lifetime of the page and start a new session for every capture. Sessions follow these rules:

- `run()` starts capture once per session. Frames passed to `processFrame()` before `run()` or after the capture completes are returned unprocessed.
- `processFrame()` owns its input buffer until the returned promise resolves. Await it before you submit another frame. The resolved buffer is attached and can be reused.
- `setCameraSource()` passes the camera video element and track to the capture engine. It applies to subsequent capture attempts, so call it before `run()` or `retry()` and again after switching cameras.
- `retry()` starts a new capture attempt after a retryable failure. Non-retryable failures end the session.
- `finish()` cancels any active capture and releases the session. Call it on every exit path.

Use `onEvent` for face guidance, `captureTechnicalData` (face bounds and landmarks), `captureFinished`, and `captureTimeout` events. Use `subscribe` to follow the session state through the `idle`, `capturing`, `succeeded`, `failed`, and `finished` phases.

### Session context

Call `session.getSessionContext()` to get the identifiers of the capture session:

```ts
const { traceId, sessionNumber } = await session.getSessionContext();
```

Send both values together. The context is available before `session.run()` resolves. The capture result also includes these values.

## Capture result

Every guided and headless capture returns `FaceCaptureResult`:

- `traceId` and `sessionNumber` correlate the capture with backend requests.
- `bestImage` is the selected user-visible selfie as `ImageData` with face landmarks.
- `supportingImages` contains other selected capture images.
- `captureFrame` is the optional engine-produced JPEG frame for face matching.
- `livenessFrames` contains ordered engine-produced QOI frames for liveness checks.
- `livenessBatchSignature` contains the optional batch signature.

Frame and batch signatures are present only when the native engine produces them. When the engine does not produce capture or liveness frames, `captureFrame` is undefined and `livenessFrames` is empty.

## WebAssembly runtime

The SDK selects a supported `simd`, `simd-threads`, `simd-relaxed`, or `simd-relaxed-threads` WebAssembly variant. Multithreaded variants require the cross-origin isolation headers listed in the [Quickstart](#3-serve-the-application).

Use `wasmVariant` to force a variant for testing:

```ts
await createBiometricsUi({
  licenseKey: "<license-key>",
  wasmVariant: "simd",
});
```

A forced variant that the browser does not support fails initialization.

## Errors

The SDK reports failures as `BiometricsError`. Use `code` to identify the failure, `stage` and `component` to locate it, and `isRetryable` to decide whether to offer a retry. `LicenseError`, `PermissionError`, `ConfigurationError`, and `SessionError` extend `BiometricsError`.

## Analytics

Analytics are queued and sent through the native WASM PingV3 transport. Use `analytics.userId` and `analytics.pingProxyUrl` to configure the transport. Set `analytics.enabled` to `false` to disable top-level capture metadata events.

## Development

```sh
pnpm install
pnpm --filter @microblink/biometrics build
pnpm --filter @microblink/biometrics test
```
