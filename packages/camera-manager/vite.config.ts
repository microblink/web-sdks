/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import UnoCSS from "unocss/vite";
import Icons from "unplugin-icons/vite";
import { defineConfig, PluginOption } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import solidPlugin from "vite-plugin-solid";
import solidSvg from "vite-plugin-solid-svg";
import externalize from "vite-plugin-externalize-dependencies";

// we need to externalize these deps because they share state between packages!
const externals = [/^solid-js/, /^@ark-ui/, /^zustand/, "solid-zustand"];

export default defineConfig((config) => {
  return {
    build: {
      sourcemap: config.mode === "development",
      minify: config.mode === "production",
      target: "es2022",
      lib: {
        formats: ["es"],
        entry: "./src/index.ts",
        fileName: "camera-manager",
      },
      rollupOptions: {
        external: externals,
      },
    },

    plugins: [
      UnoCSS({
        configFile: "./uno.config.ts",
        envMode: config.mode === "production" ? "build" : "dev",
      }),
      cssInjectedByJsPlugin({
        injectCodeFunction: (cssCode) => {
          window.__mbCameraManagerCssCode! = cssCode;
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
