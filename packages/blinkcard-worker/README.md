# @microblink/blinkcard-worker

This package provides the Web Worker script for the BlinkCard browser SDK. It is used internally by BlinkCard to offload intensive card scanning and recognition tasks to a separate thread, improving performance and responsiveness in web applications.

## Overview

- Contains the worker code that interacts with the BlinkCard WebAssembly module.
- Used by higher-level packages such as [`@microblink/blinkcard-core`](https://www.npmjs.com/package/@microblink/blinkcard-core) and [`@microblink/blinkcard`](https://www.npmjs.com/package/@microblink/blinkcard).
- Not intended for direct use by end-users.

## Usage

This package is bundled and distributed as part of the BlinkCard browser SDK. If you want to use BlinkCard in your project, install and use:

- [`@microblink/blinkcard`](https://www.npmjs.com/package/@microblink/blinkcard)
- [`@microblink/blinkcard-core`](https://www.npmjs.com/package/@microblink/blinkcard-core)

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
