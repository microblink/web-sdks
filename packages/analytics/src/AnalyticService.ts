/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  PingUxEvent,
  PingUxEventData,
  Ping,
  PingCameraHardwareInfoData,
  PingCameraInputInfoData,
  PingScanningConditionsData,
  PingBrowserDeviceInfoData,
  PingCameraPermissionData,
  PingCameraPermission,
} from "./ping";

/**
 * Analytic service
 * Provides a clean interface for tracking user interactions and events
 */
export class AnalyticService {
  /**
   * Injected function for queing ping events.
   */
  readonly #pingFn: (ping: Ping) => Promise<void>;
  /**
   * Injected function for triggering sending of queued pinglets.
   */
  readonly #sendPingletsFn: () => Promise<void>;

  constructor({
    pingFn,
    sendPingletsFn,
  }: {
    pingFn: (ping: Ping) => Promise<void>;
    sendPingletsFn: () => Promise<void>;
  }) {
    this.#pingFn = pingFn;
    this.#sendPingletsFn = sendPingletsFn;
  }

  /**
   * Safely send a ping event, handling errors gracefully
   */
  async #safePing(ping: Ping) {
    try {
      await this.#pingFn(ping);
    } catch (error) {
      // Don't break user experience on analytics failures
      console.warn("UX analytics ping failed:", error);
    }
  }

  /**
   * Safely send queued pinglets, handling errors gracefully
   */
  async sendPinglets() {
    try {
      await this.#sendPingletsFn();
    } catch (error) {
      // Don't break user experience on analytics failures
      console.warn("Send pinglets failed:", error);
    }
  }

  /**
   * Create a camera permission ping
   */
  #createCameraPermissionPing(
    pingData: PingCameraPermissionData,
  ): PingCameraPermission {
    return {
      schemaName: "ping.sdk.camera.permission",
      schemaVersion: "1.0.0",
      data: pingData,
    };
  }

  /**
   * Create a standardized UX event ping
   */
  #createUxEventPing(pingData: PingUxEventData): PingUxEvent {
    return {
      schemaName: "ping.sdk.ux.event",
      schemaVersion: "1.0.0",
      data: pingData,
    };
  }

  logCameraStartedEvent() {
    return this.#safePing(
      this.#createUxEventPing({
        eventType: "CameraStarted",
      }),
    );
  }

  logCameraClosedEvent() {
    return this.#safePing(
      this.#createUxEventPing({
        eventType: "CameraClosed",
      }),
    );
  }

  logHelpOpenedEvent() {
    return this.#safePing(
      this.#createUxEventPing({
        eventType: "HelpOpened",
      }),
    );
  }

  logHelpClosedEvent(contentFullyViewed: boolean) {
    return this.#safePing(
      this.#createUxEventPing({
        eventType: "HelpClosed",
        helpCloseType: contentFullyViewed
          ? "ContentFullyViewed"
          : "ContentSkipped",
      }),
    );
  }

  logHelpTooltipDisplayedEvent() {
    return this.#safePing(
      this.#createUxEventPing({
        eventType: "HelpTooltipDisplayed",
      }),
    );
  }

  logCloseButtonClickedEvent() {
    return this.#safePing(
      this.#createUxEventPing({
        eventType: "CloseButtonClicked",
      }),
    );
  }

  logOnboardingDisplayedEvent() {
    return this.#safePing(
      this.#createUxEventPing({
        eventType: "OnboardingInfoDisplayed",
      }),
    );
  }

  logAlertDisplayedEvent(alertType: NonNullable<PingUxEventData["alertType"]>) {
    return this.#safePing(
      this.#createUxEventPing({
        eventType: "AlertDisplayed",
        alertType,
      }),
    );
  }

  logErrorMessageEvent(errorMessageType: PingUxEventData["errorMessageType"]) {
    return this.#safePing(
      this.#createUxEventPing({
        eventType: "ErrorMessage",
        errorMessageType,
      }),
    );
  }

  logAppMovedToBackgroundEvent() {
    return this.#safePing(
      this.#createUxEventPing({
        eventType: "AppMovedToBackground",
      }),
    );
  }

  logStepTimeoutEvent() {
    return this.#safePing(
      this.#createUxEventPing({
        eventType: "StepTimeout",
      }),
    );
  }

  logCameraInputInfo(pingData: PingCameraInputInfoData) {
    return this.#safePing({
      schemaName: "ping.sdk.camera.input.info",
      schemaVersion: "1.0.2",
      data: pingData,
    });
  }

  logHardwareCameraInfo(
    cameras: PingCameraHardwareInfoData["availableCameras"],
  ) {
    return this.#safePing({
      schemaName: "ping.hardware.camera.info",
      schemaVersion: "1.0.3",
      data: {
        availableCameras: cameras,
      },
    });
  }

  logCameraPermissionCheck(granted: boolean) {
    return this.#safePing(
      this.#createCameraPermissionPing({
        eventType: "CameraPermissionCheck",
        cameraPermissionGranted: granted,
      }),
    );
  }

  logCameraPermissionRequest() {
    return this.#safePing(
      this.#createCameraPermissionPing({
        eventType: "CameraPermissionRequest",
      }),
    );
  }

  logCameraPermissionUserResponse(granted: boolean) {
    return this.#safePing(
      this.#createCameraPermissionPing({
        eventType: "CameraPermissionUserResponse",
        cameraPermissionGranted: granted,
      }),
    );
  }

  logDeviceOrientation(
    orientation: PingScanningConditionsData["deviceOrientation"],
  ) {
    return this.#safePing({
      schemaName: "ping.sdk.scan.conditions",
      schemaVersion: "1.0.0",
      data: {
        updateType: "DeviceOrientation",
        deviceOrientation: orientation,
      },
    });
  }

  logFlashlightState(flashlightOn: boolean) {
    return this.#safePing({
      schemaName: "ping.sdk.scan.conditions",
      schemaVersion: "1.0.0",
      data: {
        updateType: "FlashlightState",
        flashlightOn,
      },
    });
  }

  logDeviceInfo(pingData: PingBrowserDeviceInfoData) {
    return this.#safePing({
      schemaName: "ping.browser.device.info",
      schemaVersion: "1.0.0",
      data: pingData,
    });
  }
}
