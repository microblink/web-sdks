# @microblink/unocss-config

Shared [UnoCSS](https://unocss.dev/) configuration used by UI packages in the monorepo (for example `blinkid-ux-manager`, `blinkcard-ux-manager`, `camera-manager`, and `shared-components`).

## Overview

- Exports a single entry: `uno.config.ts`.
- Used as a dev dependency by packages that need UnoCSS styling.
- Private package; consumed via `workspace:*` within the monorepo.

## Features

### Horizontal breakpoints

Standard responsive breakpoints based on viewport width:

- `xs`: 380px
- `sm`: 640px (default from presetWind3)
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

Supported variants:

- `lt-{breakpoint}:` for max-width
- `at-{breakpoint}:` for exact range

### Vertical breakpoints

Height-based media query variants:

- `h-xs`: 400px
- `h-sm`: 640px
- `h-md`: 768px
- `h-lg`: 1024px
- `h-xl`: 1280px
- `h-2xl`: 1536px

Supported variants:

- `h-{size}:` for min-height
- `lt-h-{size}:` for max-height
- `at-h-{size}:` for exact range

### Orientation variants

- `portrait:`
- `landscape:`

### Viewport height utilities

Modern viewport unit helpers:

- `h-{num}dvh`, `h-{num}lvh`, `h-{num}svh`
- `min-h-{num}dvh/lvh/svh`
- `max-h-{num}dvh/lvh/svh`

## Development

This package has no build step. To update rules or presets, edit `uno.config.ts`.
