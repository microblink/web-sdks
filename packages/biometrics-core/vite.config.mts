import { getBrowserslistEsbuildTarget, removeModuleRegions } from "@microblink/repo-utils";
import { copyPackageResources } from "@microblink/repo-utils/vite/copyPackageResources.mts";
import { defineConfig } from "vite";
import { path } from "zx";

const resourcesDir = path.resolve(__dirname, "public", "resources");

export default defineConfig((config) => ({
  build: {
    sourcemap: config.mode === "development",
    minify: config.mode === "production",
    target: getBrowserslistEsbuildTarget(),
    lib: {
      formats: ["es"],
      entry: "./src/index.ts",
      fileName: "biometrics-core",
    },
  },
  plugins: [
    removeModuleRegions(),
    copyPackageResources({
      destination: resourcesDir,
      packages: [{ packageName: "@microblink/biometrics-worker" }],
    }),
  ],
}));
