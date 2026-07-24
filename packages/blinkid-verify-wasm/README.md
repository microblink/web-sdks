# @microblink/blinkid-verify-wasm

This package contains the WebAssembly (Wasm) and native bindings for the BlinkID Verify SDK. It provides the core C++ code compiled to WebAssembly, along with Emscripten bindings for use in web environments.

## Overview

- Provides the low-level Wasm module for BlinkID Verify document scanning.
- Exposes C++ APIs to JavaScript via Emscripten embind.
- Used internally by higher-level BlinkID Verify packages such as [`@microblink/blinkid-verify-core`](https://www.npmjs.com/package/@microblink/blinkid-verify-core).
- Not intended for direct use by end-users; use [`@microblink/blinkid-verify`](https://www.npmjs.com/package/@microblink/blinkid-verify) or [`@microblink/blinkid-verify-core`](https://www.npmjs.com/package/@microblink/blinkid-verify-core) instead.

## Browser Support (Wasm Runtime)

This package ships two Wasm build variants (`simd` and `simd-threads`). The
runtime selects the best supported variant automatically.

### `simd`

Requires the Emscripten-generated Wasm feature set used by the SDK plus
[fixed-width SIMD](https://web-platform-dx.github.io/web-features-explorer/features/wasm-simd/).

- Chrome / Chromium 96 (desktop and Android)
- Edge 96
- Opera 82
- Firefox 89 (desktop and Android)
- Safari 16.4 (macOS)
- iOS Safari 16.4

### `simd-threads`

Requires all `simd` features plus
[Wasm threads and atomics](https://caniuse.com/wasm-threads). Multithreaded Wasm
also requires cross-origin isolation headers
(`Cross-Origin-Opener-Policy: same-origin` and
`Cross-Origin-Embedder-Policy: require-corp`).

- Chrome / Chromium 96 (desktop and Android)
- Edge 96
- Opera 82
- Firefox 89 (desktop and Android)
- Safari (macOS): not selected (uses `simd`)
- iOS Safari: not selected (uses `simd`)

Safari is excluded even when it reports Wasm thread support. Emscripten
`simd-threads` builds use pthreads that spawn workers from inside a worker,
and Safari historically lacked reliable nested worker support when Wasm threads
shipped in Safari 16. There are also known Safari issues with shared memory in
Emscripten pthread builds
([emscripten-core/emscripten#19374](https://github.com/emscripten-core/emscripten/issues/19374)).
For these reasons the runtime falls back to the single-threaded `simd`
variant on Safari instead of loading `simd-threads`.

These minimums combine Emscripten 4.0.16 generated runtime defaults (see
[`src/settings.js`](https://raw.githubusercontent.com/emscripten-core/emscripten/4.0.16/src/settings.js)
and
[`tools/feature_matrix.py`](https://raw.githubusercontent.com/emscripten-core/emscripten/4.0.16/tools/feature_matrix.py))
with baseline Wasm feature support from the
[WebDX reference types](https://web-platform-dx.github.io/web-features-explorer/features/wasm-reference-types/),
[WebDX non-trapping float-to-int](https://web-platform-dx.github.io/web-features-explorer/features/wasm-non-trapping-float-to-int/),
[WebDX fixed-width SIMD](https://web-platform-dx.github.io/web-features-explorer/features/wasm-simd/),
and
[Can I use Wasm threads](https://caniuse.com/wasm-threads)
tables. The higher-level Core and Worker packages add the module Web Worker
requirement, so use the `@microblink/blinkid-verify-core` browser support section when
consuming this Wasm package through those packages.

## Usage

This package is not published or intended for direct consumption. It is bundled and distributed as part of the BlinkID Verify browser SDK packages.

If you are looking to use BlinkID Verify in your project, please refer to:

- [`@microblink/blinkid-verify`](https://www.npmjs.com/package/@microblink/blinkid-verify)
- [`@microblink/blinkid-verify-core`](https://www.npmjs.com/package/@microblink/blinkid-verify-core)

The output WebAssembly and supporting JS files are available in the `dist/` directory.
