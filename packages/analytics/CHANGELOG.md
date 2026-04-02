# @microblink/analytics

## 1.0.2

### Patch Changes

- Updated dependencies

## 1.0.1

### Patch Changes

- Added `logErrorEvent(...)` to standardize error and crash pinglets with formatted error messages and optional stack traces.

## 1.0.0

### Major Changes

- Internal analytics and telemetry package: provides `AnalyticService` and ping types for SDK events (SDK init, scan events, camera info, errors). Used by BlinkID and BlinkCard browser SDK packages; private, consumed via workspace within the monorepo.
