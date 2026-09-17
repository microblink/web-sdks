/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import dns from "node:dns";

import { moveResources } from "@microblink/repo-utils";
import { type ServerOptions, defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
import { qrcode } from "vite-plugin-qrcode";

dns.setDefaultResultOrder("verbatim");

let resourcesMoved = false;

const serverOptions: ServerOptions = {
  port: 3000,
  headers: {
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Opener-Policy": "same-origin",
  },
};

export default defineConfig(({ mode }) => ({
  base: "./",
  build: {
    sourcemap: mode === "development",
    target: "es2022",
  },
  plugins: [
    {
      name: "move-resources",
      buildStart() {
        if (!resourcesMoved) {
          resourcesMoved = true;
          return moveResources("@microblink/blinkcard-core", "public/resources");
        }
      },
    },
    qrcode(),
    mkcert(),
  ],
  server: serverOptions,
  preview: serverOptions,
}));
