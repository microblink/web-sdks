# @microblink/blinkid-verify-core

## 4000.0.0

### Major Changes

- Replaced the BlinkID Verify capture pipeline with a v3 session, consent, and Verify API surface. Session settings, consent, `getResult`, and Verify API submit are documented in this package.
- Removed `scanningSettings` from `BlinkIdVerifySessionSettings`. Pass `configuration` (`DocumentVerificationConfiguration`) and an optional `traceId`. These types are re-exported from this package. Choose the new verification values again; the old match-level names are not accepted.
  - Replaced `scanningSettings` with `configuration` and optional `traceId`.
  - Removed `manualReviewSensitivity` and `captureConditions` from `UseCase`. Use `configuration.verification.useCase` without those fields.
  - Replaced `verificationPolicy` values `"permissive"`, `"standard"`, `"strict"`, and `"very-strict"` with `"high-conversion"`, `"balanced"`, and `"high-assurance"`.
  - Replaced `treatExpirationAsFraud` with `configuration.verification.settings.rejectExpiredDocuments`.
  - Replaced `ImageQualitySettings` and `ImageQualityInterpretation`, including `blurMatchLevel`, `glareMatchLevel`, `lightingMatchLevel`, `sharpnessMatchLevel`, `handOcclusionMatchLevel`, `dpiMatchLevel`, and `tiltMatchLevel`, with `configuration.imageAssessment.imageQualitySensitivity` and `configuration.verification.settings.imageQualityRetryPolicy`.
  - Replaced `screenAnalysisMatchLevel` with `configuration.verification.settings.screenPresenceSensitivity`.
  - Replaced `barcodeAnomalyMatchLevel` with `configuration.verification.settings.barcodeAuthenticitySensitivity`.
  - Replaced `dataMatchMatchLevel` with `configuration.verification.settings.dataMatchSensitivity`.
  - Removed `staticSecurityFeaturesMatchLevel`, `scanUnsupportedBack`, and `scanPassportDataPageOnly`. There is no replacement.
  - Added `photocopySensitivity`, `portraitForgerySensitivity`, `generativeAiSensitivity`, and `cropAffectsVerdict` on `configuration.verification.settings`.
  - Removed exports `ScanningSettings`, `ImageQualitySettings`, `ImageQualityInterpretation`, `ManualReviewSensitivity`, and `CaptureConditions`. There is no replacement.
- ```ts
  const sessionSettings: BlinkIdVerifySessionSettings = {
    traceId: "optional-correlation-id",
    configuration: {
      verification: {
        useCase: {
          verificationPolicy: "balanced",
          manualReviewStrategy: "rejected-only",
          verificationContext: "remote",
        },
        settings: {
          rejectExpiredDocuments: true,
          screenPresenceSensitivity: "level-5",
          dataMatchSensitivity: "level-3",
          barcodeAuthenticitySensitivity: "level-4",
          imageQualityRetryPolicy: "retry-bad-quality-for-rejections",
        },
      },
      extraction: {
        redactionSettings: { globalMode: "none" },
        documentCaptureModuleSettings: {
          faceImageExtractionEnabled: true,
          documentImageReturnEnabled: true,
        },
      },
      imageAssessment: { imageQualitySensitivity: "level-2" },
    },
  };
  ```
- Changed `getResult(consent?, resultDataMode?)` to return a `BlinkIdVerifySessionResult` (`serializedPayload` and optional `typedPayload`) instead of `frontFrame`, `backFrame`, and `barcodeFrame`. The result is no longer an Embind object, so do not call `delete()` on it. Image parts are `serializedPayload.imageFirstSide`, `imageSecondSide`, and `imageBarcode` (`jpegBytes` only; frame `orientation` was removed). Pass `"include-typed-payload"` to receive `typedPayload`. Optional `Consent` (`userId`, `durationDays`, optional `note`, `givenOn`, and `customerContext`) is included in the generated payload.
- ```ts
  const consent: Consent = {
    durationDays: 30,
    userId: "end-user-id",
    customerContext: { customerId: "acct-1", transactionId: "txn-9" },
  };
  const result = await session.getResult(consent, "include-typed-payload");
  const front = result.serializedPayload.imageFirstSide?.jpegBytes;
  const typedConfiguration = result.typedPayload?.configuration;
  ```
