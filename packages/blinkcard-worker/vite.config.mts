import { defineConfig } from "vite";
import "zx/globals";

export default defineConfig((config) => {
  return {
    build: {
      minify: config.mode === "production",
      sourcemap: config.mode === "development" ? "inline" : false,
      lib: {
        entry: "./src/index.ts",
        name: "blinkCardWorker",
        fileName: () => "blinkcard-worker.js",
        formats: ["es"],
      },
    },
  };
});
