import { getBrowserslistEsbuildTarget } from "@microblink/repo-utils";
import { defineConfig } from "vite";

export default defineConfig((config) => ({
  build: {
    sourcemap: config.mode === "development",
    minify: config.mode === "production",
    target: getBrowserslistEsbuildTarget(),
    lib: {
      formats: ["es"],
      entry: "./src/index.ts",
      fileName: "biometrics",
    },
    rollupOptions: {
      external: [
        "@microblink/biometrics-core",
        /^@microblink\/biometrics-ux-manager(?:\/|$)/,
        /^@microblink\/camera-manager(?:\/|$)/,
      ],
    },
  },
}));
