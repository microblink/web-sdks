/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { describe, expect, test } from "vitest";

import { toVerifyApiError, VerifyApiError } from "./VerifyApiError";

describe("VerifyApiError", () => {
  test("preserves an existing VerifyApiError instance", () => {
    const error = new VerifyApiError("failed", { status: 400, body: { code: "bad_request" } });
    expect(toVerifyApiError(error)).toBe(error);
  });

  test("wraps a generic Error and copies status/body when present", () => {
    const cause = Object.assign(new Error("timeout"), { status: 504, body: "gateway" });
    const wrapped = toVerifyApiError(cause);

    expect(wrapped).toBeInstanceOf(VerifyApiError);
    expect(wrapped.message).toBe("timeout");
    expect(wrapped.status).toBe(504);
    expect(wrapped.body).toBe("gateway");
    expect(wrapped.cause).toBe(cause);
  });
});
