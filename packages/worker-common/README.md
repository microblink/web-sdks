# @microblink/worker-common

Shared utilities for Web Worker and Wasm-related logic used by BlinkID, BlinkCard, and BlinkID Verify worker and core packages. It provides resource path building, cross-origin worker URL handling, licensing helpers, Wasm feature detection, and error types.

## Overview

- Exports: `buildResourcePath`, `getCrossOriginWorkerURL`, `isSafari`, `licencing`, `mbToWasmPages`, `proxy-url-validator`, `wasm-feature-detect`, `errors`.
- Used internally by:
  - `@microblink/blinkid-worker`
  - `@microblink/blinkcard-worker`
  - `@microblink/blinkid-verify-worker`
- Private package; consumed via `workspace:*` within the monorepo.

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

3. Run tests:

   ```sh
   pnpm test
   ```

The output files will be available in the `dist/` and `types/` directories.
