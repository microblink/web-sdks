/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import {
  defineConfig,
  presetWind3,
  transformerDirectives,
  type PresetUnoTheme,
} from "unocss";
import {
  addScaleMultiplier,
  createSpacingRules,
  createVerticalRules,
  sizeObject,
} from "./src/rules/index.ts";

export default defineConfig({
  presets: [presetWind3()],
  rules: [...createSpacingRules(), ...createVerticalRules()],
  autocomplete: {
    templates: [
      "h-(xs|sm|md|lg|xl|2xl):",
      "lt-h-(xs|sm|md|lg|xl|2xl):",
      "at-h-(xs|sm|md|lg|xl|2xl):",
      "compact:",
      "portrait:",
      "landscape:",
    ],
  },
  extendTheme: (theme: PresetUnoTheme) => {
    return {
      ...theme,
      breakpoints: {
        xs: "380px",
        ...theme.breakpoints,
      },
      verticalBreakpoints: {
        "h-xs": "400px",
        "h-sm": "640px",
        "h-md": "768px",
        "h-lg": "1024px",
        "h-xl": "1280px",
        "h-2xl": "1536px",
      },
    };
  },
  variants: [
    // Compact modal guard:
    // short viewport + minimum width, to avoid narrow two-column collapse.
    (matcher) => {
      const match = matcher.match(/^compact:(.+)$/);
      if (!match) return matcher;

      const [, rest] = match;
      return {
        matcher: rest,
        parent: "@media (max-height: 639.9px) and (min-width: 380px)",
      };
    },
    // Vertical breakpoints - min-height based
    (matcher) => {
      const match = matcher.match(/^h-(xs|sm|md|lg|xl|2xl):(.+)$/);
      if (!match) return matcher;

      const [, size, rest] = match;
      const heights = {
        xs: "400px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      };

      return {
        matcher: rest,
        parent: `@media (min-height: ${heights[size as keyof typeof heights]})`,
      };
    },
    // Vertical breakpoints - max-height based (less than)
    (matcher) => {
      const match = matcher.match(/^lt-h-(xs|sm|md|lg|xl|2xl):(.+)$/);
      if (!match) return matcher;

      const [, size, rest] = match;
      const heights = {
        xs: "400px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      };

      // Subtract 0.1px for max-height to avoid overlap
      const height = parseFloat(heights[size as keyof typeof heights]);
      return {
        matcher: rest,
        parent: `@media (max-height: ${height - 0.1}px)`,
      };
    },
    // Vertical breakpoints - exact height (at)
    (matcher) => {
      const match = matcher.match(/^at-h-(xs|sm|md|lg|xl|2xl):(.+)$/);
      if (!match) return matcher;

      const [, size, rest] = match;
      const heights = {
        xs: "400px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      };

      const nextSizes = {
        xs: "sm",
        sm: "md",
        md: "lg",
        lg: "xl",
        xl: "2xl",
        "2xl": null,
      };

      const currentHeight = parseFloat(heights[size as keyof typeof heights]);
      const nextSize = nextSizes[size as keyof typeof nextSizes];
      const maxHeight = nextSize
        ? parseFloat(heights[nextSize as keyof typeof heights]) - 0.1
        : 999999;

      return {
        matcher: rest,
        parent: `@media (min-height: ${currentHeight}px) and (max-height: ${maxHeight}px)`,
      };
    },
    // Orientation variants
    (matcher) => {
      if (matcher.startsWith("portrait:")) {
        return {
          matcher: matcher.slice(9),
          parent: "@media (orientation: portrait)",
        };
      }
      if (matcher.startsWith("landscape:")) {
        return {
          matcher: matcher.slice(10),
          parent: "@media (orientation: landscape)",
        };
      }
      return matcher;
    },
  ],
  shortcuts: {
    // dialog buttons
    btn: "px-6 py-1 text-sm text-nowrap rounded-10 border-none transition-colors transition-duration-100 appearance-none h-[2.5rem] btn-disabled btn-focus truncate",
    "btn-focus":
      "focus-visible:enabled:outline focus-visible:enabled:outline-2px focus-visible:enabled:outline-solid focus-visible:enabled:outline-primary focus-visible:enabled:outline-offset-4px",
    "btn-disabled": "disabled:cursor-not-allowed",

    "btn-primary":
      "bg-primary text-white hover:enabled:bg-accent-700 active:enabled:bg-accent-800 disabled:bg-gray-300 disabled:text-gray-500",
    "btn-secondary":
      "bg-transparent text-primary ring-primary ring-1 hover:enabled:bg-accent-25 hover:enabled:ring-accent-700 hover:enabled:text-accent-700 active:enabled:ring-accent-800 active:enabled:text-accent-800 active:enabled:bg-accent-50 disabled:text-gray-400 disabled:ring-gray-400",

    // dialog copy — requires a fluid base font-size on a Modal ancestor
    // (currently calc(0.875rem + 0.125rem * var(--modal-t)) → 14px–16px).
    // --modal-t is a 0→1 progress variable set by ResizeObserver.
    // All sizes are em-relative to that base.
    "dialog-title":
      "text-[1.5em] leading-[calc(1em+0.5rem)] font-bold text-center text-pretty text-gray-700",
    "dialog-description":
      "text-[1em] leading-[calc(1em+0.5rem)] text-gray-500 text-center text-pretty mt-[1em]",
  },
  theme: {
    spacing: sizeObject,
    // would be nice if there was a single property to define all sizing,
    // like spacing, but for now we have to define each property separately
    blockSize: sizeObject,
    inlineSize: sizeObject,
    width: sizeObject,
    height: sizeObject,
    minWidth: sizeObject,
    minHeight: sizeObject,
    // TODO: see why max-width is not working
    maxWidth: sizeObject,
    maxHeight: sizeObject,
    borderRadius: sizeObject,
    // prettier-ignore
    fontSize: {
      ...sizeObject,
      'xs':   [addScaleMultiplier('0.75', "rem"),   addScaleMultiplier('1', "rem")],
      'sm':   [addScaleMultiplier('0.875', "rem"),  addScaleMultiplier('1.25', "rem")],
      'base': [addScaleMultiplier('1', "rem"),      addScaleMultiplier('1.5', "rem")],
      'lg':   [addScaleMultiplier('1.125', "rem"),  addScaleMultiplier('1.75', "rem")],
      'xl':   [addScaleMultiplier('1.25', "rem"),   addScaleMultiplier('1.75', "rem")],
      '2xl':  [addScaleMultiplier('1.5', "rem"),    addScaleMultiplier('2', "rem")],
      '3xl':  [addScaleMultiplier('1.875', "rem"),  addScaleMultiplier('2.25', "rem")],
      '4xl':  [addScaleMultiplier('2.25', "rem"),   addScaleMultiplier('2.5', "rem")],
      '5xl':  [addScaleMultiplier('3', "rem"),      addScaleMultiplier('1')],
      '6xl':  [addScaleMultiplier('3.75', "rem"),   addScaleMultiplier('1')],
      '7xl':  [addScaleMultiplier('4.5', "rem"),    addScaleMultiplier('1')],
      '8xl':  [addScaleMultiplier('6', "rem"),      addScaleMultiplier('1')],
      '9xl':  [addScaleMultiplier('8', "rem"),      addScaleMultiplier('1')],
    },
    colors: {
      black: "rgb(var(--color-black-rgb-value) / <alpha-value>)",
      white: "rgb(var(--color-white-rgb-value) / <alpha-value>)",
      primary: "rgb(var(--color-primary) / <alpha-value>)",
      accent: {
        "25": "rgb(var(--color-accent-25-rgb-value) / <alpha-value>)",
        "50": "rgb(var(--color-accent-50-rgb-value) / <alpha-value>)",
        "100": "rgb(var(--color-accent-100-rgb-value) / <alpha-value>)",
        "200": "rgb(var(--color-accent-200-rgb-value) / <alpha-value>)",
        "300": "rgb(var(--color-accent-300-rgb-value) / <alpha-value>)",
        "400": "rgb(var(--color-accent-400-rgb-value) / <alpha-value>)",
        "500": "rgb(var(--color-accent-500-rgb-value) / <alpha-value>)",
        "600": "rgb(var(--color-accent-600-rgb-value) / <alpha-value>)",
        "700": "rgb(var(--color-accent-700-rgb-value) / <alpha-value>)",
        "800": "rgb(var(--color-accent-800-rgb-value) / <alpha-value>)",
        "900": "rgb(var(--color-accent-900-rgb-value) / <alpha-value>)",
      },
      error: {
        "25": "rgb(var(--color-error-25-rgb-value) / <alpha-value>)",
        "50": "rgb(var(--color-error-50-rgb-value) / <alpha-value>)",
        "100": "rgb(var(--color-error-100-rgb-value) / <alpha-value>)",
        "200": "rgb(var(--color-error-200-rgb-value) / <alpha-value>)",
        "300": "rgb(var(--color-error-300-rgb-value) / <alpha-value>)",
        "400": "rgb(var(--color-error-400-rgb-value) / <alpha-value>)",
        "500": "rgb(var(--color-error-500-rgb-value) / <alpha-value>)",
        "600": "rgb(var(--color-error-600-rgb-value) / <alpha-value>)",
        "700": "rgb(var(--color-error-700-rgb-value) / <alpha-value>)",
        "800": "rgb(var(--color-error-800-rgb-value) / <alpha-value>)",
        "900": "rgb(var(--color-error-900-rgb-value) / <alpha-value>)",
      },
      success: {
        "25": "rgb(var(--color-success-25-rgb-value) / <alpha-value>)",
        "50": "rgb(var(--color-success-50-rgb-value) / <alpha-value>)",
        "100": "rgb(var(--color-success-100-rgb-value) / <alpha-value>)",
        "200": "rgb(var(--color-success-200-rgb-value) / <alpha-value>)",
        "300": "rgb(var(--color-success-300-rgb-value) / <alpha-value>)",
        "400": "rgb(var(--color-success-400-rgb-value) / <alpha-value>)",
        "500": "rgb(var(--color-success-500-rgb-value) / <alpha-value>)",
        "600": "rgb(var(--color-success-600-rgb-value) / <alpha-value>)",
        "700": "rgb(var(--color-success-700-rgb-value) / <alpha-value>)",
        "800": "rgb(var(--color-success-800-rgb-value) / <alpha-value>)",
        "900": "rgb(var(--color-success-900-rgb-value) / <alpha-value>)",
      },
      warning: {
        "25": "rgb(var(--color-warning-25-rgb-value) / <alpha-value>)",
        "50": "rgb(var(--color-warning-50-rgb-value) / <alpha-value>)",
        "100": "rgb(var(--color-warning-100-rgb-value) / <alpha-value>)",
        "200": "rgb(var(--color-warning-200-rgb-value) / <alpha-value>)",
        "300": "rgb(var(--color-warning-300-rgb-value) / <alpha-value>)",
        "400": "rgb(var(--color-warning-400-rgb-value) / <alpha-value>)",
        "500": "rgb(var(--color-warning-500-rgb-value) / <alpha-value>)",
        "600": "rgb(var(--color-warning-600-rgb-value) / <alpha-value>)",
        "700": "rgb(var(--color-warning-700-rgb-value) / <alpha-value>)",
        "800": "rgb(var(--color-warning-800-rgb-value) / <alpha-value>)",
        "900": "rgb(var(--color-warning-900-rgb-value) / <alpha-value>)",
      },
      "deep-blue": {
        "25": "rgb(var(-color-deep-blue-25-rgb-value) / <alpha-value>)",
        "50": "rgb(var(-color-deep-blue-50-rgb-value) / <alpha-value>)",
        "100": "rgb(var(-color-deep-blue-100-rgb-value) / <alpha-value>)",
        "200": "rgb(var(-color-deep-blue-200-rgb-value) / <alpha-value>)",
        "300": "rgb(var(-color-deep-blue-300-rgb-value) / <alpha-value>)",
        "400": "rgb(var(-color-deep-blue-400-rgb-value) / <alpha-value>)",
        "500": "rgb(var(-color-deep-blue-500-rgb-value) / <alpha-value>)",
        "600": "rgb(var(-color-deep-blue-600-rgb-value) / <alpha-value>)",
        "700": "rgb(var(-color-deep-blue-700-rgb-value) / <alpha-value>)",
        "800": "rgb(var(-color-deep-blue-800-rgb-value) / <alpha-value>)",
        "900": "rgb(var(-color-deep-blue-900-rgb-value) / <alpha-value>)",
      },
      "light-blue": {
        "25": "rgb(var(-color-light-blue-25-rgb-value) / <alpha-value>)",
        "50": "rgb(var(-color-light-blue-50-rgb-value) / <alpha-value>)",
        "100": "rgb(var(-color-light-blue-100-rgb-value) / <alpha-value>)",
        "200": "rgb(var(-color-light-blue-200-rgb-value) / <alpha-value>)",
        "300": "rgb(var(-color-light-blue-300-rgb-value) / <alpha-value>)",
        "400": "rgb(var(-color-light-blue-400-rgb-value) / <alpha-value>)",
        "500": "rgb(var(-color-light-blue-500-rgb-value) / <alpha-value>)",
        "600": "rgb(var(-color-light-blue-600-rgb-value) / <alpha-value>)",
        "700": "rgb(var(-color-light-blue-700-rgb-value) / <alpha-value>)",
        "800": "rgb(var(-color-light-blue-800-rgb-value) / <alpha-value>)",
        "900": "rgb(var(-color-light-blue-900-rgb-value) / <alpha-value>)",
      },
      gray: {
        "50": "rgb(var(--color-gray-50-rgb-value) / <alpha-value>)",
        "100": "rgb(var(--color-gray-100-rgb-value) / <alpha-value>)",
        "200": "rgb(var(--color-gray-200-rgb-value) / <alpha-value>)",
        "300": "rgb(var(--color-gray-300-rgb-value) / <alpha-value>)",
        "400": "rgb(var(--color-gray-400-rgb-value) / <alpha-value>)",
        "500": "rgb(var(--color-gray-500-rgb-value) / <alpha-value>)",
        "550": "rgb(var(--color-gray-550-rgb-value) / <alpha-value>)",
        "600": "rgb(var(--color-gray-600-rgb-value) / <alpha-value>)",
        "700": "rgb(var(--color-gray-700-rgb-value) / <alpha-value>)",
        "800": "rgb(var(--color-gray-800-rgb-value) / <alpha-value>)",
        "900": "rgb(var(--color-gray-900-rgb-value) / <alpha-value>)",
        "950": "rgb(var(--color-gray-950-rgb-value) / <alpha-value>)",
      },
      "blue-gray": {
        "50": "rgb(var(--color-dark-50-rgb-value) / <alpha-value>)",
        "100": "rgb(var(--color-dark-100-rgb-value) / <alpha-value>)",
        "200": "rgb(var(--color-dark-200-rgb-value) / <alpha-value>)",
        "300": "rgb(var(--color-dark-300-rgb-value) / <alpha-value>)",
        "400": "rgb(var(--color-dark-400-rgb-value) / <alpha-value>)",
        "500": "rgb(var(--color-dark-500-rgb-value) / <alpha-value>)",
        "600": "rgb(var(--color-dark-600-rgb-value) / <alpha-value>)",
        "700": "rgb(var(--color-dark-700-rgb-value) / <alpha-value>)",
        "800": "rgb(var(--color-dark-800-rgb-value) / <alpha-value>)",
        "900": "rgb(var(--color-dark-900-rgb-value) / <alpha-value>)",
        "950": "rgb(var(--color-dark-950-rgb-value) / <alpha-value>)",
      },
    },
  },
  transformers: [transformerDirectives()],
});
