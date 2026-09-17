/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { fileURLToPath } from "node:url";

import { playwright } from "@vitest/browser-playwright";
import UnoCSS from "unocss/vite";
import Icons from "unplugin-icons/vite";
import solidPlugin from "vite-plugin-solid";
import solidSvg from "vite-plugin-solid-svg";
import { defineConfig, type Plugin } from "vitest/config";

export default defineConfig({
  plugins: [
    UnoCSS({
      configFile: fileURLToPath(new URL("./uno.config.ts", import.meta.url)),
    }),
    solidPlugin(),
    Icons({
      compiler: "solid",
      collectionsNodeResolvePath: import.meta.dirname,
    }),
    solidSvg(),
  ] as unknown as Plugin[],
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
          // Doesn't work:
          // headless: false,
        },
      ],
    },
  },
});
