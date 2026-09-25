/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { Ping } from "@microblink/analytics/ping";
import type { CaptureSessionContext } from "@microblink/biometrics-core";
import type { FaceCaptureResult } from "@microblink/biometrics-core";
import type { BiometricsDiagnosticEvent } from "@microblink/biometrics-core";
import { getUserId } from "@microblink/core-common/getUserId";

import type { BiometricsAnalyticsEvent, BiometricsAnalyticsSettings, BiometricsSessionEvent } from "./types";

type BiometricsAnalyticsEventName =
  | "sdk.init.started"
  | "sdk.init.completed"
  | "sdk.init.failed"
  | "capture.started"
  | "capture.feedback.changed"
  | "capture.completed"
  | "capture.timed_out"
  | "sdk.diagnostic"
  | "sdk.closed";

type BiometricsAnalyticsMetadata = Record<string, boolean | number | string | undefined>;

const BIOMETRICS_USER_ID_STORAGE_KEY = "biometrics-userid";

type ResolvedBiometricsAnalyticsSettings = {
  enabled: boolean;
  userId: string;
  pingProxyUrl?: string;
};

export type BiometricsAnalyticsTransport = {
  ping(ping: Ping): Promise<void>;
  sendPinglets(): Promise<void>;
};

export type BiometricsAnalytics = {
  readonly enabled: boolean;
  forSession(context: CaptureSessionContext): BiometricsAnalytics;
  ping(ping: Ping): Promise<void>;
  report(event: BiometricsAnalyticsEvent): Promise<void>;
  logInitStarted(): Promise<void>;
  logInitCompleted(): Promise<void>;
  logInitFailed(error: unknown): Promise<void>;
  logNonFatal(origin: string, error: unknown): Promise<void>;
  logCaptureStarted(): Promise<void>;
  logSessionEvent(event: BiometricsSessionEvent): Promise<void>;
  logDiagnostic(event: BiometricsDiagnosticEvent): Promise<void>;
  logSdkClosed(): Promise<void>;
  sendPinglets(): Promise<void>;
};

export function resolveBiometricsAnalyticsSettings(
  settings: BiometricsAnalyticsSettings | undefined,
): ResolvedBiometricsAnalyticsSettings {
  return {
    enabled: settings?.enabled !== false,
    userId: settings?.userId ?? getUserId(BIOMETRICS_USER_ID_STORAGE_KEY),
    pingProxyUrl: settings?.pingProxyUrl,
  };
}

const noopAnalytics: BiometricsAnalytics = {
  enabled: false,
  forSession: () => noopAnalytics,
  ping: () => Promise.resolve(),
  report: () => Promise.resolve(),
  logInitStarted: () => Promise.resolve(),
  logInitCompleted: () => Promise.resolve(),
  logInitFailed: () => Promise.resolve(),
  logNonFatal: () => Promise.resolve(),
  logCaptureStarted: () => Promise.resolve(),
  logSessionEvent: () => Promise.resolve(),
  logDiagnostic: () => Promise.resolve(),
  logSdkClosed: () => Promise.resolve(),
  sendPinglets: () => Promise.resolve(),
};

async function safePing(transport: BiometricsAnalyticsTransport, ping: Ping): Promise<void> {
  try {
    await transport.ping(ping);
  } catch (error) {
    console.warn("Biometrics analytics ping failed:", error);
  }
}

async function safeSendPinglets(transport: BiometricsAnalyticsTransport): Promise<void> {
  try {
    await transport.sendPinglets();
  } catch (error) {
    console.warn("Send pinglets failed:", error);
  }
}

function getErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const maybeCode = "code" in error ? error.code : undefined;

  return typeof maybeCode === "string" ? maybeCode : undefined;
}

function getErrorRetryable(error: unknown): boolean | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const maybeRetryable = "isRetryable" in error ? error.isRetryable : undefined;

  return typeof maybeRetryable === "boolean" ? maybeRetryable : undefined;
}

function getErrorName(error: unknown): string {
  return error instanceof Error ? error.name : "Error";
}

