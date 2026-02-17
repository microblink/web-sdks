/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { moveResources } from "@microblink/repo-utils";
import dns from "dns";
import { ServerOptions, defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
import { qrcode } from "vite-plugin-qrcode";
import solidPlugin from "vite-plugin-solid";

// https://vitejs.dev/guide/migration.html#architecture-changes-and-legacy-options
dns.setDefaultResultOrder("verbatim");

let ranOnce = false;

const serverOptions: ServerOptions = {
  port: 3000,
  headers: {
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Opener-Policy": "same-origin",
  },
};

export default defineConfig((config) => {
  return {
    base: "./",
    build: {
      sourcemap: config.mode === "development",
      target: "es2022",
    },
    plugins: [
      // symlink wasm resources to public/resources
      {
        name: "move-resources",
        buildStart: async () => {
          if (ranOnce) {
            return;
          }
          moveResources("@microblink/blinkcard-core", "public/resources");
          ranOnce = true;
        },
      },
      qrcode(),
      solidPlugin(),
      mkcert(),
    ],
    server: serverOptions,
    preview: serverOptions,
  };
});
