/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { createBiometricsCapture } from "@microblink/biometrics-core";
import type { BiometricsCaptureClient } from "@microblink/biometrics-core";
import type { BiometricsDiagnosticEvent } from "@microblink/biometrics-core";

import { createBiometricsAnalytics, resolveBiometricsAnalyticsSettings } from "./BiometricsAnalytics";
import type { BiometricsAnalytics } from "./BiometricsAnalytics";
import { BiometricsSessionImpl } from "./BiometricsSession";
import { BiometricsInitialization } from "./init";
import type { BiometricsSdk, BiometricsSession, BiometricsSessionConfig, BiometricsSettings } from "./types";

function resolveCaptureResourcePath(resourcesLocation: string | undefined): string | undefined {
  const currentPageLocation = typeof window === "undefined" ? undefined : window.location.href;
  const baseLocation = resourcesLocation ?? currentPageLocation;

  if (baseLocation === undefined) {
    return undefined;
  }

  const baseUrl =
    currentPageLocation === undefined ? new URL(baseLocation) : new URL(baseLocation, currentPageLocation);

  return new URL("resources/", baseUrl).href;
}

class BiometricsSdkImpl implements BiometricsSdk {
  readonly #capture: BiometricsCaptureClient;
  readonly #analytics: BiometricsAnalytics;

  #closePromise: Promise<void> | undefined;

  constructor(
    capture: BiometricsCaptureClient,
    analytics: BiometricsAnalytics,
    private readonly subscribeDiagnostic: (listener: (event: BiometricsDiagnosticEvent) => void) => () => void,
    private readonly flushDiagnostics: () => Promise<void>,
  ) {
    this.#capture = capture;
    this.#analytics = analytics;
  }

  startSession(config: BiometricsSessionConfig = {}): BiometricsSession {
    return new BiometricsSessionImpl(
      () => this.#capture.startSession(config.captureFace?.thresholds),
      config,
      this.#analytics,
      this.subscribeDiagnostic,
    );
  }

  close(): Promise<void> {
    this.#closePromise ??= (async () => {
      let closeError: unknown;

      try {
        await this.flushDiagnostics();
      } catch (error) {
        closeError = error;
      }

      try {
        await this.#analytics.logSdkClosed();
      } catch (error) {
        closeError ??= error;
      }

      try {
        await this.#capture.close();
      } catch (error) {
        closeError ??= error;
      }

      if (closeError !== undefined) {
        throw closeError;
      }
    })();

    return this.#closePromise;
  }
}

/** Initializes the headless capture SDK. */

export async function initializeBiometrics(settings: BiometricsSettings, initialization: BiometricsInitialization) {
  const analyticsSettings = resolveBiometricsAnalyticsSettings(settings.analytics);

  let capture: BiometricsCaptureClient | undefined;
  let analytics: BiometricsAnalytics | undefined;

  try {
    const capturePromise = createBiometricsCapture({
      licenseKey: settings.licenseKey,
      ...settings.capture,
      resourcePath: resolveCaptureResourcePath(settings.resourcesLocation),
      wasmVariant: settings.wasmVariant,
      initializationTimeoutMs: Math.max(1, initialization.remainingMs()),
      onDownloadProgress: settings.onDownloadProgress,
      onDiagnostic: (event: BiometricsDiagnosticEvent) => {
        if (event.phase === "initialization" && event.component === "sdk") {
          return;
        }

        initialization.emitDiagnostic(event);
      },
      analytics: {
        userId: analyticsSettings.userId,
        pingProxyUrl: analyticsSettings.pingProxyUrl,
      },
    });
    capture = await initialization.wait(capturePromise, "sdk", (lateCapture) => lateCapture.close());

    analytics = createBiometricsAnalytics(analyticsSettings, capture);
    initialization.setAnalytics(analytics);
    void analytics.logInitStarted().catch(() => undefined);

    void analytics.logInitCompleted().catch(() => undefined);

    return {
      sdk: new BiometricsSdkImpl(capture, analytics, initialization.subscribeDiagnostic, () =>
        initialization.flushDiagnostics(),
      ),
      analytics,
    };
  } catch (error) {
    const normalized = initialization.reportInitializationError(error);
    initialization.fail(normalized);

    const cleanup = async (): Promise<void> => {
      if (analytics) {
        await analytics.logInitFailed(normalized).catch(() => undefined);
        await initialization.flushDiagnostics().catch(() => undefined);
        await analytics.sendPinglets().catch(() => undefined);
      }

      await capture?.close().catch(() => undefined);
    };

    await initialization.waitForCleanup(cleanup(), normalized);

    throw normalized;
  }
}

export async function createBiometrics(settings: BiometricsSettings): Promise<BiometricsSdk> {
  const initialization = new BiometricsInitialization({
    timeoutMs: settings.initializationTimeoutMs,
    timeoutMessage: (timeoutMs) => `Biometrics initialization timed out after ${timeoutMs}ms.`,
    onDiagnostic: settings.onDiagnostic,
  });
  const { sdk } = await initializeBiometrics(settings, initialization);

  initialization.complete();
  return sdk;
}
