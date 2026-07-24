# @microblink/blinkcard-wasm

## 3000.1.0-next

### Minor Changes

- Removed the `basic` Wasm build.
  - Renamed shipped Wasm build directories: `advanced` → `simd` and `advanced-threads` → `simd-threads`.
- Updated the Emscripten toolchain used to build the BlinkCard WebAssembly module to v6.x.

## 3000.0.8

### Patch Changes

- Version bump for consistency with other packages

## 3000.0.7

### Patch Changes

- Consolidates BlinkCard Wasm session result Embind blocks into shared `@microblink/wasm-common` binding helpers and routes session settings enums through the shared headers, reducing duplication without changing the intended public TypeScript API.

## 3000.0.6

### Patch Changes

- Version bump for consistency with other packages

## 3000.0.5

### Patch Changes

- Version bump for consistency with other packages

## 3000.0.4

### Patch Changes

- Updated dependencies
  - @microblink/wasm-common@2.0.0

## 3000.0.3

## 3000.0.2

### Patch Changes

- Added shared `EmscriptenModule` and `WasmBindings` types.

## 3000.0.1

## 3000.0.0

### Major Changes

- Major release of the BlinkCard Wasm package.
