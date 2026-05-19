# @microblink/blinkid-core

This package provides the core BlinkID functionality for browser-based document scanning. It exposes a low-level API for initializing and controlling the BlinkID engine, managing sessions, and processing images. It can be used directly by end users for advanced or custom integrations, or as a dependency of higher-level packages such as [`@microblink/blinkid`](https://www.npmjs.com/package/@microblink/blinkid).

## Overview

- Provides the main API for BlinkID scanning and recognition in the browser.
- Handles initialization, licensing, and session management.
- Can be used directly by end users for advanced use cases.
- Used internally by [`@microblink/blinkid`](https://www.npmjs.com/package/@microblink/blinkid).

## Migration from v7 to v8000

For breaking changes and upgrade steps, see the [BlinkID v8000 migration guide](https://docs.microblink.com/blinkid/migration-v8000).

## Installation

Install from npm using your preferred package manager:

```sh
npm install @microblink/blinkid-core
# or
yarn add @microblink/blinkid-core
# or
pnpm add @microblink/blinkid-core
```

## Usage

You can use `@microblink/blinkid-core` directly in your project for custom integrations.

### Creating a Scanning Session

Use `createScanningSession` (available via the `BlinkIdCore` proxy) to start a session:

```javascript
import { loadBlinkIdCore } from "@microblink/blinkid-core";

const core = await loadBlinkIdCore({ licenseKey: "your-license-key", resourcesLocation: "/resources" });
const session = await core.createScanningSession();
```

You can also pass worker-side session options as the second argument. For
example, use `redactionSettingsResolver` to choose result redaction per
classified document:

```javascript
const session = await core.createScanningSession(
  {
    scanningMode: "automatic",
  },
  {
    redactionSettingsResolver: (documentClassInfo) => {
      if (
        documentClassInfo.country === "germany" &&
        documentClassInfo.type === "id"
      ) {
        return {
          mode: "full-result",
          fields: ["documentNumber"],
          documentNumberRedactionSettings: {
            prefixDigitsVisible: 0,
            suffixDigitsVisible: 4,
          },
          redactMrz: true,
          redactBarcode: false,
        };
      }

      // Return null to keep SDK default redaction settings.
      return null;
    },
  },
);
```

`redactionSettingsResolver` replaces the v7 session-level anonymization
settings (`scanningSettings.anonymizationMode` and
`scanningSettings.customDocumentAnonymizationSettings`). The resolver receives
the classified `DocumentClassInfo`; return `RedactionSettings` for custom
redaction or `null` / `undefined` to keep the SDK defaults. See the
[BlinkID v8000 migration guide](https://docs.microblink.com/blinkid/migration-v8000)
for the full migration.

See the example apps in the `apps/examples` directory in the GitHub repository for full usage details.

## Environment & Setup

- ESM-only: Use in browsers with a bundler (e.g., Vite) or via [`<script type="module">`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#applying_the_module_to_your_html).
- Can also be used via [esm.sh](https://esm.sh/) for direct HTTP imports.

### License key

A valid license key is required. Request a free trial at [Microblink Developer Hub](https://developer.microblink.com/register).

### Hosting resources

You must host the `dist/resources` directory from this package without modification. It contains:

- WebAssembly `.wasm` and `.data` files
- Emscripten JS glue code
- The `@microblink/blinkid-worker` Web Worker script

### Hosting requirements

- Must be served in a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts).
- For multithreaded builds, your site must be [cross-origin isolated](https://web.dev/articles/why-coop-coep):

  ```http
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
