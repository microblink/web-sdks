/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  BlinkCardScanningResult,
  BlinkCardSessionSettings,
  DeviceInfo,
  ProcessResultWithBuffer,
  RemoteScanningSession,
} from "@microblink/blinkcard-core";
import type {
  CameraManager,
  CameraPermission,
} from "@microblink/camera-manager";
import { FeedbackStabilizer } from "@microblink/feedback-stabilizer";

import { AnalyticService } from "@microblink/analytics/AnalyticService";
import type {
  PingCameraInputInfoData,
  PingScanningConditionsData,
  PingUxEventData,
} from "@microblink/analytics/ping";
import {
  buildCameraAnalyticsKey,
  convertCameraInputToPingData,
  convertCameraToPingCamera,
  hasCameraListChanged,
} from "@microblink/ux-common/cameraAnalyticsMappers";
import { HapticFeedbackManager } from "@microblink/ux-common/hapticFeedback";
import { RafLoop } from "@microblink/ux-common/RafLoop";
import { invokeCallbacks, sleep } from "@microblink/ux-common/utils";
import { debounce } from "perfect-debounce";
import { match } from "ts-pattern";
import {
  blinkCardUiErrorStateKeys,
  blinkCardUiIntroStateKeys,
  BlinkCardUiStateMap,
  blinkCardUiStateMap,
  blinkCardUiSuccessKeys,
  getUiStateKey,
  type BlinkCardUiErrorStateKey,
  type BlinkCardUiState,
  type BlinkCardUiStateKey,
} from "./blinkcard-ui-state";
import type { BlinkCardProcessingError } from "./BlinkCardProcessingError";
import { BlinkCardUxManagerOptions } from "./createBlinkCardUxManager";
import { getBlinkCardChainedUiStateKey } from "./getBlinkCardChainedUiStateKey";

type ProcessingLifecycleState = "ready" | "busy" | "terminal";

/**
 * The BlinkCardUxManager class. This is the main class that manages the UX of
 * the BlinkCard SDK. It is responsible for handling the UI state, the timeout,
 * and the haptic feedback.
 */
export class BlinkCardUxManager {
  /** The camera manager. */
  readonly cameraManager: CameraManager;
  /** The scanning session. */
  readonly scanningSession: RemoteScanningSession;

  #uiState: BlinkCardUiState;

  /**
   * The current UI state. Updated internally by the RAF update loop.
   * Read externally once at UI mount to seed the initial Solid signal value;
   * subsequent updates are delivered via {@link addOnUiStateChangedCallback}.
   */
  get uiState(): BlinkCardUiState {
    return this.#uiState;
  }

  /** Latest mapped candidate key before stabilizer applies it to the UI. */
  #mappedUiStateKey: BlinkCardUiStateKey;

  /** Latest mapped candidate key before stabilization. */
  get mappedUiStateKey(): BlinkCardUiStateKey {
    return this.#mappedUiStateKey;
  }

  /**
   * @deprecated Use `mappedUiStateKey` (internal/debug) or `uiStateKey` (displayed state).
   */
  get rawUiStateKey(): BlinkCardUiStateKey {
    return this.#mappedUiStateKey;
  }

  /**
   * The feedback stabilizer. Public to allow UI components to read scores,
   * event queues, and call restartCurrentStateTimer() for help-tooltip resets.
   */
  readonly feedbackStabilizer: FeedbackStabilizer<BlinkCardUiStateMap>;

  /** The session settings. */
  readonly sessionSettings: BlinkCardSessionSettings;
  /** Whether the demo overlay should be shown. */
  readonly showDemoOverlay: boolean;
  /** Whether the production overlay should be shown. */
  readonly showProductionOverlay: boolean;
  /** The device info. */
  readonly deviceInfo: DeviceInfo;

  #initialUiStateKey: BlinkCardUiStateKey = "INTRO_FRONT";
  #pendingIntroAnchorKey?: BlinkCardUiStateKey;

