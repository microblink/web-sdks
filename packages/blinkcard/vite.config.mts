/// <reference types="vitest/config" />

import { getPackagePath, linkResources, getBrowserslistEsbuildTarget } from "@microblink/repo-utils";
import { defineConfig } from "vite";
import { fs, path } from "zx";

import { dependencies } from "./package.json" with { type: "json" };

const resourcesDir = path.resolve(import.meta.dirname, "public", "resources");

export default defineConfig((config) => ({
  build: {
    sourcemap: config.mode === "development",
    minify: config.mode === "production",
    target: getBrowserslistEsbuildTarget(),
    lib: {
      formats: ["es"],
      entry: "./src/index.ts",
      fileName: "blinkcard",
    },
  },
  plugins: [
    {
      name: "move-resources",
      buildStart: async () => {
        if (ranOnce) {
          return;
        }
        await moveBlinkCardResources();
        ranOnce = true;
      },
    },
  ],
  test: {
    environment: "happy-dom",
  },
}));

let ranOnce = false;
type Dependency = keyof typeof dependencies;

async function moveBlinkCardResources() {
  const packageName: Dependency = "@microblink/blinkcard-core";
  const pkgPath = getPackagePath(packageName);
  const distPath = path.join(pkgPath, "dist", "resources");
  const files = fs.readdirSync(distPath);

  fs.ensureDirSync(resourcesDir);

  for (const filePath of files) {
    await linkResources(path.join(distPath, filePath), path.join(resourcesDir, filePath));
  }
}
