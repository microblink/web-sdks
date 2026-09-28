/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { ConfigurationError, type FaceCaptureResult } from "@microblink/biometrics-core";
import {
  createBiometricsUxManager,
  type BiometricsUxSession,
  type CloseReason,
} from "@microblink/biometrics-ux-manager/core";
import { createBiometricsFeedbackUi, type BiometricsFeedbackUiHandle } from "@microblink/biometrics-ux-manager/ui";
import { CameraError, CameraManager } from "@microblink/camera-manager/core";
import { createCameraManagerUi, type CameraManagerComponent } from "@microblink/camera-manager/ui";

import { initializeBiometrics } from "./createBiometrics";
import { BiometricsInitialization } from "./init";
import type { BiometricsSessionEvent, BiometricsUi, BiometricsUiOptions } from "./types";

function now(): number {
  return globalThis.performance?.now() ?? Date.now();
}

function invokeConsumerCallback<TArguments extends unknown[]>(
  callback: ((...arguments_: TArguments) => void) | undefined,
  ...arguments_: TArguments
): void {
  try {
    callback?.(...arguments_);
  } catch {
    return;
  }
}

async function startCameraStream(
  cameraManager: CameraManager,
  preferredCameraDeviceId: string | undefined,
): Promise<void> {
  if (preferredCameraDeviceId) {
    const cameras = await cameraManager.getCameraDevices();

    const hasPreferredCamera = cameras.some((camera) => camera.deviceInfo.deviceId === preferredCameraDeviceId);

    if (hasPreferredCamera) {
      await cameraManager.startCameraStream({
        preferredCamera: (cameras) => cameras.find((camera) => camera.deviceInfo.deviceId === preferredCameraDeviceId),
      });

      return;
    }
  }

  await cameraManager.startCameraStream({ preferredFacing: "front" });
}

