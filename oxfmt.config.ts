/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { defineConfig } from "oxfmt";

export default defineConfig({
  insertFinalNewline: true,
  printWidth: 120,
  sortPackageJson: true,
  ignorePatterns: [
    ".changeset/**",
    "**/docs/**",
    "**/dist/**",
    "**/CHANGELOG.md",
    "LICENCE_NOTICE.md",
    "pnpm-lock.yaml",
    "localization.lock.json",
    "**/src/ui/locales/**",
    "**/node_modules",
  ],
  sortImports: true,
  overrides: [
    {
      files: ["apps/examples/*-headless/index.html"],
      options: { htmlWhitespaceSensitivity: "ignore" },
    },
  ],
});
