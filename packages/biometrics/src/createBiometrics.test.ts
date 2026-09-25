/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { Ping } from "@microblink/analytics/ping";
import type { FaceCaptureResult } from "@microblink/biometrics-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const createBiometricsCaptureMock = vi.hoisted(() => vi.fn());

vi.mock("@microblink/biometrics-core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@microblink/biometrics-core")>()),
  createBiometricsCapture: createBiometricsCaptureMock,
}));

import { createBiometrics } from "./createBiometrics";

function result(): FaceCaptureResult {
  return {
    traceId: "trace-id",
    sessionNumber: 1,
    bestImage: {
      image: {} as ImageData,
      landmarks: {
        LeftEye: { x: 0.2, y: 0.3 },
        RightEye: { x: 0.8, y: 0.3 },
        NoseTip: { x: 0.5, y: 0.5 },
        Mouth: { x: 0.5, y: 0.7 },
        LeftEar: { x: 0.1, y: 0.4 },
        RightEar: { x: 0.9, y: 0.4 },
      },
    },
    supportingImages: [],
    livenessFrames: [],
  };
}

function captureClient(captureResult = result()) {
  const session = {
    context: { sessionId: "native-session", traceId: "trace-id", sessionNumber: 1 },
    capture: vi.fn(() => Promise.resolve(captureResult)),
    processFrame: vi.fn(),
    setCameraSource: vi.fn(),
    setCaptureTimeoutPaused: vi.fn(),
    close: vi.fn(() => Promise.resolve()),
    subscribe: vi.fn(),
    getState: vi.fn(),
  };

  return {
    session,
    client: {
      startSession: vi.fn(() => Promise.resolve(session)),
      close: vi.fn(() => Promise.resolve()),
      ping: vi.fn((_ping: Ping) => Promise.resolve()),
      sendPinglets: vi.fn(() => Promise.resolve()),
    },
  };
}

describe("createBiometrics", () => {
  beforeEach(() => vi.clearAllMocks());

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("initializes capture and returns captured evidence", async () => {
    vi.stubGlobal("window", { location: { href: "https://example.test/app/" } });
    const fixture = captureClient();
    createBiometricsCaptureMock.mockResolvedValue(fixture.client);

    const sdk = await createBiometrics({
      licenseKey: "license",
      capture: {
        imageOrigin: "canvas2d",
        faceAnalysis: { maximumInputLongEdge: 1280, maximumInputShortEdge: 720 },
      },
      analytics: { enabled: false },
    });
    const capture = sdk.startSession({ captureTimeoutMs: 42_000 });

    await expect(capture.run()).resolves.toMatchObject({
      traceId: "trace-id",
      sessionNumber: 1,
    });
    expect(createBiometricsCaptureMock).toHaveBeenCalledWith(
      expect.objectContaining({
        licenseKey: "license",
        imageOrigin: "canvas2d",
        faceAnalysis: { maximumInputLongEdge: 1280, maximumInputShortEdge: 720 },
        resourcePath: "https://example.test/app/resources/",
      }),
    );
    expect(fixture.session.capture).toHaveBeenCalledWith(expect.objectContaining({ timeoutMs: 42_000 }));
  });

  it("starts a capture session without options", async () => {
    const fixture = captureClient();
    createBiometricsCaptureMock.mockResolvedValue(fixture.client);
    const sdk = await createBiometrics({ licenseKey: "license" });

    await expect(sdk.startSession().run()).resolves.toBeDefined();
    expect(fixture.client.startSession).toHaveBeenCalledWith(undefined);
  });

  it("rejects an invalid initialization timeout before creating capture", async () => {
    await expect(createBiometrics({ licenseKey: "license", initializationTimeoutMs: 0 })).rejects.toMatchObject({
      code: "INVALID_CONFIGURATION",
    });
    expect(createBiometricsCaptureMock).not.toHaveBeenCalled();
  });

  it("closes a capture client that resolves after initialization times out", async () => {
    vi.useFakeTimers();
    const fixture = captureClient();
    let resolveCapture!: (client: typeof fixture.client) => void;
    createBiometricsCaptureMock.mockReturnValue(
      new Promise((resolve) => {
        resolveCapture = resolve;
      }),
    );
    const initialization = createBiometrics({ licenseKey: "license", initializationTimeoutMs: 100 });
    const rejection = expect(initialization).rejects.toMatchObject({ code: "INITIALIZATION_TIMEOUT" });

    await vi.advanceTimersByTimeAsync(100);
    await rejection;
    resolveCapture(fixture.client);
    await Promise.resolve();
    await Promise.resolve();

    expect(fixture.client.close).toHaveBeenCalledOnce();
  });

  it("closes the capture SDK once", async () => {
    const fixture = captureClient();
    createBiometricsCaptureMock.mockResolvedValue(fixture.client);
    const sdk = await createBiometrics({ licenseKey: "license", analytics: { enabled: false } });

    await Promise.all([sdk.close(), sdk.close()]);
    expect(fixture.client.close).toHaveBeenCalledOnce();
  });
});
