/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { BiometricsErrorDialogKind } from "../core/BiometricsUxManager";
import type { LocalizationStrings } from "./LocalizationContext";

export type BiometricsErrorDialogCopy = {
  title: string;
  description: string;
  /** Whether the description is shown visually. Hidden descriptions are still announced to assistive technology. */
  showDescription?: boolean;
  /** Retryable dialogs offer retry and cancel actions; others only offer close. */
  retryable: boolean;
};

export type BiometricsErrorDialogs<DialogKind extends string> = Record<
  DialogKind,
  (t: LocalizationStrings) => BiometricsErrorDialogCopy
>;

const defaultErrorDialogs: BiometricsErrorDialogs<BiometricsErrorDialogKind> = {
  scanningUnsuccessful: (t) => ({
    title: t.error_dialogs.scanning_unsuccessful.title,
    description: t.error_dialogs.scanning_unsuccessful.details,
    showDescription: true,
    retryable: true,
  }),
  scanningNotAvailable: (t) => ({
    title: t.error_dialogs.scanning_not_available.title,
    description: t.error_dialogs.scanning_not_available.aria_description,
    retryable: false,
  }),
};

export function resolveErrorDialogCopy(
  kind: string | undefined,
  t: LocalizationStrings,
  errorDialogs?: Partial<Record<string, (t: LocalizationStrings) => BiometricsErrorDialogCopy>>,
): BiometricsErrorDialogCopy {
  const dialog =
    (kind === undefined ? undefined : errorDialogs?.[kind]) ??
    defaultErrorDialogs[kind as BiometricsErrorDialogKind] ??
    defaultErrorDialogs.scanningNotAvailable;

  return dialog(t);
}
