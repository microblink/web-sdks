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

## OTA Document Support Updates

The worker loads BlinkID document-support resources during initialization.
Every SDK build hosts a baseline under `resources/ota-resources/`, separate from
`BlinkIdModule.data`.

The hosted directory contains `ota-resources.json` and the canonical files:

```jsonc
{
  "resources": [
    {
      "filename": "knowledge-database.zzip",
      "version": "2.0.1",
      "url": "knowledge-database.zzip",
    },
  ],
}
```

Applications can override the hosted baseline and provider URLs:

```ts
const initSettings = {
  licenseKey: "your-license-key",
  otaResources: {
    resourcesLocation: "https://cdn.example.com/blinkid-ota",
    otaResourceProviderUrl: "https://your-proxy.example.com/blinkid-ota",
  },
};
```

The provider URL can point to Microblink's OTA resource provider or to a proxy
service owned by your application. A proxy service is useful when you need to
route OTA traffic through your own domain, network policy, or CORS
configuration.

The provider or proxy must expose the OTA versions endpoint:

```text
GET {otaResourceProviderUrl}/api/v1/versions?generic_version={recognizerVersion}
```

The worker obtains `generic_version` from the BlinkID recognizer and selects a
provider resource only when it is newer than the hosted version. It writes the
selected files under `/microblink/blinkid-ota` before SDK initialization.
Provider failures fall back to the hosted file unless `strict: true` is set.
Hosted baseline failures are always fatal. Set `checkForUpdates: false` to skip
the provider check while still loading the hosted baseline.

The OTA provider URL is separate from `microblinkProxyUrl`, which is used for
Microblink license and analytics proxying.

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
