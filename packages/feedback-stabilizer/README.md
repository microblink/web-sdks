# @microblink/feedback-stabilizer

Stabilizes UI feedback state by averaging and debouncing state events before they are displayed. Used by UX managers to avoid flickering or noisy feedback during scanning.

## Overview

- Provides a feedback stabilizer that smooths transient state changes.
- Used internally by `@microblink/blinkid-ux-manager` and `@microblink/blinkcard-ux-manager` (and their example apps).
- Can be used directly for custom integrations that need stabilized feedback (consumed via `workspace:*` in the monorepo).

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
