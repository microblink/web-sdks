/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { merge } from "merge-anything";
import { type ParentComponent, createContext, createEffect, useContext } from "solid-js";
import { type SetStoreFunction, createStore } from "solid-js/store";

import enLocaleStrings from "./locales/en";

export type LocaleRecord = typeof enLocaleStrings;

export type LocalizedValue<T> = T extends string
  ? string
  : T extends Record<string, unknown>
    ? {
        [Key in keyof T]: LocalizedValue<T[Key]>;
      }
    : T;

type DeepPartialLocalized<T> =
  T extends Record<string, unknown>
    ? {
        -readonly [Key in keyof T]?: T[Key] extends Record<string, unknown> ? DeepPartialLocalized<T[Key]> : string;
      }
    : never;

export type LocalizationStrings = LocalizedValue<LocaleRecord>;

export type PartialLocalizationStrings = DeepPartialLocalized<LocaleRecord>;

const LocalizationContext = createContext<{
  t: LocalizationStrings;
  updateLocalization: SetStoreFunction<LocalizationStrings>;
}>();

export const LocalizationProvider: ParentComponent<{
  userStrings?: PartialLocalizationStrings;
}> = (props) => {
  const mergedStrings = (): LocalizationStrings => merge(enLocaleStrings, props.userStrings ?? {});

  const [localizationStore, updateLocalizationStore] = createStore<LocalizationStrings>(mergedStrings());

  createEffect(() => {
    updateLocalizationStore(mergedStrings());
  });

  return (
    <LocalizationContext.Provider
      value={{
        t: localizationStore,
        updateLocalization: updateLocalizationStore,
      }}
    >
      {props.children}
    </LocalizationContext.Provider>
  );
};

export function useLocalization() {
  const context = useContext(LocalizationContext);

  if (!context) {
    throw new Error("LocalizationContext.Provider not in scope.");
  }

  return context;
}
