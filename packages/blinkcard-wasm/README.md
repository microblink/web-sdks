# @microblink/blinkcard-wasm

This package contains the WebAssembly (Wasm) and native bindings for the BlinkCard SDK. It provides the core C++ code compiled to WebAssembly, along with Emscripten bindings for use in web environments.

## Overview

- Provides the low-level Wasm module for BlinkCard cards scanning.
- Exposes C++ APIs to JavaScript via Emscripten embind.
- Used internally by higher-level BlinkCard packages such as [`@microblink/blinkcard-core`](https://www.npmjs.com/package/@microblink/blinkcard-core).
- Not intended for direct use by end-users; use [`@microblink/blinkcard`](https://www.npmjs.com/package/@microblink/blinkcard) or [`@microblink/blinkcard-core`](https://www.npmjs.com/package/@microblink/blinkcard-core) instead.

## Usage

This package is not published or intended for direct consumption. It is bundled and distributed as part of the BlinkCard browser SDK packages.

If you are looking to use BlinkCard in your project, please refer to:

- [`@microblink/blinkcard`](https://www.npmjs.com/package/@microblink/blinkcard)
- [`@microblink/blinkcard-core`](https://www.npmjs.com/package/@microblink/blinkcard-core)

The output WebAssembly and supporting JS files can be found in the `dist/` directory.
