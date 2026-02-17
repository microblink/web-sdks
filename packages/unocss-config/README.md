# @microblink/unocss-config

Shared [UnoCSS](https://unocss.dev/) configuration used by UI packages in the monorepo (e.g. blinkid-ux-manager, blinkcard-ux-manager, camera-manager, shared-components). It provides a single source of truth for atomic CSS rules and presets.

## Overview

- Exports a single entry: `uno.config.ts`.
- Used as a dev dependency by packages that need UnoCSS styling.
- Private package; consumed via `workspace:*` within the monorepo.

## Development

This package has no build step. Consuming packages reference it in their UnoCSS config (e.g. `presets: [require('@microblink/unocss-config')]` or equivalent). To change rules or presets, edit `uno.config.ts` in this package.
