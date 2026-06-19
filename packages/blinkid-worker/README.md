# @microblink/blinkid-worker

This package provides the Web Worker script for the BlinkID browser SDK. It is used internally by BlinkID to offload intensive document scanning and recognition tasks to a separate thread, improving performance and responsiveness in web applications.

## Overview

- Contains the worker code that interacts with the BlinkID WebAssembly module.
- Used by higher-level packages such as [`@microblink/blinkid-core`](https://www.npmjs.com/package/@microblink/blinkid-core) and [`@microblink/blinkid`](https://www.npmjs.com/package/@microblink/blinkid).
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
`@microblink/blinkid-core`. This package does not include camera capture or UX components.
If you use `@microblink/blinkid` or the UX manager package, see the browser support section in those packages instead.

## Migration from v7 to v8000

For breaking changes and upgrade steps in the BlinkID package line, see the [BlinkID v8000 migration guide](https://docs.microblink.com/blinkid/migration-v8000).

## Usage

This package is bundled and distributed as part of the BlinkID browser SDK. If you want to use BlinkID in your project, install and use:

- [`@microblink/blinkid`](https://www.npmjs.com/package/@microblink/blinkid)
- [`@microblink/blinkid-core`](https://www.npmjs.com/package/@microblink/blinkid-core)

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
