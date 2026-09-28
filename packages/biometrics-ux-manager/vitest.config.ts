/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { fileURLToPath } from "node:url";

import { playwright } from "@vitest/browser-playwright";
import UnoCSS from "unocss/vite";
import solidPlugin from "vite-plugin-solid";
import solidSvg from "vite-plugin-solid-svg";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    UnoCSS({
      configFile: fileURLToPath(new URL("./uno.config.ts", import.meta.url)),
      content: {
        filesystem: ["src/**/*.{ts,tsx}"],
      },
    }),
    solidPlugin(),
    solidSvg(),
  ],
  optimizeDeps: {
    include: [
      "@microblink/camera-manager > solid-zustand",
      "@microblink/camera-manager > zustand/middleware",
      "@microblink/camera-manager > zustand/shallow",
      "@microblink/camera-manager > zustand/vanilla",
    ],
  },
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      commands: {
        ariaSnapshot: ({ iframe }, selector: string) => iframe.locator(selector).ariaSnapshot(),
      },
      screenshotFailures: false,
      headless: true,
      instances: [{ browser: "chromium" }],
    },
    server: {
      deps: {
        inline: [/@ark-ui/],
      },
    },
  },
});
