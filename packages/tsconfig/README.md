# @microblink/tsconfig

Shared TypeScript configuration for the monorepo. Other packages extend this base config to keep compiler options consistent across BlinkID, BlinkCard, and supporting packages.

## Overview

- Provides base `tsconfig` (e.g. `base.json`) for use via `extends`.
- Private package; consumed via `workspace:*` in other packages' `devDependencies`.

## Development

No build step. To change compiler options or paths, edit the JSON config in this package; dependent packages will pick up changes on next build.
