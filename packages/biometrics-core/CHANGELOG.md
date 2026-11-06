# @microblink/biometrics-core

## 1000.1.0

### Minor Changes

- Added inactivity timer with a default of 10 seconds, configurable via `inactivityTimeoutMs`.

### Patch Changes

- Lowered default liveness frame count to 2

## 1000.0.5

### Patch Changes

- Removed SDK defaults that override engine defaults.

## 1000.0.4

### Patch Changes

- Improved capture lifecycle hooks.

## 1000.0.3

### Patch Changes

- Added missing `signatureVersion` and `captureFrameMetadata` to `FaceCaptureResult`.
- Fixed liveness frame counts not being propagated properly.
- Fixed liveness frame `timestamp` values to match their capture time.

## 1000.0.2

### Patch Changes

- Improved face detector performance and liveness frame sampling

## 1000.0.1

### Patch Changes

- Optimized liveness frame format

## 1000.0.0

Introducing Biometrics web SDK, an on-device, frameless capturing solution guiding users to take optimal selfies for biometric processing.