  /** Protects worker message channel from concurrent/terminal process calls. */
  #processingLifecycleState: ProcessingLifecycleState = "ready";
  /** Whether analytics have been fired for the first processed frame. */
  #firstProcessedFrameAt?: number;

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
  /** The analytics service. */
  #analytics: AnalyticService;
  /** Tracks last reported camera hardware state. */
  #reportedCameraKeys = new Set<string>();
  /** Debounced wrapper around {@link #syncCameraInputToAnalytics} (300 ms). */
  #debouncedCameraInputSyncToAnalytics = debounce(() => {
    this.#syncCameraInputToAnalytics();
  }, 300);

  /** Throttled RAF loop that drives UI state updates at 30 FPS. */
  #rafLoop = new RafLoop((timestamp) => {
    this.feedbackStabilizer.tick();
    void this.#updateUiState(this.feedbackStabilizer.currentState.key);
  }, 1000 / 30);

  /**
   * The constructor for the BlinkCardUxManager class.
   *
   * @param cameraManager - The camera manager.
   * @param scanningSession - The scanning session.
   * @param options - Optional manager configuration.
   * @param sessionSettings - The session settings.
   * @param showDemoOverlay - Whether to show the demo overlay.
   * @param showProductionOverlay - Whether to show the production overlay.
   * @param deviceInfo - The device info.
   */
  constructor(
    cameraManager: CameraManager,
    scanningSession: RemoteScanningSession,
    options: BlinkCardUxManagerOptions = {},
    sessionSettings: BlinkCardSessionSettings,
    showDemoOverlay: boolean,
    showProductionOverlay: boolean,
    deviceInfo: DeviceInfo,
  ) {
    this.cameraManager = cameraManager;
    this.scanningSession = scanningSession;
    this.sessionSettings = sessionSettings;
    this.showDemoOverlay = showDemoOverlay;
    this.showProductionOverlay = showProductionOverlay;
    this.deviceInfo = deviceInfo;

    if (options.initialUiStateKey) {
      this.#initialUiStateKey = options.initialUiStateKey;
    }

    this.feedbackStabilizer = new FeedbackStabilizer(
      blinkCardUiStateMap,
      this.#initialUiStateKey,
    );

    this.#uiState = this.feedbackStabilizer.currentState;

    this.#mappedUiStateKey = this.feedbackStabilizer.currentState.key;
    this.#pendingIntroAnchorKey = this.uiState.key;

    // Initialize analytics service with the scanning session's ping function
    this.#analytics = new AnalyticService({
      pingFn: (ping) => this.scanningSession.ping(ping),
      sendPingletsFn: () => this.scanningSession.sendPinglets(),
    });

    void this.#analytics.logDeviceInfo(this.deviceInfo);

    this.#setupObservers();

    const removeFrameCaptureCallback =
      this.cameraManager.addFrameCaptureCallback(this.#frameCaptureCallback);

    this.#cleanupCallbacks.add(removeFrameCaptureCallback);

    this.startUiUpdateLoop();
  }

  /** The currently applied UI state key. */
  get uiStateKey(): BlinkCardUiStateKey {
    return this.uiState.key;
  }

  startUiUpdateLoop() {
    this.#rafLoop.start();
  }

  stopUiUpdateLoop() {
    this.#rafLoop.stop();
  }

  #setupObservers() {
    let previousPlaybackState: "idle" | "playback" | "capturing" | undefined;

    // clear timeout when we stop processing and add one when we start
    const unsubscribeCaptureState = this.cameraManager.subscribe(
      (s) => s.playbackState,
      (playbackState) => {
        console.debug(`⏯️ ${playbackState}`);
        const wasActive =
          previousPlaybackState !== undefined &&
          previousPlaybackState !== "idle";
        const isActive = playbackState !== "idle";
        const isCaptureTransition =
          playbackState === "capturing" &&
          previousPlaybackState !== "capturing";

        if (!wasActive && isActive) {
          void this.#analytics.logCameraStartedEvent();
          void this.#analytics.sendPinglets();
        } else if (wasActive && !isActive) {
          void this.#analytics.logCameraClosedEvent();
          void this.#analytics.sendPinglets();
        }

        if (
          isCaptureTransition &&
          this.#pendingIntroAnchorKey === this.uiState.key
        ) {
          this.feedbackStabilizer.restartCurrentStateTimer();
          this.#pendingIntroAnchorKey = undefined;
        }

        previousPlaybackState = playbackState;
        if (this.#timeoutDuration === null) return;

        if (playbackState !== "capturing") {
          this.clearScanTimeout();
        } else {
          console.debug("🔁 continuing timeout");
          this.#setTimeout(this.uiState);
        }
      },
    );
    this.#cleanupCallbacks.add(unsubscribeCaptureState);

    const unsubscribeCameras = this.cameraManager.subscribe(
      (s) => s.cameras,
      (cameras) => {
        const nextCameraKeys = new Set(
          cameras.map((camera) => buildCameraAnalyticsKey(camera)),
        );

        const state = this.cameraManager.getState();
        if (cameras.length === 0 && !state.videoElement) {
          // Camera manager is torn down; avoid sending empty hardware pings.
          this.#reportedCameraKeys = nextCameraKeys;
          return;
        }

        if (!hasCameraListChanged(nextCameraKeys, this.#reportedCameraKeys)) {
          return;
        }

        this.#reportedCameraKeys = nextCameraKeys;
        const pingCameras = cameras.map((camera) =>
          convertCameraToPingCamera(camera),
        );
        void this.#analytics.logHardwareCameraInfo(pingCameras);
      },
    );

    this.#cleanupCallbacks.add(unsubscribeCameras);

    const visibilityChangeCallback = () => {
      if (document.visibilityState === "hidden") {
        void this.#analytics.logAppMovedToBackgroundEvent();
      }
      void this.#analytics.sendPinglets();
    };

    document.addEventListener("visibilitychange", visibilityChangeCallback);

    this.#cleanupCallbacks.add(() => {
      document.removeEventListener(
        "visibilitychange",
        visibilityChangeCallback,
      );
    });

    const unsubscribeSelectedCamera = this.cameraManager.subscribe(
      (s) => s.selectedCamera,
      () => this.#syncCameraInputToAnalytics(),
    );

    this.#cleanupCallbacks.add(unsubscribeSelectedCamera);

    const unsubResizeVideo = this.cameraManager.subscribe(
      (s) => s.videoResolution,
      () => this.#scheduleCameraInputSyncToAnalytics(),
    );

    this.#cleanupCallbacks.add(unsubResizeVideo);

    const unsubExtractionArea = this.cameraManager.subscribe(
      (s) => s.extractionArea,
      () => this.#scheduleCameraInputSyncToAnalytics(),
    );

    this.#cleanupCallbacks.add(unsubExtractionArea);

    const unsubscribeCameraPermission = this.cameraManager.subscribe(
      (s) => s.cameraPermission,
      this.#handleCameraPermissionChange,
    );

    this.#cleanupCallbacks.add(unsubscribeCameraPermission);

    // Orientation pings
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

      void this.#analytics.logDeviceOrientation(deviceOrientation);
    };

    const orientationChangeHandler = (event: Event) => {
      const target = event.target as ScreenOrientation;
      reportOrientation(target);
    };

    screen.orientation.addEventListener("change", orientationChangeHandler);

    // initial report
    reportOrientation(screen.orientation);

    this.#cleanupCallbacks.add(() => {
      screen.orientation.removeEventListener(
        "change",
        orientationChangeHandler,
      );
    });

    const unsubTorch = this.cameraManager.subscribe(
      (state) => state.selectedCamera?.torchEnabled,
      (torchEnabled) => {
        if (torchEnabled === undefined) {
          return;
        }

        // trigger haptic feedback
        if (torchEnabled === true) {
          this.#hapticFeedbackManager.triggerShort();
        }

        void this.#analytics.logFlashlightState(torchEnabled);
      },
    );

    this.#cleanupCallbacks.add(unsubTorch);

    // We unsubscribe the video observer when the video element is removed from the DOM.
    const unsubscribeVideoObserver = this.cameraManager.subscribe(
      (s) => s.videoElement,
      (videoElement) => {
        if (!videoElement) {
          console.debug("Removing camera manager subscriptions");
          this.destroy();
        }
      },
    );
    this.#cleanupCallbacks.add(unsubscribeVideoObserver);

    this.#cleanupCallbacks.add(() => {
      this.stopUiUpdateLoop();
    });
  }

  #handleCameraPermissionChange = (
    curr: CameraPermission,
    prev: CameraPermission,
  ) => {
    if (prev === undefined) {
      // startup
      if (curr === "granted") {
        console.debug("previously granted");
        void this.#analytics.logCameraPermissionCheck(true);
      } else if (curr === "denied") {
        console.debug("previously blocked");
        void this.#analytics.logCameraPermissionCheck(false);
      } else if (curr === "prompt") {
        console.debug("Waiting for user response");
        void this.#analytics.logCameraPermissionRequest();
      }
    }

    if (prev === "prompt") {
      if (curr === "granted") {
        console.debug("user granted permission");
        void this.#analytics.logCameraPermissionUserResponse(true);
      } else if (curr === "denied") {
        console.debug("user denied permission");
        void this.#analytics.logCameraPermissionUserResponse(false);
      }
    }

    if (prev === "denied") {
      if (curr === "granted") {
        console.debug("user gave permission in browser settings");
      } else if (curr === "prompt") {
        console.debug("retrying for camera permission");
        void this.#analytics.logCameraPermissionRequest();
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

    void this.#analytics.sendPinglets();
  };

  #syncCameraInputToAnalytics(): void {
    const cameraInputInfo = this.#buildCameraInputPingData();
    if (!cameraInputInfo) {
      return;
    }
    void this.#analytics.logCameraInputInfo(cameraInputInfo);
  }

  #scheduleCameraInputSyncToAnalytics(): void {
    void this.#debouncedCameraInputSyncToAnalytics();
  }

  #clearCameraInputAnalyticsSync(): void {
    this.#debouncedCameraInputSyncToAnalytics.cancel();
  }

  #buildCameraInputPingData(): PingCameraInputInfoData | undefined {
    const state = this.cameraManager.getState();
    if (!state.selectedCamera || !state.videoResolution) {
      return undefined;
    }
    return convertCameraInputToPingData(
      state.selectedCamera,
      state.videoResolution,
      state.extractionArea,
    );
  }

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
    void this.#analytics.logHelpClosedEvent(fullyViewed);
  }

  /**
   * Logs when the help modal is opened.
   */
  logHelpOpened(): void {
    void this.#analytics.logHelpOpenedEvent();
  }

  /**
   * Logs when the help tooltip is displayed.
   */
  logHelpTooltipDisplayed(): void {
    void this.#analytics.logHelpTooltipDisplayedEvent();
  }

  /**
   * Logs when the close button is clicked.
   */
  logCloseButtonClicked(): void {
    void this.#analytics.logCloseButtonClickedEvent();
  }

  /**
   * Logs when an alert is displayed.
   *
   * @param alertType - The type of alert displayed.
   */
  logAlertDisplayed(
    alertType: NonNullable<PingUxEventData["alertType"]>,
  ): void {
    void this.#analytics.logAlertDisplayedEvent(alertType);
  }

  /**
   * Logs when the onboarding guide is displayed.
   */
  logOnboardingDisplayed(): void {
    void this.#analytics.logOnboardingDisplayedEvent();
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
   * Gets the analytics service for tracking UX events.
   */
  get analytics(): AnalyticService {
    return this.#analytics;
  }

  /**
   * Adds a callback function to be executed when the UI state changes.
   *
   * @param callback - Function to be called when UI state changes. Receives the
   * new UI state as parameter.
   * @returns A cleanup function that removes the callback when called.
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
   */
  addOnErrorCallback(callback: (errorState: BlinkCardProcessingError) => void) {
    this.#onErrorCallbacks.add(callback);
    return () => {
      this.#onErrorCallbacks.delete(callback);
    };
  }

  /**
   * The frame capture callback. Only processes the frame and ingests the
   * mapped state into the stabilizer; all UI updates are driven by the RAF loop.
   *
   * @param imageData - The image data.
   * @returns The processed frame's ArrayBuffer, or undefined if not applicable.
   */
  #frameCaptureCallback = async (
    imageData: ImageData,
  ): Promise<ArrayBuffer | void> => {
    if (this.#processingLifecycleState === "terminal") {
      return;
    }

    if (this.#processingLifecycleState === "busy") {
      console.debug("🚦🔴 Thread is busy, skipping frame capture");
      return;
    }

    this.#processingLifecycleState = "busy";

    try {
      const processResult = await this.scanningSession.process(imageData);

      if (!this.#firstProcessedFrameAt) {
        this.#firstProcessedFrameAt = performance.now();
        void this.#analytics.sendPinglets();
      }

      const mappedUiStateKey = getUiStateKey(
        processResult,
        this.sessionSettings.scanningSettings,
      );

      // Invoke frame-level side effects (analytics, stop-processing, terminal flag)
      this.#handleProcessResultSideEffects(mappedUiStateKey);

      // Notify frame process subscribers
      invokeCallbacks(
        this.#onFrameProcessCallbacks,
        processResult,
        "onFrameProcess",
      );

      // Feed the stabilizer — RAF loop will apply the state on next tick
      if (mappedUiStateKey) {
        this.#mappedUiStateKey = mappedUiStateKey;
        this.feedbackStabilizer.ingest(mappedUiStateKey);
      }

      return processResult.arrayBuffer;
    } finally {
      if (this.#processingLifecycleState === "busy") {
        this.#processingLifecycleState = "ready";
      }
    }
  };

  /**
   * Handles frame-level side effects without touching the UI directly:
   * queues analytics pings and stops frame capture on success.
   */
  #handleProcessResultSideEffects = (
    mappedUiStateKey: ReturnType<typeof getUiStateKey>,
  ): void => {
    if (!mappedUiStateKey) {
      return;
    }

    // Stop frame capture on any success state
    if (
      (blinkCardUiSuccessKeys as readonly string[]).includes(mappedUiStateKey)
    ) {
      console.debug("🛑 stop processing", mappedUiStateKey);
      this.cameraManager.stopFrameCapture();
      void this.#analytics.sendPinglets();

      // Terminal: no more frames needed after full card capture
      if (mappedUiStateKey === "CARD_CAPTURED") {
        this.#processingLifecycleState = "terminal";
      }
    }
  };

  /**
   * Maps a BlinkCard error UI state key to its analytics error message type.
   */
  #getErrorAnalyticsType = (
    errorKey: BlinkCardUiErrorStateKey,
  ): NonNullable<PingUxEventData["errorMessageType"]> => {
    return match<
      BlinkCardUiErrorStateKey,
      NonNullable<PingUxEventData["errorMessageType"]>
    >(errorKey)
      .with("CARD_NOT_IN_FRAME_FRONT", () => "KeepVisible")
      .with("CARD_NOT_IN_FRAME_BACK", () => "KeepVisible")
      .with("BLUR_DETECTED", () => "EliminateBlur")
      .with("OCCLUDED", () => "KeepVisible")
      .with("WRONG_SIDE", () => "FlipSide")
      .with("CARD_FRAMING_CAMERA_TOO_FAR", () => "MoveCloser")
      .with("CARD_FRAMING_CAMERA_TOO_CLOSE", () => "MoveFarther")
      .with("CARD_FRAMING_CAMERA_ANGLE_TOO_STEEP", () => "AlignDocument")
      .with("CARD_TOO_CLOSE_TO_FRAME_EDGE", () => "MoveFromEdge")
      .exhaustive();
  };

  /**
   * Updates the UI state from the current stabilizer key. Called by the RAF loop.
   */
  #updateUiState = async (uiStateKey: BlinkCardUiStateKey) => {
    if (uiStateKey === this.#uiState.key) {
      return;
    }

    console.debug(`🔄 UI State changed: ${this.#uiState.key} -> ${uiStateKey}`);

    const newUiState = blinkCardUiStateMap[uiStateKey];
    this.#uiState = newUiState;

    // Log error analytics when UI state changes to an error state (not in processing loop)
    if (
      (blinkCardUiErrorStateKeys as readonly string[]).includes(newUiState.key)
    ) {
      const errorKey = newUiState.key as BlinkCardUiErrorStateKey;
      const pingErrorMessageType = this.#getErrorAnalyticsType(errorKey);
      void this.#analytics.logErrorMessageEvent(pingErrorMessageType);
    }

    this.#handleHapticFeedback(newUiState.key);

    invokeCallbacks(
      this.#onUiStateChangedCallbacks,
      newUiState,
      "onUiStateChanged",
    );

    await this.#handleUiStateUpdates(newUiState);
    this.#queueNextChainedUiState(newUiState.key);
  };

  /**
   * Queues the next chained UI state into the stabilizer after a transition.
   */
  #queueNextChainedUiState = (previousUiStateKey: BlinkCardUiStateKey) => {
    const chainedUiStateKey = getBlinkCardChainedUiStateKey({
      previousUiStateKey,
    });

    if (!chainedUiStateKey) {
      return;
    }

    this.feedbackStabilizer.ingest(chainedUiStateKey);
  };

  /**
   * Handles UI-level side effects triggered by a state transition:
   * restarts the scan timeout, resumes frame capture on intro states, and
   * orchestrates result retrieval on CARD_CAPTURED.
   */
  #handleUiStateUpdates = async (uiState: BlinkCardUiState) => {
    if (this.#timeoutDuration !== null && uiState.key !== "CARD_CAPTURED") {
      this.#setTimeout(uiState);
    }

    if (
      (blinkCardUiIntroStateKeys as readonly BlinkCardUiStateKey[]).includes(
        uiState.key,
      )
    ) {
      this.#pendingIntroAnchorKey = uiState.key;
      void this.cameraManager.startFrameCapture();
    }

    // Full card captured: wait for animation, then retrieve result
    if (uiState.key === "CARD_CAPTURED") {
      this.clearScanTimeout();
      try {
        await sleep(uiState.minDuration);

        const result = await this.getSessionResult();

        invokeCallbacks(this.#onResultCallbacks, result, "onResult");
      } catch (err) {
        console.error(
          "Failed to retrieve scan result after card capture:",
          err,
        );
        invokeCallbacks(
          this.#onErrorCallbacks,
          "result_retrieval_failed",
          "onError",
        );
        void this.#analytics.sendPinglets();
      }
    }
  };

  /**
   * Handles haptic feedback based on UI state changes.
   */
  #handleHapticFeedback = (uiStateKey: BlinkCardUiStateKey) => {
    if (uiStateKey === "FIRST_SIDE_CAPTURED") {
      this.#hapticFeedbackManager.triggerShort();
      return;
    }

    if (uiStateKey === "CARD_CAPTURED") {
      this.#hapticFeedbackManager.triggerLong();
      return;
    }

    if (blinkCardUiStateMap[uiStateKey].reticleType === "error") {
      this.#hapticFeedbackManager.triggerShort();
    }
  };

  /**
   * Sets the timeout for the scanning session.
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

      invokeCallbacks(this.#onErrorCallbacks, "timeout", "onError");

      void this.#analytics.logStepTimeoutEvent();
      void this.#analytics.sendPinglets();

      this.#resetUiState();
    }, this.#timeoutDuration);
  };

  /**
   * Resets the feedback stabilizer and invokes the onUiStateChanged callbacks.
   */
  #resetUiState = (
    uiStateKey: BlinkCardUiStateKey = this.#initialUiStateKey,
  ) => {
    this.feedbackStabilizer.reset(uiStateKey);
    this.#uiState = this.feedbackStabilizer.currentState;
    this.#mappedUiStateKey = this.uiState.key;
    this.#processingLifecycleState = "ready";
    this.#pendingIntroAnchorKey = uiStateKey;
    this.#firstProcessedFrameAt = undefined;
    invokeCallbacks(
      this.#onUiStateChangedCallbacks,
      this.uiState,
      "onUiStateChanged",
    );
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
   * Sets the duration after which the scanning session will timeout.
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
   * Gets the result from the scanning session.
   *
   * @returns The result.
   */
  async getSessionResult(): Promise<BlinkCardScanningResult> {
    return this.scanningSession.getResult();
  }

  /**
   * Resets the scanning session.
   *
   * @param startFrameCapture Whether to start frame processing.
   */
  async resetScanningSession(startFrameCapture = true) {
    console.debug("🔁 Resetting scanning session");
    this.clearScanTimeout();
    this.#resetUiState();

    await this.scanningSession.reset();

    if (startFrameCapture) {
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
    this.#processingLifecycleState = "ready";
    this.clearUserCallbacks();
  }

  /**
   * Fully tears down the BlinkCardUxManager. Stops frame processing, cancels the
   * scan timeout, removes all subscriptions and the RAF loop, and clears all
   * registered callbacks. Should be called when the manager is no longer needed.
   *
   * Does not stop the camera stream or delete the scanning session.
   */
  destroy() {
    console.debug("💥 Destroying BlinkCardUxManager");
    this.#processingLifecycleState = "terminal";
    this.clearScanTimeout();
    this.cleanupAllObservers();
    this.clearUserCallbacks();
  }
}
