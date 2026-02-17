# @microblink/core-common

## 1.0.0

### Major Changes

- Shared utilities and helpers for BlinkID and BlinkCard core packages: worker proxying, cross-origin worker URL resolution, device info, custom image data creation, and build-variant detection. Exports `createProxyWorker`, `getCrossOriginWorkerURL`, `createCustomImageData`, `getUserId`, `shouldUseLightweightBuild`, `deviceInfo`. Used by `@microblink/blinkid-core`, `@microblink/blinkcard-core`; private, consumed via workspace.
