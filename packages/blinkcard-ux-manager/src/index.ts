/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * @packageDocumentation
 * User experience and interface components for BlinkCard SDK - provides a complete UI layer for card scanning.
 * This package includes feedback UI, localization support, and card scanning state management to create
 * an intuitive card scanning experience.
 */

export type * from "@microblink/feedback-stabilizer";
export type * from "@microblink/ux-common/hapticFeedback";
export * from "./core/blinkcard-ui-state";
export type { BlinkCardProcessingError } from "./core/BlinkCardProcessingError";
export type { BlinkCardUxManager } from "./core/BlinkCardUxManager";
export * from "./core/createBlinkCardUxManager";
export * from "./ui/createBlinkCardFeedbackUi";
export type {
  LocaleRecord,
  LocalizationStrings,
  LocalizedValue,
  PartialLocalizationStrings,
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
  var __BLINKCARD_UX_MANAGER__: typeof testSymbol;
}

globalThis.__BLINKCARD_UX_MANAGER__ ||= testSymbol;
if (globalThis.__BLINKCARD_UX_MANAGER__ !== testSymbol) {
  console.warn(
    "Detected multiple instances of @microblink/blinkcard-ux-manager. This can lead to unexpected behavior.",
  );
}
