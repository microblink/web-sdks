import { readFileSync } from "node:fs";

import { getBrowserslistEsbuildTarget, removeModuleRegions } from "@microblink/repo-utils";
import { defineConfig } from "vite";
import "zx/globals";

const { emscriptenVersion } = JSON.parse(
  readFileSync(new URL("../biometrics-wasm/dist/build-info.json", import.meta.url), "utf8"),
) as { emscriptenVersion: string };

export default defineConfig((config) => {
  const pingAnalyticsEnvironment = process.env.PING_ANALYTICS_ENV ?? "DEV";

  if (pingAnalyticsEnvironment !== "DEV" && pingAnalyticsEnvironment !== "PROD") {
    throw new Error(`Unsupported PING_ANALYTICS_ENV: ${pingAnalyticsEnvironment}`);
  }

  return {
    plugins: [removeModuleRegions()],
    define: {
      __EMSCRIPTEN_VERSION__: JSON.stringify(emscriptenVersion),
      __PING_ANALYTICS_ENV__: JSON.stringify(pingAnalyticsEnvironment),
    },
    build: {
      minify: config.mode === "production",
      sourcemap: config.mode === "development" ? "inline" : false,
      target: getBrowserslistEsbuildTarget(),
      lib: {
        entry: "./src/index.ts",
        name: "biometricsWorker",
        fileName: () => "biometrics-worker.js",
        formats: ["es"],
      },
    },
  };
});
