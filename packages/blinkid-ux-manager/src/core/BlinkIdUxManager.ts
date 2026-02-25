/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

// TODO: fix linting to apply only to /ui
/* eslint-disable solid/reactivity */

import { AnalyticService } from "@microblink/analytics/AnalyticService";
import type {
  PingCameraInputInfoData,
  PingScanningConditionsData,
} from "@microblink/analytics/ping";
import {
  DeviceInfo,
  DocumentRotation,
  type BlinkIdProcessResult,
  type BlinkIdScanningResult,
  type BlinkIdSessionSettings,
  type DocumentClassInfo,
  type ProcessResultWithBuffer,
  type RemoteScanningSession,
} from "@microblink/blinkid-core";
import type {
  CameraManager,
  CameraPermission,
} from "@microblink/camera-manager";
import { FeedbackStabilizer } from "@microblink/feedback-stabilizer";
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
import {
  BlinkIdUiErrorStateKey,
  blinkIdUiErrorStateKeys,
  blinkIdUiIntroStateKeys,
  BlinkIdUiState,
  BlinkIdUiStateKey,
  BlinkIdUiStateMap,
  blinkIdUiStateMap,
  blinkIdUiStepSuccessKeys,
  getUiStateKey,
} from "./blinkid-ui-state";
import { BlinkIdProcessingError } from "./BlinkIdProcessingError";
import { BlinkIdUxManagerOptions } from "./createBlinkIdUxManager";
import { DocumentClassFilter } from "./DocumentClassFilter";
import {
  ChainedUiStateProps,
  getChainedUiStateKey,
} from "./getChainedUiStateKey";
import {
  DocumentPagination,
  extractDocumentClassInfo,
  getDocumentPaginationType,
  getDocumentRotation,
  isDocumentClassified,
} from "./ui-state-utils";
import {
  mapErrorStateKeyToAnalyticsType,
  type PingableErrorUiStateKey,
} from "./uxAnalyticsMappers";

type ProcessingLifecycleState = "ready" | "busy" | "terminal";

/**
 * The BlinkIdUxManager class. This is the main class that manages the UX of
 * the BlinkID SDK. It is responsible for handling the UI state, the timeout,
 * the help tooltip, and the document class filter.
 */
export class BlinkIdUxManager {
  /** The camera manager. */
  readonly cameraManager: CameraManager;
  /** The scanning session. */
  readonly scanningSession: RemoteScanningSession;

  #uiState: BlinkIdUiState;

  /**
   * The current UI state. Updated internally by the RAF update loop.
   * Read externally once at UI mount to seed the initial Solid signal value;
   * subsequent updates are delivered via {@link addOnUiStateChangedCallback}.
   */
  get uiState(): BlinkIdUiState {
    return this.#uiState;
  }

  /** Latest mapped candidate key before stabilizer applies it to the UI. */
  #mappedUiStateKey: BlinkIdUiStateKey;
  /**
   * The feedback stabilizer. Public to allow UI components to read scores,
   * event queues, and call restartCurrentStateTimer() for help-tooltip resets.
   */
  readonly feedbackStabilizer: FeedbackStabilizer<BlinkIdUiStateMap>;
  /** The session settings. Populated asynchronously from the scanning session. */
  readonly sessionSettings: BlinkIdSessionSettings;
  /** Whether the demo overlay should be shown. Populated asynchronously from the scanning session. */
  readonly showDemoOverlay: boolean;
  /** Whether the production overlay should be shown. Populated asynchronously from the scanning session. */
  readonly showProductionOverlay: boolean;
  /** The device info. */
  readonly deviceInfo: DeviceInfo;

  #documentPagination?: DocumentPagination;
  #lastDocumentRotation?: DocumentRotation;
  #pendingIntroAnchorKey?: BlinkIdUiStateKey;
  #initialUiStateKey: BlinkIdUiStateKey = "INTRO_FRONT_PAGE";
  #firstProcessedFrameAt?: number;

