# @microblink/blinkcard-core

## 3000.0.3

### Patch Changes

- Surfaces worker frame-transfer failures as explicit `FrameTransferError`s through the proxy-worker layer, improving diagnostics for invalid or detached frame buffers.
- Updated dependencies
  - @microblink/core-common@1.0.1
  - @microblink/blinkcard-worker@3000.0.3
  - @microblink/blinkcard-wasm@3000.0.3

## 3000.0.2

### Patch Changes

- Fixed missing analytics events for crashes during SDK and Wasm initialization.
- Updated dependencies
  - @microblink/blinkcard-worker@3000.0.2
  - @microblink/blinkcard-wasm@3000.0.2

## 3000.0.1

### Patch Changes

- Updated dependencies
  - @microblink/blinkcard-wasm@3000.0.1
  - @microblink/blinkcard-worker@3000.0.1

## 3000.0.0

### Major Changes

- Major release of the BlinkCard core package.

### Patch Changes

- Updated dependencies
  - @microblink/blinkcard-wasm@3000.0.0
  - @microblink/blinkcard-worker@3000.0.0
  - @microblink/core-common@1.0.0
