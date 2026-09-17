/// <reference types="vitest/config" />

import { fileURLToPath } from "node:url";

import { getBrowserslistEsbuildTarget } from "@microblink/repo-utils";
import { playwright } from "@vitest/browser-playwright";
import UnoCSS from "unocss/vite";
import { defineConfig, PluginOption } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import externalize from "vite-plugin-externalize-dependencies";
import solidPlugin from "vite-plugin-solid";
import solidSvg from "vite-plugin-solid-svg";

// we need to externalize these deps because they share state between packages!
const externals = [
  /^solid-js/,
  /^@ark-ui/,
  /^@solid-primitives\/keyed/,
  "solid-zustand",
  /^@microblink\/camera-manager(?:\/|$)/,
  "@microblink/blinkid-verify-core",
];

const uiEntry = fileURLToPath(new URL("./src/ui.ts", import.meta.url));

export default defineConfig((config) => {
  return {
    build: {
      sourcemap: config.mode === "development",
      minify: config.mode === "production",
      // One build serves every entry, so transpile for the lowest baseline any of them declares.
      target: getBrowserslistEsbuildTarget({
        environments: ["core", "ui"],
        packageRoot: fileURLToPath(new URL(".", import.meta.url)),
      }),
      lib: {
        formats: ["es"],
        // Modules shared by several entries land in `chunks/`, so each module exists exactly once and `/core`
        // consumers never load UI code.
        entry: {
          "blinkid-verify-ux-manager": "./src/index.ts",
          core: "./src/core.ts",
          ui: "./src/ui.ts",
        },
        fileName: (_format, entryName) => `${entryName}.js`,
      },
      rollupOptions: {
        external: externals,
        output: {
          chunkFileNames: "chunks/[name]-[hash].js",
        },
      },
    },
    test: {
      silent: true,
      browser: {
        enabled: true,
        provider: playwright(),
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
      UnoCSS({
        configFile: fileURLToPath(new URL("./uno.config.ts", import.meta.url)),
        envMode: config.mode === "production" ? "build" : "dev",
      }),
      cssInjectedByJsPlugin({
        useStrictCSP: true,
        // Inject styles into the chunk that carries the UI entry code so both `/ui` and root consumers load it.
        jsAssetsFilterFunction: (outputChunk) => outputChunk.moduleIds.includes(uiEntry),
        injectCodeFunction: (cssCode) => {
          window.__blinkidVerifyUxManagerCssCode! = cssCode;
        },
      }),
      // `vite-plugin-externalize-dependencies` only works with `vite dev`
      externalize({
        // vitest fails otherwise
        externals: config.mode === "production" ? externals : [],
      }),
      solidPlugin(),
      solidSvg(),
    ] as PluginOption[],
  };
});

declare global {
  interface Window {
    __blinkidVerifyUxManagerCssCode?: string;
  }
}
