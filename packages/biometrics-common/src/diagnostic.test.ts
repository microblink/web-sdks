/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { describe, expect, test, vi } from "vitest";

import { emitBiometricsDiagnostic, sanitizeBiometricsResourceUrl, type BiometricsDiagnosticEvent } from "./diagnostic";

describe("sanitizeBiometricsResourceUrl", () => {
  test.each([
    {
      input: "https://user:password@example.com/resources/worker.js?apiKey=secret#fragment",
      expected: "https://example.com/resources/worker.js",
    },
    {
      input: "/resources/worker.js?apiKey=secret#fragment",
      expected: "/resources/worker.js",
    },
    {
      input: "data:text/plain,secret",
      expected: "[unsupported-url]",
    },
    {
      input: "https://%",
      expected: "[invalid-url]",
    },
  ])("sanitizes $input", ({ input, expected }) => {
    expect(sanitizeBiometricsResourceUrl(input)).toBe(expected);
  });
});

describe("emitBiometricsDiagnostic", () => {
  test("emits only allowlisted safe fields", () => {
    const callback = vi.fn();
    const event = {
      phase: "initialization",
      component: "worker",
      status: "failed",
      timestamp: "2026-07-24T12:00:00.000Z",
      durationMs: 12.5,
      errorCode: "WORKER_LOAD_FAILED",
      resource: {
        kind: "worker-script",
        url: "https://user:password@example.com/worker.js?token=secret#hash",
      },
      cause: new Error("secret"),
      stack: "secret",
      licenseKey: "secret",
    } as BiometricsDiagnosticEvent;

    emitBiometricsDiagnostic(callback, event);

    expect(callback).toHaveBeenCalledWith({
      phase: "initialization",
      component: "worker",
      status: "failed",
      timestamp: "2026-07-24T12:00:00.000Z",
      durationMs: 12.5,
      errorCode: "WORKER_LOAD_FAILED",
      resource: {
        kind: "worker-script",
        url: "https://example.com/worker.js",
      },
    });
  });

  test("omits invalid durations", () => {
    const callback = vi.fn();

    emitBiometricsDiagnostic(callback, {
      phase: "capture",
      component: "sdk",
      status: "completed",
      timestamp: "2026-07-24T12:00:00.000Z",
      durationMs: Number.NaN,
    });

    expect(callback).toHaveBeenCalledWith({
      phase: "capture",
      component: "sdk",
      status: "completed",
      timestamp: "2026-07-24T12:00:00.000Z",
    });
  });

  test("isolates callback exceptions", () => {
    const callback = vi.fn(() => {
      throw new Error("Consumer callback failed");
    });

    expect(() =>
      emitBiometricsDiagnostic(callback, {
        phase: "capture",
        component: "sdk",
        status: "started",
        timestamp: "2026-07-24T12:00:00.000Z",
      }),
    ).not.toThrow();
  });
});
