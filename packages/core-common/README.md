# @microblink/core-common

Shared utilities and helpers used by BlinkID and BlinkCard core packages. It provides worker proxying, cross-origin worker URL resolution, device info, and build-variant detection.

## Overview

- Exports: `createProxyWorker`, `getCrossOriginWorkerURL`, `getUserId`, `shouldUseLightweightBuild`, `deviceInfo`.
- Used internally by `@microblink/blinkid-core`, `@microblink/blinkcard-core`, and related packages.
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
