# @microblink/blinkid-verify-wasm

This package contains the WebAssembly (Wasm) and native bindings for the BlinkID Verify SDK. It provides the core C++ code compiled to WebAssembly, along with Emscripten bindings for use in web environments.

## Overview

- Provides the low-level Wasm module for BlinkID Verify document scanning.
- Exposes C++ APIs to JavaScript via Emscripten embind.
- Used internally by higher-level BlinkID Verify packages such as [`@microblink/blinkid-verify-core`](https://www.npmjs.com/package/@microblink/blinkid-verify-core).
- Not intended for direct use by end-users; use [`@microblink/blinkid-verify`](https://www.npmjs.com/package/@microblink/blinkid-verify) or [`@microblink/blinkid-verify-core`](https://www.npmjs.com/package/@microblink/blinkid-verify-core) instead.

## Usage

This package is not published or intended for direct consumption. It is bundled and distributed as part of the BlinkID Verify browser SDK packages.

If you are looking to use BlinkID Verify in your project, please refer to:

- [`@microblink/blinkid-verify`](https://www.npmjs.com/package/@microblink/blinkid-verify)
- [`@microblink/blinkid-verify-core`](https://www.npmjs.com/package/@microblink/blinkid-verify-core)

The output WebAssembly and supporting JS files are available in the `dist/` directory.
