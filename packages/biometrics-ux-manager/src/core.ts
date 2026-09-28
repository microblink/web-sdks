/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

/**
 * @packageDocumentation
 * Framework-independent Biometrics guided capture orchestration APIs.
 */

export * from "./core/BiometricsUxManager";

const testSymbol = Symbol();

declare global {
  /* oxlint-disable no-var */
  var __BIOMETRICS_UX_MANAGER__: typeof testSymbol;
}

globalThis.__BIOMETRICS_UX_MANAGER__ ||= testSymbol;

if (globalThis.__BIOMETRICS_UX_MANAGER__ !== testSymbol) {
  console.warn(
    "Detected multiple instances of @microblink/biometrics-ux-manager. This can lead to unexpected behavior.",
  );
}
