# Biometrics Advanced Setup Example

This example composes the guided capture flow from the modular Biometrics packages instead of calling `createBiometricsUi`. It uses `@microblink/biometrics` for the headless SDK, `@microblink/biometrics-ux-manager` for guidance and the feedback UI, and `@microblink/camera-manager` for the camera and camera UI.

## Functionality

1. **Loads the SDK once**: `createBiometrics` downloads and initializes the resources on the first capture and reports download progress. Later captures reuse the loaded SDK.
2. **Creates a session per capture**: `sdk.startSession()` creates the capture session, and `session.getSessionContext()` provides the `traceId` and `sessionNumber` a backend needs to correlate its Biometrics API request.
3. **Manages the camera**: The app creates a `CameraManager`, mounts `createCameraManagerUi`, and opens the front camera.
4. **Manages the UX flow**: `createBiometricsUxManager` connects the camera to the session and handles onboarding, help, timeouts, retry, and errors.
5. **Renders the feedback UI**: `createBiometricsFeedbackUi` is mounted once the camera starts playing. It starts capture itself, or after the onboarding guide when that is enabled. The example overrides one localization string.
6. **Shows live state**: The page displays the UX state key, the capture state, and the current face feedback, plus a log of UX and session events.
7. **Handles results**: The app shows `bestImage`, the engine-produced `captureFrame`, and a summary of the `FaceCaptureResult`.
8. **Cleans up**: Completing a capture, the close button, or dismounting the camera UI finishes the session, closes the UX manager, dismisses the UI, and resets the camera. **Unload SDK** closes the SDK and releases the worker and WebAssembly module.

## Options

Change the constants at the top of `src/App.tsx`:

- `USE_PORTAL` renders the capture UI outside the root element, for example in a modal.
- `SHOW_ONBOARDING` shows the onboarding guide before capture.
- `SHOW_DEBUG_OVERLAY` draws the detected face bounds and landmarks over the camera stream.

`src/index.css` shows how to change the face guide width with `--mb-bio-face-visual-width`.

## How to Run

From the repository root, install dependencies and build the packages:

```sh
pnpm install
pnpm build:packages
```

Copy `.env.example` to `.env.local` and replace the placeholder with a Biometrics license key. Then run:

```sh
pnpm --filter @microblink/biometrics-advanced-setup-example dev
```
