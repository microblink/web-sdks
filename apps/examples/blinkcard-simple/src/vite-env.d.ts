/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BLINKCARD_LICENCE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
