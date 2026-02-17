# @microblink/blinkcard

The all-in-one BlinkCard browser SDK package. It provides a high-level, easy-to-use API for credit and debit card scanning and recognition in web applications, bundling all required components and resources for a seamless integration experience.

## Overview

- Combines the BlinkCard engine, camera management, user experience (UX) management, and all required resources.
- Handles initialization, licensing, camera selection, scanning, and user feedback UI.
- Suitable for most use cases—just add your license key and start scanning.

## What's Included

- [`@microblink/blinkcard-core`](https://www.npmjs.com/package/@microblink/blinkcard-core): Core scanning engine and low-level API.
- [`@microblink/blinkcard-ux-manager`](https://www.npmjs.com/package/@microblink/blinkcard-ux-manager): User experience and feedback UI.
- [`@microblink/camera-manager`](https://www.npmjs.com/package/@microblink/camera-manager): Camera selection and video stream management.

## Installation

Install from npm using your preferred package manager:

```sh
npm install @microblink/blinkcard
# or
yarn add @microblink/blinkcard
# or
pnpm add @microblink/blinkcard
```

## Usage

A minimal example:

```js
import { createBlinkCard } from "@microblink/blinkcard";

const blinkcard = await createBlinkCard({
  licenseKey: import.meta.env.VITE_LICENCE_KEY,
});
```

For more advanced usage or integration with your own UI, see the example apps and the documentation for the underlying packages.

## Documentation

Full documentation, API reference, and integration guides are available at [docs.microblink.com](https://docs.microblink.com).

## Example Apps

Explore example applications in the repository under `apps/examples`:
- `apps/examples/blinkcard-simple` for a minimal integration.
- `apps/examples/blinkcard-advanced-setup` for advanced low-level setup and customization.

## Hosting Requirements

- Serve the `public/resources` directory as-is; it contains all required Wasm, worker, and resource files.
- Must be served in a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts).
- For multithreaded builds, your site must be [cross-origin isolated](https://web.dev/articles/why-coop-coep):

  ```
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
  ```

## License Key

A valid license key is required. Request a free trial at [Microblink Developer Hub](https://developer.microblink.com/register).

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

The output files will be available in the `dist/`, `types/`, and `public/resources/` directories.
