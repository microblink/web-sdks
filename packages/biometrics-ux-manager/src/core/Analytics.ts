/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { AnalyticService } from "@microblink/analytics/AnalyticService";
import type { PingCameraInputInfoData } from "@microblink/analytics/ping";
import type { DeviceInfo } from "@microblink/biometrics-core";
import type { CameraManager, CameraPermission } from "@microblink/camera-manager/core";
import {
  buildCameraAnalyticsKey,
  convertCameraInputToPingData,
  convertCameraToPingCamera,
  hasCameraListChanged,
} from "@microblink/ux-common/cameraAnalyticsMappers";
import { subscribeToDeviceOrientation } from "@microblink/ux-common/deviceOrientationAnalytics";
import { debounce } from "perfect-debounce";

import { BiometricsError } from "./BiometricsUxManager";
import type { AlertType, AnalyticsTransport, BiometricsUxState, CloseReason } from "./types";

const CAMERA_INPUT_ANALYTICS_DEBOUNCE_MS = 300;
const CAPTURE_ABANDON_STATES = new Set<BiometricsUxState<unknown, string>["key"]>(["starting", "capturing", "help"]);

function entered<T>(value: T, previous: T, next: T): boolean {
  return previous !== value && next === value;
}

function exited<T>(value: T, previous: T, next: T): boolean {
  return previous === value && next !== value;
}

