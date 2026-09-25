# Biometrics Custom UI Example

This plain TypeScript application supplies its own capture interface and camera loop. It uses the headless `createBiometrics` API from `@microblink/biometrics` and the framework-independent `@microblink/camera-manager/core` entrypoint.

## Functionality

1. **Loads the SDK once**: `createBiometrics` downloads and initializes the SDK resources when the page opens and reports download progress.
2. **Starts a session per capture**: **Start capture** calls `sdk.startSession()`, opens the front camera, and passes the video element and track to `session.setCameraSource()`.
3. **Feeds camera frames**: A Camera Manager frame capture callback returns `session.processFrame(frame)`, so Camera Manager waits for each frame before it submits the next one.
4. **Shows guidance**: The app maps `faceGuidance` events to its own messages and frame colors.
5. **Shows the result**: When `session.run()` resolves, the app draws `bestImage`, summarizes the `FaceCaptureResult`, and shows the `traceId` and `sessionNumber` from `session.getSessionContext()`.
6. **Recovers from failures**: Retryable failures show **Retry**, which calls `session.retry()` on the same session. Other failures end the session.
7. **Cleans up**: **Stop** removes the session callbacks, stops the camera, and finishes the session. Leaving the page also closes the SDK.

## How to Run

From the repository root, install dependencies and build the packages:

```sh
pnpm install
pnpm build:packages
```

Copy `.env.example` to `.env.local` and replace the placeholder with a Biometrics license key. Then run:

```sh
pnpm --filter @microblink/biometrics-custom-ui-example dev
```

Use `build` for a production build and `typecheck` to check the TypeScript source.
