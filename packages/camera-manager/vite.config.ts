/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { fileURLToPath } from "node:url";

import { collapseClassWhitespace, getBrowserslistEsbuildTarget } from "@microblink/repo-utils";
import UnoCSS from "unocss/vite";
import Icons from "unplugin-icons/vite";
import { defineConfig, PluginOption } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import externalize from "vite-plugin-externalize-dependencies";
import solidPlugin from "vite-plugin-solid";
import solidSvg from "vite-plugin-solid-svg";

// we need to externalize these deps because they share state between packages!
const externals = [/^solid-js/, /^@ark-ui/, "@solid-primitives/keyed", /^zustand/, "solid-zustand"];

const uiEntry = fileURLToPath(new URL("./src/ui.ts", import.meta.url));

export default defineConfig((config) => {
  return {
    build: {
      sourcemap: config.mode === "development",
      minify: config.mode === "production",
      // One build serves every entry, so transpile for the lowest baseline any of them declares.
      target: getBrowserslistEsbuildTarget({ environments: ["core", "ui"] }),
      lib: {
        formats: ["es"],
        // Modules shared by several entries land in `chunks/`, so each module exists exactly once and `/core`
        // consumers never load UI code.
        entry: {
          "camera-manager": "./src/index.ts",
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

    plugins: [
      collapseClassWhitespace(),
      UnoCSS({
        configFile: fileURLToPath(new URL("./uno.config.ts", import.meta.url)),
        envMode: config.mode === "production" ? "build" : "dev",
      }),
      cssInjectedByJsPlugin({
        // Inject styles into the chunk that carries the UI entry code so both `/ui` and root consumers load it.
        jsAssetsFilterFunction: (outputChunk) => outputChunk.moduleIds.includes(uiEntry),
        injectCodeFunction: (cssCode) => {
          window.__mbCameraManagerCssCode = cssCode;
        },
      }),
      // `vite-plugin-externalize-dependencies` only works with `vite dev`
      externalize({
        // vitest fails otherwise
        externals: config.mode === "production" ? externals : [],
      }),
      solidPlugin(),
      Icons({ compiler: "solid" }),
      solidSvg(),
    ] as PluginOption[],
  };
});

declare global {
  interface Window {
    __mbCameraManagerCssCode?: string;
  }
}
