/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { describe, expect, it, vi } from "vitest";
import { installWorkerCrashReporter } from "./workerCrashReporter";

function makeScope() {
  const listeners = new Map<string, EventListener>();
  return {
    listeners,
    workerScope: {
      addEventListener: vi.fn((type: string, listener: EventListenerOrEventListenerObject | null) => {
        listeners.set(type, listener as EventListener);
      }),
      removeEventListener: vi.fn((type: string, listener: EventListenerOrEventListenerObject | null) => {
        listeners.set(`removed:${type}`, listener as EventListener);
      }),
    },
  };
}

describe("installWorkerCrashReporter", () => {
  it("reports worker errors with the current session number", () => {
    const { listeners, workerScope } = makeScope();
    const onError = vi.fn();

    installWorkerCrashReporter({ workerScope, getSessionNumber: () => 4, onError });

    listeners.get("error")!({
      error: new Error("boom"),
      message: "boom",
    } as unknown as Event);

    expect(onError).toHaveBeenCalledWith({
      origin: "worker.onerror",
      error: expect.any(Error),
      sessionNumber: 4,
    });
  });

  it("reports unhandled rejections with the default session number", () => {
    const { listeners, workerScope } = makeScope();
    const onError = vi.fn();

    installWorkerCrashReporter({ workerScope, onError });

    listeners.get("unhandledrejection")!({ reason: "rejected" } as unknown as Event);

    expect(onError).toHaveBeenCalledWith({
      origin: "worker.unhandledrejection",
      error: "rejected",
      sessionNumber: 0,
    });
  });

  it("falls back to message string when error property is absent", () => {
    const { listeners, workerScope } = makeScope();
    const onError = vi.fn();

    installWorkerCrashReporter({ workerScope, onError });

    listeners.get("error")!({ message: "something went wrong" } as unknown as Event);

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ origin: "worker.onerror", error: "something went wrong" }),
    );
  });

  it("falls back to 'Unknown worker error' when both error and message are absent", () => {
    const { listeners, workerScope } = makeScope();
    const onError = vi.fn();

    installWorkerCrashReporter({ workerScope, onError });

    listeners.get("error")!({} as unknown as Event);

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ origin: "worker.onerror", error: "Unknown worker error" }),
    );
  });

  it("falls back to 'Unhandled worker rejection' when reason is absent", () => {
    const { listeners, workerScope } = makeScope();
    const onError = vi.fn();

    installWorkerCrashReporter({ workerScope, onError });

    listeners.get("unhandledrejection")!({} as unknown as Event);

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ origin: "worker.unhandledrejection", error: "Unhandled worker rejection" }),
    );
  });

  it("removes the same listener references on teardown", () => {
    const { listeners, workerScope } = makeScope();

    const uninstall = installWorkerCrashReporter({ workerScope, onError: vi.fn() });
    uninstall();

    expect(listeners.get("removed:error")).toBe(listeners.get("error"));
    expect(listeners.get("removed:unhandledrejection")).toBe(listeners.get("unhandledrejection"));
  });

  it("suppresses reentrant errors fired during the onError callback", () => {
    const { listeners, workerScope } = makeScope();
    const onError = vi.fn(() => {
      listeners.get("error")!({ error: new Error("reentrant") } as unknown as Event);
    });

    installWorkerCrashReporter({ workerScope, onError });

    listeners.get("error")!({ error: new Error("original") } as unknown as Event);

    expect(onError).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.objectContaining({ message: "original" }) }),
    );
  });

  it("resumes reporting after onError throws", () => {
    const { listeners, workerScope } = makeScope();
    let callCount = 0;
    const onError = vi.fn(() => {
      callCount++;
      if (callCount === 1) throw new Error("callback failure");
    });

    installWorkerCrashReporter({ workerScope, onError });

    expect(() =>
      listeners.get("error")!({ error: new Error("first") } as unknown as Event),
    ).toThrow("callback failure");

    listeners.get("error")!({ error: new Error("second") } as unknown as Event);

    expect(onError).toHaveBeenCalledTimes(2);
    expect(onError).toHaveBeenLastCalledWith(
      expect.objectContaining({ error: expect.objectContaining({ message: "second" }) }),
    );
  });
});
