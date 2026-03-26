# @microblink/blinkcard-worker

## 3000.0.3

### Patch Changes

- Added crash reporting for worker runtime failures, unhandled promise rejections, Wasm aborts, session creation failures, session method failures, and frame-transfer failures.
- Flushes init-time pinglets only when BlinkCard SDK initialization fails, preventing successful initialization from sending queued analytics prematurely.
- Updated dependencies
  - @microblink/worker-common@1.0.2
  - @microblink/analytics@1.0.1
  - @microblink/blinkcard-wasm@3000.0.3

## 3000.0.2

### Patch Changes

- Removed unused analytics flushing points and aligned analytics flushing behavior across workers.
- Added comprehensive tests for licensing analytics.
- Fixed missing analytics events for crashes during SDK and Wasm initialization.
- Updated dependencies
  - @microblink/blinkcard-wasm@3000.0.2
  - @microblink/worker-common@1.0.1

## 3000.0.1

### Patch Changes

- Updated dependencies
  - @microblink/blinkcard-wasm@3000.0.1

## 3000.0.0

### Major Changes

- Major release of the BlinkCard worker package.

### Patch Changes

- Updated dependencies
  - @microblink/analytics@1.0.0
  - @microblink/blinkcard-wasm@3000.0.0
  - @microblink/worker-common@1.0.0
