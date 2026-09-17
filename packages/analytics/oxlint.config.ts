/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { defineConfig } from "oxlint";

import rootConfig from "../../oxlint.config.ts";

export default defineConfig({
  extends: [rootConfig],
  overrides: [
    {
      files: ["src/ping/ping.base.ts"],
      rules: {
        "typescript/ban-types": "off",
      },
    },
  ],
});
