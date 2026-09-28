/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { Ping } from "@microblink/analytics/ping";
import type { FaceCaptureResult } from "@microblink/biometrics-core";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createBiometricsAnalytics } from "./BiometricsAnalytics";

function createTransport() {
  const pings: Ping[] = [];

  return {
    pings,
    transport: {
      ping: vi.fn((ping: Ping) => {
        pings.push(ping);

        return Promise.resolve();
      }),
      sendPinglets: vi.fn(() => Promise.resolve()),
    },
  };
}

const sessionContext = { sessionId: "native-session-id", traceId: "native-trace-id", sessionNumber: 4 };

function analyticsEvents(pings: Ping[]) {
  return pings
    .filter((ping) => ping.schemaName === "ping.log")
    .map((ping) => JSON.parse(ping.data.logMessage) as Record<string, unknown>);
}

describe("BiometricsAnalytics", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("uses native session correlation for metadata pinglets", async () => {
    const { pings, transport } = createTransport();
    const analytics = createBiometricsAnalytics({ enabled: true, userId: "user-id" }, transport).forSession(
      sessionContext,
    );

    await analytics.logSessionEvent({ kind: "captureTimeout" });

    expect(pings).toHaveLength(2);
    expect(pings[0]).toMatchObject({
      schemaName: "ping.log",
      sessionNumber: 4,
    });
    expect(JSON.parse((pings[0] as Extract<Ping, { schemaName: "ping.log" }>).data.logMessage)).toMatchObject({
      product: "Biometrics",
      eventName: "capture.timed_out",
      sessionId: "native-session-id",
      sessionNumber: 4,
    });
    expect(pings[1]).toEqual({
      schemaName: "ping.sdk.ux.event",
      schemaVersion: "1.3.0",
      sessionNumber: 4,
      data: { eventType: "StepTimeout" },
    });
    expect(transport.sendPinglets).toHaveBeenCalledOnce();
  });

  it("adds native session correlation to externally constructed analytics events", async () => {
    const { pings, transport } = createTransport();
    const analytics = createBiometricsAnalytics({ enabled: true, userId: "user-id" }, transport).forSession(
      sessionContext,
    );

    await analytics.report({
      schemaName: "ping.sdk.upload",
      schemaVersion: "1.0.0",
      data: { sessionId: "native-session-id", eventType: "Initialized" },
    });

    expect(pings).toEqual([
      {
        schemaName: "ping.sdk.upload",
        schemaVersion: "1.0.0",
        sessionNumber: 4,
        data: { sessionId: "native-session-id", eventType: "Initialized" },
      },
    ]);
  });

  it("logs capture start through the session-owned ping.log seam", async () => {
    const { pings, transport } = createTransport();
    const sdkAnalytics = createBiometricsAnalytics({ enabled: true, userId: "user-id" }, transport);
    const analytics = sdkAnalytics.forSession(sessionContext);

    await analytics.logCaptureStarted();

    expect(analyticsEvents(pings)).toEqual([
      expect.objectContaining({ eventName: "capture.started", sessionId: "native-session-id", sessionNumber: 4 }),
    ]);
    expect(transport.sendPinglets).not.toHaveBeenCalled();
  });

  it("reports handled errors as nonfatal with native session correlation", async () => {
    const { pings, transport } = createTransport();
    const analytics = createBiometricsAnalytics({ enabled: true, userId: "user-id" }, transport).forSession(
      sessionContext,
    );
    const error = new Error("temporary failure");

    await analytics.logNonFatal("sdk.capture", error);

    expect(pings).toEqual([
      {
        schemaName: "ping.error",
        schemaVersion: "1.0.0",
        sessionNumber: 4,
        data: {
          errorType: "NonFatal",
          errorMessage: "sdk.capture: temporary failure",
          stackTrace: error.stack,
        },
      },
    ]);
  });

  it("emits derived metadata without biometric payloads", async () => {
    const { pings, transport } = createTransport();
    const analytics = createBiometricsAnalytics({ enabled: true, userId: "user-id" }, transport).forSession(
      sessionContext,
    );
    const captureResult: FaceCaptureResult = {
      traceId: sessionContext.traceId,
      sessionNumber: sessionContext.sessionNumber,
      bestImage: {
        image: { width: 2, height: 2 } as ImageData,
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
      captureFrame: {
        data: new TextEncoder().encode("private-image/jpeg").buffer,
        mimeType: "image/jpeg",
        frameNumber: 7,
        captureTimeMs: 120,
        signature: {
          algorithm: "engine",
          signature: new TextEncoder().encode("private-signature").buffer,
        },
      },
      livenessFrames: [
        {
          data: new TextEncoder().encode("private-image/qoi").buffer,
          mimeType: "image/qoi",
          frameNumber: 8,
          captureTimeMs: 140,
          timestamp: "2026-06-16T10:00:00.000Z",
          signature: {
            algorithm: "engine",
            signature: new TextEncoder().encode("private-signature").buffer,
          },
        },
      ],
      livenessBatchSignature: {
        algorithm: "engine",
        signature: new TextEncoder().encode("private-signature").buffer,
      },
    };

    await analytics.logSessionEvent({
      kind: "captureFinished",
      result: captureResult,
    });

    expect(analyticsEvents(pings)).toEqual([
      expect.objectContaining({
        eventName: "capture.completed",
        livenessFrameCount: 1,
        requestMode: "engineFrames",
        hasCaptureFrame: true,
        hasLivenessBatchSignature: true,
      }),
    ]);
    expect(JSON.stringify(pings)).not.toMatch(/private-|signature|LeftEye|image\/jpeg|image\/qoi/);
    expect(transport.sendPinglets).toHaveBeenCalledOnce();
  });

  it("uses SDK-level correlation before a capture session exists", async () => {
    const { pings, transport } = createTransport();
    const analytics = createBiometricsAnalytics({ enabled: true, userId: "user-id" }, transport);

    await expect(analytics.logInitStarted()).resolves.toBeUndefined();
    await analytics.logInitFailed(new Error("WASM could not load"));

    expect(pings[0]).toMatchObject({ sessionNumber: 0 });
    expect(JSON.parse((pings[0] as Extract<Ping, { schemaName: "ping.log" }>).data.logMessage)).toMatchObject({
      product: "Biometrics",
      eventName: "sdk.init.started",
      sessionNumber: 0,
    });
    expect(pings).toContainEqual(
      expect.objectContaining({
        schemaName: "ping.error",
        sessionNumber: 0,
        data: expect.objectContaining({ errorType: "NonFatal", errorMessage: "sdk.init: WASM could not load" }),
      }),
    );
  });

  it("mirrors safe diagnostic timing metadata without resource URLs", async () => {
    const { pings, transport } = createTransport();
    const analytics = createBiometricsAnalytics({ enabled: true, userId: "user-id" }, transport);

    await analytics.logDiagnostic({
      phase: "initialization",
      component: "wasm-resources",
      status: "completed",
      timestamp: "2026-07-24T10:00:00.000Z",
      durationMs: 42,
      resource: {
        kind: "biometrics-wasm-binary",
        url: "https://private.example/model.wasm?token=secret",
      },
    });

    expect(analyticsEvents(pings)).toEqual([
      expect.objectContaining({
        eventName: "sdk.diagnostic",
        phase: "initialization",
        component: "wasm-resources",
        status: "completed",
        durationMs: 42,
        resourceKind: "biometrics-wasm-binary",
      }),
    ]);
    expect(JSON.stringify(pings)).not.toContain("private.example");
    expect(JSON.stringify(pings)).not.toContain("token");
  });

  it("does not queue top-level metadata when disabled", async () => {
    const { transport } = createTransport();
    const analytics = createBiometricsAnalytics({ enabled: false, userId: "user-id" }, transport);

    await analytics.logInitStarted();
    await analytics.logCaptureStarted();
    await analytics.logSessionEvent({ kind: "captureTimeout" });
    await analytics.logNonFatal("sdk.capture", new Error("boom"));
    await analytics.logDiagnostic({
      phase: "initialization",
      component: "sdk",
      status: "completed",
      timestamp: "2026-07-24T10:00:00.000Z",
      durationMs: 12,
    });

    expect(transport.ping).not.toHaveBeenCalled();
    expect(transport.sendPinglets).not.toHaveBeenCalled();
  });
});
