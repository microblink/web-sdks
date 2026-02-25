/// <reference types="vitest/config" />
/// <reference types="@vitest/browser/providers/playwright" />

import UnoCSS from "unocss/vite";
import { defineConfig, type PluginOption } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import externalize from "vite-plugin-externalize-dependencies";
import solidPlugin from "vite-plugin-solid";
import solidSvg from "vite-plugin-solid-svg";

const externals = [
  /^solid-js/,
  /^@ark-ui/,
  "solid-zustand",
  "@microblink/camera-manager",
  "@microblink/blinkid-core",
];

export default defineConfig((config) => ({
  build: {
    sourcemap: config.mode === "development",
    minify: config.mode === "production",
    target: "es2022",
    lib: {
      formats: ["es"],
      entry: "./src/index.ts",
      fileName: "blinkid-ux-manager",
    },
    rollupOptions: {
      external: externals,
    },
  },
  test: {
    silent: true,
    browser: {
      enabled: true,
      provider: "playwright",
      screenshotFailures: false,
      headless: true,
      instances: [
        {
          browser: "chromium",
        },
      ],
    },
  },
  plugins: [
    collapseClassWhitespace(),
    UnoCSS({
      configFile: "./uno.config.ts",
      envMode: config.mode === "production" ? "build" : "dev",
    }),
    cssInjectedByJsPlugin({
      useStrictCSP: true,
      injectCodeFunction: (cssCode) => {
        window.__blinkidUxManagerCssCode! = cssCode;
      },
    }),
    externalize({
      externals: config.mode === "production" ? externals : [],
    }),
    solidPlugin(),
    solidSvg(),
  ] as PluginOption[],
}));

/**
 * Collapses whitespace in class attributes to ensure a clean DOM output
 * while maintaining multi-line readability in source code.
 *
 * TODO: Extract to utils after TS conversion PR
 */

function collapseClassWhitespace(): PluginOption {
  return {
    name: "collapse-class-whitespace",
    enforce: "pre",
    transform(code: string, id: string) {
      if (!/\.[jt]sx?$/.test(id)) return null;

      let result = code;
      // 1. Handle standard quoted strings (No nested logic, easy regex)
      result = result.replace(
        /\b(class(?:Name)?)\s*=\s*(["'])([\s\S]*?)\2/g,
        (match, attr, quote, content) => {
          return `${attr}=${quote}${content.replace(/\s+/g, " ").trim()}${quote}`;
        },
      );

      // 2. Handle braced expressions class={...} or classList={...}
      // We search for the start and then balance the braces
      const bracedAttrRegex = /\b(class(?:Name|List)?)\s*=\s*\{/g;
      let match;

      // We work backwards or carefully to avoid index shifts,
      // but simple string replacement is fine if we are precise.
      while ((match = bracedAttrRegex.exec(result)) !== null) {
        const startIdx = match.index;
        const attrName = match[1];
        const openingBraceIdx = startIdx + match[0].length - 1;

        // Find matching closing brace
        let depth = 1;
        let endIdx = -1;
        for (let i = openingBraceIdx + 1; i < result.length; i++) {
          if (result[i] === "{") depth++;
          if (result[i] === "}") depth--;
          if (depth === 0) {
            endIdx = i;
            break;
          }
        }

        if (endIdx !== -1) {
          const rawContent = result.slice(openingBraceIdx + 1, endIdx);

          // Collapse whitespace but PROTECT interpolations ${...}
          const parts = rawContent.split(/(\$\{[\s\S]*?\})/g);
          const cleanedContent = parts
            .map((part, i) => (i % 2 === 0 ? part.replace(/\s+/g, " ") : part))
            .join("");

          const before = result.slice(0, startIdx);
          const after = result.slice(endIdx + 1);
          const replacement = `${attrName}={${cleanedContent.trim()}}`;

          result = before + replacement + after;

          // Adjust regex index to account for string length change
          bracedAttrRegex.lastIndex = before.length + replacement.length;
        }
      }

      return {
        code: result,
        map: null,
      };
    },
  };
}

declare global {
  interface Window {
    __blinkidUxManagerCssCode?: string;
  }
}
