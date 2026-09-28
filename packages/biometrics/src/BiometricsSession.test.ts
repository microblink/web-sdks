/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { BiometricsCaptureSession, CaptureFaceConfig } from "@microblink/biometrics-core";
import { BiometricsError, type FaceCaptureResult, type FaceLandmarks } from "@microblink/biometrics-core";
import { describe, expect, it, vi } from "vitest";

import type { BiometricsAnalytics } from "./BiometricsAnalytics";
import { BiometricsSessionImpl } from "./BiometricsSession";
import type { BiometricsSessionEvent } from "./types";

function landmarks(): FaceLandmarks {
  return {
    LeftEye: { x: 0.2, y: 0.3 },
    RightEye: { x: 0.8, y: 0.3 },
    NoseTip: { x: 0.5, y: 0.5 },
    Mouth: { x: 0.5, y: 0.7 },
    LeftEar: { x: 0.1, y: 0.4 },
    RightEar: { x: 0.9, y: 0.4 },
  };
}

function captureResult(): FaceCaptureResult {
  return {
    traceId: "trace",
    sessionNumber: 2,
    bestImage: { image: { width: 2, height: 2 } as ImageData, landmarks: landmarks() },
    supportingImages: [],
    livenessFrames: [],
  };
}

function captureSession() {
  return {
    context: { sessionId: "session", traceId: "trace", sessionNumber: 2 },
    capture: vi.fn<(config: CaptureFaceConfig) => Promise<FaceCaptureResult>>(),
    processFrame: vi.fn<(imageData: ImageData) => Promise<ArrayBuffer>>(),
    setCameraSource: vi.fn<(videoElement: HTMLVideoElement | undefined, track: MediaStreamTrack | undefined) => void>(),
    setCaptureTimeoutPaused: vi.fn<(paused: boolean) => void>(),
    close: vi.fn(() => Promise.resolve()),
    subscribe: vi.fn(),
    getState: vi.fn(),
  };
}

function analytics(): BiometricsAnalytics {
  const value = {
    enabled: true,
    forSession: vi.fn(),
    ping: vi.fn(() => Promise.resolve()),
    report: vi.fn(() => Promise.resolve()),
    logInitStarted: vi.fn(() => Promise.resolve()),
    logInitCompleted: vi.fn(() => Promise.resolve()),
    logInitFailed: vi.fn(() => Promise.resolve()),
    logNonFatal: vi.fn(() => Promise.resolve()),
    logCaptureStarted: vi.fn(() => Promise.resolve()),
    logSessionEvent: vi.fn(() => Promise.resolve()),
    logDiagnostic: vi.fn(() => Promise.resolve()),
    logSdkClosed: vi.fn(() => Promise.resolve()),
    sendPinglets: vi.fn(() => Promise.resolve()),
  } satisfies BiometricsAnalytics;
  value.forSession.mockReturnValue(value);
  return value;
}

