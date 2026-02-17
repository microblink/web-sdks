/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { path } from "zx";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: [path.resolve(__dirname, "vitest.setup.ts")],
  },
});
