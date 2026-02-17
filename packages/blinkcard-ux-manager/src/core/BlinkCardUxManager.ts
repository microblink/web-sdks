/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  BlinkCardScanningResult,
  BlinkCardSessionSettings,
  ProcessResultWithBuffer,
  RemoteScanningSession,
  DeviceInfo,
} from "@microblink/blinkcard-core";
import type {
  Camera,
  CameraManager,
  CameraPermission,
  FacingMode,
  PlaybackState,
} from "@microblink/camera-manager";
import { FeedbackStabilizer } from "@microblink/feedback-stabilizer";

import type { BlinkCardProcessingError } from "./BlinkCardProcessingError";
import { HapticFeedbackManager } from "@microblink/ux-common/hapticFeedback";
import {
  type BlinkCardUiState,
  type BlinkCardUiStateKey,
  blinkCardUiStateMap,
  type ErrorUiStateKey,
  firstSideCapturedUiStateKeys,
  getUiStateKey,
} from "./blinkcard-ui-state";
import { AnalyticService } from "@microblink/analytics/AnalyticService";
import { debounce } from "./debounce";
import type {
  PingCameraHardwareInfoData,
  PingCameraInputInfoData,
  PingScanningConditionsData,
  PingUxEventData,
} from "@microblink/analytics/ping";
import { sleep } from "@microblink/ux-common/utils";
import { match } from "ts-pattern";

/**
 * The BlinkCardUxManager class. This is the main class that manages the UX of
 * the BlinkCard SDK. It is responsible for handling the UI state, the timeout,
 * the help tooltip, and the document class filter.
 */
export class BlinkCardUxManager {
  /** The camera manager. */
  declare cameraManager: CameraManager;
  /** The scanning session. */
  declare scanningSession: RemoteScanningSession;
  /** Whether the demo overlay should be shown. */
  declare showDemoOverlay: boolean;
  /** Whether the production overlay should be shown. */
  declare showProductionOverlay: boolean;
  /** The current UI state. */
  declare uiState: BlinkCardUiState;
  /** The raw UI state key. */
  declare rawUiStateKey: BlinkCardUiStateKey;
  /** The feedback stabilizer. */
  declare feedbackStabilizer: FeedbackStabilizer<typeof blinkCardUiStateMap>;
  /** The session settings. */
  declare sessionSettings: BlinkCardSessionSettings;
  /** The device info. */
  declare deviceInfo: DeviceInfo;

  /** The analytics service (private). */
  #analyticsService: AnalyticService;

