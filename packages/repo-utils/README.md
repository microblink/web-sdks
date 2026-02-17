# @microblink/repo-utils

Development and build-time utilities for the monorepo. It provides scripts and helpers (e.g. path resolution, workspace helpers) used by build scripts and tooling, not by published SDK runtime code.

## Overview

- Provides `utils.mts` for dev/build scripts.
- Used by example apps and internal tooling via `workspace:*`.
- Private package; not published for direct consumer use.

## Development

This package is consumed as a dev dependency. Run tests from the monorepo root or from this directory:

```sh
pnpm test
```
