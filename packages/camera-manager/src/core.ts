/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

/**
 * @packageDocumentation
 * Framework-independent camera access, selection, stream management, and frame processing.
 */

import "rvfc-polyfill";

export * from "./core/Camera";
export * from "./core/cameraError";
export * from "./core/cameraManagerStore";
export * from "./core/CameraManager";
export * from "./core/VideoFrameProcessor";

// https://newsletter.daishikato.com/p/detecting-dual-module-issues-in-jotai
const testSymbol = Symbol();

/** The global interface. */
declare global {
  /* oxlint-disable no-var */
  var __CAMERA_MANAGER__: typeof testSymbol;
}

globalThis.__CAMERA_MANAGER__ ||= testSymbol;
if (globalThis.__CAMERA_MANAGER__ !== testSymbol) {
  console.warn("Detected multiple instances of @microblink/camera-manager. This can lead to unexpected behavior.");
}
