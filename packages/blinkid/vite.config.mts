/// <reference types="vitest/config" />

import { getPackagePath, linkResources } from "@microblink/repo-utils";
import { defineConfig } from "vite";
import { dependencies } from "./package.json";
import { fs, path } from "zx";

export default defineConfig((config) => ({
  build: {
    sourcemap: config.mode === "development",
    minify: config.mode === "production",
    target: "es2022",
    lib: {
      formats: ["es"],
      entry: "./src/index.ts",
      fileName: "blinkid",
    },
  },
  test: {
    environment: "happy-dom",
  },
  plugins: [
    {
      name: "move-resources",
      buildStart: async () => {
        if (ranOnce) {
          return;
        }
        await moveBlinkIdResources();
        ranOnce = true;
      },
    },
  ],
}));

let ranOnce = false;
type Dependency = keyof typeof dependencies;

async function moveBlinkIdResources() {
  if (process.env.VITEST === "true") {
    return;
  }

  const packageName: Dependency = "@microblink/blinkid-core";
  const pkgPath = getPackagePath(packageName);
  if (!pkgPath) {
    // Skip when running from project root (e.g., during vitest workspace initialization)
    // The resources will be moved during actual builds from the package directory
    return;
  }
  const distPath = path.join(pkgPath, "dist", "resources");

  if (!fs.pathExistsSync(distPath)) {
    // Skip if dist doesn't exist yet (e.g., package not built)
    return;
  }

  const files = fs.readdirSync(distPath);

  fs.ensureDirSync(`public/resources`);

  for (const filePath of files) {
    await linkResources(
      path.join(distPath, filePath),
      path.join("public/resources", filePath),
    );
  }
}
