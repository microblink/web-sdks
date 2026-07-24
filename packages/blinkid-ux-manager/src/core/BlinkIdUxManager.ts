/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

// TODO: fix linting to apply only to /ui
/* eslint-disable solid/reactivity */

import {
  AnalyticService,
  DeviceInfo,
  DocumentRotation,
  ScanningStatus,
  type BlinkIdProcessResult,
  type BlinkIdScanningResult,
  type BlinkIdSessionSettings,
  type DocumentClassInfo,
  type PingCameraInputInfoData,
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
import { subscribeToDeviceOrientation } from "@microblink/ux-common/deviceOrientationAnalytics";
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
  getUiStateKeyFromScanningStatus,
} from "./blinkid-ui-state";
import { BlinkIdProcessingError } from "./BlinkIdProcessingError";
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
import { normalizeBlinkIdTimeoutConfiguration } from "./BlinkIdTimeoutConfiguration";
import type { BlinkIdTimeoutConfiguration } from "./BlinkIdTimeoutConfiguration";
import type { BlinkIdUxManagerOptions } from "./createBlinkIdUxManager";
import {
  getBlinkIdExtractionMode,
  type BlinkIdExtractionMode,
} from "./extractionMode";
import { match } from "ts-pattern";

type ProcessingLifecycleState = "ready" | "busy" | "terminal";
type ScanTimeoutKind = "inactivity" | "scan-step";
type ScanTimerState = {
  timeoutId?: number;
  startedAt?: number;
  remainingMs: number | null;
};
export type BlinkIdProgressTimerStatus =
  | "disabled"
  | "idle"
  | "running"
  | "paused";

/**
 * Callback invoked after BlinkID processes a camera frame.
 *
 * @param frameResult - Process result for the current frame. This contains the
 * input image analysis and result completeness data that the UX manager uses to
 * map feedback state; it does not include the final scanning result.
 * @param advanceToNextStep - Advances the scanning session to the next required
 * step. Use this for custom flows that decide, from the frame result, that the
 * current side or step is complete before the default UX flow advances. For
 * example, call this once `frameResult` contains all data your integration
 * needs, even if the default flow would keep waiting for an optional barcode
 * step that is hard to capture on a poor camera.
 * @param triggerStepTimeout - Immediately triggers the scan-step timeout path
 * for the active step. Use this when custom validation decides that the current
 * step should fail or stop waiting for more frames.
 * @param getLastFrame - Returns the raw `ArrayBuffer` for the frame that
 * produced `frameResult`. The buffer is intended for diagnostics or custom
 * tooling that needs the exact last processed frame.
 */
export type BlinkIdFrameProcessCallback = (
  frameResult: BlinkIdProcessResult,
  advanceToNextStep: () => Promise<void>,
  triggerStepTimeout: () => void,
  getLastFrame: () => ArrayBuffer,
) => void;

export type BlinkIdProgressTimerState = {
  /** Configured timeout duration in milliseconds. */
  configuredMs: number | null;
  /** Remaining timeout duration in milliseconds. */
  remainingMs: number | null;
  /** Whether this timer is idle, actively counting down, or paused. */
  status: BlinkIdProgressTimerStatus;
};

