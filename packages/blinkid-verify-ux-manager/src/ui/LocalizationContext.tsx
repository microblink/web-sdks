/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { merge } from "merge-anything";
import { ParentComponent, createContext, createEffect, useContext } from "solid-js";
import { SetStoreFunction, createStore } from "solid-js/store";

import enLocaleStrings from "./locales/en";
import type { LocalizationStrings, PartialLocalizationStrings } from "./localization-strings";

export type { LocaleRecord, LocalizationStrings, PartialLocalizationStrings } from "./localization-strings";

/** Plain copy so a store proxy never attaches to the shared locale module. */
function cloneLocale<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const defaultLocaleStrings = cloneLocale(enLocaleStrings);

/** The localization context. */
const LocalizationContext = createContext<{
  t: LocalizationStrings;
  updateLocalization: SetStoreFunction<LocalizationStrings>;
}>();

/** The localization provider. */
export const LocalizationProvider: ParentComponent<{
  userStrings?: PartialLocalizationStrings;
}> = (props) => {
  const mergedStrings = (): LocalizationStrings =>
    cloneLocale(merge(defaultLocaleStrings, props.userStrings ?? {})) as LocalizationStrings;

  const [localizationStore, updateLocalizationStore] = createStore<LocalizationStrings>(mergedStrings());

  // update store as a side-effects of userStrings changing
  createEffect(() => {
    updateLocalizationStore(mergedStrings());
  });

  const contextValue = {
    t: localizationStore,
    updateLocalization: updateLocalizationStore,
  };

  return <LocalizationContext.Provider value={contextValue}>{props.children}</LocalizationContext.Provider>;
};

/**
 * The use localization hook.
 *
 * @returns The localization strings.
 */
export function useLocalization() {
  const ctx = useContext(LocalizationContext);
  if (!ctx) {
    throw new Error("LocalizationContext.Provider not in scope.");
  }
  return ctx;
}