describe("BiometricsSession", () => {
  it("exposes one session context for correlation and analytics reporting", async () => {
    const capture = captureSession();
    const sessionAnalytics = analytics();
    const reportedEvents: unknown[] = [];
    let flushCount = 0;
    sessionAnalytics.report = (event) => {
      reportedEvents.push(event);
      return Promise.resolve();
    };
    sessionAnalytics.sendPinglets = () => {
      flushCount += 1;
      return Promise.resolve();
    };
    const session = new BiometricsSessionImpl(
      () => Promise.resolve(capture as unknown as BiometricsCaptureSession),
      {},
      sessionAnalytics,
    );
    const context = await session.getSessionContext();
    const repeatedContext = await session.getSessionContext();
    const event = {
      schemaName: "ping.sdk.upload",
      schemaVersion: "1.0.0",
      data: { sessionId: "session", eventType: "Initialized" },
    } as const;

    expect(context).toMatchObject({ sessionId: "session", traceId: "trace", sessionNumber: 2 });
    expect(repeatedContext).toBe(context);
    await context.report(event);
    await context.flush();
    expect(reportedEvents).toEqual([event]);
    expect(flushCount).toBe(1);
  });

  it("retries session initialization after a session-context failure", async () => {
    const capture = captureSession();
    const createCaptureSession = vi
      .fn<() => Promise<BiometricsCaptureSession>>()
      .mockRejectedValueOnce(new Error("initialization failed"))
      .mockResolvedValueOnce(capture as unknown as BiometricsCaptureSession);
    const session = new BiometricsSessionImpl(createCaptureSession);

    await expect(session.getSessionContext()).rejects.toThrow("initialization failed");
    await expect(session.getSessionContext()).resolves.toMatchObject({
      sessionId: "session",
      traceId: "trace",
      sessionNumber: 2,
    });
    expect(createCaptureSession).toHaveBeenCalledTimes(2);
  });

  it("captures a face and publishes capture events", async () => {
    const capture = captureSession();
    const result = captureResult();
    const events: BiometricsSessionEvent[] = [];
    capture.capture.mockImplementation((config) => {
      config.onFeedbackChange?.("TOO_FAR");
      config.onAnalysisResult?.({
        feedback: "TOO_FAR",
        boundingBox: { x: 0.1, y: 0.2, width: 0.3, height: 0.4 },
        landmarks: landmarks(),
        inputImageSize: { width: 640, height: 480 },
      });
      config.onCapture?.(result);
      return Promise.resolve(result);
    });
    const session = new BiometricsSessionImpl(
      () => Promise.resolve(capture as unknown as BiometricsCaptureSession),
      { captureTimeoutMs: 42_000, captureFace: { debugMode: true } },
      analytics(),
    );
    session.onEvent((event) => events.push(event));

    await expect(session.run()).resolves.toBe(result);

    expect(capture.capture).toHaveBeenCalledWith(expect.objectContaining({ timeoutMs: 42_000, debugMode: true }));
    expect(events.map((event) => event.kind)).toEqual(["faceGuidance", "captureTechnicalData", "captureFinished"]);
    expect(session.getState()).toEqual({ phase: "succeeded", result });
    expect(capture.close).toHaveBeenCalledOnce();
  });

  it("retries a retryable capture failure", async () => {
    const capture = captureSession();
    const result = captureResult();
    capture.capture
      .mockRejectedValueOnce(
        new BiometricsError({
          message: "temporary failure",
          code: "FRAME_PROCESSING_FAILED",
          stage: "capture",
          component: "worker",
          isRetryable: true,
        }),
      )
      .mockResolvedValueOnce(result);
    const sessionAnalytics = analytics();
    const reportNonFatal = vi.fn(() => Promise.resolve());
    sessionAnalytics.logNonFatal = reportNonFatal;
    const session = new BiometricsSessionImpl(
      () => Promise.resolve(capture as unknown as BiometricsCaptureSession),
      {},
      sessionAnalytics,
    );

    await expect(session.run()).rejects.toMatchObject({ isRetryable: true });
    await expect(session.retry()).resolves.toBe(result);
    expect(capture.capture).toHaveBeenCalledTimes(2);
    expect(reportNonFatal).toHaveBeenCalledOnce();
  });

  it("returns the capture session's frame-processing promise", async () => {
    const capture = captureSession();
    const frame = { data: { buffer: new ArrayBuffer(4) } } as ImageData;
    const framePromise = Promise.resolve(new ArrayBuffer(8));
    capture.processFrame.mockReturnValue(framePromise);
    const session = new BiometricsSessionImpl(() => Promise.resolve(capture as unknown as BiometricsCaptureSession));

    await Promise.resolve();
    expect(session.processFrame(frame)).toBe(framePromise);
  });

  it("forwards the camera source when the capture session becomes available", async () => {
    const capture = captureSession();
    const session = new BiometricsSessionImpl(() => Promise.resolve(capture as unknown as BiometricsCaptureSession));
    const videoElement = {} as HTMLVideoElement;
    const track = {} as MediaStreamTrack;

    session.setCameraSource(videoElement, track);

    await vi.waitFor(() => expect(capture.setCameraSource).toHaveBeenCalledWith(videoElement, track));
  });

  it("finishes an active capture and closes its native session", async () => {
    const capture = captureSession();
    capture.capture.mockReturnValue(new Promise(() => undefined));
    const session = new BiometricsSessionImpl(() => Promise.resolve(capture as unknown as BiometricsCaptureSession));
    const run = session.run();
    await vi.waitFor(() => expect(capture.capture).toHaveBeenCalledOnce());

    session.finish();

    expect(session.getState()).toEqual({ phase: "finished" });
    await vi.waitFor(() => expect(capture.close).toHaveBeenCalledOnce());
    void run.catch(() => undefined);
  });
});
