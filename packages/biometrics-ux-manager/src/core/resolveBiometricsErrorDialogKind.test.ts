/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { describe, expect, it } from "vitest";

import { resolveBiometricsErrorDialogKind } from "./resolveBiometricsErrorDialogKind";

function errorWithCode(code: string): Error & { code: string } {
  return Object.assign(new Error("not used for resolution"), { code });
}

describe("resolveBiometricsErrorDialogKind", () => {
  it.each([
    ["CAPTURE_TIMEOUT", "capture", "scanningUnsuccessful"],
    ["FRAME_PROCESSING_FAILED", "capture", "scanningNotAvailable"],
    ["CAPTURE_TIMEOUT", "processing", "scanningNotAvailable"],
    ["CAPTURE_TIMEOUT", "runtime", "scanningNotAvailable"],
    ["UNKNOWN", "runtime", "scanningNotAvailable"],
  ] as const)("maps %s during %s to %s", (code, phase, expected) => {
    expect(resolveBiometricsErrorDialogKind(errorWithCode(code), phase)).toBe(expected);
  });

  it("uses only the machine-readable code", () => {
    const error = Object.assign(new Error("CAPTURE_TIMEOUT"), {
      code: "FRAME_PROCESSING_FAILED",
    });

    expect(resolveBiometricsErrorDialogKind(error, "capture")).toBe("scanningNotAvailable");
  });

  it("suppresses SESSION_CLOSED after teardown", () => {
    expect(resolveBiometricsErrorDialogKind(errorWithCode("SESSION_CLOSED"), "runtime", true)).toBeUndefined();
  });
});
