# @microblink/blinkcard-worker

This package provides the Web Worker script for the BlinkCard browser SDK. It is used internally by BlinkCard to offload intensive card scanning and recognition tasks to a separate thread, improving performance and responsiveness in web applications.

## Overview

- Contains the worker code that interacts with the BlinkCard WebAssembly module.
- Used by higher-level packages such as [`@microblink/blinkcard-core`](https://www.npmjs.com/package/@microblink/blinkcard-core) and [`@microblink/blinkcard`](https://www.npmjs.com/package/@microblink/blinkcard).
- Not intended for direct use by end-users.

## Browser Support

This package supports image processing in these browser versions and newer:

- Chrome / Chromium 96 (desktop and Android)
- Edge 96
- Opera 84
- Firefox 114 (desktop and Android)
- Safari 15.1 (macOS)
- iOS Safari 15.1

These minimums come from the combination of Emscripten-generated WebAssembly,
required baseline Wasm features, and the module Web Worker used by
`@microblink/blinkcard-core`. This package does not include camera capture or UX components.
If you use `@microblink/blinkcard` or the UX manager package, see the browser support section in those packages instead.

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
