# @microblink/worker-common

## 1.0.0

### Major Changes

- Shared utilities for Web Worker and Wasm-related logic: resource path building, cross-origin worker URL handling, licensing helpers, Wasm feature detection, and error types. Exports `buildResourcePath`, `getCrossOriginWorkerURL`, `isSafari`, `licencing`, `mbToWasmPages`, `proxy-url-validator`, `wasm-feature-detect`, `errors`. Used by `@microblink/blinkid-worker`, `@microblink/blinkcard-worker`, and core packages; private, consumed via workspace.

### Patch Changes

- Updated dependencies
  - @microblink/wasm-common@1.0.0