  /** Tracks last reported camera hardware state. */
  #reportedCameraKeys = new Set<string>();
  #debouncedCameraInputSyncToAnalytics = debounce(() => {
    this.#syncCameraInputToAnalytics();
  }, 300);

  #isFirstFrame = true;

  /** The success process result. */
  #successProcessResult: ProcessResultWithBuffer | undefined;
  /** Whether the thread is busy. */
  #threadBusy = false;
  /** The scanning session timeout ID. */
  #timeoutId?: number;
  /** Timeout duration in ms for the scanning session. If null, timeout won't be triggered ever. */
  #timeoutDuration: number | null = 10000; // 10s

  /** The callbacks for when the UI state changes. */
  #onUiStateChangedCallbacks = new Set<(uiState: BlinkCardUiState) => void>();
  /** The callbacks for when a scan result is available. */
  #onResultCallbacks = new Set<(result: BlinkCardScanningResult) => void>();
  /** The callbacks for when a frame is processed. */
  #onFrameProcessCallbacks = new Set<
    (frameResult: ProcessResultWithBuffer) => void
  >();
  /** The callbacks for when an error occurs during processing. */
  #onErrorCallbacks = new Set<(errorState: BlinkCardProcessingError) => void>();
  /** Clean up observers, store subscriptions and event listeners. */
  #cleanupCallbacks = new Set<() => void>();
  /** The haptic feedback manager. */
  #hapticFeedbackManager = new HapticFeedbackManager();

  /**
   * The constructor for the BlinkCardUxManager class.
   *
   * @param cameraManager - The camera manager.
   * @param scanningSession - The scanning session.
   * @param sessionSettings - The session settings.
   * @param showDemoOverlay - Whether to show the demo overlay.
   * @param showProductionOverlay - Whether to show the production overlay.
   * @param deviceInfo - The device info.
   */
  constructor(
    cameraManager: CameraManager,
    scanningSession: RemoteScanningSession,
    sessionSettings: BlinkCardSessionSettings,
    showDemoOverlay: boolean,
    showProductionOverlay: boolean,
    deviceInfo: DeviceInfo,
  ) {
    this.cameraManager = cameraManager;
    this.scanningSession = scanningSession;
    this.feedbackStabilizer = new FeedbackStabilizer(
      blinkCardUiStateMap,
      "SENSING_FRONT",
    );
    this.uiState = this.feedbackStabilizer.currentState;
    this.sessionSettings = sessionSettings;
    this.showDemoOverlay = showDemoOverlay;
    this.showProductionOverlay = showProductionOverlay;
    this.deviceInfo = deviceInfo;

    // Initialize analytics service with the scanning session's ping function
    this.#analyticsService = new AnalyticService({
      pingFn: (ping) => this.scanningSession.ping(ping),
      sendPingletsFn: () => this.scanningSession.sendPinglets(),
    });

    // Device info ping
    void this.#analyticsService.logDeviceInfo(this.deviceInfo);

    this.#setupObservers();

    const removeFrameCaptureCallback =
      this.cameraManager.addFrameCaptureCallback(this.#frameCaptureCallback);

    this.#cleanupCallbacks.add(removeFrameCaptureCallback);
  }

  #setupObservers() {
    this.#subscribeToPlaybackStateChange();
    this.#subscribeToCameraListChange();
    this.#subscribeToAppVisibilityChange();
    this.#subscribeToSelectedCameraChange();
    this.#subscribeToVideoResolutionChange();
    this.#subscribeToExtractionAreaChange();
    this.#subscribeToCameraPermissionChange();
    this.#subscribeToOrientationChange();
    this.#subscribeToTorchChange();
    this.#subscribeToVideoElementRemoval();
  }

  #subscribeToPlaybackStateChange() {
    const unsubscribe = this.cameraManager.subscribe(
      (s) => s.playbackState,
      (playbackState, previousPlaybackState) => {
        console.debug(`⏯️ ${playbackState}`);

        const wasActive = previousPlaybackState !== "idle";
        const isActive = playbackState !== "idle";

        if (!wasActive && isActive) {
          void this.#analyticsService.logCameraStartedEvent();
          void this.#analyticsService.sendPinglets();
        } else if (wasActive && !isActive) {
          void this.#analyticsService.logCameraClosedEvent();
          void this.#analyticsService.sendPinglets();
        }

        // handle timeout
        this.#handleTimeoutOnPlaybackChange(playbackState);
      },
    );
    this.#cleanupCallbacks.add(unsubscribe);
  }

  #subscribeToCameraListChange() {
    const unsubscribe = this.cameraManager.subscribe(
      (s) => s.cameras,
      (cameras) => {
        const nextCameraKeys = new Set(
          cameras.map((camera) => this.#buildCameraAnalyticsKey(camera)),
        );

        const state = this.cameraManager.getState();
        if (cameras.length === 0 && !state.videoElement) {
          // Camera manager is torn down; avoid sending empty hardware pings.
          this.#reportedCameraKeys = nextCameraKeys;
          return;
        }

        if (!this.#hasCameraListChanged(nextCameraKeys)) {
          return;
        }

        this.#reportedCameraKeys = nextCameraKeys;
        const pingCameras = cameras.map((camera) =>
          this.#convertCameraToPingCamera(camera),
        );
        void this.#analyticsService.logHardwareCameraInfo(pingCameras);
      },
    );
    this.#cleanupCallbacks.add(unsubscribe);
  }

  #subscribeToAppVisibilityChange() {
    const visibilityChangeCallback = () => {
      if (document.visibilityState === "hidden") {
        void this.#analyticsService.logAppMovedToBackgroundEvent();
      }
      void this.#analyticsService.sendPinglets();
    };

    document.addEventListener("visibilitychange", visibilityChangeCallback);

    this.#cleanupCallbacks.add(() => {
      document.removeEventListener(
        "visibilitychange",
        visibilityChangeCallback,
      );
    });
  }

  #subscribeToSelectedCameraChange() {
    const unsubscribeSelectedCamera = this.cameraManager.subscribe(
      (s) => s.selectedCamera,
      () => this.#syncCameraInputToAnalytics(),
    );
    this.#cleanupCallbacks.add(unsubscribeSelectedCamera);
  }

  #subscribeToVideoResolutionChange() {
    const unsubscribe = this.cameraManager.subscribe(
      (s) => s.videoResolution,
      () => this.#scheduleCameraInputSyncToAnalytics(),
    );
    this.#cleanupCallbacks.add(unsubscribe);
  }

  #subscribeToExtractionAreaChange() {
    const unsubscribe = this.cameraManager.subscribe(
      (s) => s.extractionArea,
      () => this.#scheduleCameraInputSyncToAnalytics(),
    );
    this.#cleanupCallbacks.add(unsubscribe);
  }

  #subscribeToCameraPermissionChange() {
    const unsubscribe = this.cameraManager.subscribe(
      (s) => s.cameraPermission,
      this.#handleCameraPermissionChange,
    );
    this.#cleanupCallbacks.add(unsubscribe);
  }

  #subscribeToOrientationChange() {
    const reportOrientation = (orientation: ScreenOrientation) => {
      let deviceOrientation: PingScanningConditionsData["deviceOrientation"];

      switch (orientation.type) {
        case "portrait-primary":
          deviceOrientation = "Portrait";
          break;
        case "portrait-secondary":
          deviceOrientation = "PortraitUpside";
          break;
        case "landscape-primary":
          deviceOrientation = "LandscapeLeft";
          break;
        case "landscape-secondary":
          deviceOrientation = "LandscapeRight";
          break;
      }

      void this.#analyticsService.logDeviceOrientation(deviceOrientation);
    };

    const orientationChangeHandler = (event: Event) => {
      const target = event.target as ScreenOrientation;
      reportOrientation(target);
    };

    screen.orientation.addEventListener("change", orientationChangeHandler);

    reportOrientation(screen.orientation);

    this.#cleanupCallbacks.add(() => {
      screen.orientation.removeEventListener(
        "change",
        orientationChangeHandler,
      );
    });
  }

  #subscribeToTorchChange() {
    const unsubTorchAnalytics = this.cameraManager.subscribe(
      (s) => s.selectedCamera?.torchEnabled,
      (torchEnabled) => {
        if (torchEnabled === undefined) {
          return;
        }

        // trigger haptic feedback
        if (torchEnabled === true) {
          this.#hapticFeedbackManager.triggerShort();
        }

        // log flashlight state
        void this.#analyticsService.logFlashlightState(torchEnabled);
      },
    );
    this.#cleanupCallbacks.add(unsubTorchAnalytics);
  }

  #subscribeToVideoElementRemoval() {
    const unsubscribe = this.cameraManager.subscribe(
      (s) => s.videoElement,
      (videoElement) => {
        if (!videoElement) {
          console.debug("Removing camera manager subscriptions");
          this.reset();
          this.cleanupAllObservers();
        }
      },
    );
    this.#cleanupCallbacks.add(unsubscribe);
  }

  #syncCameraInputToAnalytics(): void {
    const cameraInputInfo = this.#buildCameraInputPingData();
    if (!cameraInputInfo) {
      return;
    }

    void this.#analyticsService.logCameraInputInfo(cameraInputInfo);
  }

  #scheduleCameraInputSyncToAnalytics(): void {
    this.#debouncedCameraInputSyncToAnalytics();
  }

  #clearCameraInputAnalyticsSync(): void {
    this.#debouncedCameraInputSyncToAnalytics.cancel();
  }

  #buildCameraInputPingData(): PingCameraInputInfoData | undefined {
    const state = this.cameraManager.getState();

    if (!state.selectedCamera || !state.videoResolution) {
      return undefined;
    }

    const roiW = state.extractionArea?.width
      ? state.extractionArea.width
      : state.videoResolution.width;
    const roiH = state.extractionArea?.height
      ? state.extractionArea.height
      : state.videoResolution.height;

    return {
      deviceId: state.selectedCamera.name,
      cameraFacing: this.#mapCameraFacingToPingFacing(
        state.selectedCamera.facingMode,
      ),
      cameraFrameWidth: state.videoResolution.width,
      cameraFrameHeight: state.videoResolution.height,
      roiWidth: roiW,
      roiHeight: roiH,
      viewPortAspectRatio: roiW / roiH,
    };
  }

  #convertCameraToPingCamera(
    camera: Camera,
  ): PingCameraHardwareInfoData["availableCameras"][number] {
    return {
      deviceId: camera.name,
      cameraFacing: this.#mapCameraFacingToPingFacing(camera.facingMode),
      /** we can't know this */
      availableResolutions: undefined,
      focus: camera.singleShotSupported ? "Auto" : "Fixed",
    };
  }

  #buildCameraAnalyticsKey(camera: Camera): string {
    const facing = camera.facingMode ?? "unknown";
    const focus = camera.singleShotSupported ? "auto" : "fixed";
    return `${camera.name}|${facing}|${focus}`;
  }

  #hasCameraListChanged(nextKeys: Set<string>): boolean {
    if (nextKeys.size !== this.#reportedCameraKeys.size) {
      return true;
    }

    for (const key of nextKeys) {
      if (!this.#reportedCameraKeys.has(key)) {
        return true;
      }
    }

    return false;
  }

  #mapCameraFacingToPingFacing(
    facing: FacingMode,
  ): "Front" | "Back" | "Unknown" {
    switch (facing) {
      case "front":
        return "Front";
      case "back":
        return "Back";
      default:
        return "Unknown";
    }
  }

  #handleCameraPermissionChange = (
    curr: CameraPermission,
    prev: CameraPermission,
  ) => {
    if (prev === undefined) {
      // startup
      if (curr === "granted") {
        console.debug("previously granted");
        void this.#analyticsService.logCameraPermissionCheck(true);
      } else if (curr === "denied") {
        console.debug("previously blocked");
        void this.#analyticsService.logCameraPermissionCheck(false);
      } else if (curr === "prompt") {
        console.debug("Waiting for user response");
        void this.#analyticsService.logCameraPermissionRequest();
      }
    }

    if (prev === "prompt") {
      if (curr === "granted") {
        console.debug("user granted permission");
        void this.#analyticsService.logCameraPermissionUserResponse(true);
      } else if (curr === "denied") {
        console.debug("user denied permission");
        void this.#analyticsService.logCameraPermissionUserResponse(false);
      }
    }

    if (prev === "denied") {
      if (curr === "granted") {
        console.debug("user gave permission in browser settings");
      } else if (curr === "prompt") {
        console.debug("retrying for camera permission");
        void this.#analyticsService.logCameraPermissionRequest();
      } else if (curr === undefined) {
        console.debug("user reset permission");
      }
    }

    if (prev === "granted") {
      if (curr === "denied") {
        console.debug("user revoked permission");
      } else if (curr === "prompt") {
        console.debug("user reset permission after granting v1");
      }
    }

    void this.#analyticsService.sendPinglets();
  };

  /**
   * Indicates whether the UI should display the demo overlay. Controlled by the
   * license property.
   */
  getShowDemoOverlay(): boolean {
    return this.showDemoOverlay;
  }

  /**
   * Indicates whether the UI should display the production overlay. Controlled by
   * the license property.
   */
  getShowProductionOverlay(): boolean {
    return this.showProductionOverlay;
  }

  /**
   * Returns the timeout duration in ms. Null if timeout won't be triggered ever.
   */
  getTimeoutDuration(): number | null {
    return this.#timeoutDuration;
  }

  /**
   * Logs when the help modal is closed.
   *
   * @param fullyViewed - Whether the user viewed all help content before closing.
   */
  logHelpClosed(fullyViewed: boolean): void {
    void this.#analyticsService.logHelpClosedEvent(fullyViewed);
  }

  /**
   * Logs when the help modal is opened.
   */
  logHelpOpened(): void {
    void this.#analyticsService.logHelpOpenedEvent();
  }

  /**
   * Logs when the help tooltip is displayed.
   */
  logHelpTooltipDisplayed(): void {
    void this.#analyticsService.logHelpTooltipDisplayedEvent();
  }

  /**
   * Logs when the close button is clicked.
   */
  logCloseButtonClicked(): void {
    void this.#analyticsService.logCloseButtonClickedEvent();
  }

  /**
   * Logs when an alert is displayed.
   *
   * @param alertType - The type of alert displayed.
   */
  logAlertDisplayed(
    alertType: NonNullable<PingUxEventData["alertType"]>,
  ): void {
    void this.#analyticsService.logAlertDisplayedEvent(alertType);
  }

  /**
   * Logs when the onboarding guide is displayed.
   */
  logOnboardingDisplayed(): void {
    void this.#analyticsService.logOnboardingDisplayedEvent();
  }

  /**
   * Gets the haptic feedback manager instance.
   *
   * @returns The haptic feedback manager
   */
  getHapticFeedbackManager(): HapticFeedbackManager {
    return this.#hapticFeedbackManager;
  }

  /**
   * Enable or disable haptic feedback.
   *
   * @param enabled - Whether haptic feedback should be enabled
   */
  setHapticFeedbackEnabled(enabled: boolean): void {
    this.#hapticFeedbackManager.setEnabled(enabled);
  }

  /**
   * Check if haptic feedback is currently enabled.
   *
   * @returns true if haptic feedback is enabled
   */
  isHapticFeedbackEnabled(): boolean {
    return this.#hapticFeedbackManager.isEnabled();
  }

  /**
   * Check if haptic feedback is supported by the current browser/device.
   *
   * @returns true if haptic feedback is supported
   */
  isHapticFeedbackSupported(): boolean {
    return this.#hapticFeedbackManager.isSupported();
  }

  /**
   * Adds a callback function to be executed when the UI state changes.
   *
   * @param callback - Function to be called when UI state changes. Receives the
   * new UI state as parameter.
   * @returns A cleanup function that removes the callback when called.
   *
   * @example
   * const cleanup = manager.addOnUiStateChangedCallback((newState) => {
   *   console.log('UI state changed to:', newState);
   * });
   *
   * cleanup();
   */
  addOnUiStateChangedCallback(callback: (uiState: BlinkCardUiState) => void) {
    this.#onUiStateChangedCallbacks.add(callback);
    return () => {
      this.#onUiStateChangedCallbacks.delete(callback);
    };
  }

  /**
   * Registers a callback function to be called when a scan result is available.
   *
   * @param callback - A function that will be called with the scan result.
   * @returns A cleanup function that, when called, will remove the registered
   * callback.
   *
   * @example
   *
   * const cleanup = manager.addOnResultCallback((result) => {
   *   console.log('Scan result:', result);
   * });
   *
   * // Later, to remove the callback:
   * cleanup();
   */
  addOnResultCallback(callback: (result: BlinkCardScanningResult) => void) {
    this.#onResultCallbacks.add(callback);
    return () => {
      this.#onResultCallbacks.delete(callback);
    };
  }

  /**
   * Registers a callback function to be called when a frame is processed.
   *
   * @param callback - A function that will be called with the frame analysis
   * result.
   * @returns A cleanup function that, when called, will remove the registered
   * callback.
   *
   * @example
   * const cleanup = manager.addOnFrameProcessCallback((frameResult) => {
   *   console.log('Frame processed:', frameResult);
   * });
   *
   * // Later, to remove the callback:
   * cleanup();
   */
  addOnFrameProcessCallback(
    callback: (frameResult: ProcessResultWithBuffer) => void,
  ) {
    this.#onFrameProcessCallbacks.add(callback);
    return () => {
      this.#onFrameProcessCallbacks.delete(callback);
    };
  }

  /**
   * Registers a callback function to be called when an error occurs during
   * processing.
   *
   * @param callback - A function that will be called with the error state.
   * @returns A cleanup function that, when called, will remove the registered
   * callback.
   *
   * @example
   * const cleanup = manager.addOnErrorCallback((error) => {
   *   console.error('Processing error:', error);
   * });
   *
   * // Later, to remove the callback:
   * cleanup();
   */
  addOnErrorCallback(callback: (errorState: BlinkCardProcessingError) => void) {
    this.#onErrorCallbacks.add(callback);
    return () => {
      this.#onErrorCallbacks.delete(callback);
    };
  }

  /**
   * Invokes the onError callbacks.
   *
   * @param errorState - The error state.
   */
  #invokeOnErrorCallbacks = (errorState: BlinkCardProcessingError) => {
    this.#hapticFeedbackManager.triggerLong();

    for (const callback of this.#onErrorCallbacks) {
      try {
        callback(errorState);
      } catch (e) {
        console.error("Error in onError callback", e);
      }
    }
  };

  /**
   * Invokes the onResult callbacks.
   *
   * @param result - The scan result.
   */
  #invokeOnResultCallbacks = (result: BlinkCardScanningResult) => {
    for (const callback of this.#onResultCallbacks) {
      try {
        callback(result);
      } catch (e) {
        console.error("Error in onResult callback", e);
      }
    }
  };

  /**
   * Invokes the onFrameProcess callbacks.
   *
   * @param frameResult - The frame result.
   */
  #invokeOnFrameProcessCallbacks = (frameResult: ProcessResultWithBuffer) => {
    for (const callback of this.#onFrameProcessCallbacks) {
      try {
        callback(frameResult);
      } catch (e) {
        console.error("Error in onFrameProcess callback", e);
      }
    }
  };

  /**
   * Invokes the onUiStateChanged callbacks.
   *
   * @param uiState - The UI state.
   */
  #invokeOnUiStateChangedCallbacks = (uiState: BlinkCardUiState) => {
    for (const callback of this.#onUiStateChangedCallbacks) {
      try {
        callback(uiState);
      } catch (e) {
        console.error("Error in onUiStateChanged callback", e);
      }
    }
  };

  /**
   * The frame capture callback. This is the main function that is called when a
   * new frame is captured. It is responsible for processing the frame and
   * updating the UI state.
   *
   * @param imageData - The image data.
   * @returns The processed frame's ArrayBuffer, or undefined if not applicable.
   */
  #frameCaptureCallback = async (
    imageData: ImageData,
  ): Promise<ArrayBuffer | void> => {
    if (this.#threadBusy) {
      console.debug("🚦🔴 Thread is busy, skipping frame capture");
      return;
    }

    this.#threadBusy = true;

    try {
      // https://issues.chromium.org/issues/379999322
      const imageDataLike = {
        data: imageData.data,
        width: imageData.width,
        height: imageData.height,
        colorSpace: "srgb",
      } satisfies ImageData;

      /**
       * `scanningSession.process()` errors on calls after the document is captured and
       * the success state is placed on the queue to be shown after the current message's
       * minimum duration is reached.
       *
       * However, we still need to call `#handleUiStateChange()` to update the UI state, so
       * we stop the loop here by not setting `this.#threadBusy` to `true` and manually
       * calling `#handleUiStateChange()` with the `DOCUMENT_CAPTURED` state after the
       * minimum duration of the state is reached.
       */
      if (this.#successProcessResult) {
        window.setTimeout(() => {
          if (!this.#successProcessResult) {
            console.error("No success process result, should not happen");
            return;
          }
          this.#updateUiStateFromProcessResult(this.#successProcessResult);
        }, blinkCardUiStateMap.CARD_CAPTURED.minDuration);
        return;
      }

      const processResult = await this.scanningSession.process(imageDataLike);

      if (this.#isFirstFrame) {
        this.#isFirstFrame = false;
        void this.#analyticsService.sendPinglets();
      }

      // Document passed filtering or no filtering was configured
      // Update UI state based on recognition results and notify callbacks
      this.#updateUiStateFromProcessResult(processResult);
      this.#invokeOnFrameProcessCallbacks(processResult);

      return processResult.arrayBuffer;
    } finally {
      this.#threadBusy = false;
    }
  };

  /**
   * Sets the duration after which the scanning session will timeout. The
   * timeout can occur in various scenarios and may be restarted by different
   * scanning events.
   *
   * @param duration The timeout duration in milliseconds. If null, timeout won't
   * be triggered ever.
   * @throws {Error} Throws an error if duration is less than or equal to 0 when not null.
   */
  setTimeoutDuration(duration: number | null) {
    if (duration !== null && duration <= 0) {
      throw new Error("Timeout duration must be greater than 0");
    }

    this.#timeoutDuration = duration;
  }

  /**
   * Handles the timeout on playback state change.
   *
   * @param playbackState - The playback state.
   */
  #handleTimeoutOnPlaybackChange = (playbackState: PlaybackState) => {
    if (this.#timeoutDuration === null) {
      return;
    }

    if (playbackState !== "capturing") {
      this.clearScanTimeout();
    } else {
      console.debug("🔁 continuing timeout");
      this.#setTimeout(this.uiState);
    }
  };

  /**
   * Sets the timeout for the scanning session.
   *
   * @param uiState - The UI state.
   */
  #setTimeout = (uiState: BlinkCardUiState) => {
    if (this.#timeoutDuration === null) {
      console.debug("⏳🟢 timeout duration is null, not starting timeout");
      return;
    }

    this.clearScanTimeout();
    console.debug(`⏳🟢 starting timeout for ${uiState.key}`);

    this.#timeoutId = window.setTimeout(() => {
      console.debug("⏳🟢 timeout triggered");
      this.cameraManager.stopFrameCapture();

      this.#invokeOnErrorCallbacks("timeout");

      void this.#analyticsService.logStepTimeoutEvent();
      void this.#analyticsService.sendPinglets();

      // Reset the feedback stabilizer to clear the state
      // We handle this as a new scan attempt
      this.#resetUiState();
    }, this.#timeoutDuration);
  };

  /**
   * Handles haptic feedback based on UI state changes.
   *
   * @param uiStateKey - The new UI state key
   */
  #handleHapticFeedback = (uiStateKey: BlinkCardUiStateKey) => {
    // First side success states (before barcode scanning)
    if (firstSideCapturedUiStateKeys.includes(uiStateKey)) {
      this.#hapticFeedbackManager.triggerShort();
      return;
    }

    // Final success state (document fully captured)
    if (uiStateKey === "CARD_CAPTURED") {
      this.#hapticFeedbackManager.triggerLong();
      return;
    }

    // Error states
    if (blinkCardUiStateMap[uiStateKey].reticleType === "error") {
      this.#hapticFeedbackManager.triggerShort();
      return;
    }
  };

  /**
   * Updates the UI state based on the process result. This is called after a frame has been processed
   * to update the UI state according to the recognition results.
   *
   * @param processResult - The process result from frame processing.
   */
  #updateUiStateFromProcessResult = (
    processResult: ProcessResultWithBuffer,
  ) => {
    const uiStateKeyCandidate = getUiStateKey(
      processResult,
      this.sessionSettings.scanningSettings,
    );

    // first side captured
    if (firstSideCapturedUiStateKeys.includes(uiStateKeyCandidate)) {
      void this.#analyticsService.sendPinglets();
    }

    if (uiStateKeyCandidate === "CARD_CAPTURED") {
      this.#successProcessResult = processResult;
      void this.#analyticsService.sendPinglets();
    }

    this.rawUiStateKey = uiStateKeyCandidate;

    const newUiState =
      this.feedbackStabilizer.getNewUiState(uiStateKeyCandidate);

    // Skip if the state is the same
    if (newUiState.key === this.uiState.key) {
      return;
    }

    // Trigger haptic feedback based on UI state changes
    this.#handleHapticFeedback(newUiState.key);

    this.uiState = newUiState;

    this.#invokeOnUiStateChangedCallbacks(newUiState);
    void this.#handleUiStateChange(newUiState);
  };

  /**
   * Handles the UI state change. This is the main function that is called
   * when a new UI state is set. It is responsible for handling the timeout,
   * handling the first side captured states.
   *
   * @param uiState - The UI state.
   */
  #handleUiStateChange = async (uiState: BlinkCardUiState) => {
    if (this.#timeoutDuration !== null) {
      this.#setTimeout(uiState);
    }

    // queue error ping if applicable
    if (uiState.reticleType === "error") {
      const errorKey = uiState.key as ErrorUiStateKey;

      const pingErrorMessageType = match<
        ErrorUiStateKey,
        PingUxEventData["errorMessageType"]
      >(errorKey)
        .with("BLUR_DETECTED", () => "EliminateBlur")
        .with("OCCLUDED", () => "KeepVisible")
        .with("WRONG_SIDE", () => "FlipSide")
        .with("CARD_FRAMING_CAMERA_TOO_FAR", () => "MoveCloser")
        .with("CARD_FRAMING_CAMERA_TOO_CLOSE", () => "MoveFarther")
        .with("CARD_FRAMING_CAMERA_ANGLE_TOO_STEEP", () => "AlignDocument")
        .with("CARD_TOO_CLOSE_TO_FRAME_EDGE", () => "MoveFromEdge")
        .exhaustive();

      void this.#analyticsService.logErrorMessageEvent(pingErrorMessageType);
    }

    // Handle all first side captured states to display both the
    // animation to reposition the document and the success animation
    if (firstSideCapturedUiStateKeys.includes(uiState.key)) {
      this.cameraManager.stopFrameCapture();
      // we need to wait for the compound duration
      // The DOCUMENT_CAPTURED state is the checkbox animation

      await sleep(
        uiState.minDuration + blinkCardUiStateMap.CARD_CAPTURED.minDuration,
      );
      await this.cameraManager.startFrameCapture();
      return;
    }

    // handle DOCUMENT_CAPTURED
    if (uiState.key === "CARD_CAPTURED") {
      this.cameraManager.stopFrameCapture();
      await sleep(uiState.minDuration); // allow animation to play out

      const result = await this.getSessionResult();

      this.#invokeOnResultCallbacks(result);
      return;
    }
  };

  /**
   * Resets the feedback stabilizer and invokes the onUiStateChanged callbacks.
   */
  #resetUiState = () => {
    this.feedbackStabilizer.reset();
    this.uiState = this.feedbackStabilizer.currentState;
    this.#invokeOnUiStateChangedCallbacks(this.uiState);
  };

  /**
   * Clears the scanning session timeout.
   */
  clearScanTimeout = () => {
    if (!this.#timeoutId) {
      return;
    }

    console.debug("⏳🔴 clearing timeout");
    window.clearTimeout(this.#timeoutId);
    this.#timeoutId = undefined;
  };

  /**
   * Gets the result from the scanning session.
   *
   * @returns The result.
   */
  async getSessionResult(): Promise<BlinkCardScanningResult> {
    const result = await this.scanningSession.getResult();

    return result;
  }

  /**
   * Resets the scanning session.
   *
   * @param startFrameCapture Whether to start frame processing.
   */
  async resetScanningSession(startFrameCapture = true) {
    console.debug("🔁 Resetting scanning session");
    this.clearScanTimeout();
    this.#threadBusy = false;
    this.#successProcessResult = undefined;
    this.#resetUiState();

    await this.scanningSession.reset();

    if (startFrameCapture) {
      // Check if camera is active before starting frame capture
      if (!this.cameraManager.isActive) {
        await this.cameraManager.startCameraStream();
      }
      await this.cameraManager.startFrameCapture();
    }
  }

  clearUserCallbacks() {
    console.debug("🧹 Clearing all BlinkCardUxManager user callbacks");

    this.#onUiStateChangedCallbacks.clear();
    this.#onResultCallbacks.clear();
    this.#onFrameProcessCallbacks.clear();
    this.#onErrorCallbacks.clear();
  }

  cleanupAllObservers() {
    console.debug("🧹 Removing all BlinkCardUxManager observers");
    this.#clearCameraInputAnalyticsSync();
    this.#cleanupCallbacks.forEach((cleanup) => cleanup());
    this.#cleanupCallbacks.clear();
  }

  /**
   * Resets the BlinkCardUxManager. Clears all callbacks.
   *
   * Does not reset the camera manager or the scanning session.
   */
  reset() {
    console.debug("🔁 Resetting BlinkCardUxManager");
    this.clearScanTimeout();
    this.#clearCameraInputAnalyticsSync();
    this.#threadBusy = false;
    this.#successProcessResult = undefined;
    this.clearUserCallbacks();
  }
}
