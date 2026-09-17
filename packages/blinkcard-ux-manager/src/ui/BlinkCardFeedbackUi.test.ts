/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { describe, expect, test } from "vitest";

import { getTimeoutErrorType } from "./BlinkCardFeedbackUi";

describe("getTimeoutAlertType", () => {
  test("maps inactivity timeouts to inactivity alerts", () => {
    expect(getTimeoutErrorType("inactivity_timeout")).toBe("InactivityTimeout");
  });

  test("maps scan-step timeouts to step alerts", () => {
    expect(getTimeoutErrorType("scan_step_timeout")).toBe("StepTimeout");
  });

  test("does not map unrelated errors", () => {
    expect(getTimeoutErrorType("unknown")).toBeUndefined();
  });
});
