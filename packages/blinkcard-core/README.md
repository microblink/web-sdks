# @microblink/blinkcard-core

This package provides the core BlinkCard functionality for browser-based card scanning. It exposes a low-level API for initializing and controlling the BlinkCard engine, managing sessions, and processing images. It can be used directly by end users for advanced or custom integrations, or as a dependency of higher-level packages such as [`@microblink/blinkcard`](https://www.npmjs.com/package/@microblink/blinkcard).

## Overview

- Provides the main API for BlinkCard scanning and recognition in the browser.
- Handles initialization, licensing, and session management.
- Can be used directly by end users for advanced use cases.
- Used internally by [`@microblink/blinkcard`](https://www.npmjs.com/package/@microblink/blinkcard).

## Installation

Install from npm using your preferred package manager:

```sh
npm install @microblink/blinkcard-core
# or
yarn add @microblink/blinkcard-core
# or
pnpm add @microblink/blinkcard-core
```

## Usage

You can use `@microblink/blinkcard-core` directly in your project for custom integrations. See the example apps in the `apps/examples` directory in the GitHub repository for usage details.

## Environment & Setup

- ESM-only: Use in browsers with a bundler (e.g., Vite) or via [`<script type="module">`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#applying_the_module_to_your_html).
- Can also be used via [esm.sh](https://esm.sh/) for direct HTTP imports.

### License key

A valid license key is required. Request a free trial at [Microblink Developer Hub](https://developer.microblink.com/register).

### Hosting resources

You must host the `dist/resources` directory from this package without modification. It contains:

- WebAssembly `.wasm` and `.data` files
- Emscripten JS glue code
- The `@microblink/blinkcard-worker` Web Worker script

### Hosting requirements

- Must be served in a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts).
- For multithreaded builds, your site must be [cross-origin isolated](https://web.dev/articles/why-coop-coep):

  ```
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
  ```

## Development

To build the package locally:

1. Install dependencies in the monorepo root:

   ```sh
   pnpm install
   ```

2. Build the package:

   ```sh
   pnpm build
   ```

The output files will be available in the `dist/` and `types/` directories.
