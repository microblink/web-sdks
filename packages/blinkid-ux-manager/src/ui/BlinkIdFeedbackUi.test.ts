/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { describe, expect, test } from "vitest";
import { getTimeoutAlertType } from "./BlinkIdFeedbackUi";

describe("getTimeoutAlertType", () => {
  test("maps inactivity timeouts to inactivity alerts", () => {
    expect(getTimeoutAlertType("inactivity_timeout")).toBe("InactivityTimeout");
  });

  test("maps scan-step timeouts to step alerts", () => {
    expect(getTimeoutAlertType("scan_step_timeout")).toBe("StepTimeout");
  });

  test("does not map unrelated errors", () => {
    expect(getTimeoutAlertType("unsupported_document")).toBeUndefined();
  });
});
