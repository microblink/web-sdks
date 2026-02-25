# @microblink/ux-common

Shared UX utilities used by BlinkID and BlinkCard UX manager packages. It provides haptic feedback helpers and common utils for user experience logic.

## Overview

- Exports: `hapticFeedback`, `utils`, `cameraAnalyticsMappers`, `RafLoop`.
- Used internally by `@microblink/blinkid-ux-manager` and `@microblink/blinkcard-ux-manager`.
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
