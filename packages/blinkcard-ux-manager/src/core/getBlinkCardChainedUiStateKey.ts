/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { match } from "ts-pattern";
import { BlinkCardUiStateKey } from "./blinkcard-ui-state";

export type BlinkCardChainedUiStateProps = {
  previousUiStateKey: BlinkCardUiStateKey;
};

/**
 * Returns the next chained UI state key after a state transition, or
 * `undefined` if there is no automatic follow-on state.
 *
 * BlinkCard chain:
 * - `FIRST_SIDE_CAPTURED` → `FLIP_CARD`  (show flip instruction after success flash)
 * - `FLIP_CARD`           → `INTRO_BACK` (show back-side intro after flip animation)
 *
 * @param props - Contains the key of the state that just completed.
 * @returns The next state key, or `undefined`.
 */
export function getBlinkCardChainedUiStateKey(
  props: BlinkCardChainedUiStateProps,
): BlinkCardUiStateKey | undefined {
  return match<BlinkCardChainedUiStateProps, BlinkCardUiStateKey | undefined>(
    props,
  )
    .with({ previousUiStateKey: "FIRST_SIDE_CAPTURED" }, () => "FLIP_CARD")
    .with({ previousUiStateKey: "FLIP_CARD" }, () => "INTRO_BACK")
    .otherwise(() => undefined);
}
