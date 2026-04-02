# @microblink/blinkid-verify-worker

This package provides the Web Worker script for the BlinkID Verify browser SDK. It is used internally by BlinkID Verify to offload intensive identity document scanning and recognition tasks to a separate thread, improving performance and responsiveness in web applications.

## Overview

- Contains the worker code that interacts with the BlinkID Verify WebAssembly module.
- Used by higher-level packages such as [`@microblink/blinkid-verify-core`](https://www.npmjs.com/package/@microblink/blinkid-verify-core) and [`@microblink/blinkid-verify`](https://www.npmjs.com/package/@microblink/blinkid-verify).
- Not intended for direct use by end-users.

## Usage

This package is bundled and distributed as part of the BlinkID Verify browser SDK. If you want to use BlinkID Verify in your project, install and use:

- [`@microblink/blinkid-verify`](https://www.npmjs.com/package/@microblink/blinkid-verify)
- [`@microblink/blinkid-verify-core`](https://www.npmjs.com/package/@microblink/blinkid-verify-core)

## Development

To build the worker locally:

1. Install dependencies in the monorepo root:

   ```sh
   pnpm install
   ```

2. Build the package:

   ```sh
   pnpm build
   ```

The output files will be available in the `dist/` directory.