export class Analytics {
  readonly #cameraManager: CameraManager;
  readonly #analytics: AnalyticService;
  readonly #errorDialogAlertTypes: Partial<Record<string, AlertType>>;
  readonly #cleanup = new Set<() => void>();
  readonly #debouncedCameraInputSync = debounce(() => {
    this.#syncCameraInput();
  }, CAMERA_INPUT_ANALYTICS_DEBOUNCE_MS);

  #state: BiometricsUxState<unknown, string>;
  #reportedCameraKeys = new Set<string>();
  #lastCameraInputKey?: string;
  #pendingCameraCloseReason: CloseReason = "Sdk";
  #playbackState: "idle" | "playback" | "capturing";
  #reportedCameraOpenFailure = false;

  constructor(
    cameraManager: CameraManager,
    transport: AnalyticsTransport,
    deviceInfo: DeviceInfo,
    initialState: BiometricsUxState<unknown, string>,
    errorDialogAlertTypes: Partial<Record<string, AlertType>> = {},
  ) {
    this.#cameraManager = cameraManager;
    this.#errorDialogAlertTypes = errorDialogAlertTypes;
    this.#playbackState = cameraManager.getState().playbackState;
    this.#state = initialState;
    this.#analytics = new AnalyticService({
      pingFn: (ping) => transport.ping(ping),
      sendPingletsFn: () => transport.sendPinglets(),
    });

    void this.#analytics.logDeviceInfo(deviceInfo);
    this.#setupObservers();

    if (initialState.key === "onboarding") {
      void this.#analytics.logOnboardingDisplayedEvent();
    }
  }

  stateChanged(previous: BiometricsUxState<unknown, string>, next: BiometricsUxState<unknown, string>): void {
    this.#state = next;

    if (entered("starting", previous.key, next.key)) {
      // Reset failure state so we don't report the same error again
      this.#reportedCameraOpenFailure = false;
    }

    if (entered("onboarding", previous.key, next.key)) {
      void this.#analytics.logOnboardingDisplayedEvent();
    }

    // Help events
    if (entered("help", previous.key, next.key)) {
      void this.#analytics.logHelpOpenedEvent();
    } else if (exited("help", previous.key, next.key)) {
      void this.#analytics.logHelpClosedEvent();
    }

    if (entered(true, previous.helpNudgeVisible, next.helpNudgeVisible)) {
      void this.#analytics.logHelpTooltipDisplayedEvent();
    }

    if (entered("error", previous.key, next.key)) {
      // Can't be undefined since the state is only entered when it's set
      const kind = next.errorDialogKind!;
      const customAlertType = this.#errorDialogAlertTypes[kind];

      if (customAlertType) {
        void this.#analytics.logAlertDisplayedEvent(customAlertType);
        return;
      }

      if (kind === "scanningUnsuccessful") {
        void this.#analytics.logAlertDisplayedEvent("StepTimeout");
        return;
      }

      const isLicenseError = next.error instanceof BiometricsError && next.error.code === "INVALID_LICENSE_KEY";
      void this.#analytics.logAlertDisplayedEvent(isLicenseError ? "InvalidLicenseKey" : undefined);

      return;
    }
  }

  cameraWillClose(reason: CloseReason): void {
    this.#pendingCameraCloseReason = reason;

    if (reason === "User") {
      void this.#analytics.logCloseButtonClickedEvent();
    }
  }

  dispose(): void {
    this.#debouncedCameraInputSync.cancel();

    for (const remove of this.#cleanup) {
      remove();
    }

    this.#cleanup.clear();
    void this.#analytics.sendPinglets();
  }

  #setupObservers(): void {
    this.#cleanup.add(this.#cameraManager.subscribe((state) => state.errorState, this.#handleErrorState));

    this.#cleanup.add(
      this.#cameraManager.subscribe(
        (state) => state.playbackState,
        (playbackState) => {
          const wasActive = this.#playbackState !== "idle";
          const isActive = playbackState !== "idle";

          if (!wasActive && isActive) {
            this.#reportedCameraOpenFailure = false;
            this.#pendingCameraCloseReason = "Sdk";

            void this.#analytics.logCameraStartedEvent();
            void this.#analytics.sendPinglets();
          } else if (wasActive && !isActive) {
            void this.#analytics.logCameraClosedEvent(this.#pendingCameraCloseReason);
            void this.#analytics.sendPinglets();

            this.#pendingCameraCloseReason = "Sdk";
          }

          this.#playbackState = playbackState;
        },
      ),
    );

    this.#cleanup.add(
      this.#cameraManager.subscribe(
        (state) => state.cameras,
        (cameras) => {
          const nextCameraKeys = new Set(cameras.map((camera) => buildCameraAnalyticsKey(camera)));
          const state = this.#cameraManager.getState();

          if (cameras.length === 0 && !state.videoElement) {
            this.#reportedCameraKeys = nextCameraKeys;
            return;
          }

          if (!hasCameraListChanged(nextCameraKeys, this.#reportedCameraKeys)) {
            return;
          }

          this.#reportedCameraKeys = nextCameraKeys;
          void this.#analytics.logHardwareCameraInfo(cameras.map((camera) => convertCameraToPingCamera(camera)));
        },
      ),
    );

    this.#cleanup.add(
      this.#cameraManager.subscribe(
        (state) => state.selectedCamera,
        () => this.#syncCameraInput(),
      ),
    );

    this.#cleanup.add(
      this.#cameraManager.subscribe(
        (state) => state.videoResolution,
        () => void this.#debouncedCameraInputSync(),
      ),
    );

    this.#cleanup.add(
      this.#cameraManager.subscribe(
        (state) => state.extractionArea,
        () => void this.#debouncedCameraInputSync(),
      ),
    );

    this.#cleanup.add(
      this.#cameraManager.subscribe((state) => state.cameraPermission, this.#handleCameraPermissionChange),
    );

    this.#cleanup.add(
      this.#cameraManager.addErrorCallback(() => {
        this.#markSystemErrorIfActive();
      }),
    );

    this.#cleanup.add(
      subscribeToDeviceOrientation(
        (deviceOrientation) => {
          void this.#analytics.logDeviceOrientation(deviceOrientation);
        },
        (logMessage) => {
          void this.#analytics.logWarning(logMessage);
        },
      ),
    );

    const visibilityChangeCallback = () => {
      if (document.visibilityState !== "hidden") {
        void this.#analytics.sendPinglets();
        return;
      }

      if (CAPTURE_ABANDON_STATES.has(this.#state.key)) {
        void this.#analytics.logAppMovedToBackgroundEvent();
      }

      void this.#analytics.sendPinglets();
    };

    document.addEventListener("visibilitychange", visibilityChangeCallback);
    this.#cleanup.add(() => document.removeEventListener("visibilitychange", visibilityChangeCallback));
  }

  #handleErrorState = (error: unknown) => {
    if (!error) {
      return;
    }

    if (this.#markSystemErrorIfActive()) {
      return;
    }

    this.#reportCameraOpenFailed(error);
  };

  #handleCameraPermissionChange = (curr: CameraPermission, prev: CameraPermission) => {
    let logged = false;

    if (prev === undefined) {
      if (curr === "granted") {
        void this.#analytics.logCameraPermissionCheck(true);
        logged = true;
      } else if (curr === "denied" || curr === "blocked") {
        void this.#analytics.logCameraPermissionCheck(false);
        logged = true;
      } else if (curr === "prompt") {
        void this.#analytics.logCameraPermissionCheck(false);
        void this.#analytics.logCameraPermissionRequest();
        logged = true;
      }
    }

    if (prev === "prompt") {
      if (curr === "granted") {
        void this.#analytics.logCameraPermissionUserResponse(true);
        logged = true;
      } else if (curr === "denied" || curr === "blocked") {
        void this.#analytics.logCameraPermissionUserResponse(false);
        logged = true;
      }
    }

    if ((prev === "denied" || prev === "blocked") && curr === "prompt") {
      void this.#analytics.logCameraPermissionCheck(false);
      void this.#analytics.logCameraPermissionRequest();
      logged = true;
    }

    if (logged) {
      void this.#analytics.sendPinglets();
    }
  };

  #syncCameraInput(): void {
    const cameraInputInfo = this.#buildCameraInputPingData();

    if (!cameraInputInfo) {
      return;
    }

    const nextKey = JSON.stringify(cameraInputInfo);

    if (nextKey === this.#lastCameraInputKey) {
      return;
    }

    this.#lastCameraInputKey = nextKey;
    void this.#analytics.logCameraInputInfo(cameraInputInfo);
  }

  #buildCameraInputPingData(): PingCameraInputInfoData | undefined {
    const state = this.#cameraManager.getState();

    if (!state.selectedCamera || !state.videoResolution) {
      return undefined;
    }

    return convertCameraInputToPingData(state.selectedCamera, state.videoResolution, state.extractionArea);
  }

  #markSystemErrorIfActive(): boolean {
    if (this.#playbackState === "idle") {
      return false;
    }

    this.#pendingCameraCloseReason = "SystemError";
    return true;
  }

  #reportCameraOpenFailed(error: unknown): void {
    if (this.#reportedCameraOpenFailure) {
      return;
    }

    this.#reportedCameraOpenFailure = true;
    void this.#analytics.logCameraOpenFailedEvent(error instanceof BiometricsError ? error.code : "Unknown");
    void this.#analytics.sendPinglets();
  }
}
