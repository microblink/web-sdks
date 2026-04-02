import { defineConfig } from "vitest/config";
import path from "path";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  publicDir: path.resolve(__dirname, "dist/advanced"),
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
