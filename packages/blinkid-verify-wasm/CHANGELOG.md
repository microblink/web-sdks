# @microblink/blinkid-verify-wasm

## 4000.0.0

### Major Changes

- Replaced the scanning session bindings with the v3 payload. `getResult` returns `serializedPayload` and an optional `typedPayload`, and sessions expose `prepareVerifyRequest` and `submitResult`.

### Minor Changes

- Added the `simd-relaxed` and `simd-relaxed-threads` WebAssembly variants. Browsers that support relaxed SIMD now load these faster builds automatically, while other browsers keep using `simd` or `simd-threads`. The `wasmVariant` setting accepts the new variant names, and the shipped `resources/` tree contains the new variant directories.

## 4000.0.0-next.1

### Minor Changes

- Renamed shipped Wasm build directories: `advanced` → `simd` and `advanced-threads` → `simd-threads`.

### Patch Changes

- Speeds up BlinkID Verify initialization by compiling WebAssembly while it downloads. Resources served without the `application/wasm` content type or environments without streaming compilation continue to use buffered compilation.

## 3.21.1

### Patch Changes

- Version bump for consistency with other packages

### Minor Changes

- Update of internal dependencies in blinkid-verify-wasm

## 3.20.3

### Patch Changes

- Fixes BlinkID Verify Wasm Embind registration by removing redundant geometry helpers and eliminating a conflicting registration where `Quadrangle` was bound under the `Point` name, so the module’s exported classes match the intended `Point` and `Quadrangle` types.

## 3.20.2

### Patch Changes

- Version bump for consistency with other packages

## 3.20.1

### Patch Changes

- Fixed a bug where movement instructions for the second page of some passports were not returned correctly.
- Added new settings to `ScanningSettings`:
  - `scanPassportDataPageOnly` - when enabled, only the passport data page (containing `MRZ`) is scanned; when disabled, scanning of the second page is required for certain passports
  - `scanUnsupportedBack` - when enabled, the back side of documents whose back side is not supported will also be scanned

## 3.20.0

- Introducing BlinkID Verify web SDK, a capturing solution for perparing the perfect frames from a camera to be sent to the BlinkID verify API
