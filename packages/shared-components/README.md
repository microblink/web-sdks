# @microblink/shared-components

Internal SolidJS-based UI components and utilities shared across BlinkID and BlinkCard browser SDK packages within this monorepo.

This package does not have a build step. Instead it only provides shared code which is directly consumed by other packages in their build step.

For more info see:

https://turborepo.com/docs/core-concepts/internal-packages#just-in-time-packages

## Consumption

This package is referenced in downstream `package.json` entries using:

• `"@microblink/shared-components": "workspace:*"`

All imports resolve through the monorepo’s workspace protocol.

## Development Guidelines

- Add new components under `src/` and export them in `src/index.ts` or via `package.json#exports`.
- Make sure that these components do not expose any APIs that would require this package to be a peer dependency for the end user consuming packages using `@microblink/shared-components`.
