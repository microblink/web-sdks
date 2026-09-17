/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

/**
 * @packageDocumentation
 * Framework-independent BlinkID Verify UX orchestration APIs.
 */

export type * from "@microblink/feedback-stabilizer";
export type * from "@microblink/ux-common/hapticFeedback";
export * from "./core/blinkid-verify-ui-state";
export type { BlinkIdVerifyProcessingError } from "./core/BlinkIdVerifyProcessingError";
export type { BlinkIdVerifyUxManager } from "./core/BlinkIdVerifyUxManager";
export * from "./core/createBlinkIdVerifyUxManager";

const testSymbol = Symbol();

declare global {
  /* oxlint-disable no-var */
  var __BLINKID_VERIFY_UX_MANAGER__: typeof testSymbol;
}

globalThis.__BLINKID_VERIFY_UX_MANAGER__ ||= testSymbol;
if (globalThis.__BLINKID_VERIFY_UX_MANAGER__ !== testSymbol) {
  console.warn(
    "Detected multiple instances of @microblink/blinkid-verify-ux-manager. This can lead to unexpected behavior.",
  );
}