function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    try {
      return JSON.stringify(error);
    } catch {
      return Object.prototype.toString.call(error);
    }
  }

  return String(error);
}

function buildCaptureMetadata(result: FaceCaptureResult): BiometricsAnalyticsMetadata {
  return {
    livenessFrameCount: result.livenessFrames.length,
    requestMode: result.livenessFrames.length > 0 ? "engineFrames" : "singleImage",
    hasCaptureFrame: result.captureFrame !== undefined,
    hasLivenessBatchSignature: result.livenessBatchSignature !== undefined,
  };
}

export function createBiometricsAnalytics(
  settings: ResolvedBiometricsAnalyticsSettings,
  transport: BiometricsAnalyticsTransport,
): BiometricsAnalytics {
  if (!settings.enabled) {
    return noopAnalytics;
  }

  function createForContext(context: { sessionId?: string; sessionNumber: number }): BiometricsAnalytics {
    async function logEvent(
      eventName: BiometricsAnalyticsEventName,
      metadata: BiometricsAnalyticsMetadata = {},
    ): Promise<void> {
      const { sessionId, sessionNumber } = context;

      const ping: Ping = {
        schemaName: "ping.log",
        schemaVersion: "1.0.0",
        sessionNumber,
        data: {
          logLevel: "Info",
          logMessage: JSON.stringify({
            product: "Biometrics",
            eventName,
            sessionId,
            sessionNumber,
            ...metadata,
          }),
        },
      };

      await safePing(transport, ping);
    }

    async function logError(
      eventName: BiometricsAnalyticsEventName,
      error: unknown,
      metadata: BiometricsAnalyticsMetadata = {},
    ): Promise<void> {
      await logEvent(eventName, {
        ...metadata,
        errorName: getErrorName(error),
        errorCode: getErrorCode(error),
        retryable: getErrorRetryable(error),
      });
    }

    async function logNonFatal(origin: string, error: unknown): Promise<void> {
      const code = getErrorCode(error);

      await safePing(transport, {
        schemaName: "ping.error",
        schemaVersion: "1.0.0",
        sessionNumber: context.sessionNumber,
        data: {
          errorType: "NonFatal",
          errorMessage: `${origin}: ${code ? `${code}: ` : ""}${formatErrorMessage(error)}`,
          stackTrace: error instanceof Error ? error.stack : undefined,
        },
      });
    }

    return {
      enabled: true,
      forSession: (sessionContext) => createForContext(sessionContext),
      ping: (ping) => safePing(transport, ping),
      report: (event) => safePing(transport, { ...event, sessionNumber: context.sessionNumber } as Ping),
      logInitStarted: () => logEvent("sdk.init.started"),
      logInitCompleted: () => logEvent("sdk.init.completed"),
      logInitFailed: async (error) => {
        await logError("sdk.init.failed", error);
        await logNonFatal("sdk.init", error);
      },
      logNonFatal,
      logCaptureStarted: () => logEvent("capture.started"),
      logDiagnostic: (event) =>
        logEvent("sdk.diagnostic", {
          phase: event.phase,
          component: event.component,
          status: event.status,
          durationMs: event.durationMs,
          errorCode: event.errorCode,
          resourceKind: event.resource?.kind,
        }),
      logSdkClosed: () => logEvent("sdk.closed"),
      sendPinglets: () => safeSendPinglets(transport),
      async logSessionEvent(event) {
        switch (event.kind) {
          case "faceGuidance":
            await logEvent("capture.feedback.changed", {
              feedback: event.feedback,
            });

            return;
          case "captureFinished":
            await logEvent("capture.completed", buildCaptureMetadata(event.result));
            await safeSendPinglets(transport);

            return;
          case "captureTimeout":
            await logEvent("capture.timed_out");
            await safePing(transport, {
              schemaName: "ping.sdk.ux.event",
              schemaVersion: "1.3.0",
              sessionNumber: context.sessionNumber,
              data: { eventType: "StepTimeout" },
            });
            await safeSendPinglets(transport);

            return;
          case "captureTechnicalData":
            return;
        }
      },
    };
  }

  return createForContext({ sessionNumber: 0 });
}
