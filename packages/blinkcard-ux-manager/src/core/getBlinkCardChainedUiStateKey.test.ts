/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { describe, expect, test } from "vitest";
import { getBlinkCardChainedUiStateKey } from "./getBlinkCardChainedUiStateKey";
import type { BlinkCardUiStateKey } from "./blinkcard-ui-state";

/**
 * Test file role:
 * - Verifies chained UI transitions in isolation (pure function behavior).
 * - No manager, timers, or frame-processing side effects here.
 */

describe("getBlinkCardChainedUiStateKey", () => {
  test("chains FIRST_SIDE_CAPTURED to FLIP_CARD", () => {
    expect(
      getBlinkCardChainedUiStateKey({
        previousUiStateKey: "FIRST_SIDE_CAPTURED",
      }),
    ).toBe<BlinkCardUiStateKey>("FLIP_CARD");
  });

  test("chains FLIP_CARD to INTRO_BACK", () => {
    expect(
      getBlinkCardChainedUiStateKey({ previousUiStateKey: "FLIP_CARD" }),
    ).toBe<BlinkCardUiStateKey>("INTRO_BACK");
  });

  test("returns undefined for CARD_CAPTURED (terminal state)", () => {
    expect(
      getBlinkCardChainedUiStateKey({ previousUiStateKey: "CARD_CAPTURED" }),
    ).toBeUndefined();
  });

  test("returns undefined for INTRO_FRONT (no automatic successor)", () => {
    expect(
      getBlinkCardChainedUiStateKey({ previousUiStateKey: "INTRO_FRONT" }),
    ).toBeUndefined();
  });

  test("returns undefined for error states", () => {
    expect(
      getBlinkCardChainedUiStateKey({ previousUiStateKey: "BLUR_DETECTED" }),
    ).toBeUndefined();

    expect(
      getBlinkCardChainedUiStateKey({
        previousUiStateKey: "CARD_NOT_IN_FRAME_FRONT",
      }),
    ).toBeUndefined();
  });
});
