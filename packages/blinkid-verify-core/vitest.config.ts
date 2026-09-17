/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
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
});