export async function createBiometricsUi(options: BiometricsUiOptions): Promise<BiometricsUi> {
  const initialization = new BiometricsInitialization({
    timeoutMs: options.initializationTimeoutMs,
    timeoutMessage: () => "Biometrics UI initialization timed out.",
    onDiagnostic: options.onDiagnostic,
    onError: options.onError,
  });

  const helpTooltipShowDelay = options.feedbackUiOptions?.helpTooltipShowDelay;

  if (
    helpTooltipShowDelay !== null &&
    helpTooltipShowDelay !== undefined &&
    (!Number.isFinite(helpTooltipShowDelay) || helpTooltipShowDelay < 0)
  ) {
    const error = new ConfigurationError(
      "feedbackUiOptions.helpTooltipShowDelay must be a non-negative finite number or null.",
      "INVALID_HELP_TOOLTIP_SHOW_DELAY",
    );
    initialization.reportError(error);
    initialization.fail(error);
    throw error;
  }

  const { sdk, analytics } = await initializeBiometrics(
    {
      licenseKey: options.licenseKey,
      resourcesLocation: options.resourcesLocation,
      wasmVariant: options.wasmVariant,
      capture: options.capture,
      analytics: options.analytics,
    },
    initialization,
  );

  let session: ReturnType<typeof sdk.startSession>;

  try {
    session = sdk.startSession({
      captureTimeoutMs: options.captureTimeoutMs,
      captureFace: options.captureFace,
    });
  } catch (error) {
    const normalized = initialization.reportError(error);
    initialization.fail(normalized);

    const cleanup = (async (): Promise<void> => {
      await analytics.logInitFailed(normalized).catch(() => undefined);
      await initialization.flushDiagnostics().catch(() => undefined);
      await analytics.sendPinglets().catch(() => undefined);
      await sdk.close().catch(() => undefined);
    })();
    await initialization.waitForCleanup(cleanup, normalized);

    throw normalized;
  }

  const uxSession: BiometricsUxSession<FaceCaptureResult, BiometricsSessionEvent> = session;

  let destroyPromise: Promise<void> | undefined;
  let cameraUi: CameraManagerComponent | undefined;
  let uiHandle: BiometricsFeedbackUiHandle | undefined;
  let removePlaybackSubscription: (() => void) | undefined;
  let removeSelectedCameraSubscription: (() => void) | undefined;
  let removeCameraDismountCallback: (() => void) | undefined;
  let cameraManager: CameraManager | undefined;
  let uxManager: Awaited<ReturnType<typeof createBiometricsUxManager>> | undefined;

  const dismissCaptureUi = (): void => {
    const activeUiHandle = uiHandle;
    uiHandle = undefined;
    const activePlaybackSubscription = removePlaybackSubscription;
    removePlaybackSubscription = undefined;
    const activeCameraSubscription = removeSelectedCameraSubscription;
    removeSelectedCameraSubscription = undefined;
    const activeDismountCallback = removeCameraDismountCallback;
    removeCameraDismountCallback = undefined;
    const activeCameraUi = cameraUi;
    cameraUi = undefined;

    let cleanupError: unknown;

    for (const cleanup of [
      () => activeUiHandle?.dismiss(),
      () => activePlaybackSubscription?.(),
      () => activeCameraSubscription?.(),
      () => activeDismountCallback?.(),
      () => activeCameraUi?.dismount(),
      () => cameraManager?.reset(),
    ]) {
      try {
        cleanup();
      } catch (error) {
        cleanupError ??= error;
      }
    }

    if (cleanupError !== undefined) {
      throw cleanupError;
    }
  };

  const destroy = (closeReason: CloseReason = "Sdk"): Promise<void> => {
    destroyPromise ??= (async () => {
      let cleanupError: unknown;

      const runCleanup = (cleanup: () => void): void => {
        try {
          cleanup();
        } catch (error) {
          cleanupError ??= error;
        }
      };

      runCleanup(() => session.finish());
      runCleanup(() => uxManager?.close(closeReason));
      runCleanup(dismissCaptureUi);

      try {
        await sdk.close();
      } catch (error) {
        cleanupError ??= error;
      }

      if (cleanupError !== undefined) {
        throw cleanupError;
      }
    })();

    return destroyPromise;
  };

  try {
    cameraManager = new CameraManager({ preferredResolution: "1080p" });

    const uxManagerPromise = createBiometricsUxManager(cameraManager, uxSession, {
      showOnboarding: options.feedbackUiOptions?.showOnboardingGuide,
      helpNudgeDelayMs: helpTooltipShowDelay,
      showDebugOverlay: options.captureFace?.debugMode === true,
      analytics: analytics.enabled ? analytics : undefined,
      onEvent: (event) => {
        invokeConsumerCallback(options.onEvent, event);
      },
      onError: (error) => {
        initialization.reportError(error);
      },
      onDiagnostic: initialization.uxDiagnosticSink,
      onResult: (result) => {
        if (destroyPromise) {
          return;
        }

        dismissCaptureUi();
        invokeConsumerCallback(options.onResult, result);
      },
    });

    uxManager = await initialization.wait(uxManagerPromise, "sdk", (late) => late.close());

    const cameraUiPromise = createCameraManagerUi(cameraManager, options.targetNode, {
      showMirrorCameraButton: true,
      ...options.cameraManagerUiOptions,
    });

    cameraUi = await initialization.wait(cameraUiPromise, "sdk", (late) => late.dismount());

    removeSelectedCameraSubscription = cameraManager.subscribe(
      (state) => state.selectedCamera,
      (selectedCamera) => {
        invokeConsumerCallback(options.onSelectedCameraDeviceIdChange, selectedCamera?.deviceInfo.deviceId);
      },
      { fireImmediately: true },
    );

    removeCameraDismountCallback = cameraUi.addOnDismountCallback(() => {
      void destroy();
    });

    removePlaybackSubscription = cameraManager.subscribe(
      (state) => state.playbackState,
      (playbackState) => {
        if (
          playbackState !== "playback" ||
          uiHandle !== undefined ||
          cameraUi === undefined ||
          uxManager === undefined
        ) {
          return;
        }

        uiHandle = createBiometricsFeedbackUi(uxManager, cameraUi, {
          localizationStrings: options.feedbackUiOptions?.localizationStrings,
          showHelpButton: options.feedbackUiOptions?.showHelpButton,
          onClose: () => {
            void destroy("User");
          },
        });
        removePlaybackSubscription?.();
        removePlaybackSubscription = undefined;
      },
    );

    const cameraStartedAt = now();
    initialization.emitDiagnostic({
      phase: "initialization",
      component: "camera",
      status: "started",
      timestamp: new Date().toISOString(),
    });

    try {
      const cameraStartPromise = startCameraStream(cameraManager, options.preferredCameraDeviceId);

      await initialization.wait(cameraStartPromise, "camera", () => {
        if (!destroyPromise) {
          cameraManager?.reset();
        }
      });

      initialization.emitDiagnostic({
        phase: "initialization",
        component: "camera",
        status: "completed",
        timestamp: new Date().toISOString(),
        durationMs: Math.max(0, now() - cameraStartedAt),
      });
    } catch (error) {
      if (
        error instanceof CameraError &&
        error.code === "PERMISSION_DENIED" &&
        options.cameraManagerUiOptions?.showCameraErrorModal !== false
      ) {
        initialization.emitDiagnostic({
          phase: "initialization",
          component: "camera",
          status: "failed",
          timestamp: new Date().toISOString(),
          durationMs: Math.max(0, now() - cameraStartedAt),
          errorCode: "CAMERA_ACCESS_DENIED",
        });
      } else {
        const normalized = initialization.reportError(error, "camera");
        initialization.emitDiagnostic({
          phase: "initialization",
          component: "camera",
          status: normalized.code === "INITIALIZATION_TIMEOUT" ? "timed-out" : "failed",
          timestamp: new Date().toISOString(),
          durationMs: Math.max(0, now() - cameraStartedAt),
          errorCode: normalized.code,
        });
        throw normalized;
      }
    }

    initialization.complete();

    return { destroy: () => destroy("Sdk") };
  } catch (error) {
    const normalized = initialization.reportError(error);
    initialization.fail(normalized);

    const cleanup = (async (): Promise<void> => {
      await analytics.logInitFailed(normalized).catch(() => undefined);
      await initialization.flushDiagnostics().catch(() => undefined);
      await analytics.sendPinglets().catch(() => undefined);
      await destroy().catch(() => undefined);
    })();
    await initialization.waitForCleanup(cleanup, normalized);

    throw normalized;
  }
}
