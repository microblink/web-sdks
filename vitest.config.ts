/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { defineConfig, type TestProjectConfiguration } from "vitest/config";

const exclude = ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/repo/**"];
const hookTimeout = 30_000;

function project(name: string, root: string, configFile?: string): TestProjectConfiguration {
  return {
    ...(configFile ? { extends: `${root}/${configFile}` } : {}),
    root,
    test: {
      hookTimeout,
      name,
      exclude,
    },
  };
}

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: [
        "packages/*/src/**/*.{js,jsx,ts,tsx,mjs,mts,cjs,cts}",
        "packages/*/scripts/**/*.{js,jsx,ts,tsx,mjs,mts,cjs,cts}",
        "packages/utils/*/src/**/*.{js,jsx,ts,tsx,mjs,mts,cjs,cts}",
        "packages/repo-utils/*.{js,ts,mjs,mts,cjs,cts}",
      ],
      exclude: ["**/*.d.ts"],
      reporter: ["text", "html", "json-summary"],
    },
    hookTimeout,
    passWithNoTests: true,
    projects: [
      project("@microblink/analytics", "packages/analytics", "vitest.config.ts"),
      project("@microblink/blinkcard", "packages/blinkcard", "vite.config.mts"),
      project("@microblink/blinkcard-core", "packages/blinkcard-core", "vite.config.mts"),
      project("@microblink/blinkcard-ux-manager", "packages/blinkcard-ux-manager", "vite.config.mts"),
      project("@microblink/blinkcard-worker", "packages/blinkcard-worker", "vite.config.mts"),
      project("@microblink/blinkid", "packages/blinkid", "vite.config.mts"),
      project("@microblink/blinkid-core", "packages/blinkid-core", "vitest.config.ts"),
      project("@microblink/blinkid-ux-manager", "packages/blinkid-ux-manager", "vite.config.mts"),
      project("@microblink/blinkid-verify", "packages/blinkid-verify", "vite.config.mts"),
      project("@microblink/blinkid-verify-ux-manager", "packages/blinkid-verify-ux-manager", "vite.config.mts"),
      project("@microblink/blinkid-verify-wasm", "packages/blinkid-verify-wasm", "vite.config.mts"),
      project("@microblink/blinkid-worker", "packages/blinkid-worker", "vite.config.mts"),
      project("@microblink/camera-manager", "packages/camera-manager", "vitest.config.ts"),
      project("@microblink/core-common", "packages/core-common", "vitest.config.ts"),
      project("@microblink/feedback-stabilizer", "packages/feedback-stabilizer", "vitest.config.ts"),
      project("@microblink/repo-utils", "packages/repo-utils", "vitest.config.mts"),
      project("@microblink/ux-common", "packages/ux-common", "vitest.config.ts"),
      project("@microblink/wasm-common", "packages/wasm-common"),
      project("@microblink/worker-common", "packages/worker-common", "vitest.config.ts"),
    ],
  },
});
