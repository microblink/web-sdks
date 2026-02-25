/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/// <reference types="@vitest/browser/providers/playwright" />
import { defineConfig } from "vitest/config";

export default defineConfig({
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
});
