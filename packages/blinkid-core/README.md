# @microblink/blinkid-core

This package provides the core BlinkID functionality for browser-based document scanning. It exposes a low-level API for initializing and controlling the BlinkID engine, managing sessions, and processing images. It can be used directly by end users for advanced or custom integrations, or as a dependency of higher-level packages such as [`@microblink/blinkid`](https://www.npmjs.com/package/@microblink/blinkid).

## Overview

- Provides the main API for BlinkID scanning and recognition in the browser.
- Handles initialization, licensing, and session management.
- Can be used directly by end users for advanced use cases.
- Used internally by [`@microblink/blinkid`](https://www.npmjs.com/package/@microblink/blinkid).

## Browser Support

This package supports image processing in these browser versions and newer:

- Chrome / Chromium 96 (desktop and Android)
- Edge 96
- Opera 84
- Firefox 114 (desktop and Android)
- Safari 16.4 (macOS)
- iOS Safari 16.4

These minimums come from the combination of Emscripten-generated WebAssembly,
required baseline Wasm features, and the module Web Worker used by
`@microblink/blinkid-core`. This package does not include camera capture or UX components.
If you use `@microblink/blinkid` or the UX manager package, see the browser support section in those packages instead.

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

const core = await loadBlinkIdCore({
  licenseKey: "your-license-key",
  resourcesLocation: "/resources",
});
const session = await core.createScanningSession();
```

### OTA Document Support Updates

BlinkID can download document-support resources over the air (OTA) during SDK
initialization. Every SDK build hosts baseline resources at:

```text
{resourcesLocation}/resources/ota-resources/
```

The directory contains the canonical files and `ota-resources.json`:

```jsonc
{
  "resources": [
    {
      "filename": "template-database.zzip",
      "version": "1.0.1",
      "url": "template-database.zzip",
    },
  ],
}
```

Set `otaResources.resourcesLocation` to override the baseline directory. By
default, BlinkID also asks `https://blinkid-ota.microblink.com` for updates and
uses a provider resource only when its semantic version is newer. Override that
service with `otaResources.otaResourceProviderUrl`.

The provider must expose:

```text
GET {otaResourceProviderUrl}/api/v1/versions?generic_version={recognizerVersion}
```

The SDK supplies `generic_version` from the BlinkID recognizer. The OTA
settings are separate from top-level `resourcesLocation`, which points to the
static SDK `resources` directory, and from `microblinkProxyUrl`, which proxies
licensing and analytics traffic. Provider failures use the hosted baseline by
default; `otaResources.strict: true` makes them fatal. A missing hosted baseline
is always fatal because OTA files are no longer embedded in
`BlinkIdModule.data`. Set `otaResources.checkForUpdates` to `false` to load the
hosted baseline without contacting the provider.

### Redaction Settings

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
        documentClassInfo.country?.id === "germany" &&
        documentClassInfo.type?.id === "id"
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

To get the specific document default redaction settings, use the second argument of redactionSettingsResolver

```javascript
const session = await core.createScanningSession(
  {
    scanningMode: "automatic",
  },
  {
    redactionSettingsResolver: async (
      documentClassInfo,
      getDefaultRedactionSettings,
    ) => {
      if (
        documentClassInfo.country?.id === "germany" &&
        documentClassInfo.type?.id === "id"
      ) {
        const defaults = await getDefaultRedactionSettings(documentClassInfo);

        return {
          mode: "full-result",
          fields: ["documentNumber"],
          documentNumberRedactionSettings: {
            prefixDigitsVisible: 0,
            suffixDigitsVisible: 4,
          },
          redactMrz: defaults.redactMrz,
          redactBarcode: defaults.redactBarcode,
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
redaction or `null` to keep the SDK defaults. The `country`, `region`, and
`type` fields are wrapper objects: `id` holds the strongly-typed value when the
document class is known at build time, while `rawValue` always carries the raw
classification token (including OTA-delivered classes without an `id`). See the
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
- Baseline OTA document-support resources under `ota-resources/`, including
  `ota-resources.json` and its canonical resource files

Do not omit the `ota-resources/` directory: BlinkID always loads this hosted
baseline before optionally checking the OTA provider for updates. To host the
baseline separately, set `otaResources.resourcesLocation` to its directory URL
and preserve the manifest-relative file paths.

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
