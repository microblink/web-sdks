/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import dns from "node:dns";

import { type ServerOptions, defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
import { qrcode } from "vite-plugin-qrcode";

dns.setDefaultResultOrder("verbatim");

const serverOptions: ServerOptions = { port: 3000 };

export default defineConfig(({ mode }) => ({
  base: "./",
  build: {
    sourcemap: mode === "development",
    target: "es2022",
  },
  plugins: [qrcode(), mkcert()],
  server: serverOptions,
  preview: serverOptions,
}));
