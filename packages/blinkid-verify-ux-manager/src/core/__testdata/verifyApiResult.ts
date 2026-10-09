/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { VerifyApiResult } from "@microblink/blinkid-verify-core";

/** Smallest response that satisfies the generated v3 schema; each call returns a distinct object for identity checks. */
export const createVerifyApiResult = (overrides: Partial<VerifyApiResult> = {}): VerifyApiResult => ({
  pipeline: {
    extraction: { status: "Completed" },
    verification: { status: "Completed" },
  },
  verification: {
    verdict: "Accept",
    failedChecks: [],
  },
  imageAssessment: {},
  extraction: {
    processingStatus: "Success",
    result: {},
  },
  configurationUsed: {},
  runtime: {
    startedOn: "2026-01-01T00:00:00.000Z",
    finishedOn: "2026-01-01T00:00:01.000Z",
    elapsedMs: 1000,
    executionId: "execution-1",
    blinkIdVersion: "test",
    blinkIdVerifyVersion: "test",
  },
  ...overrides,
});