  /** Protects worker message channel from concurrent/terminal process calls. */
  #processingLifecycleState: ProcessingLifecycleState = "ready";
  /** The scanning session timeout ID. */
  #timeoutId?: number;
  /** Timeout duration in ms for the scanning session. If null, timeout won't be triggered ever. */
  #timeoutDuration: number | null = 10000; // 10s
  /**
   * Time in ms before the help tooltip is shown. If null, tooltip won't be auto shown.
   *
   * @deprecated This option will be removed in a future release. Use `helpTooltipShowDelay` in `FeedbackUiOptions` instead.
   */
  #helpTooltipShowDelay: number | null = 5000; // 5s
  /**
   * Time in ms before the help tooltip is hidden. If null, tooltip won't be auto hidden.
   *
   * @deprecated This option will be removed in a future release. Use `helpTooltipHideDelay` in `FeedbackUiOptions` instead.
   */
  #helpTooltipHideDelay: number | null = 5000; // 5s

  /** The callbacks for when the UI state changes. */
  #onUiStateChangedCallbacks = new Set<(uiState: BlinkIdUiState) => void>();
  /** The callbacks for when a scan result is available. */
  #onResultCallbacks = new Set<(result: BlinkIdScanningResult) => void>();
  /** The callbacks for when a frame is processed. */
  #onFrameProcessCallbacks = new Set<
    (frameResult: ProcessResultWithBuffer) => void
  >();
  /** The callbacks for when an error occurs during processing. */
  #onErrorCallbacks = new Set<(errorState: BlinkIdProcessingError) => void>();
  /** The callbacks for when a document is filtered. */
  #onDocumentFilteredCallbacks = new Set<
    (documentClassInfo: DocumentClassInfo) => void
  >();
  /** Clean up observers, store subscriptions and event listeners. */
  #cleanupCallbacks = new Set<() => void>();
  /** The document class filter. */
  #documentClassFilter?: DocumentClassFilter;
  /** The haptic feedback manager. */
  #hapticFeedbackManager = new HapticFeedbackManager();
  /** The UX analytics service. */
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
   * The constructor for the BlinkIdUxManager class.
   *
   * @param cameraManager - The camera manager.
   * @param scanningSession - The scanning session.
   * @param options - Optional manager configuration.
   */
  constructor(
    cameraManager: CameraManager,
    scanningSession: RemoteScanningSession,
    options: BlinkIdUxManagerOptions = {},
    sessionSettings: BlinkIdSessionSettings,
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
      blinkIdUiStateMap,
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
  get uiStateKey(): BlinkIdUiStateKey {
    return this.uiState.key;
  }

  /** Latest mapped candidate key before stabilization. */
  get mappedUiStateKey(): BlinkIdUiStateKey {
    return this.#mappedUiStateKey;
  }

  /**
   * @deprecated Use `mappedUiStateKey` (internal/debug) or `uiStateKey` (displayed state).
   */
  get rawUiStateKey(): BlinkIdUiStateKey {
    return this.#mappedUiStateKey;
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

    // We unsubscribe the video observer when the video element is removed from the DOM
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
   * Returns the timeout duration in ms. Null if timeout won't be triggered ever.
   */
  getTimeoutDuration(): number | null {
    return this.#timeoutDuration;
  }

  /**
   * Returns the time in ms before the help tooltip is shown. Null if tooltip won't be auto shown.
   *
   * @deprecated This option will be removed in a future release. Use `helpTooltipShowDelay` in `FeedbackUiOptions` instead.
   */
  getHelpTooltipShowDelay(): number | null {
    return this.#helpTooltipShowDelay;
  }

  /**
   * Returns the time in ms before the help tooltip is hidden. Null if tooltip won't be auto hidden.
   *
   * @deprecated This option will be removed in a future release. Use `helpTooltipHideDelay` in `FeedbackUiOptions` instead.
   */
  getHelpTooltipHideDelay(): number | null {
    return this.#helpTooltipHideDelay;
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
   *
   * @returns The UX analytics service
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
   *
   * @example
   * const cleanup = manager.addOnUiStateChangedCallback((newState) => {
   *   console.log('UI state changed to:', newState);
   * });
   *
   * cleanup();
   */
  addOnUiStateChangedCallback(callback: (uiState: BlinkIdUiState) => void) {
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
  addOnResultCallback(callback: (result: BlinkIdScanningResult) => void) {
    this.#onResultCallbacks.add(callback);
    return () => {
      this.#onResultCallbacks.delete(callback);
    };
  }

  /**
   * Registers a callback function to filter document classes.
   *
   * @param callback - A function that will be called with the document class
   * info.
   * @returns A cleanup function that, when called, will remove the registered
   * callback.
   *
   * @example
   * const cleanup = manager.addDocumentClassFilter((docClassInfo) => {
   *   return docClassInfo.country === 'usa';
   * });
   *
   * // Later, to remove the callback:
   * cleanup();
   */
  addDocumentClassFilter(callback: DocumentClassFilter) {
    this.#documentClassFilter = callback;
    return () => {
      this.#documentClassFilter = undefined;
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
  addOnErrorCallback(callback: (errorState: BlinkIdProcessingError) => void) {
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
  #invokeOnErrorCallbacks = (errorState: BlinkIdProcessingError) => {
    this.#hapticFeedbackManager.triggerLong();
    invokeCallbacks(this.#onErrorCallbacks, errorState, "onError");
  };

  /**
   * Registers a callback function to be called when a document is filtered.
   *
   * @param callback - A function that will be called with the document class
   * info.
   * @returns A cleanup function that, when called, will remove the registered
   * callback.
   *
   * @example
   * const cleanup = manager.addOnDocumentFilteredCallback((docClassInfo) => {
   *   console.log('Document filtered:', docClassInfo);
   * });
   *
   * // Later, to remove the callback:
   * cleanup();
   */
  addOnDocumentFilteredCallback(
    callback: (documentClassInfo: DocumentClassInfo) => void,
  ) {
    this.#onDocumentFilteredCallbacks.add(callback);
    return () => {
      this.#onDocumentFilteredCallbacks.delete(callback);
    };
  }

  /**
   * Invokes the onDocumentFiltered callbacks.
   *
   * @param documentClassInfo - The document class info.
   */
  #invokeOnDocumentFilteredCallbacks = (
    documentClassInfo: DocumentClassInfo,
  ) => {
    this.#hapticFeedbackManager.triggerLong();
    invokeCallbacks(
      this.#onDocumentFilteredCallbacks,
      documentClassInfo,
      "onDocumentFiltered",
    );
  };

  /**
   * Invokes the onResult callbacks.
   *
   * @param result - The scan result.
   */
  #invokeOnResultCallbacks = (result: BlinkIdScanningResult) => {
    invokeCallbacks(this.#onResultCallbacks, result, "onResult");
  };

  /**
   * Invokes the onFrameProcess callbacks.
   *
   * @param frameResult - The frame result.
   */
  #invokeOnFrameProcessCallbacks = (frameResult: ProcessResultWithBuffer) => {
    invokeCallbacks(
      this.#onFrameProcessCallbacks,
      frameResult,
      "onFrameProcess",
    );
  };

  /**
   * Invokes the onUiStateChanged callbacks.
   *
   * @param uiState - The UI state.
   */
  #invokeOnUiStateChangedCallbacks = (uiState: BlinkIdUiState) => {
    invokeCallbacks(
      this.#onUiStateChangedCallbacks,
      uiState,
      "onUiStateChanged",
    );
  };

  /**
   * Handles document class filtering if configured.
   * Returns true if the document should be processed, false if it was filtered out.
   *
   * @param processResult - The result of processing the current frame
   * @returns boolean indicating if the document should be processed
   */
  #handleDocumentClassFiltering(
    processResult: ProcessResultWithBuffer,
  ): boolean {
    // Skip filtering if no filter is configured
    if (this.#documentClassFilter === undefined) {
      return true;
    }

    const documentClassInfo = extractDocumentClassInfo(processResult);

    // If document is not classified or passes the filter, continue processing
    if (
      !isDocumentClassified(documentClassInfo) ||
      this.#documentClassFilter(documentClassInfo)
    ) {
      return true;
    }

    // Document was classified but filtered out by client's criteria
    this.cameraManager.stopFrameCapture();

    // Notify relevant callbacks but skip UI updates since the document is rejected
    this.#invokeOnDocumentFilteredCallbacks(documentClassInfo);

    return false;
  }

  /**
   * Sets the duration after which the scanning session will timeout. The
   * timeout can occur in various scenarios and may be restarted by different
   * scanning events.
   *
   * @param duration The timeout duration in milliseconds. If null, timeout won't
   * be triggered ever.
   * @param setHelpTooltipShowDelay If true, also sets the help tooltip show
   * delay to half of the provided duration. If timeout duration is null, help
   * tooltip show delay will be set to null. Defaults to true.
   * @throws {Error} Throws an error if duration is less than or equal to 0 when not null.
   */
  setTimeoutDuration(duration: number | null, setHelpTooltipShowDelay = true) {
    if (duration !== null && duration <= 0) {
      throw new Error("Timeout duration must be greater than 0");
    }

    this.#timeoutDuration = duration;

    if (setHelpTooltipShowDelay) {
      this.setHelpTooltipShowDelay(duration !== null ? duration / 2 : null);
    }
  }

  /**
   * Sets the duration in milliseconds before the help tooltip is shown.
   * A value of null means the help tooltip will not be auto shown.
   *
   * @param duration The duration in milliseconds before the help tooltip is
   * shown. If null, tooltip won't be auto shown.
   * @throws {Error} Throws an error if duration is less than or equal to 0 when
   * not null.
   *
   * @deprecated This option will be removed in a future release. Use `helpTooltipShowDelay` in `FeedbackUiOptions` instead.
   */
  setHelpTooltipShowDelay(duration: number | null) {
    if (duration !== null && duration <= 0) {
      throw new Error("Help tooltip show delay must be greater than 0");
    }

    this.#helpTooltipShowDelay = duration;
  }

  /**
   * Sets the duration in milliseconds before the help tooltip is hidden.
   * A value of null means the help tooltip will not be auto hidden.
   *
   * @param duration The duration in milliseconds before the help tooltip is
   * hidden. If null, tooltip won't be auto hidden.
   * @throws {Error} Throws an error if duration is less than or equal to 0 when
   * not null.
   *
   * @deprecated This option will be removed in a future release. Use `helpTooltipHideDelay` in `FeedbackUiOptions` instead.
   */
  setHelpTooltipHideDelay(duration: number | null) {
    if (duration !== null && duration <= 0) {
      throw new Error("Help tooltip display duration must be greater than 0");
    }

    this.#helpTooltipHideDelay = duration;
  }

  /**
   * Sets the timeout for the scanning session.
   *
   * @param uiState - The UI state.
   */
  #setTimeout = (uiState: BlinkIdUiState) => {
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

      void this.#analytics.logStepTimeoutEvent();
      void this.#analytics.sendPinglets();

      // reset the scanning session, but don't continue
      void this.resetScanningSession(false);
    }, this.#timeoutDuration);
  };

  /**
   * Handles haptic feedback based on UI state changes.
   *
   * @param uiStateKey - The new UI state key
   */
  #handleHapticFeedback = (uiStateKey: BlinkIdUiStateKey) => {
    if (uiStateKey === "PAGE_CAPTURED") {
      this.#hapticFeedbackManager.triggerShort();
      return;
    }

    // Final success state (document fully captured)
    if (uiStateKey === "DOCUMENT_CAPTURED") {
      this.#hapticFeedbackManager.triggerLong();
      return;
    }

    // Error states (excluding unsupported document which is handled separately)
    if (
      uiStateKey !== "UNSUPPORTED_DOCUMENT" &&
      blinkIdUiErrorStateKeys.includes(uiStateKey as BlinkIdUiErrorStateKey)
    ) {
      this.#hapticFeedbackManager.triggerShort();
      return;
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

      if (processResult.arrayBuffer.byteLength === 0) {
        console.warn(
          "scanningSession.process did not return ownership of the array buffer!",
        );
      }

      /**
       * This should not happen. The processing should stop after the document has been
       * captured, or after the result has been retrieved.
       * @see BlinkIdSessionErrorType
       */
      if ("error" in processResult) {
        console.warn("session process error:", processResult.error);
        return processResult.arrayBuffer;
      }

      if (!this.#firstProcessedFrameAt) {
        this.#firstProcessedFrameAt = performance.now();
        void this.#analytics.sendPinglets();
      }

      this.#lastDocumentRotation = getDocumentRotation(processResult);
      this.#documentPagination = getDocumentPaginationType(
        extractDocumentClassInfo(processResult),
      );

      const mappedUiStateKey = this.#getMappedUiStateKey(processResult);

      // stop/resume side-effects remain on frame processing path
      this.#handleProcessResultSideEffects(mappedUiStateKey);

      // invoke user callbacks
      this.#invokeOnFrameProcessCallbacks(processResult);

      // Check if document should be processed or filtered out
      if (!this.#handleDocumentClassFiltering(processResult)) {
        return processResult.arrayBuffer;
      }

      // fills the stabilizer event queue on the video frame, RAF handles updates
      // Ingest immediately to avoid an extra manager queue layer.
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

  #handleProcessResultSideEffects = (
    mappedUiStateKey?: BlinkIdUiStateKey,
  ): void => {
    if (!mappedUiStateKey) {
      return;
    }

    // stop frame processing on success states
    if (
      (blinkIdUiStepSuccessKeys as readonly BlinkIdUiStateKey[]).includes(
        mappedUiStateKey,
      )
    ) {
      console.debug("🛑 stop processing", mappedUiStateKey);
      this.cameraManager.stopFrameCapture();
      void this.#analytics.sendPinglets();
      if (mappedUiStateKey === "DOCUMENT_CAPTURED") {
        this.#processingLifecycleState = "terminal";
      }
    }
  };

