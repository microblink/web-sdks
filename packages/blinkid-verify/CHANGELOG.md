# @microblink/blinkid-verify

## 4000.0.0

### Major Changes

- Replaced the BlinkID Verify capture pipeline with a v3 session, consent, and Verify API surface. This package covers `createBlinkIdVerify` only.
- Removed `addOnResultCallback` from the component returned by `createBlinkIdVerify`. Register `addOnCaptureCompletedCallback` and call `resolver.getCaptureResult()` when you need the capture payload.
- ```ts
  const blinkIdVerify = await createBlinkIdVerify({ licenseKey });
  blinkIdVerify.addOnCaptureCompletedCallback(async (resolver) => {
    const result = await resolver.getCaptureResult();
    console.log(result.typedPayload);
  });
  ```
- Replaced `scanningSettings` on `createBlinkIdVerify` with `configuration`. Field names and nesting are in the `@microblink/blinkid-verify-core` notes.
- `createBlinkIdVerify` returns one `BlinkIdVerifyComponent`. Optional `verifyApiBaseUrl` defaults to the page origin. Relative values resolve against the page URL, and trailing slashes are stripped on the main thread. The component always exposes `verifyOnScanningCompletion`, and the capture resolver always includes `getCaptureResult` and `verifyCaptureResult`. `blinkIdVerifyCore` is a `BlinkIdVerifyCore`.
- The SDK POSTs `{resolved}/api/v3/verify` with `Content-Type` only and `credentials` set to `"same-origin"`. It sends no API key and no `Authorization` header. The customer's server accepts that POST, forwards the multipart body unchanged (the `sdkMetadata` signature covers those bytes), and adds `Authorization`. `microblinkProxyUrl` is unchanged and is only ping and Baltazar. Submit requests time out after 20 seconds and are aborted by `reset()`, session deletion, and SDK termination.
- ```ts
  const blinkIdVerify = await createBlinkIdVerify({
    licenseKey,
    verifyApiBaseUrl: "https://example.com/verify-proxy",
  });

  blinkIdVerify.addOnCaptureCompletedCallback(async (resolver) => {
    const captureResult = await resolver.getCaptureResult();
    const verifyResult = await resolver.verifyCaptureResult();
    if (verifyResult.ok) {
      console.log(captureResult.typedPayload, verifyResult.result);
    }
  });

  blinkIdVerify.verifyOnScanningCompletion({
    onSuccess: async (_apiResult, resolver) => {
      const capture = await resolver.getCaptureResult();
      console.log(capture.typedPayload);
    },
    onError: async (error, resolver) => {
      console.error(error);
      const retry = await resolver.verifyCaptureResult();
      if (!retry.ok) {
        console.error(retry.error);
      }
    },
  });
  ```
- A failed automatic submit is not retried by the SDK. The error callback can call `resolver.verifyCaptureResult()` again while the scanning session is still alive. That call resolves with `{ ok: true, result }` or `{ ok: false, error }` and does not reject for API failures. A later resubmit is not delivered to the success callback.
- Added `uxManagerOptions` for headless UX behavior, including `consentUxConfig`. Added `BlinkIdVerifyConsentDeclinedError`. With `uxManagerOptions.consentUxConfig.consentMode` set to `"RequireConsent"`, declining the consent modal rejects `createBlinkIdVerify` after the SDK is terminated, and the camera stream is not started.
- ```ts
  try {
    await createBlinkIdVerify({
      licenseKey,
      uxManagerOptions: {
        consentUxConfig: {
          consentMode: "RequireConsent",
          consent: { userId: "user-123", durationDays: 30 },
        },
      },
    });
  } catch (error) {
    if (error instanceof BlinkIdVerifyConsentDeclinedError) {
      return;
    }
    throw error;
  }
  ```
- Changed `createBlinkIdVerify` so it no longer waits for `cameraManager.startCameraStream()`. The stream starts after the promise resolves, and a stream failure is logged with `console.warn` instead of rejecting creation. When consent is required, creation waits for the consent gate before resolving. `feedbackUiOptions.localizationStrings` are passed into that consent dialog.

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-verify-core@4000.0.0
  - @microblink/blinkid-verify-ux-manager@4000.0.0

## 4000.0.0-next.1

### Minor Changes

- Updates English localization strings.
  Added:
  - `feedback_messages.screen_detected`: "Move the document to a plain background"
    Updated:
  - `feedback_messages.blur_detected` from "Keep document and phone still" to "Keep the document and phone still"
  - `feedback_messages.camera_angle_too_steep` from "Keep document parallel to phone" to "Keep the document parallel to the phone"
  - `feedback_messages.face_photo_not_fully_visible` from "Keep face photo fully visible" to "Keep the face photo fully visible"
  - `feedback_messages.glare_detected` from "Tilt or move document to remove reflection" to "Tilt or move the document to remove reflection"
  - `feedback_messages.keep_document_parallel` from "Keep document parallel with screen" to "Keep the document parallel to the screen"
  - `feedback_messages.keep_document_still` from "Keep document and device still" to "Keep still"
  - `timeout_modal.cancel_btn` from "Cancel" to "Cancel Scanning"
  - `timeout_modal.details` from "Unable to read the document. Please try again." to "Make sure the document is well lit, fully visible, and free of glare."
  - `timeout_modal.title` from "Scan unsuccessful" to "Unable to read the document"
    Removed: none
- Updated the minimum browser requirements after removing the non-SIMD `basic` Wasm build. The SDKs now require WebAssembly SIMD support: Chrome/Edge 91+, Firefox 89+, Safari/iOS Safari 16.4+, and Samsung Internet 16+.
- Updated dependencies

### Patch Changes

- Updated declaration bundles
- Updated package dependencies.
- Fixed an issue where frame processing wouldnt stop if showTimeoutModal was configured to false
- Speeds up BlinkID Verify initialization by compiling WebAssembly while it downloads. Resources served without the `application/wasm` content type or environments without streaming compilation continue to use buffered compilation.
- Upgrade to TypeScript 7
- Updated dependencies
  - @microblink/camera-manager@8.1.0
  - @microblink/blinkid-verify-core@4000.0.0-next.1
  - @microblink/blinkid-verify-ux-manager@4000.0.0-next.1

## 3.21.1

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-verify-ux-manager@3.21.1
  - @microblink/blinkid-verify-core@3.21.1

## 3.21.0

### Minor Changes

- Update of internal dependencies in blinkid-verify-wasm

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-verify-core@3.21.0
  - @microblink/blinkid-verify-ux-manager@3.21.0

## 3.20.3

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-verify-ux-manager@3.20.3
  - @microblink/blinkid-verify-core@3.20.3

## 3.20.2

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-verify-core@3.20.2
  - @microblink/blinkid-verify-ux-manager@3.20.2

## 3.20.1

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-verify-ux-manager@3.20.1
  - @microblink/blinkid-verify-core@3.20.1

## 3.20.0

- Introducing BlinkID Verify web SDK, a capturing solution for perparing the perfect frames from a camera to be sent to the BlinkID verify API
