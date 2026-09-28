# @microblink/biometrics-ux-manager

Guided Biometrics capture UX for browser integrations. This package contains the
Solid UI and state manager used by the top-level `createBiometricsUi` API.

Most apps should import `createBiometricsUi` from `@microblink/biometrics`
instead of using this package directly.

Use `@microblink/biometrics-ux-manager/core` for orchestration without UI framework dependencies. Use
`@microblink/biometrics-ux-manager/ui` for the feedback UI. The `/ui` entry requires compatible versions of
`solid-js`, `@ark-ui/solid`, `solid-zustand`, and `@solid-primitives/keyed`. Install them explicitly when using the root
or `/ui` entry; they are optional package peers only so `/core` consumers do not install a Solid runtime:

```sh
npm install solid-js @ark-ui/solid solid-zustand @solid-primitives/keyed
```

The package root continues to export both entrypoints for compatibility until the next major release. New integrations
should use `/core` and `/ui` explicitly.

<!-- microblink:bundle-size:start -->

## Bundle size

Production consumer bundle sizes for `@microblink/biometrics-ux-manager`:

| Entrypoint | Minified  | Gzip     |
| ---------- | --------- | -------- |
| `root`     | 107.93 kB | 28.89 kB |
| `/core`    | 32.19 kB  | 8.07 kB  |
| `/ui`      | 75.49 kB  | 20.98 kB |

External packages and runtime assets such as workers, WASM, and models are excluded. Shared code is included in each entrypoint that loads it.

_Generated automatically. Do not edit manually._
<!-- microblink:bundle-size:end -->

## Browser Support

The package exports support camera-based capture in these browser versions and newer:

| Browser                     | Root | `/core` | `/ui` |
| --------------------------- | ---- | ------- | ----- |
| Chrome / Chromium (desktop) | 96   | 96      | 96    |
| Chrome / Chromium (Android) | 96   | 96      | 96    |
| Edge                        | 96   | 96      | 96    |
| Opera                       | 84   | 84      | 84    |
| Firefox (desktop)           | 132  | 132     | 132   |
| Safari (macOS)              | 16.4 | 16.4    | 16.4  |
| iOS Safari                  | 16.4 | 16.4    | 16.4  |

Camera integrations that use this package must run in a
[secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts)
because browsers only expose camera APIs such as `getUserMedia()` on HTTPS or
localhost.

Firefox for Android is not supported for camera-based capture because camera
device discovery and permission handling are unreliable there; see
[Bugzilla 1611998](https://bugzilla.mozilla.org/show_bug.cgi?id=1611998).

## Responsibilities

- Camera frame registration and guided presentation using `CameraManager`.
- Onboarding, help, timeout, retry, close, completion, and error states.
- Animation-gated result presentation and capture error dialogs.
- Accessible close/help controls and live feedback announcements.
- Localization string overrides.
- Reduced-motion behavior.
- Forwarding session workflow events alongside guided-only UX events.

The UX package does not import worker or WASM packages. Native analysis stays in
`@microblink/biometrics-core`. Capture, cancellation, and retry
ownership stay in the supplied `BiometricsUxSession`.

## Low-Level Usage

```ts
import { createBiometricsUxManager, type BiometricsUxSession } from "@microblink/biometrics-ux-manager/core";
import { createBiometricsFeedbackUi } from "@microblink/biometrics-ux-manager/ui";
import type { CameraManager } from "@microblink/camera-manager/core";
import type { CameraManagerComponent } from "@microblink/camera-manager/ui";

declare const cameraManager: CameraManager;
declare const cameraUi: CameraManagerComponent;
declare const session: BiometricsUxSession;

const manager = await createBiometricsUxManager(cameraManager, session, {
  showOnboarding: true,
  onResult(result) {
    console.log(result);
  },
});

const ui = createBiometricsFeedbackUi(manager, cameraUi, {
  showHelpButton: true,
  localizationStrings: {
    onboarding_modal: {
      title: "Get ready",
    },
  },
});

ui.close();
manager.close();
```

`showHelpButton` defaults to `true`. Set it to `false` to hide both the help
button and its automatic tooltip nudge.

## Customization

Set `--mb-bio-face-visual-width` on the Camera Manager host element to override
the face guide and capture-success visual width:

```css
microblink-camera-manager {
  --mb-bio-face-visual-width: min(80%, 42rem);
}
```

The Biometrics UI supports these Shadow Parts:

- `help-button-part`
- `help-button-tooltip-part`

Camera controls and the capture screen expose additional parts through
`@microblink/camera-manager`.

## Extending

Sessions that do more work after capture can report the `processing` phase. The manager shows a processing status
once the capture animation completes. A failure with `stage: "processing"` shows an error dialog without resetting the
capture presentation, and `retry()` then calls `session.retry()` without restarting frame capture.

To add error dialogs, return a custom dialog kind from `resolveErrorDialogKind` and pass matching copy to the feedback
UI through `errorDialogs`. Return `undefined` to keep the default dialog:

```ts
const manager = await createBiometricsUxManager(cameraManager, session, {
  resolveErrorDialogKind: (error, stage) => (stage === "processing" && error.isRetryable ? "retryLater" : undefined),
});

createBiometricsFeedbackUi(manager, cameraUi, {
  errorDialogs: {
    retryLater: () => ({
      title: "Something went wrong",
      description: "Retry, or cancel and try again later.",
      retryable: true,
    }),
  },
});
```

## Development

```sh
pnpm install
pnpm --filter @microblink/biometrics-ux-manager build
pnpm --filter @microblink/biometrics-ux-manager test
```