export type BlinkIdProgress = {
  /** Currently stabilized BlinkID UI state key. */
  uiStateKey: BlinkIdUiStateKey;
  /** Remaining state for the inactivity timeout. */
  inactivity: BlinkIdProgressTimerState;
  /** Remaining state for the scan-step timeout. */
  perSide: BlinkIdProgressTimerState;
  /** Remaining state for partially supported barcode auto-resolution. */
  partiallySupportedBarcodeResolve: BlinkIdProgressTimerState;
  /** Whether BlinkID is currently timing an active scan step. */
  isTimingActiveScanStep: boolean;
  /** Current camera playback state that controls timer pause/resume. */
  playbackState: "idle" | "playback" | "capturing";
  /** Latest raw mapped BlinkID UI key. */
  mappedUiStateKey: BlinkIdUiStateKey;
  /** Stabilized UI state key that last reset the inactivity timeout. */
  inactivityResetUiStateKey?: BlinkIdUiStateKey;
};

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
   * subsequent updates are delivered via `addOnUiStateChangedCallback`.
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
  /** Session-settings-derived extraction mode used by UI copy and assets. */
  readonly #extractionMode: BlinkIdExtractionMode;

  #documentPagination?: DocumentPagination;
  #lastDocumentRotation?: DocumentRotation;
  #pendingIntroAnchorKey?: BlinkIdUiStateKey;
  #initialUiStateKey: BlinkIdUiStateKey = "INTRO_FRONT_PAGE";
  #firstProcessedFrameAt?: number;

  /** Protects worker message channel from concurrent/terminal process calls. */
  #processingLifecycleState: ProcessingLifecycleState = "ready";
  /** True after destroy() is called; used to suppress late async work during teardown. */
  #isDestroyed = false;
  /** BlinkID timeout configuration. */
  #timeoutConfiguration: BlinkIdTimeoutConfiguration;
  /** Last stabilized UI state key that reset the inactivity timer. */
  #inactivityResetUiStateKey?: BlinkIdUiStateKey;
  /** Whether the current scan step should be timing. */
  #isTimingActiveScanStep = false;
  /** State of the inactivity timeout timer. */
  #inactivityTimeoutState: ScanTimerState;
  /** State of the scan-step timeout timer. */
  #scanStepTimeoutState: ScanTimerState;
  /** State of the partially supported barcode resolve timer. */
  #partiallySupportedBarcodeResolveTimeoutState: ScanTimerState;
  /** Whether the partially supported barcode resolve timer has been started. */
  #partiallySupportedBarcodeResolveTimerStarted = false;
  /** Prevents repeated resolve attempts for the same barcode step. */
  #partiallySupportedBarcodeResolveAttempted = false;

  /** The callbacks for when the UI state changes. */
  #onUiStateChangedCallbacks = new Set<(uiState: BlinkIdUiState) => void>();
  /** The callbacks for when a scan result is available. */
  #onResultCallbacks = new Set<(result: BlinkIdScanningResult) => void>();
  /** The callbacks for when a frame is processed. */
  #onFrameProcessCallbacks = new Set<BlinkIdFrameProcessCallback>();
  /** The callbacks for when an error occurs during processing. */
  #onErrorCallbacks = new Set<(errorState: BlinkIdProcessingError) => void>();
  /** The callbacks for BlinkID progress snapshots emitted from the RAF loop. */
  #onProgressCallbacks = new Set<(progress: BlinkIdProgress) => void>();
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
  /** Debounced wrapper around `#syncCameraInputToAnalytics` (300 ms). */
  #debouncedCameraInputSyncToAnalytics = debounce(() => {
    this.#syncCameraInputToAnalytics();
  }, 300);
  /** Throttled RAF loop that drives UI state updates at 30 FPS. */
  #rafLoop = new RafLoop((timestamp) => {
    this.feedbackStabilizer.tick();
    void this.#updateUiState(this.feedbackStabilizer.currentState.key);
    this.#emitProgress();
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
    this.#extractionMode = getBlinkIdExtractionMode(sessionSettings);

    this.#timeoutConfiguration = normalizeBlinkIdTimeoutConfiguration(
      options.timeoutConfiguration,
      this.#isDesktop,
    );

    this.#inactivityTimeoutState = {
      remainingMs: this.#timeoutConfiguration.inactivityTimeoutMs,
    };

    this.#scanStepTimeoutState = {
      remainingMs: this.#timeoutConfiguration.scanStepTimeoutMs,
    };

    this.#partiallySupportedBarcodeResolveTimeoutState = {
      remainingMs:
        this.#timeoutConfiguration.partiallySupportedBarcodeResolveTimeoutMs,
    };

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
    this.#clearScanTimeoutState();

    // Initialize analytics service with the scanning session's ping function
    this.#analytics = new AnalyticService({
      pingFn: (ping) => this.scanningSession.ping(ping),
      sendPingletsFn: () => this.scanningSession.sendPinglets(),
    });

    void this.#analytics.logDeviceInfo(this.deviceInfo);

    this.#setupObservers();

    const removeFrameCaptureCallback =
      this.cameraManager.addFrameCaptureCallback(this.#frameCaptureCallback);
    const removeCameraManagerErrorCallback =
      this.cameraManager.addErrorCallback(this.handleCameraManagerError);

    this.#cleanupCallbacks.add(removeFrameCaptureCallback);
    this.#cleanupCallbacks.add(removeCameraManagerErrorCallback);

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

  /** Session-settings-derived extraction mode used by feedback and dialogs. */
  get extractionMode(): BlinkIdExtractionMode {
    return this.#extractionMode;
  }

  startUiUpdateLoop() {
    this.#rafLoop.start();
  }

  stopUiUpdateLoop() {
    this.#rafLoop.stop();
  }

  get #isDesktop() {
    return this.deviceInfo.derivedDeviceInfo.formFactors.includes("Desktop");
  }

  #setupObservers() {
    let previousPlaybackState: "idle" | "playback" | "capturing" | undefined;

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
        const isPendingIntroAnchorTransition =
          isCaptureTransition &&
          this.#pendingIntroAnchorKey === this.uiState.key;
        const isIntroCaptureTransition =
          isPendingIntroAnchorTransition &&
          (blinkIdUiIntroStateKeys as readonly BlinkIdUiStateKey[]).includes(
            this.uiState.key,
          );

        if (!wasActive && isActive) {
          void this.#analytics.logCameraStartedEvent();
          void this.#analytics.sendPinglets();
        } else if (wasActive && !isActive) {
          void this.#analytics.logCameraClosedEvent();
          void this.#analytics.sendPinglets();
        }

        if (isPendingIntroAnchorTransition) {
          this.feedbackStabilizer.restartCurrentStateTimer();
          this.#pendingIntroAnchorKey = undefined;
        }

        previousPlaybackState = playbackState;
        if (playbackState !== "capturing") {
          this.#restartInactivityTimeout();
          this.#pauseScanTimer(this.#scanStepTimeoutState);
          this.#pauseScanTimer(
            this.#partiallySupportedBarcodeResolveTimeoutState,
          );
          return;
        }

        if (isIntroCaptureTransition) {
          this.#resetScanTimeoutsForCurrentStep();
          return;
        }

        if (!this.#isTimingActiveScanStep) {
          this.#resetScanTimeoutsForCurrentStep();
          return;
        }

        console.debug("🔁 continuing timeout");
        this.#restartInactivityTimeout();
        this.#resumeScanTimeouts();
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
      } else if (this.#isTimingActiveScanStep) {
        this.#resetScanTimeoutsForCurrentStep();
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

    this.#cleanupCallbacks.add(this.#subscribeToDeviceOrientationAnalytics());

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

  #subscribeToDeviceOrientationAnalytics(): () => void {
    return subscribeToDeviceOrientation(
      (deviceOrientation) => {
        void this.#analytics.logDeviceOrientation(deviceOrientation);
      },
      (logMessage) => {
        void this.#analytics.logWarning(logMessage);
      },
    );
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
        void this.#analytics.logCameraPermissionCheck(false);
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
        void this.#analytics.logCameraPermissionCheck(false);
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
   * Returns the active BlinkID timeout configuration.
   */
  getTimeoutConfiguration(): BlinkIdTimeoutConfiguration {
    return { ...this.#timeoutConfiguration };
  }

  #buildProgress = (): BlinkIdProgress => {
    const playbackState = this.cameraManager.getState().playbackState;

    return {
      uiStateKey: this.uiState.key,
      inactivity: {
        configuredMs: this.#timeoutConfiguration.inactivityTimeoutMs,
        remainingMs: this.#getProgressScanTimerRemainingMs(
          this.#inactivityTimeoutState,
        ),
        status: this.#getScanTimerProgressStatus(
          this.#inactivityTimeoutState,
          playbackState,
          "inactivity",
        ),
      },
      perSide: {
        configuredMs: this.#timeoutConfiguration.scanStepTimeoutMs,
        remainingMs: this.#getProgressScanTimerRemainingMs(
          this.#scanStepTimeoutState,
        ),
        status: this.#getScanTimerProgressStatus(
          this.#scanStepTimeoutState,
          playbackState,
          "scan-step",
        ),
      },
      partiallySupportedBarcodeResolve: {
        configuredMs:
          this.#timeoutConfiguration.partiallySupportedBarcodeResolveTimeoutMs,
        remainingMs: this.#getProgressScanTimerRemainingMs(
          this.#partiallySupportedBarcodeResolveTimeoutState,
        ),
        status:
          this.#getPartiallySupportedBarcodeResolveTimerProgressStatus(
            playbackState,
          ),
      },
      isTimingActiveScanStep: this.#isTimingActiveScanStep,
      playbackState,
      mappedUiStateKey: this.#mappedUiStateKey,
      inactivityResetUiStateKey: this.#inactivityResetUiStateKey,
    };
  };

  #emitProgress = () => {
    if (this.#onProgressCallbacks.size === 0) {
      return;
    }

    invokeCallbacks(
      this.#onProgressCallbacks,
      this.#buildProgress(),
      "onProgress",
    );
  };

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
   *   return docClassInfo.country?.id === 'usa';
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
   * @param callback - A function that receives the processed frame result and
   * controls for custom step advancement, step timeout triggering, and access to
   * the last processed frame buffer.
   * @returns A cleanup function that, when called, will remove the registered
   * callback.
   *
   * @example
   * const cleanup = manager.addOnFrameProcessCallback((frameResult, advanceToNextStep) => {
   *   console.log('Frame processed:', frameResult);
   *   if (shouldAdvance(frameResult)) {
   *     void advanceToNextStep();
   *   }
   * });
   *
   * // Later, to remove the callback:
   * cleanup();
   */
  addOnFrameProcessCallback(callback: BlinkIdFrameProcessCallback) {
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
   * Registers a callback function to receive BlinkID progress snapshots.
   *
   * @param callback - A function that will be called with progress data from
   * the internal 30 FPS RAF loop.
   * @returns A cleanup function that, when called, will remove the registered
   * callback.
   *
   * @example
   * const cleanup = manager.addOnProgressCallback((progress) => {
   *   console.log('BlinkID progress:', progress);
   * });
   *
   * // Later, to remove the callback:
   * cleanup();
   */
  addOnProgressCallback(callback: (progress: BlinkIdProgress) => void) {
    this.#onProgressCallbacks.add(callback);
    return () => {
      this.#onProgressCallbacks.delete(callback);
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
    for (const callback of this.#onFrameProcessCallbacks) {
      try {
        callback(
          {
            inputImageAnalysisResult: frameResult.inputImageAnalysisResult,
            resultCompleteness: frameResult.resultCompleteness,
          },
          () => this.#advanceToNextStep(),
          () => this.#handleScanTimeout("scan-step"),
          () => frameResult.arrayBuffer,
        );
      } catch (error) {
        console.error("Error in onFrameProcess callback", error);
      }
    }
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
   * Updates the BlinkID timeout configuration.
   *
   * Updating the configuration resets timeout tracking for the current scan
   * step so the new durations take effect immediately.
   */
  setTimeoutConfiguration(
    timeoutConfiguration: Partial<BlinkIdTimeoutConfiguration>,
  ) {
    this.#timeoutConfiguration = normalizeBlinkIdTimeoutConfiguration(
      {
        ...this.#timeoutConfiguration,
        ...timeoutConfiguration,
      },
      this.#isDesktop,
    );

    if (this.#isTimingActiveScanStep) {
      this.#resetScanTimeoutsForCurrentStep();
      return;
    }

    this.#clearScanTimeoutState();
  }

  #getScanTimerRemainingMs = (timerState: ScanTimerState) => {
    if (timerState.remainingMs === null) {
      return null;
    }

    if (timerState.startedAt === undefined) {
      return Math.max(timerState.remainingMs, 0);
    }

    return Math.max(
      timerState.remainingMs - (performance.now() - timerState.startedAt),
      0,
    );
  };

  #getProgressScanTimerRemainingMs = (timerState: ScanTimerState) => {
    const remainingMs = this.#getScanTimerRemainingMs(timerState);
    return remainingMs === null ? null : Math.ceil(remainingMs);
  };

  #isBarcodeScanStepUiState = (uiStateKey: BlinkIdUiStateKey) => {
    return uiStateKey === "PROCESSING_BARCODE";
  };

  #isBarcodePresenceMandatory = () => {
    return (
      this.sessionSettings.scanningSettings.barcodeModule?.presenceMandatory ===
      true
    );
  };

  #getScanTimerProgressStatus = (
    timerState: ScanTimerState,
    playbackState: "idle" | "playback" | "capturing",
    timeoutKind: ScanTimeoutKind,
  ): BlinkIdProgressTimerStatus => {
    if (timerState.remainingMs === null) {
      return "disabled";
    }

    if (!this.#isTimingActiveScanStep) {
      return "idle";
    }

    if (
      timeoutKind === "inactivity" &&
      this.#isBarcodeScanStepUiState(this.uiState.key)
    ) {
      return "paused";
    }

    if (
      playbackState === "capturing" &&
      timerState.timeoutId !== undefined &&
      timerState.startedAt !== undefined
    ) {
      return "running";
    }

    if (
      timeoutKind === "inactivity" &&
      timerState.timeoutId === undefined &&
      timerState.startedAt === undefined &&
      timerState.remainingMs === this.#timeoutConfiguration.inactivityTimeoutMs
    ) {
      return "idle";
    }

    return "paused";
  };

  #getPartiallySupportedBarcodeResolveTimerProgressStatus = (
    playbackState: "idle" | "playback" | "capturing",
  ): BlinkIdProgressTimerStatus => {
    if (
      this.#partiallySupportedBarcodeResolveTimeoutState.remainingMs === null
    ) {
      return "disabled";
    }

    if (
      !this.#partiallySupportedBarcodeResolveTimerStarted ||
      this.#partiallySupportedBarcodeResolveAttempted
    ) {
      return "idle";
    }

    if (
      playbackState === "capturing" &&
      this.#partiallySupportedBarcodeResolveTimeoutState.timeoutId !==
        undefined &&
      this.#partiallySupportedBarcodeResolveTimeoutState.startedAt !== undefined
    ) {
      return "running";
    }

    return "paused";
  };

  #pauseScanTimer = (timerState: ScanTimerState) => {
    if (
      timerState.remainingMs === null ||
      timerState.timeoutId === undefined ||
      timerState.startedAt === undefined
    ) {
      return;
    }

    timerState.remainingMs = this.#getScanTimerRemainingMs(timerState);
    this.#clearScanTimerHandle(timerState);
  };

  #clearScanTimerHandle = (timerState: ScanTimerState) => {
    if (timerState.timeoutId !== undefined) {
      window.clearTimeout(timerState.timeoutId);
      timerState.timeoutId = undefined;
    }

    timerState.startedAt = undefined;
  };

  #clearScanTimeoutState = () => {
    this.#clearScanTimerHandle(this.#inactivityTimeoutState);
    this.#clearScanTimerHandle(this.#scanStepTimeoutState);
    this.#clearScanTimerHandle(
      this.#partiallySupportedBarcodeResolveTimeoutState,
    );
    this.#inactivityTimeoutState.remainingMs =
      this.#timeoutConfiguration.inactivityTimeoutMs;
    this.#scanStepTimeoutState.remainingMs =
      this.#timeoutConfiguration.scanStepTimeoutMs;
    this.#partiallySupportedBarcodeResolveTimeoutState.remainingMs =
      this.#timeoutConfiguration.partiallySupportedBarcodeResolveTimeoutMs;
    this.#inactivityResetUiStateKey = undefined;
    this.#isTimingActiveScanStep = false;
    this.#partiallySupportedBarcodeResolveTimerStarted = false;
    this.#partiallySupportedBarcodeResolveAttempted = false;
  };

  #scheduleScanTimer = (
    timerState: ScanTimerState,
    timeoutKind: ScanTimeoutKind,
  ) => {
    if (timerState.timeoutId !== undefined) {
      return;
    }

    if (timerState.remainingMs === null) {
      return;
    }

    if (timerState.remainingMs <= 0) {
      this.#handleScanTimeout(timeoutKind);
      return;
    }

    timerState.startedAt = performance.now();
    timerState.timeoutId = window.setTimeout(() => {
      timerState.timeoutId = undefined;
      timerState.startedAt = undefined;
      timerState.remainingMs = 0;
      this.#handleScanTimeout(timeoutKind);
    }, timerState.remainingMs);
  };

  #schedulePartiallySupportedBarcodeResolveTimer = () => {
    const timerState = this.#partiallySupportedBarcodeResolveTimeoutState;

    if (
      !this.#partiallySupportedBarcodeResolveTimerStarted ||
      this.#partiallySupportedBarcodeResolveAttempted ||
      timerState.timeoutId !== undefined ||
      timerState.remainingMs === null
    ) {
      return;
    }

    if (timerState.remainingMs <= 0) {
      void this.#handlePartiallySupportedBarcodeResolveTimeout();
      return;
    }

    timerState.startedAt = performance.now();
    timerState.timeoutId = window.setTimeout(() => {
      timerState.timeoutId = undefined;
      timerState.startedAt = undefined;
      timerState.remainingMs = 0;
      void this.#handlePartiallySupportedBarcodeResolveTimeout();
    }, timerState.remainingMs);
  };

  #startPartiallySupportedBarcodeResolveTimer = () => {
    if (
      this.#partiallySupportedBarcodeResolveTimerStarted ||
      this.#partiallySupportedBarcodeResolveAttempted ||
      this.#timeoutConfiguration.partiallySupportedBarcodeResolveTimeoutMs ===
        null
    ) {
      return;
    }

    this.#partiallySupportedBarcodeResolveTimerStarted = true;
    this.#partiallySupportedBarcodeResolveTimeoutState.remainingMs =
      this.#timeoutConfiguration.partiallySupportedBarcodeResolveTimeoutMs;

    if (this.cameraManager.getState().playbackState === "capturing") {
      this.#schedulePartiallySupportedBarcodeResolveTimer();
    }
  };

  #clearPartiallySupportedBarcodeResolveTimer = () => {
    this.#clearScanTimerHandle(
      this.#partiallySupportedBarcodeResolveTimeoutState,
    );
    this.#partiallySupportedBarcodeResolveTimeoutState.remainingMs =
      this.#timeoutConfiguration.partiallySupportedBarcodeResolveTimeoutMs;
    this.#partiallySupportedBarcodeResolveTimerStarted = false;
    this.#partiallySupportedBarcodeResolveAttempted = false;
  };

  #handlePartiallySupportedBarcodeResolveTimeout = async () => {
    if (
      this.#processingLifecycleState === "terminal" ||
      this.#partiallySupportedBarcodeResolveAttempted
    ) {
      return;
    }

    this.#partiallySupportedBarcodeResolveAttempted = true;
    this.#partiallySupportedBarcodeResolveTimerStarted = false;
    this.#clearScanTimerHandle(
      this.#partiallySupportedBarcodeResolveTimeoutState,
    );
    this.#partiallySupportedBarcodeResolveTimeoutState.remainingMs = 0;

    void this.#analytics.logUnsupportedBarcodeTimeout();

    try {
      await this.#advanceToNextStep();
    } catch (error) {
      await this.#analytics.logErrorEvent({
        origin: "ux.partiallySupportedBarcodeResolve",
        error,
        errorType: "NonFatal",
      });
      await this.#analytics.sendPinglets();
    }
  };

  #resumeScanTimeouts = () => {
    if (
      !this.#isTimingActiveScanStep ||
      this.#processingLifecycleState === "terminal"
    ) {
      return;
    }

    if (this.#isBarcodeScanStepUiState(this.uiState.key)) {
      this.#suppressInactivityTimeoutForBarcodeScanStep();
    } else {
      this.#scheduleScanTimer(this.#inactivityTimeoutState, "inactivity");
    }
    this.#scheduleScanTimer(this.#scanStepTimeoutState, "scan-step");
    this.#schedulePartiallySupportedBarcodeResolveTimer();
  };

  #suppressInactivityTimeoutForBarcodeScanStep = () => {
    this.#clearScanTimerHandle(this.#inactivityTimeoutState);
    this.#inactivityTimeoutState.remainingMs =
      this.#timeoutConfiguration.inactivityTimeoutMs;
    this.#inactivityResetUiStateKey = "PROCESSING_BARCODE";
  };

  #resetTimeoutsForBarcodeScanStep = () => {
    this.#suppressInactivityTimeoutForBarcodeScanStep();
    this.#clearScanTimerHandle(this.#scanStepTimeoutState);
    this.#scanStepTimeoutState.remainingMs =
      this.#timeoutConfiguration.scanStepTimeoutMs;
    this.#isTimingActiveScanStep = true;

    if (this.cameraManager.getState().playbackState === "capturing") {
      this.#scheduleScanTimer(this.#scanStepTimeoutState, "scan-step");
    }
  };

  #resetScanTimeoutsForCurrentStep = (
    uiStateKey: BlinkIdUiStateKey = this.uiState.key,
  ) => {
    if (this.#isBarcodeScanStepUiState(uiStateKey)) {
      this.#resetTimeoutsForBarcodeScanStep();
      return;
    }

    this.#clearScanTimerHandle(this.#inactivityTimeoutState);
    this.#clearScanTimerHandle(this.#scanStepTimeoutState);
    this.#clearScanTimerHandle(
      this.#partiallySupportedBarcodeResolveTimeoutState,
    );
    this.#inactivityTimeoutState.remainingMs =
      this.#timeoutConfiguration.inactivityTimeoutMs;
    this.#scanStepTimeoutState.remainingMs =
      this.#timeoutConfiguration.scanStepTimeoutMs;
    this.#partiallySupportedBarcodeResolveTimeoutState.remainingMs =
      this.#timeoutConfiguration.partiallySupportedBarcodeResolveTimeoutMs;
    this.#inactivityResetUiStateKey = uiStateKey;
    this.#isTimingActiveScanStep = true;
    this.#partiallySupportedBarcodeResolveTimerStarted = false;
    this.#partiallySupportedBarcodeResolveAttempted = false;

    if (this.cameraManager.getState().playbackState === "capturing") {
      this.#resumeScanTimeouts();
    }
  };

  #restartInactivityTimeout = (
    uiStateKey: BlinkIdUiStateKey = this.uiState.key,
  ) => {
    if (!this.#isTimingActiveScanStep) {
      return;
    }

    if (this.#isBarcodeScanStepUiState(uiStateKey)) {
      this.#suppressInactivityTimeoutForBarcodeScanStep();
      return;
    }

    this.#inactivityResetUiStateKey = uiStateKey;
    this.#clearScanTimerHandle(this.#inactivityTimeoutState);
    this.#inactivityTimeoutState.remainingMs =
      this.#timeoutConfiguration.inactivityTimeoutMs;

    if (this.cameraManager.getState().playbackState === "capturing") {
      this.#scheduleScanTimer(this.#inactivityTimeoutState, "inactivity");
    }
  };

  #restartInactivityTimeoutForUiState = (uiStateKey: BlinkIdUiStateKey) => {
    if (!this.#isTimingActiveScanStep) {
      return;
    }

    if (this.#inactivityResetUiStateKey === uiStateKey) {
      return;
    }

    this.#restartInactivityTimeout(uiStateKey);
  };

  #handleScanTimeout = (timeoutKind: ScanTimeoutKind) => {
    if (this.#processingLifecycleState === "terminal") {
      return;
    }

    const processingTimeoutError: BlinkIdProcessingError = match<
      ScanTimeoutKind,
      BlinkIdProcessingError
    >(timeoutKind)
      .with("inactivity", () => {
        void this.#analytics.logInactivityTimeoutEvent();
        return "inactivity_timeout";
      })
      .with("scan-step", () => {
        void this.#analytics.logStepTimeoutEvent();
        return "scan_step_timeout";
      })
      .exhaustive();

    console.debug(`⏳🟢 ${timeoutKind} timeout triggered`);
    this.clearScanTimeout();
    this.cameraManager.stopFrameCapture();

    this.#invokeOnErrorCallbacks(processingTimeoutError);

    void this.#analytics.sendPinglets();

    void this.resetScanningSession(false);
  };

  #updatePartiallySupportedBarcodeResolveTimer = (
    scanningStatus: ScanningStatus,
    processResult: BlinkIdProcessResult,
  ) => {
    if (scanningStatus !== "scanning-barcode-in-progress") {
      if (this.#partiallySupportedBarcodeResolveTimerStarted) {
        this.#clearPartiallySupportedBarcodeResolveTimer();
      }
      return;
    }

    if (
      processResult.inputImageAnalysisResult.processingStatus !==
        "barcode-recognition-failed" ||
      processResult.resultCompleteness.barcode?.parsingSupported !== false ||
      this.#isBarcodePresenceMandatory()
    ) {
      return;
    }

    this.#startPartiallySupportedBarcodeResolveTimer();
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
    let returnedArrayBuffer: ArrayBuffer | undefined;

    try {
      const processResult = await this.scanningSession.process(imageData);
      returnedArrayBuffer = processResult.arrayBuffer;

      if (this.#isDestroyed) {
        return returnedArrayBuffer;
      }

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

      const scanningStatus = await this.scanningSession.getScanningStatus();

      const mappedUiStateKey = this.#getMappedUiStateKey(
        scanningStatus,
        processResult,
      );

      this.#updatePartiallySupportedBarcodeResolveTimer(
        scanningStatus,
        processResult,
      );

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
      this.#ingestMappedUiStateKey(mappedUiStateKey);

      return processResult.arrayBuffer;
    } catch (error) {
      if (this.#isDestroyed) {
        return returnedArrayBuffer;
      }
      await this.#analytics.logErrorEvent({
        origin: "ux.frameCapture",
        error,
        errorType: "NonFatal",
      });
      await this.#analytics.sendPinglets();
      throw error;
    } finally {
      if (this.#processingLifecycleState === "busy") {
        this.#processingLifecycleState = "ready";
      }
    }
  };

  handleCameraManagerError = (error: Error) => {
    void this.#analytics.logErrorEvent({
      origin: "cameraManager.error",
      error,
      errorType: "NonFatal",
    });
    void this.#analytics.sendPinglets();
  };

  #ingestMappedUiStateKey(mappedUiStateKey?: BlinkIdUiStateKey): void {
    if (!mappedUiStateKey) {
      return;
    }

    this.#mappedUiStateKey = mappedUiStateKey;
    this.feedbackStabilizer.ingest(mappedUiStateKey);
  }

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
      this.#clearPartiallySupportedBarcodeResolveTimer();
      this.cameraManager.stopFrameCapture();
      void this.#analytics.sendPinglets();
      if (mappedUiStateKey === "DOCUMENT_CAPTURED") {
        this.#processingLifecycleState = "terminal";
      }
    }
  };

  #getMappedUiStateKey = (
    scanningStatus: ScanningStatus,
    processResult: BlinkIdProcessResult,
  ) => {
    if (!this.sessionSettings) {
      return undefined;
    }

    return getUiStateKey(
      scanningStatus,
      processResult.inputImageAnalysisResult,
      this.sessionSettings.scanningSettings,
    );
  };

  async #advanceToNextStep(): Promise<void> {
    console.debug("⏭️ Advancing to next step");
    if (this.#processingLifecycleState === "terminal") {
      return;
    }

    const wasCapturing =
      this.cameraManager.getState().playbackState === "capturing";
    if (wasCapturing) {
      this.cameraManager.stopFrameCapture();
    }

    await this.scanningSession.resolveCurrentStep();

    if (this.#isDestroyed) {
      return;
    }

    const scanningStatus = await this.scanningSession.getScanningStatus();
    const mappedUiStateKey = getUiStateKeyFromScanningStatus(scanningStatus);

    const stepResolved =
      mappedUiStateKey !== undefined &&
      (blinkIdUiStepSuccessKeys as readonly BlinkIdUiStateKey[]).includes(
        mappedUiStateKey,
      );

    if (wasCapturing && stepResolved) {
      console.debug("🛑 stop processing", mappedUiStateKey);
      this.#clearPartiallySupportedBarcodeResolveTimer();
      void this.#analytics.sendPinglets();
      if (mappedUiStateKey === "DOCUMENT_CAPTURED") {
        this.#processingLifecycleState = "terminal";
      }
    } else {
      this.#handleProcessResultSideEffects(mappedUiStateKey);
    }

    this.#ingestMappedUiStateKey(mappedUiStateKey);

    if (
      wasCapturing &&
      (scanningStatus === "scanning-side-in-progress" ||
        scanningStatus === "scanning-barcode-in-progress")
    ) {
      await this.cameraManager.startFrameCapture();
    }
  }

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
   * Handles side effects triggered by a UI state transition: resumes frame
   * capture on intro states and orchestrates
   * result retrieval on DOCUMENT_CAPTURED.
   *
   * @param uiState - The UI state.
   */
  #handleUiStateUpdates = async (uiState: BlinkIdUiState) => {
    if (this.#isBarcodeScanStepUiState(uiState.key)) {
      this.#resetTimeoutsForBarcodeScanStep();
    } else if (uiState.key !== "DOCUMENT_CAPTURED") {
      this.#restartInactivityTimeoutForUiState(uiState.key);
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

        if (this.#isDestroyed) {
          return;
        }

        const result = await this.getSessionResult();

        this.#invokeOnResultCallbacks(result);
      } catch (err) {
        console.error(
          "Failed to retrieve scan result after document capture:",
          err,
        );
        this.#invokeOnErrorCallbacks("result_retrieval_failed");
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
    this.#isDestroyed = false;
    this.#processingLifecycleState = "ready";
    this.#pendingIntroAnchorKey = uiStateKey;
    this.#firstProcessedFrameAt = undefined;
    this.#invokeOnUiStateChangedCallbacks(this.uiState);
  };

  /**
   * Clears the scanning session timeout.
   */
  clearScanTimeout() {
    this.#clearScanTimeoutState();
  }

  /**
   * Gets the result from the scanning session.
   *
   * @returns The result.
   */
  async getSessionResult(): Promise<BlinkIdScanningResult> {
    try {
      return await this.scanningSession.getResult();
    } catch (error) {
      await this.#analytics.logErrorEvent({
        origin: "ux.getSessionResult",
        error,
        errorType: "NonFatal",
      });
      await this.#analytics.sendPinglets();
      throw error;
    }
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
    this.#onProgressCallbacks.clear();
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
    this.#isDestroyed = true;
    this.#processingLifecycleState = "terminal";
    this.clearScanTimeout();
    this.cleanupAllObservers();
    this.clearUserCallbacks();
    this.#documentClassFilter = undefined;
  }
}