  #getMappedUiStateKey = (processResult: BlinkIdProcessResult) => {
    if (!this.sessionSettings) {
      return undefined;
    }
    return getUiStateKey(processResult, this.sessionSettings.scanningSettings);
  };

  /**
   * Updates the UI state from the uiStateKey
   */
  #updateUiState = async (uiStateKey: BlinkIdUiStateKey) => {
    // Skip UI update if the state is the same
    if (uiStateKey === this.uiState.key) {
      return;
    }

    console.debug(`🔄 UI State changed: ${this.uiState.key} -> ${uiStateKey}`);

    const newUiState = blinkIdUiStateMap[uiStateKey];

    this.#uiState = newUiState;

    // Log error analytics when UI state changes to an error state (not in processing loop)
    if (
      uiStateKey !== "UNSUPPORTED_DOCUMENT" &&
      blinkIdUiErrorStateKeys.includes(uiStateKey as BlinkIdUiErrorStateKey)
    ) {
      const errorKey = uiStateKey as PingableErrorUiStateKey;
      void this.#analytics.logErrorMessageEvent(
        mapErrorStateKeyToAnalyticsType(errorKey),
      );
    }

    // Trigger haptic feedback based on UI state changes
    this.#handleHapticFeedback(newUiState.key);

    // Unsupported document is stabilized on purpose to prevent one-off errors.
    // This state should not update the spinner + user guidance message, only
    // open the unsupported-document modal via the error callback.
    if (uiStateKey === "UNSUPPORTED_DOCUMENT") {
      // handle UNSUPPORTED_DOCUMENT
      console.debug("🔴 Unsupported document");
      this.#invokeOnErrorCallbacks("unsupported_document");
      return;
    }

    this.#invokeOnUiStateChangedCallbacks(newUiState);
    await this.#handleUiStateUpdates(newUiState);
    this.#queueNextChainedUiState(newUiState.key);
  };

  #queueNextChainedUiState = (previousUiStateKey: BlinkIdUiStateKey) => {
    if (!this.#documentPagination) {
      return;
    }

    const chainedUiProps: ChainedUiStateProps = {
      previousUiStateKey,
      paginationType: this.#documentPagination,
      rotation: this.#lastDocumentRotation,
    };

    const chainedUiStateKey = getChainedUiStateKey(chainedUiProps);

    if (!chainedUiStateKey) {
      return;
    }

    this.feedbackStabilizer.ingest(chainedUiStateKey);
  };

  /**
   * Handles side effects triggered by a UI state transition: restarts the
   * scan timeout, resumes frame capture on intro states, and orchestrates
   * result retrieval on DOCUMENT_CAPTURED.
   *
   * @param uiState - The UI state.
   */
  #handleUiStateUpdates = async (uiState: BlinkIdUiState) => {
    if (this.#timeoutDuration !== null && uiState.key !== "DOCUMENT_CAPTURED") {
      this.#setTimeout(uiState);
    }

    // handle resuming processing on intro states
    if (
      (blinkIdUiIntroStateKeys as readonly BlinkIdUiStateKey[]).includes(
        uiState.key,
      )
    ) {
      this.#pendingIntroAnchorKey = uiState.key;
      void this.cameraManager.startFrameCapture();
    }

    // handle DOCUMENT_CAPTURED
    if (uiState.key === "DOCUMENT_CAPTURED") {
      console.debug(
        "Handling DOCUMENT_CAPTURED state from #handleUiStateChange",
      );
      // Scanning is complete — cancel any running timeout before the animation sleep
      // to prevent it from firing and triggering a spurious reset during result retrieval.
      this.clearScanTimeout();
      try {
        await sleep(uiState.minDuration); // allow checkbox success animation to play out

        const result = await this.getSessionResult();

        this.#invokeOnResultCallbacks(result);
      } catch (err) {
        console.error(
          "Failed to retrieve scan result after document capture:",
          err,
        );
        this.#invokeOnErrorCallbacks("result_retrieval_failed");
        void this.#analytics.sendPinglets();
      } finally {
        this.#processingLifecycleState = "terminal";
      }
    }
  };

  /**
   * Returns the initial UI state key used when resetting UX state.
   */
  getInitialUiStateKey() {
    return this.#initialUiStateKey;
  }

  /**
   * Overrides the initial UI state key.
   *
   * @param uiStateKey - The UI state key to use as manager initial state.
   * @param applyImmediately - If true, immediately applies and emits this state.
   */
  setInitialUiStateKey(
    uiStateKey: BlinkIdUiStateKey,
    applyImmediately = false,
  ) {
    this.#initialUiStateKey = uiStateKey;
    if (applyImmediately) {
      this.#resetUiState(uiStateKey);
    }
  }

  /**
   * Resets the feedback stabilizer and invokes the onUiStateChanged callbacks.
   */
  #resetUiState = (uiStateKey: BlinkIdUiStateKey = this.#initialUiStateKey) => {
    this.feedbackStabilizer.reset(uiStateKey);
    this.#uiState = this.feedbackStabilizer.currentState;
    this.#mappedUiStateKey = this.uiState.key;
    this.#processingLifecycleState = "ready";
    this.#pendingIntroAnchorKey = uiStateKey;
    this.#firstProcessedFrameAt = undefined;
    this.#invokeOnUiStateChangedCallbacks(this.uiState);
  };

  /**
   * Clears the scanning session timeout.
   */
  clearScanTimeout() {
    if (!this.#timeoutId) {
      return;
    }

    console.debug("⏳🔴 clearing timeout");
    window.clearTimeout(this.#timeoutId);
    this.#timeoutId = undefined;
  }

  /**
   * Gets the result from the scanning session.
   *
   * @returns The result.
   */
  async getSessionResult(): Promise<BlinkIdScanningResult> {
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
      // Check if camera is active before starting frame capture
      if (!this.cameraManager.isActive) {
        await this.cameraManager.startCameraStream();
      }
      await this.cameraManager.startFrameCapture();
    }
  }

  clearUserCallbacks() {
    console.debug("🧹 Clearing all BlinkIdUxManager user callbacks");

    this.#onUiStateChangedCallbacks.clear();
    this.#onResultCallbacks.clear();
    this.#onFrameProcessCallbacks.clear();
    this.#onErrorCallbacks.clear();
    this.#onDocumentFilteredCallbacks.clear();
  }

  cleanupAllObservers() {
    console.debug("🧹 Removing all BlinkIdUxManager observers");
    this.#clearCameraInputAnalyticsSync();
    this.#cleanupCallbacks.forEach((cleanup) => cleanup());
    this.#cleanupCallbacks.clear();
  }

  /**
   * Resets the BlinkIdUxManager. Clears all callbacks.
   *
   * Does not reset the camera manager or the scanning session.
   */
  reset() {
    console.debug("🔁 Resetting BlinkIdUxManager");
    this.clearScanTimeout();
    this.#clearCameraInputAnalyticsSync();
    this.#processingLifecycleState = "ready";
    this.clearUserCallbacks();
    this.#documentClassFilter = undefined;
  }

  /**
   * Fully tears down the BlinkIdUxManager. Stops frame processing, cancels the
   * scan timeout, removes all subscriptions and the RAF loop, and clears all
   * registered callbacks. Should be called when the manager is no longer needed.
   *
   * Does not stop the camera stream or delete the scanning session.
   */
  destroy() {
    console.debug("💥 Destroying BlinkIdUxManager");
    this.#processingLifecycleState = "terminal";
    this.clearScanTimeout();
    this.cleanupAllObservers();
    this.clearUserCallbacks();
    this.#documentClassFilter = undefined;
  }
}
