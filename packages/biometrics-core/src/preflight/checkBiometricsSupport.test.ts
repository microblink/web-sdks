/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ConfigurationError } from "../error";
import { getBiometricsRuntimeResourceManifest } from "../resources/resourceManifest";
import { checkBiometricsSupport } from "./checkBiometricsSupport";

const detectMainThreadWasmCapabilitiesMock = vi.hoisted(() => vi.fn());

vi.mock("./wasmCapabilityDetection", () => ({
  detectMainThreadWasmCapabilities: detectMainThreadWasmCapabilitiesMock,
}));

function contentTypeFor(url: string): string {
  if (url.endsWith(".js")) {
    return "application/javascript";
  }

  if (url.endsWith(".wasm")) {
    return "application/wasm";
  }

  return "application/octet-stream";
}

function responseFor(url: string, overrides: Partial<Response> = {}): Response {
  return {
    headers: new Headers({ "content-type": contentTypeFor(url) }),
    ok: true,
    redirected: false,
    status: 200,
    url,
    ...overrides,
  } as Response;
}

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }

  return input instanceof URL ? input.href : input.url;
}

function installSupportedBrowser(
  fetchImplementation: typeof fetch = vi.fn((input: RequestInfo | URL) => {
    const url = requestUrl(input);

    return Promise.resolve(responseFor(url));
  }),
): void {
  vi.stubGlobal("isSecureContext", true);
  vi.stubGlobal("Worker", class {});
  vi.stubGlobal("fetch", fetchImplementation);
  vi.stubGlobal("navigator", {
    mediaDevices: {
      enumerateDevices: vi.fn(() => Promise.resolve([])),
      getUserMedia: vi.fn(),
    },
  });
}