- Removed `GeneratePayloadForBlinkidVerifyRequest`, `BlinkIdVerifyPayload`, and `BlinkIdVerifyRequestOptions`. `loadBlinkIdVerifyCore` returns one `BlinkIdVerifyCore`. Optional `verifyApiBaseUrl` defaults to `window.location.origin`. Relative values resolve against the page URL. Trailing slashes are stripped on the main thread. `createScanningSession` returns a `RemoteScanningSession` that always includes `prepareVerifyRequest` and `submitResult`.
- The SDK always POSTs `{resolved}/api/v3/verify` with `Content-Type` only and `credentials` set to `"same-origin"`. It sends no API key and no `Authorization` header. Send `PreparedVerifyRequest.body` as-is. The `sdkMetadata` signature covers those bytes, so do not rebuild `FormData` from the parts. The customer's server accepts that POST, forwards the multipart body unchanged, and adds `Authorization`. `submitResult` returns `VerifyApiResult`, the typed cloud verification response. Failures throw `VerifyApiError`; `toVerifyApiError` coerces unknown rejections. Submit requests time out after 20 seconds and are aborted by `reset()`, session deletion, and SDK termination. Former request options such as image return and redaction belong on `configuration.extraction` before capture. `microblinkProxyUrl` is unchanged and is only ping and Baltazar.
- ```ts
  const core = await loadBlinkIdVerifyCore({
    licenseKey,
    verifyApiBaseUrl: "https://example.com/verify-proxy",
  });
  const session = await core.createScanningSession(sessionSettings);
  const prepared = await session.prepareVerifyRequest(consent);
  await fetch(prepared.url, {
    method: prepared.method,
    headers: prepared.headers,
    body: prepared.body,
  });
  try {
    const verifyResult = await session.submitResult(consent);
  } catch (error) {
    throw toVerifyApiError(error);
  }
  ```
- Removed `userId` from `BlinkIdVerifyInitSettings`. The SDK generates and persists the ping identifier. Put the end-user identity on `Consent.userId`, not on `loadBlinkIdVerifyCore`.
- Added `ScanningSide` (`"first"`, `"second"`, `"barcode"`), and `screenPresenceDetected` plus `scanningSide` on `InputImageAnalysisResult`. `scanningSide` reports the document side of the processed frame.

### Minor Changes

- Added the `simd-relaxed` and `simd-relaxed-threads` WebAssembly variants. Browsers that support relaxed SIMD now load these faster builds automatically, while other browsers keep using `simd` or `simd-threads`. The `wasmVariant` setting accepts the new variant names, and the shipped `resources/` tree contains the new variant directories.

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-verify-wasm@4000.0.0
  - @microblink/blinkid-verify-worker@4000.0.0

## 4000.0.0-next.1

### Patch Changes

- Updated declaration bundles
- Updated package dependencies.
- Require HTTPS when loading cross-origin worker resources.
- Speeds up BlinkID Verify initialization by compiling WebAssembly while it downloads. Resources served without the `application/wasm` content type or environments without streaming compilation continue to use buffered compilation.
- Upgrade to TypeScript 7
- Updated dependencies
  - @microblink/analytics@2.1.0
  - @microblink/blinkid-verify-wasm@4000.0.0-next.1
  - @microblink/blinkid-verify-worker@4000.0.0-next.1

## 3.21.1

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-verify-wasm@3.21.1
  - @microblink/blinkid-verify-worker@3.21.1

## 3.21.0

### Minor Changes

- Update of internal dependencies in blinkid-verify-wasm

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-verify-wasm@3.21.0
  - @microblink/blinkid-verify-worker@3.21.0

## 3.20.3

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-verify-wasm@3.20.3
  - @microblink/core-common@1.0.2
  - @microblink/blinkid-verify-worker@3.20.3

## 3.20.2

### Patch Changes

- Updated dependencies
  - @microblink/analytics@2.0.1
  - @microblink/blinkid-verify-wasm@3.20.2
  - @microblink/blinkid-verify-worker@3.20.2

## 3.20.1

### Patch Changes

- Updated dependencies
  - @microblink/analytics@2.0.0
  - @microblink/blinkid-verify-worker@3.20.1
  - @microblink/blinkid-verify-wasm@3.20.1

## 3.20.0

- Introducing BlinkID Verify web SDK, a capturing solution for perparing the perfect frames from a camera to be sent to the BlinkID verify API
