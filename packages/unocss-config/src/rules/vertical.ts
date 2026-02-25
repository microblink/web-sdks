/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type { Rule } from "unocss";

/**
 * Create vertical layout utility rules
 * Includes viewport height units and orientation utilities
 */
export function createVerticalRules(): Rule[] {
  return [
    // Dynamic viewport height (dvh) - adjusts for mobile browser chrome
    [
      /^h-(\d+)dvh$/,
      ([, num]) => ({ height: `${num}dvh` }),
      { autocomplete: "h-<num>dvh" },
    ],
    [
      /^min-h-(\d+)dvh$/,
      ([, num]) => ({ "min-height": `${num}dvh` }),
      { autocomplete: "min-h-<num>dvh" },
    ],
    [
      /^max-h-(\d+)dvh$/,
      ([, num]) => ({ "max-height": `${num}dvh` }),
      { autocomplete: "max-h-<num>dvh" },
    ],

    // Large viewport height (lvh) - largest possible viewport
    [
      /^h-(\d+)lvh$/,
      ([, num]) => ({ height: `${num}lvh` }),
      { autocomplete: "h-<num>lvh" },
    ],
    [
      /^min-h-(\d+)lvh$/,
      ([, num]) => ({ "min-height": `${num}lvh` }),
      { autocomplete: "min-h-<num>lvh" },
    ],
    [
      /^max-h-(\d+)lvh$/,
      ([, num]) => ({ "max-height": `${num}lvh` }),
      { autocomplete: "max-h-<num>lvh" },
    ],

    // Small viewport height (svh) - smallest possible viewport
    [
      /^h-(\d+)svh$/,
      ([, num]) => ({ height: `${num}svh` }),
      { autocomplete: "h-<num>svh" },
    ],
    [
      /^min-h-(\d+)svh$/,
      ([, num]) => ({ "min-height": `${num}svh` }),
      { autocomplete: "min-h-<num>svh" },
    ],
    [
      /^max-h-(\d+)svh$/,
      ([, num]) => ({ "max-height": `${num}svh` }),
      { autocomplete: "max-h-<num>svh" },
    ],
  ];
}