describe("checkBiometricsSupport", () => {
  beforeEach(() => {
    detectMainThreadWasmCapabilitiesMock.mockResolvedValue({
      minimumFeatures: true,
      relaxedSimd: false,
      threads: false,
      sharedMemory: false,
      worker: true,
      crossOriginIsolated: false,
      safari: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("checks browser capabilities and every resource without initializing the SDK", async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = requestUrl(input);

      return Promise.resolve(responseFor(url, { status: 200 }));
    });
    installSupportedBrowser(fetchMock);

    const report = await checkBiometricsSupport({
      resourcesLocation: "https://cdn.test/sdk/index.html",
    });

    expect(report.supported).toBe(true);
    expect(report.wasmVariant).toBe("simd");
    expect(report.checks.filter((check) => check.id === "resource")).toHaveLength(
      getBiometricsRuntimeResourceManifest("simd").length,
    );
    expect(report.checks.find((check) => check.id === "camera")?.status).toBe("skipped");
    expect(fetchMock).toHaveBeenCalledTimes(getBiometricsRuntimeResourceManifest("simd").length);
    expect(fetchMock.mock.calls.every(([, init]) => init?.method === "HEAD")).toBe(true);
    expect((globalThis.navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(0);
  });

  it("requests video permission, stops every track, and verifies a camera exists", async () => {
    const stopFirst = vi.fn();
    const stopSecond = vi.fn();
    const getUserMedia = vi.fn(() =>
      Promise.resolve({
        getTracks: () => [{ stop: stopFirst }, { stop: stopSecond }],
      }),
    );
    installSupportedBrowser();
    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia,
        enumerateDevices: vi.fn(() => Promise.resolve([{ kind: "videoinput" }])),
      },
    });

    const report = await checkBiometricsSupport({
      requestCameraPermission: true,
      resourcesLocation: "https://cdn.test/sdk/",
    });

    expect(report.checks.find((check) => check.id === "camera")?.status).toBe("passed");
    expect(stopFirst).toHaveBeenCalledOnce();
    expect(stopSecond).toHaveBeenCalledOnce();
    expect(getUserMedia).toHaveBeenCalledWith({
      audio: false,
      video: true,
    });
  });

  it("stops a camera stream that arrives after the deadline", async () => {
    vi.useFakeTimers();
    const stop = vi.fn();
    let resolveStream!: (stream: MediaStream) => void;
    installSupportedBrowser();
    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: vi.fn(
          () =>
            new Promise<MediaStream>((resolve) => {
              resolveStream = resolve;
            }),
        ),
        enumerateDevices: vi.fn(),
      },
    });

    const reportPromise = checkBiometricsSupport({
      requestCameraPermission: true,
      resourcesLocation: "https://cdn.test/sdk/",
      timeoutMs: 10,
    });
    await vi.advanceTimersByTimeAsync(11);
    const report = await reportPromise;

    expect(report.checks.find((check) => check.id === "camera")).toMatchObject({
      status: "failed",
      message: "Camera check exceeded the preflight deadline.",
    });

    resolveStream({
      getTracks: () => [{ stop }],
    } as unknown as MediaStream);
    await Promise.resolve();
    await Promise.resolve();

    expect(stop).toHaveBeenCalledOnce();
  });

  it("stops remaining tracks when one track cleanup fails", async () => {
    const stopSecond = vi.fn();
    installSupportedBrowser();
    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: vi.fn(() =>
          Promise.resolve({
            getTracks: () => [
              {
                stop: () => {
                  throw new Error("cleanup failed");
                },
              },
              { stop: stopSecond },
            ],
          }),
        ),
        enumerateDevices: vi.fn(() => Promise.resolve([{ kind: "videoinput" }])),
      },
    });

    const report = await checkBiometricsSupport({
      requestCameraPermission: true,
      resourcesLocation: "https://cdn.test/sdk/",
    });

    expect(report.checks.find((check) => check.id === "camera")?.status).toBe("passed");
    expect(stopSecond).toHaveBeenCalledOnce();
  });

  it("fails the camera check when no video input exists", async () => {
    const stop = vi.fn();
    installSupportedBrowser();
    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: vi.fn(() =>
          Promise.resolve({
            getTracks: () => [{ stop }],
          }),
        ),
        enumerateDevices: vi.fn(() => Promise.resolve([{ kind: "audioinput" }])),
      },
    });

    const report = await checkBiometricsSupport({
      requestCameraPermission: true,
      resourcesLocation: "https://cdn.test/sdk/",
    });

    expect(report.checks.find((check) => check.id === "camera")).toMatchObject({
      status: "failed",
      message: "No video input device is available.",
    });
    expect(stop).toHaveBeenCalledOnce();
    expect(report.supported).toBe(false);
  });

  it("returns a complete report for HTTP, MIME, and HEAD failures", async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = requestUrl(input);

      if (url.endsWith("biometrics-worker.js")) {
        return Promise.resolve(responseFor(url, { ok: false, status: 404 }));
      }

      if (url.endsWith("biometrics-wasm.data")) {
        return Promise.resolve(responseFor(url, { ok: false, status: 405 }));
      }

      if (url.endsWith("biometrics-wasm.wasm")) {
        return Promise.resolve(
          responseFor(url, {
            headers: new Headers({
              "content-type": "application/octet-stream",
            }),
          }),
        );
      }

      return Promise.resolve(responseFor(url));
    });
    installSupportedBrowser(fetchMock);

    const report = await checkBiometricsSupport({
      resourcesLocation: "https://cdn.test/sdk/",
    });
    const resources = report.checks.filter((check) => check.id === "resource");

    expect(resources).toHaveLength(getBiometricsRuntimeResourceManifest("simd").length);
    expect(resources.map((check) => check.status)).toEqual(expect.arrayContaining(["failed", "warning", "passed"]));
    expect(resources.find((check) => check.resource?.kind === "worker-script")?.status).toBe("failed");
    expect(report.supported).toBe(false);
  });

  it("sanitizes the final redirected resource URL", async () => {
    installSupportedBrowser(
      vi.fn((input: RequestInfo | URL) => {
        const url = requestUrl(input);

        return Promise.resolve(
          responseFor(url, {
            redirected: true,
            url: `https://user:secret@assets.test${new URL(url).pathname}?token=secret#debug`,
          }),
        );
      }),
    );

    const report = await checkBiometricsSupport({
      resourcesLocation: "https://cdn.test/sdk/",
    });

    expect(
      report.checks
        .filter((check) => check.id === "resource")
        .every(
          (check) =>
            check.resource?.url.startsWith("https://assets.test/") === true &&
            !check.resource.url.includes("secret") &&
            !check.resource.url.includes("?") &&
            !check.resource.url.includes("#"),
        ),
    ).toBe(true);
    expect(JSON.stringify(report)).not.toContain("secret");
    expect(JSON.stringify(report)).not.toContain("token");
  });

  it("returns every timed-out resource check when fetch ignores abort", async () => {
    vi.useFakeTimers();
    installSupportedBrowser(vi.fn(() => new Promise<Response>(() => undefined)));

    const reportPromise = checkBiometricsSupport({
      resourcesLocation: "https://cdn.test/sdk/",
      timeoutMs: 10,
    });
    await vi.advanceTimersByTimeAsync(11);
    const report = await reportPromise;
    const resources = report.checks.filter((check) => check.id === "resource");

    expect(resources).toHaveLength(getBiometricsRuntimeResourceManifest("simd").length);
    expect(
      resources.every(
        (check) => check.status === "failed" && check.message === "Resource check exceeded the preflight deadline.",
      ),
    ).toBe(true);
  });

  it("automatically selects and checks only SIMD threads resources", async () => {
    detectMainThreadWasmCapabilitiesMock.mockResolvedValue({
      minimumFeatures: true,
      relaxedSimd: false,
      threads: true,
      sharedMemory: true,
      worker: true,
      crossOriginIsolated: true,
      safari: false,
    });
    const fetchMock = vi.fn((input: RequestInfo | URL) => Promise.resolve(responseFor(requestUrl(input))));
    installSupportedBrowser(fetchMock);

    const report = await checkBiometricsSupport({
      resourcesLocation: "https://cdn.test/sdk/",
    });
    const nativeUrls = fetchMock.mock.calls
      .map(([input]) => requestUrl(input))
      .filter((url) => url.includes("biometrics-wasm"));

    expect(report.wasmVariant).toBe("simd-threads");
    expect(report.supported).toBe(true);
    expect(nativeUrls).toHaveLength(3);
    expect(nativeUrls.every((url) => url.includes("/simd-threads/"))).toBe(true);
  });

  it("automatically selects and checks only relaxed SIMD threads resources", async () => {
    detectMainThreadWasmCapabilitiesMock.mockResolvedValue({
      minimumFeatures: true,
      relaxedSimd: true,
      threads: true,
      sharedMemory: true,
      worker: true,
      crossOriginIsolated: true,
      safari: false,
    });
    const fetchMock = vi.fn((input: RequestInfo | URL) => Promise.resolve(responseFor(requestUrl(input))));
    installSupportedBrowser(fetchMock);

    const report = await checkBiometricsSupport({
      resourcesLocation: "https://cdn.test/sdk/",
    });
    const nativeUrls = fetchMock.mock.calls
      .map(([input]) => requestUrl(input))
      .filter((url) => url.includes("biometrics-wasm"));

    expect(report.wasmVariant).toBe("simd-relaxed-threads");
    expect(report.supported).toBe(true);
    expect(nativeUrls).toHaveLength(3);
    expect(nativeUrls.every((url) => url.includes("/simd-relaxed-threads/"))).toBe(true);
  });

  it("requires thread capabilities for a forced relaxed SIMD threads variant", async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => Promise.resolve(responseFor(requestUrl(input))));
    installSupportedBrowser(fetchMock);

    const report = await checkBiometricsSupport({
      resourcesLocation: "https://cdn.test/sdk/",
      wasmVariant: "simd-relaxed-threads",
    });

    expect(report.wasmVariant).toBe("simd-relaxed-threads");
    expect(report.checks.find((check) => check.id === "wasmThreads")).toMatchObject({ status: "failed" });
  });

  it("checks only a forced SIMD variant", async () => {
    detectMainThreadWasmCapabilitiesMock.mockResolvedValue({
      minimumFeatures: true,
      relaxedSimd: false,
      threads: true,
      sharedMemory: true,
      worker: true,
      crossOriginIsolated: true,
      safari: false,
    });
    const fetchMock = vi.fn((input: RequestInfo | URL) => Promise.resolve(responseFor(requestUrl(input))));
    installSupportedBrowser(fetchMock);

    const report = await checkBiometricsSupport({
      resourcesLocation: "https://cdn.test/sdk/",
      wasmVariant: "simd",
    });
    const nativeUrls = fetchMock.mock.calls
      .map(([input]) => requestUrl(input))
      .filter((url) => url.includes("biometrics-wasm"));

    expect(report.wasmVariant).toBe("simd");
    expect(nativeUrls).toHaveLength(3);
    expect(nativeUrls.every((url) => url.includes("/simd/"))).toBe(true);
  });

  it.each([
    ["wasmThreads", { threads: false }],
    ["threadWorker", { worker: false }],
    ["sharedMemory", { sharedMemory: false }],
    ["crossOriginIsolated", { crossOriginIsolated: false }],
    ["safariThreads", { safari: true }],
  ] as const)("fails forced SIMD threads when %s is unavailable", async (failedCheckId, override) => {
    detectMainThreadWasmCapabilitiesMock.mockResolvedValue({
      minimumFeatures: true,
      relaxedSimd: false,
      threads: true,
      sharedMemory: true,
      worker: true,
      crossOriginIsolated: true,
      safari: false,
      ...override,
    });
    installSupportedBrowser();

    const report = await checkBiometricsSupport({
      resourcesLocation: "https://cdn.test/sdk/",
      wasmVariant: "simd-threads",
    });

    expect(report.wasmVariant).toBe("simd-threads");
    expect(report.supported).toBe(false);
    expect(report.checks.find((check) => check.id === failedCheckId)?.status).toBe("failed");
  });

  it("reports no variant and checks only common resources without minimum SIMD support", async () => {
    detectMainThreadWasmCapabilitiesMock.mockResolvedValue({
      minimumFeatures: false,
      relaxedSimd: false,
      threads: false,
      sharedMemory: false,
      worker: true,
      crossOriginIsolated: false,
      safari: false,
    });
    const fetchMock = vi.fn((input: RequestInfo | URL) => Promise.resolve(responseFor(requestUrl(input))));
    installSupportedBrowser(fetchMock);

    const report = await checkBiometricsSupport({
      resourcesLocation: "https://cdn.test/sdk/",
    });

    expect(report.wasmVariant).toBeUndefined();
    expect(report.supported).toBe(false);
    expect(fetchMock.mock.calls.some(([input]) => requestUrl(input).includes("biometrics-wasm"))).toBe(false);
  });

  it("does not retry SIMD after a selected threaded resource fails", async () => {
    detectMainThreadWasmCapabilitiesMock.mockResolvedValue({
      minimumFeatures: true,
      relaxedSimd: false,
      threads: true,
      sharedMemory: true,
      worker: true,
      crossOriginIsolated: true,
      safari: false,
    });
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = requestUrl(input);

      return Promise.resolve(
        responseFor(url, url.endsWith("simd-threads/biometrics-wasm.wasm") ? { ok: false, status: 404 } : {}),
      );
    });
    installSupportedBrowser(fetchMock);

    const report = await checkBiometricsSupport({
      resourcesLocation: "https://cdn.test/sdk/",
    });

    expect(report.supported).toBe(false);
    expect(fetchMock.mock.calls.some(([input]) => requestUrl(input).includes("/simd/biometrics-wasm"))).toBe(false);
  });

  it("rejects invalid options with structured configuration errors", async () => {
    installSupportedBrowser();

    await expect(checkBiometricsSupport({ timeoutMs: 0 })).rejects.toMatchObject<Partial<ConfigurationError>>({
      code: "INVALID_CONFIGURATION",
      isRetryable: false,
    });
    await expect(checkBiometricsSupport({ resourcesLocation: "file:///tmp/resources" })).rejects.toMatchObject<
      Partial<ConfigurationError>
    >({
      code: "INVALID_CONFIGURATION",
      isRetryable: false,
    });
    await expect(
      checkBiometricsSupport({
        wasmVariant: "invalid" as "simd",
      }),
    ).rejects.toMatchObject<Partial<ConfigurationError>>({
      code: "INVALID_CONFIGURATION",
      isRetryable: false,
    });
    await expect(checkBiometricsSupport(null as unknown as object)).rejects.toMatchObject<Partial<ConfigurationError>>({
      code: "INVALID_CONFIGURATION",
      isRetryable: false,
    });
  });
});
