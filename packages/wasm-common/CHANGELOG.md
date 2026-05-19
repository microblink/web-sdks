# @microblink/wasm-common

## 2.1.0

### Minor Changes

- Refactors shared Wasm binding utilities (enum binding helpers, vector helpers, and shared session result bindings such as date, image, and quadrilateral types) so BlinkID and BlinkCard Emscripten modules reuse the same binding layer and stay easier to maintain.

## 2.0.0

### Major Changes

- Typescript:
    - Added `WasmSimdVariant` type for all products
- Cplusplus:
    - Updated internal imporevements for cleaner binding of types

## 1.0.1

### Patch Changes

- Added shared `EmscriptenModule` and `WasmBindings` types.

## 1.0.0

### Major Changes

- Shared WebAssembly types and build configuration for BlinkID and BlinkCard Wasm packages. Ensures consistent setup for building Wasm modules used by the browser SDKs. Used by `@microblink/blinkid-wasm` and `@microblink/blinkcard-wasm`; private, consumed via workspace.
