/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const releaseProxy = Symbol("releaseProxy");
  const release = vi.fn();
  const raw = {
    ready: vi.fn(() => Promise.resolve({ ok: true, value: undefined })),
    reset: vi.fn(() => Promise.resolve({ ok: true, value: { error: null } })),
    process: vi.fn().mockImplementation((image: ImageData) =>
      Promise.resolve({
        ok: true,
        value: {
          arrayBuffer: image.data.buffer,
        },
      }),
    ),
    [releaseProxy]: release,
  };

  return {
    getCrossOriginWorkerURL: vi.fn(),
    raw,
    release,
    releaseProxy,
    wrap: vi.fn((_worker: Worker) => raw),
  };
});

vi.mock("comlink", () => ({
  releaseProxy: mocks.releaseProxy,
  wrap: mocks.wrap,
}));

vi.mock("@microblink/worker-common/getCrossOriginWorkerURL", () => ({
  getCrossOriginWorkerURL: mocks.getCrossOriginWorkerURL,
}));

import { createBiometricsWorkerProxy } from "./biometricsWorkerClient";

class WorkerMock extends EventTarget {
  readonly terminate = vi.fn();

  constructor(
    readonly url: string | URL,
    readonly options?: WorkerOptions,
  ) {
    super();
  }
}

describe("createBiometricsWorkerProxy", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("opens the worker, returns native results, and releases it on termination", async () => {
    vi.stubGlobal("Worker", WorkerMock);
    mocks.getCrossOriginWorkerURL.mockResolvedValue("blob:https://example.com/worker");

    const worker = await createBiometricsWorkerProxy("https://example.com/resources");

    const image = new ImageData(new Uint8ClampedArray([1, 2, 3, 4]), 1, 1);
    const originalBuffer = image.data.buffer;

    const result = await worker.remote.process(image);

    expect(mocks.getCrossOriginWorkerURL).toHaveBeenCalledWith("https://example.com/resources/biometrics-worker.js");
    expect(mocks.wrap).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "blob:https://example.com/worker",
        options: { type: "module" },
      }),
    );

    expect(mocks.raw.process).toHaveBeenCalledWith(image);
    expect(result.arrayBuffer).toBe(originalBuffer);

    worker.terminate();

    expect(mocks.release).toHaveBeenCalledOnce();

    const workerInstance = mocks.wrap.mock.calls[0]?.[0] as unknown as WorkerMock;
    expect(workerInstance.terminate).toHaveBeenCalledOnce();
  });

  it("terminates a worker that does not complete its readiness handshake", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("Worker", WorkerMock);
    mocks.getCrossOriginWorkerURL.mockResolvedValue("blob:https://example.com/worker");
    mocks.raw.ready.mockReturnValueOnce(new Promise(() => undefined));

    const creation = createBiometricsWorkerProxy("https://example.com/resources", { timeoutMs: 100 });
    const rejection = expect(creation).rejects.toMatchObject({
      code: "WORKER_START_TIMEOUT",
      stage: "initialization",
      component: "worker",
      isRetryable: true,
    });

    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(100);

    await rejection;

    const workerInstance = mocks.wrap.mock.calls[0]?.[0] as unknown as WorkerMock;
    expect(workerInstance.terminate).toHaveBeenCalledOnce();
    expect(mocks.release).toHaveBeenCalledOnce();
  });
});
