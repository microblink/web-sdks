import path from "path";

import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  publicDir: path.resolve(import.meta.dirname, "dist/simd"),
  test: {
    browser: {
      provider: playwright(),
      enabled: true,
      headless: true,
      trace: {
        mode: "off",
        screenshots: false,
      },
      screenshotFailures: false,
      instances: [
        {
          browser: "chromium",
        },
      ],
    },
    setupFiles: ["./vitest.setup.mts"],
  },
});
