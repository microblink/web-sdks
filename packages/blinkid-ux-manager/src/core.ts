/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

/**
 * @packageDocumentation
 * Framework-independent BlinkID scanning orchestration APIs.
 */

export type * from "@microblink/feedback-stabilizer";
export type * from "@microblink/ux-common/hapticFeedback";
export * from "./core/blinkid-ui-state";
export type { BlinkIdProcessingError } from "./core/BlinkIdProcessingError";
export type { BlinkIdTimeoutConfiguration } from "./core/BlinkIdTimeoutConfiguration";
export type {
  BlinkIdFrameProcessCallback,
  BlinkIdProgress,
  BlinkIdProgressTimerState,
  BlinkIdProgressTimerStatus,
  BlinkIdUxManager,
} from "./core/BlinkIdUxManager";
export * from "./core/createBlinkIdUxManager";
export type { DocumentClassFilter } from "./core/DocumentClassFilter";

const testSymbol = Symbol();

declare global {
  /* oxlint-disable no-var */
  var __BLINKID_UX_MANAGER__: typeof testSymbol;
}

globalThis.__BLINKID_UX_MANAGER__ ||= testSymbol;
if (globalThis.__BLINKID_UX_MANAGER__ !== testSymbol) {
  console.warn("Detected multiple instances of @microblink/blinkid-ux-manager. This can lead to unexpected behavior.");
}
