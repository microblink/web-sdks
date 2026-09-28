# @microblink/biometrics-core

Headless browser face capture package. It analyzes camera frames, emits guidance,
and resolves with a `FaceCaptureResult`. Most apps should use the guided and
headless APIs in `@microblink/biometrics` instead of this package directly.

<!-- microblink:bundle-size:start -->

## Bundle size

Production consumer bundle sizes for `@microblink/biometrics-core`:

| Entrypoint | Minified  | Gzip      |
| ---------- | --------- | --------- |
| `root`     | 287.15 kB | 100.37 kB |

External packages and runtime assets such as workers, WASM, and models are excluded. Shared code is included in each entrypoint that loads it.

_Generated automatically. Do not edit manually._
<!-- microblink:bundle-size:end -->

## Browser Support

Biometrics Capture supports camera-based capture in these browser versions and
newer:

- Chrome / Chromium 96 (desktop and Android)
- Edge 96
- Opera 84
- Firefox 132 (desktop)
- Safari 16.4 (macOS)
- iOS Safari 16.4

Camera integrations that supply frames to this package must run in a
[secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts)
because browsers only expose camera APIs such as `getUserMedia()` on HTTPS or
localhost.

Firefox for Android is not supported for camera-based capture because camera
device discovery and permission handling are unreliable there; see
[Bugzilla 1611998](https://bugzilla.mozilla.org/show_bug.cgi?id=1611998).

## Capture Result

`session.capture()` resolves with:

- `bestImage`: user-visible captured `ImageData`, landmarks, and optional bounds;
- `supportingImages`: additional user-visible images when available;
- `captureFrame`: engine-produced JPEG bytes for selfie template extraction,
  when available;
- `livenessFrames`: ordered engine-produced liveness frames, usually QOI bytes;
- `livenessBatchSignature`: optional engine batch signature;
- `traceId` and `sessionNumber`: session identifiers.

When the native engine does not expose capture or liveness frames, `captureFrame` is
undefined and `livenessFrames` is empty. That is the explicit single-image
fallback.

## Usage

```ts
import { createBiometricsCapture } from "@microblink/biometrics-core";
import type { CameraManager } from "@microblink/camera-manager/core";

declare const cameraManager: CameraManager;

const capture = await createBiometricsCapture({
  licenseKey: "<license-key>",
  resourcePath: new URL("/resources/", window.location.origin).href,
  imageOrigin: "canvas2d",
});

const session = await capture.startSession();
const resultPromise = session.capture({
  quality: { captureMode: "engineFrames" },
  timeoutMs: 60_000,
  onFeedbackChange(feedback) {
    console.log(feedback);
  },
});

// Return the promise so Camera Manager can reclaim the frame buffer.
cameraManager.addFrameCaptureCallback((frame) => session.processFrame(frame));

const result = await resultPromise;

console.log({
  livenessFrameCount: result.livenessFrames.length,
  hasCaptureFrame: result.captureFrame !== undefined,
  hasBatchSignature: result.livenessBatchSignature !== undefined,
});

await session.close();
await capture.close();
```

`processFrame()` owns the input buffer until its promise resolves. Await it
before submitting another frame; the resolved buffer is attached and reusable.

Use `quality.captureMode: "single"` when you need to force single-image output
for compatibility testing. The default is `"engineFrames"`.

Call `session.capture()` again to retry within the same native session. Retries
keep the same session identifiers. Call
`capture.startSession()` again after closing the previous session to start a new
native session.

Pass face analysis thresholds to `capture.startSession(settings)`. The same
thresholds apply to every capture attempt in the session.

A capture client supports one active or pending session at a time. Starting
another session before closing the current one throws `SESSION_ALREADY_ACTIVE`.

## WebAssembly runtime

The package ships `simd`, `simd-threads`, `simd-relaxed`, and
`simd-relaxed-threads` WebAssembly variants and selects the best supported
variant automatically. Fixed-width SIMD is the minimum requirement. When the
browser supports relaxed SIMD, the package prefers a `simd-relaxed*` variant.
When WebAssembly threads, shared memory, nested workers, and cross-origin
isolation are available, the package selects the `*-threads` variant; otherwise
it selects the single-threaded one. Safari always uses a single-threaded
variant.

Multithreaded WebAssembly requires these response headers:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Use `wasmVariant` to force a variant for testing:

```ts
const capture = await createBiometricsCapture({
  licenseKey: "<license-key>",
  resourcePath: new URL("/resources/", window.location.origin).href,
  wasmVariant: "simd-threads",
});
```

A forced unsupported variant fails initialization. After selection, a resource
or module failure does not retry another variant.

`checkBiometricsSupport()` accepts the same optional override. Without it,
preflight reports the automatically resolved `wasmVariant`; with it, preflight
validates only the requested variant and its resources.

Deploy the complete resource tree produced by the package build. Native assets
live under `simd/`, `simd-threads/`, `simd-relaxed/`, and
`simd-relaxed-threads/` below `resourcePath`.

## Development

WASM and worker assets under `public/resources/` are not committed. Build from
the monorepo root so the Biometrics WASM package builds and this package copies
the worker/resources tree:

```sh
pnpm install
pnpm --filter @microblink/biometrics-core build
pnpm --filter @microblink/biometrics-core test
```
