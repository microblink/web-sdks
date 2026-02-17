# @microblink/analytics

Internal package for SDK analytics and telemetry. It provides services and ping types for collecting and sending analytics events (e.g. SDK init, scan events, camera info, errors) used by BlinkID and BlinkCard browser SDK packages.

## Overview

- Provides `AnalyticService` and ping types for SDK telemetry.
- Used internally by SDK packages; not published for direct consumer use.
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
