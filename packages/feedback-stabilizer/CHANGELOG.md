# @microblink/feedback-stabilizer

## 7.1.4

### Patch Changes

- Updates debug snapshot getters to use a browser-compatible fallback when `structuredClone` is unavailable. This keeps `getEventQueue()`, `getSingleEventQueue()`, `getScores()`, and `getScoreBoard()` working across supported browser baselines.

## 7.1.3

### Patch Changes

- Fixes timing stability in feedback state transitions and improves internal event-queue handling used for UI-state smoothing.
- Adds explicit `ingest(...)` and `tick()` state progression flow while preserving `getNewUiState(...)` as a compatibility wrapper.
- No breaking API changes.

## 7.1.2

### Patch Changes

- Improved documentation

## 7.1.1

### Patch Changes

- Stabilizer properly waits for previous state to finish on success events

## 7.1.0

### Minor Changes

## 7.0.1

### Patch Changes

- Bump package version
