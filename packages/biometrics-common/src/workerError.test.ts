/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { describe, expect, test } from "vitest";

import { BiometricsError } from "./error";
import { deserializeBiometricsError, serializeBiometricsError, unwrapBiometricsWorkerResult } from "./workerError";

describe("Worker error transport", () => {
  test("round-trips every public serializable field", () => {
    const source = new BiometricsError({
      message: "WASM failed",
      code: "WASM_LOAD_FAILED",
      stage: "initialization",
      component: "wasm",
      isRetryable: true,
      cause: new Error("private worker error"),
    });

    const serialized = serializeBiometricsError(source);
    const reconstructed = deserializeBiometricsError(serialized);

    expect(serialized).toEqual({
      message: "WASM failed",
      code: "WASM_LOAD_FAILED",
      stage: "initialization",
      component: "wasm",
      isRetryable: true,
    });
    expect(reconstructed).toMatchObject(serialized);
    expect(reconstructed.cause).toBeUndefined();
  });

  test("unwraps a successful result", () => {
    expect(unwrapBiometricsWorkerResult({ ok: true, value: 42 })).toBe(42);
  });

  test("throws a reconstructed BiometricsError for a failed result", () => {
    let thrown: unknown;

    try {
      unwrapBiometricsWorkerResult({
        ok: false,
        error: {
          message: "Worker failed",
          code: "WORKER_LOAD_FAILED",
          stage: "initialization",
          component: "worker",
          isRetryable: true,
        },
      });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(BiometricsError);
    expect(thrown).toMatchObject({
      code: "WORKER_LOAD_FAILED",
      stage: "initialization",
      component: "worker",
      isRetryable: true,
    });
  });
});
