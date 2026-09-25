/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { defineConfig } from "vitest/config";
import { path } from "zx";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: [path.resolve(import.meta.dirname, "vitest.setup.ts")],
  },
});
