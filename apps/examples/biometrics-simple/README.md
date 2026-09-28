# Biometrics Simple Example

This example shows the smallest guided face capture integration with `@microblink/biometrics`.

## Functionality

1. **Creates the guided UI**: `createBiometricsUi` loads the SDK resources, opens the front camera, and mounts the capture UI into `#root`.
2. **Guides the user**: The SDK shows onboarding, live face guidance, help, and retry dialogs.
3. **Logs the result**: `onResult` receives a `FaceCaptureResult` and logs it to the console.
4. **Cleans up**: The example calls `destroy()` after the result to release the camera, worker, and WebAssembly module. The close button also destroys the UI.

## Resources

The Vite config links the `@microblink/biometrics-core` resources into `public/resources/`. `resourcesLocation` defaults to the current page URL, so the SDK loads them from `resources/` next to `index.html`. The dev server sends the cross-origin isolation headers required by the multithreaded WebAssembly build.

## How to Run

From the repository root, install dependencies and build the packages:

```sh
pnpm install
pnpm build:packages
```

Copy `.env.example` to `.env.local` and replace the placeholder with a Biometrics license key. Then run:

```sh
pnpm --filter @microblink/biometrics-simple-example dev
```

Open the HTTPS URL printed in the terminal. Use the QR code to open the example on a phone in the same network.
