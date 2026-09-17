/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { UxTimeoutHandler } from "./UxTimeoutHandler";

type TestTimeoutConfiguration = {
  inactivityTimeoutMs: number | null;
  scanStepTimeoutMs: number | null;
  partiallySupportedBarcodeResolveTimeoutMs: number | null;
};

const defaults: TestTimeoutConfiguration = {
  inactivityTimeoutMs: 1_000,
  scanStepTimeoutMs: 2_000,
  partiallySupportedBarcodeResolveTimeoutMs: 3_000,
};

const createHandler = (configuration?: Partial<TestTimeoutConfiguration>) => {
  const callbacks = {
    onInactivityTimeout: vi.fn(),
    onScanStepTimeout: vi.fn(),
    onPartiallySupportedBarcodeResolveTimeout: vi.fn(),
  };
  const handler = new UxTimeoutHandler({ defaults, configuration, onTimeout: callbacks });

  return { callbacks, handler };
};

describe("UxTimeoutHandler", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("validates timeout durations", () => {
    expect(() => createHandler({ inactivityTimeoutMs: 0 })).toThrowError("inactivityTimeoutMs must be greater than 0");
    expect(() => createHandler({ inactivityTimeoutMs: Number.POSITIVE_INFINITY })).toThrowError(
      "inactivityTimeoutMs must be greater than 0",
    );

    const { handler } = createHandler();
    expect(() => handler.setConfiguration({ scanStepTimeoutMs: -1 })).toThrowError(
      "scanStepTimeoutMs must be greater than 0",
    );
    expect(handler.getConfiguration()).toEqual(defaults);
  });

  test("returns a configuration copy", () => {
    const { handler } = createHandler({ inactivityTimeoutMs: 500 });
    const configuration = handler.getConfiguration();

    configuration.inactivityTimeoutMs = 250;

    expect(handler.getConfiguration()).toEqual({ ...defaults, inactivityTimeoutMs: 500 });
  });

  test("starts a timer and invokes its callback on expiry", async () => {
    const { callbacks, handler } = createHandler({ inactivityTimeoutMs: 100 });

    handler.start("inactivityTimeoutMs");
    expect(handler.getTimerState("inactivityTimeoutMs")).toEqual({
      configuredMs: 100,
      remainingMs: 100,
      status: "running",
    });

    await vi.advanceTimersByTimeAsync(60);
    expect(handler.getTimerState("inactivityTimeoutMs")).toEqual({
      configuredMs: 100,
      remainingMs: 40,
      status: "running",
    });

    await vi.advanceTimersByTimeAsync(40);
    expect(callbacks.onInactivityTimeout).toHaveBeenCalledOnce();
    expect(handler.getTimerState("inactivityTimeoutMs")).toEqual({
      configuredMs: 100,
      remainingMs: 0,
      status: "idle",
    });
  });

  test("pauses and resumes a timer from its remaining duration", async () => {
    const { callbacks, handler } = createHandler({ scanStepTimeoutMs: 100 });

    handler.start("scanStepTimeoutMs");
    await vi.advanceTimersByTimeAsync(60);
    handler.pause("scanStepTimeoutMs");

    expect(handler.getTimerState("scanStepTimeoutMs")).toEqual({
      configuredMs: 100,
      remainingMs: 40,
      status: "paused",
    });

    await vi.advanceTimersByTimeAsync(100);
    expect(callbacks.onScanStepTimeout).not.toHaveBeenCalled();

    handler.resume("scanStepTimeoutMs");
    await vi.advanceTimersByTimeAsync(39);
    expect(callbacks.onScanStepTimeout).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(callbacks.onScanStepTimeout).toHaveBeenCalledOnce();
  });

  test("resets a timer to its configured duration", async () => {
    const { callbacks, handler } = createHandler({ inactivityTimeoutMs: 100 });

    handler.start("inactivityTimeoutMs");
    await vi.advanceTimersByTimeAsync(60);
    handler.reset("inactivityTimeoutMs");

    expect(handler.getTimerState("inactivityTimeoutMs")).toEqual({
      configuredMs: 100,
      remainingMs: 100,
      status: "idle",
    });

    await vi.advanceTimersByTimeAsync(100);
    expect(callbacks.onInactivityTimeout).not.toHaveBeenCalled();
  });

  test("keeps null-duration timers disabled", async () => {
    const { callbacks, handler } = createHandler({ inactivityTimeoutMs: null });

    handler.start("inactivityTimeoutMs");
    handler.pause("inactivityTimeoutMs");
    handler.resume("inactivityTimeoutMs");

    expect(handler.getTimerState("inactivityTimeoutMs")).toEqual({
      configuredMs: null,
      remainingMs: null,
      status: "disabled",
    });

    await vi.advanceTimersByTimeAsync(10_000);
    expect(callbacks.onInactivityTimeout).not.toHaveBeenCalled();
  });

  test("configuration updates merge with current values and reset all timers", async () => {
    const { callbacks, handler } = createHandler({ inactivityTimeoutMs: 100, scanStepTimeoutMs: 200 });

    handler.start("inactivityTimeoutMs");
    handler.start("scanStepTimeoutMs");
    await vi.advanceTimersByTimeAsync(50);

    handler.setConfiguration({ inactivityTimeoutMs: 400 });

    expect(handler.getConfiguration()).toEqual({
      inactivityTimeoutMs: 400,
      scanStepTimeoutMs: 200,
      partiallySupportedBarcodeResolveTimeoutMs: 3_000,
    });
    expect(handler.getTimerState("inactivityTimeoutMs")).toEqual({
      configuredMs: 400,
      remainingMs: 400,
      status: "idle",
    });
    expect(handler.getTimerState("scanStepTimeoutMs")).toEqual({
      configuredMs: 200,
      remainingMs: 200,
      status: "idle",
    });

    await vi.advanceTimersByTimeAsync(200);
    expect(callbacks.onInactivityTimeout).not.toHaveBeenCalled();
    expect(callbacks.onScanStepTimeout).not.toHaveBeenCalled();
  });

  test("maps configuration keys to callback names only when invoked", () => {
    const { callbacks, handler } = createHandler();

    handler.trigger("partiallySupportedBarcodeResolveTimeoutMs");

    expect(callbacks.onPartiallySupportedBarcodeResolveTimeout).toHaveBeenCalledOnce();
    expect(callbacks.onInactivityTimeout).not.toHaveBeenCalled();
    expect(callbacks.onScanStepTimeout).not.toHaveBeenCalled();
  });

  test("manually triggers a running timer only once", async () => {
    const { callbacks, handler } = createHandler({ scanStepTimeoutMs: 100 });

    handler.start("scanStepTimeoutMs");
    handler.trigger("scanStepTimeoutMs");

    expect(callbacks.onScanStepTimeout).toHaveBeenCalledOnce();
    expect(handler.getTimerState("scanStepTimeoutMs")).toEqual({
      configuredMs: 100,
      remainingMs: 0,
      status: "idle",
    });

    await vi.advanceTimersByTimeAsync(100);
    expect(callbacks.onScanStepTimeout).toHaveBeenCalledOnce();
  });
});
