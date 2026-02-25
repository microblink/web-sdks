/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * @packageDocumentation
 * User experience and interface components for BlinkID SDK - provides a complete UI layer for document scanning.
 * This package includes feedback UI, localization support, and document scanning state management to create
 * an intuitive document scanning experience.
 */

export type * from "@microblink/feedback-stabilizer";
export type * from "@microblink/ux-common/hapticFeedback";
export * from "./core/blinkid-ui-state";
export type { BlinkIdProcessingError } from "./core/BlinkIdProcessingError";
export type { BlinkIdUxManager } from "./core/BlinkIdUxManager";
export * from "./core/createBlinkIdUxManager";
export type { DocumentClassFilter } from "./core/DocumentClassFilter";
export * from "./ui/createBlinkIdFeedbackUi";
export type {
  LocaleRecord,
  LocalizationStrings,
} from "./ui/LocalizationContext";

/**
 * The global interface.
 *
 * @see https://newsletter.daishikato.com/p/detecting-dual-module-issues-in-jotai
 */
const testSymbol = Symbol();

/**
 * The global interface.
 */
declare global {
  /* eslint-disable no-var */
  var __BLINKID_UX_MANAGER__: typeof testSymbol;
}

globalThis.__BLINKID_UX_MANAGER__ ||= testSymbol;
if (globalThis.__BLINKID_UX_MANAGER__ !== testSymbol) {
  console.warn(
    "Detected multiple instances of @microblink/blinkid-ux-manager. This can lead to unexpected behavior.",
  );
}
