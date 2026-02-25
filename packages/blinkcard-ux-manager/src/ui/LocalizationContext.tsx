/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import {
  ParentComponent,
  createContext,
  createEffect,
  useContext,
} from "solid-js";
import { SetStoreFunction, createStore } from "solid-js/store";

import enLocaleStrings from "./locales/en";

/**
 * The locale record type.
 */
export type LocaleRecord = typeof enLocaleStrings;

/**
 * Recursively transforms a locale record to allow string overrides at any level.
 */
export type LocalizedValue<T> =
  T extends Record<string, unknown>
    ?
        | {
            [K in keyof T]: LocalizedValue<T[K]>;
          }
        | (string & Record<string, never>)
    : T | (string & Record<string, never>);

/**
 * Deep partial type that allows any string to be assigned to override values.
 * This type is permissive to allow any partial override structure.
 */
// eslint-disable @typescript-eslint/ban-types
type DeepPartialLocalized<T> =
  T extends Record<string, unknown>
    ? {
        -readonly [K in keyof T]?: T[K] extends Record<string, unknown>
          ? DeepPartialLocalized<T[K]> | string
          : string;
      }
    : never;

/**
 * The localization strings type.
 * This allows for autocomplete for defaults, but also overriding with strings at any level.
 * https://twitter.com/mattpocockuk/status/1709281782325977101
 */
export type LocalizationStrings = LocalizedValue<LocaleRecord>;

/**
 * Partial version of LocalizationStrings that allows any string to be assigned.
 */
export type PartialLocalizationStrings = DeepPartialLocalized<LocaleRecord>;

/**
 * The localization context.
 */
const LocalizationContext = createContext<{
  t: LocalizationStrings;
  updateLocalization: SetStoreFunction<LocalizationStrings>;
}>();

/**
 * The localization provider.
 */
export const LocalizationProvider: ParentComponent<{
  userStrings?: PartialLocalizationStrings;
}> = (props) => {
  const [localizationStore, updateLocalizationStore] =
    // avoid initing with original as proxying to the original object will
    // mutate the original object on store updates
    createStore<LocalizationStrings>({} as LocalizationStrings);

  const mergedStrings = (): LocalizationStrings =>
    ({
      ...enLocaleStrings,
      ...props.userStrings,
    }) as LocalizationStrings;

  // update store as a side-effects of userStrings changing
  createEffect(() => {
    updateLocalizationStore(mergedStrings());
  });

  const contextValue = {
    t: localizationStore,
    updateLocalization: updateLocalizationStore,
  };

  return (
    <LocalizationContext.Provider value={contextValue}>
      {props.children}
    </LocalizationContext.Provider>
  );
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
