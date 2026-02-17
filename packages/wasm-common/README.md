# @microblink/wasm-common

Shared WebAssembly (Wasm) types and build configuration used by the BlinkID and BlinkCard Wasm packages in this monorepo. It ensures a consistent setup for building the Wasm modules used by the browser SDKs.

## Overview

- Provides common types and build configuration for Wasm-based packages.
- Used internally by `@microblink/blinkid-wasm` and `@microblink/blinkcard-wasm`.
- Private package; consumed via `workspace:*` within the monorepo.

## Development

From the monorepo root:

```sh
pnpm install
pnpm build
```
