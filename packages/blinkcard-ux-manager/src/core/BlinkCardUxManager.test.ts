/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { beforeEach, describe, expect, test, vi, afterEach } from "vitest";
import type {
  BlinkCardScanningResult,
  BlinkCardSessionSettings,
  ProcessResultWithBuffer,
  RemoteScanningSession,
  ScanningSettings,
} from "@microblink/blinkcard-core";
import type {
  CameraManager,
  FrameCaptureCallback,
  PlaybackState,
} from "@microblink/camera-manager";
import { BlinkCardUxManager } from "./BlinkCardUxManager";
import { blinkCardUiStateMap } from "./blinkcard-ui-state";
import { blankProcessResult } from "./__testdata/blankProcessResult";
import { merge } from "merge-anything";
import type { DeviceInfo } from "@microblink/blinkcard-core";

type AnalyticServiceMock = {
  logDeviceInfo: ReturnType<typeof vi.fn>;
  logDeviceOrientation: ReturnType<typeof vi.fn>;
  logCameraStartedEvent: ReturnType<typeof vi.fn>;
  logCameraClosedEvent: ReturnType<typeof vi.fn>;
  logCameraInputInfo: ReturnType<typeof vi.fn>;
  sendPinglets: ReturnType<typeof vi.fn>;
  logErrorMessageEvent: ReturnType<typeof vi.fn>;
  logStepTimeoutEvent: ReturnType<typeof vi.fn>;
  logFlashlightState: ReturnType<typeof vi.fn>;
  logHelpOpenedEvent: ReturnType<typeof vi.fn>;
  logHelpClosedEvent: ReturnType<typeof vi.fn>;
  logHelpTooltipDisplayedEvent: ReturnType<typeof vi.fn>;
  logCloseButtonClickedEvent: ReturnType<typeof vi.fn>;
  logAlertDisplayedEvent: ReturnType<typeof vi.fn>;
  logOnboardingDisplayedEvent: ReturnType<typeof vi.fn>;
};

type PartialProcessResult = Partial<
  Omit<
    ProcessResultWithBuffer,
    "inputImageAnalysisResult" | "resultCompleteness"
  >
> & {
  inputImageAnalysisResult?: Partial<
    ProcessResultWithBuffer["inputImageAnalysisResult"]
  >;
  resultCompleteness?: Partial<ProcessResultWithBuffer["resultCompleteness"]>;
};

const analyticsInstances: AnalyticServiceMock[] = [];
const screenOrientationMock = {
  type: "portrait-primary",
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
} as unknown as ScreenOrientation;

vi.mock("@microblink/analytics/AnalyticService", () => ({
  AnalyticService: vi.fn().mockImplementation(() => {
    const instance: AnalyticServiceMock = {
      logDeviceInfo: vi.fn(),
      logDeviceOrientation: vi.fn(),
      logCameraStartedEvent: vi.fn(),
      logCameraClosedEvent: vi.fn(),
      logCameraInputInfo: vi.fn(),
      sendPinglets: vi.fn(),
      logErrorMessageEvent: vi.fn(),
      logStepTimeoutEvent: vi.fn(),
      logFlashlightState: vi.fn(),
      logHelpOpenedEvent: vi.fn(),
      logHelpClosedEvent: vi.fn(),
      logHelpTooltipDisplayedEvent: vi.fn(),
      logCloseButtonClickedEvent: vi.fn(),
      logAlertDisplayedEvent: vi.fn(),
      logOnboardingDisplayedEvent: vi.fn(),
    };
    analyticsInstances.push(instance);
    return instance;
  }),
}));

const createDeviceInfo = (): DeviceInfo =>
  ({
    userAgent: "test-agent",
    threads: 4,
    screen: {
      screenWidth: 800,
      screenHeight: 600,
      devicePixelRatio: 2,
      physicalScreenWidth: 1600,
      physicalScreenHeight: 1200,
      maxTouchPoints: 0,
    },
    browserStorageSupport: {
      cookieEnabled: true,
      localStorageEnabled: true,
    },
    derivedDeviceInfo: {
      model: "test",
      formFactors: [],
      platform: "",
      browser: {
        brand: "test",
        version: "1",
      },
    },
  }) as DeviceInfo;

const defaultScanningSettings: ScanningSettings = {
  skipImagesWithBlur: true,
  tiltDetectionLevel: "off",
  inputImageMargin: 0.02,
  extractionSettings: {
    extractIban: true,
    extractExpiryDate: true,
    extractCardholderName: true,
    extractCvv: true,
    extractInvalidCardNumber: false,
  },
  croppedImageSettings: {
    dotsPerInch: 300,
    extensionFactor: 0,
    returnCardImage: false,
  },
  livenessSettings: {
    handToCardSizeRatio: 0,
    handCardOverlapThreshold: 0,
    enableCardHeldInHandCheck: false,
    screenCheckStrictnessLevel: "disabled",
    photocopyCheckStrictnessLevel: "disabled",
  },
  anonymizationSettings: {
    cardNumberAnonymizationSettings: {
      mode: "none",
      prefixDigitsVisible: 0,
      suffixDigitsVisible: 0,
    },
    cardNumberPrefixAnonymizationMode: "none",
    cvvAnonymizationMode: "none",
    ibanAnonymizationMode: "none",
    cardholderNameAnonymizationMode: "none",
  },
};

const createScanningSettings = (
  overrides: Partial<ScanningSettings> = {},
): ScanningSettings => {
  return merge(defaultScanningSettings, overrides);
};

const createProcessResult = (
  overrides: PartialProcessResult = {},
): ProcessResultWithBuffer => {
  return merge(
    blankProcessResult,
    {
      arrayBuffer: new ArrayBuffer(0),
    },
    overrides,
  ) as ProcessResultWithBuffer;
};

const createSessionSettings = (
  overrides: Partial<ScanningSettings> = {},
): BlinkCardSessionSettings => ({
  inputImageSource: "video",
  scanningSettings: createScanningSettings(overrides),
});

const createScanningResult = (
  overrides: Partial<BlinkCardScanningResult> = {},
): BlinkCardScanningResult => ({
  issuingNetwork: "test-network",
  cardAccounts: [
    {
      cardNumber: "4111111111111111",
      cardNumberValid: true,
      cardNumberPrefix: undefined,
      cvv: undefined,
      expiryDate: {
        day: undefined,
        month: undefined,
        year: 2030,
        originalString: undefined,
        filledByDomainKnowledge: undefined,
        successfullyParsed: undefined,
      },
      fundingType: undefined,
      cardCategory: undefined,
      issuerName: undefined,
      issuerCountryCode: undefined,
      issuerCountry: undefined,
    },
  ],
  iban: undefined,
  cardholderName: undefined,
  overallCardLivenessResult: "not-available",
  firstSideResult: undefined,
  secondSideResult: undefined,
  ...overrides,
});

const createTestImageData = (): ImageData =>
  ({
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1,
    colorSpace: "srgb",
  }) as ImageData;

type CameraInputState = {
  selectedCamera?: {
    name: string;
    facingMode?: "front" | "back";
  };
  videoResolution?: {
    width: number;
    height: number;
  };
  extractionArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

const createCameraManager = () => {
  let playbackCallback:
    | ((state: PlaybackState, previousState?: PlaybackState) => void)
    | undefined;
  let selectedCameraCallback: (() => void) | undefined;
  let videoResolutionCallback: (() => void) | undefined;
  let extractionAreaCallback: (() => void) | undefined;
  let frameCaptureCallback: FrameCaptureCallback | undefined;
  let subscribeCalls = 0;
  let isActive = true;
  const state: CameraInputState = {
    selectedCamera: {
      name: "default-camera",
      facingMode: "back",
    },
    videoResolution: {
      width: 1920,
      height: 1080,
    },
  };

  const addFrameCaptureCallback = vi.fn((callback: FrameCaptureCallback) => {
    frameCaptureCallback = callback;
    return vi.fn();
  });

  const stopFrameCapture = vi.fn();
  const startFrameCapture = vi.fn().mockResolvedValue(undefined);
  const startCameraStream = vi.fn().mockResolvedValue(undefined);

  const subscribe = vi.fn((selectorOrListener: unknown, listener?: unknown) => {
    subscribeCalls += 1;
    const callback =
      typeof listener === "function" ? listener : selectorOrListener;
    if (subscribeCalls === 1) {
      playbackCallback = callback as (
        state: PlaybackState,
        previousState?: PlaybackState,
      ) => void;
    }
    if (subscribeCalls === 3) {
      selectedCameraCallback = callback as () => void;
    }
    if (subscribeCalls === 4) {
      videoResolutionCallback = callback as () => void;
    }
    if (subscribeCalls === 5) {
      extractionAreaCallback = callback as () => void;
    }
    return vi.fn();
  }) as unknown as CameraManager["subscribe"];

  const cameraManager = {
    addFrameCaptureCallback,
    subscribe,
    stopFrameCapture,
    startFrameCapture,
    startCameraStream,
    getState: vi.fn(() => state),
    get isActive() {
      return isActive;
    },
  } as unknown as CameraManager;

  return {
    cameraManager,
    getPlaybackCallback: () => playbackCallback!,
    getFrameCaptureCallback: () => frameCaptureCallback!,
    setIsActive: (value: boolean) => {
      isActive = value;
    },
    setCameraState: (nextState: Partial<CameraInputState>) => {
      Object.assign(state, nextState);
    },
    triggerSelectedCameraChange: () => selectedCameraCallback?.(),
    triggerVideoResolutionChange: () => videoResolutionCallback?.(),
    triggerExtractionAreaChange: () => extractionAreaCallback?.(),
    stopFrameCapture,
    startFrameCapture,
    startCameraStream,
  };
};

const createScanningSession = () =>
  ({
    process: vi.fn(),
    getSettings: vi.fn().mockResolvedValue(createSessionSettings()),
    showDemoOverlay: vi.fn().mockResolvedValue(false),
    showProductionOverlay: vi.fn().mockResolvedValue(true),
    getResult: vi.fn(),
    reset: vi.fn().mockResolvedValue(undefined),
    ping: vi.fn(),
    sendPinglets: vi.fn(),
  }) as unknown as RemoteScanningSession;

const getAnalytics = () => analyticsInstances[analyticsInstances.length - 1];

describe("BlinkCardUxManager", () => {
  beforeEach(() => {
    if (!("orientation" in screen) || !screen.orientation) {
      Object.defineProperty(screen, "orientation", {
        configurable: true,
        value: screenOrientationMock,
      });
    }

    analyticsInstances.length = 0;
    vi.clearAllMocks();
  });

  describe("constructor and analytics", () => {
    test("logs device info and playback events", () => {
      const { cameraManager, getPlaybackCallback } = createCameraManager();
      const session = createScanningSession();
      const deviceInfo = createDeviceInfo();
      const manager = new BlinkCardUxManager(
        cameraManager,
        session,
        createSessionSettings(),
        false,
        true,
        deviceInfo,
      );

      expect(manager.getShowDemoOverlay()).toBe(false);
      expect(manager.getShowProductionOverlay()).toBe(true);

      const analytics = getAnalytics();
      expect(analytics.logDeviceInfo).toHaveBeenCalledWith(deviceInfo);

      const playbackCallback = getPlaybackCallback();
      playbackCallback("capturing", "idle");
      expect(analytics.logCameraStartedEvent).toHaveBeenCalledTimes(1);
      expect(analytics.sendPinglets).toHaveBeenCalled();

      playbackCallback("idle", "capturing");
      expect(analytics.logCameraClosedEvent).toHaveBeenCalledTimes(1);
    });
  });

  describe("camera input analytics", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test("coalesces orientation-like updates into one camera input ping", async () => {
      const {
        cameraManager,
        setCameraState,
        triggerVideoResolutionChange,
        triggerExtractionAreaChange,
      } = createCameraManager();
      const session = createScanningSession();
      new BlinkCardUxManager(
        cameraManager,
        session,
        createSessionSettings(),
        false,
        false,
        createDeviceInfo(),
      );

      const analytics = getAnalytics();

      setCameraState({
        videoResolution: {
          width: 1080,
          height: 1920,
        },
        extractionArea: {
          x: 0,
          y: 0,
          width: 1080,
          height: 1920,
        },
      });
      triggerVideoResolutionChange();

      setCameraState({
        videoResolution: {
          width: 1920,
          height: 1080,
        },
      });
      triggerVideoResolutionChange();

      setCameraState({
        videoResolution: {
          width: 1080,
          height: 1920,
        },
        extractionArea: {
          x: 0,
          y: 5,
          width: 1080,
          height: 1910,
        },
      });
      triggerExtractionAreaChange();

      expect(analytics.logCameraInputInfo).not.toHaveBeenCalled();

      await vi.runOnlyPendingTimersAsync();

      expect(analytics.logCameraInputInfo).toHaveBeenCalledTimes(1);
      expect(analytics.logCameraInputInfo).toHaveBeenCalledWith({
        deviceId: "default-camera",
        cameraFacing: "Back",
        cameraFrameWidth: 1080,
        cameraFrameHeight: 1920,
        roiWidth: 1080,
        roiHeight: 1910,
        viewPortAspectRatio: 1080 / 1910,
      });
    });

    test("sends immediate + debounced pings for separated updates", async () => {
      const {
        cameraManager,
        setCameraState,
        triggerSelectedCameraChange,
        triggerExtractionAreaChange,
      } = createCameraManager();
      const session = createScanningSession();
      new BlinkCardUxManager(
        cameraManager,
        session,
        createSessionSettings(),
        false,
        false,
        createDeviceInfo(),
      );

      const analytics = getAnalytics();

      triggerSelectedCameraChange();
      expect(analytics.logCameraInputInfo).toHaveBeenCalledTimes(1);

      setCameraState({
        extractionArea: {
          x: 0,
          y: 5,
          width: 1080,
          height: 1910,
        },
      });
      triggerExtractionAreaChange();

      expect(analytics.logCameraInputInfo).toHaveBeenCalledTimes(1);
      await vi.runOnlyPendingTimersAsync();
      expect(analytics.logCameraInputInfo).toHaveBeenCalledTimes(2);
    });

    test("does not send delayed camera input ping after reset", async () => {
      const { cameraManager, triggerVideoResolutionChange } =
        createCameraManager();
      const session = createScanningSession();
      const manager = new BlinkCardUxManager(
        cameraManager,
        session,
        createSessionSettings(),
        false,
        false,
        createDeviceInfo(),
      );

      const analytics = getAnalytics();

      triggerVideoResolutionChange();
      manager.reset();
      await vi.runOnlyPendingTimersAsync();

      expect(analytics.logCameraInputInfo).not.toHaveBeenCalled();
    });

    test("does not send delayed camera input ping after observer cleanup", async () => {
      const { cameraManager, triggerVideoResolutionChange } =
        createCameraManager();
      const session = createScanningSession();
      const manager = new BlinkCardUxManager(
        cameraManager,
        session,
        createSessionSettings(),
        false,
        false,
        createDeviceInfo(),
      );

      const analytics = getAnalytics();

      triggerVideoResolutionChange();
      manager.cleanupAllObservers();
      await vi.runOnlyPendingTimersAsync();

      expect(analytics.logCameraInputInfo).not.toHaveBeenCalled();
    });
  });

  describe("callbacks and public API", () => {
    test("registers and cleans up UI state callbacks", async () => {
      const { cameraManager, getFrameCaptureCallback } = createCameraManager();
      const session = createScanningSession();
      const manager = new BlinkCardUxManager(
        cameraManager,
        session,
        createSessionSettings(),
        false,
        false,
        createDeviceInfo(),
      );

      const uiStateSpy = vi.fn();
      const cleanup = manager.addOnUiStateChangedCallback(uiStateSpy);

      const feedbackSpy = vi
        .spyOn(manager.feedbackStabilizer, "getNewUiState")
        .mockReturnValueOnce(blinkCardUiStateMap.BLUR_DETECTED)
        .mockReturnValueOnce(blinkCardUiStateMap.SENSING_FRONT);

      const processResult = createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "image-preprocessing-failed",
          blurDetectionStatus: "detected",
        },
      });
      vi.mocked(session.process).mockResolvedValue(processResult);

      const frameCaptureCallback = getFrameCaptureCallback();
      await frameCaptureCallback(createTestImageData());
      expect(uiStateSpy).toHaveBeenCalledTimes(1);

      cleanup();
      await frameCaptureCallback(createTestImageData());

      expect(uiStateSpy).toHaveBeenCalledTimes(1);
      feedbackSpy.mockRestore();
    });

    test("forwards help/alert analytics events", () => {
      const { cameraManager } = createCameraManager();
      const session = createScanningSession();
      const manager = new BlinkCardUxManager(
        cameraManager,
        session,
        createSessionSettings(),
        false,
        false,
        createDeviceInfo(),
      );

      const analytics = getAnalytics();

      manager.logHelpOpened();
      manager.logHelpClosed(true);
      manager.logHelpTooltipDisplayed();
      manager.logCloseButtonClicked();
      manager.logAlertDisplayed("NetworkError");
      manager.logOnboardingDisplayed();

      expect(analytics.logHelpOpenedEvent).toHaveBeenCalledTimes(1);
      expect(analytics.logHelpClosedEvent).toHaveBeenCalledWith(true);
      expect(analytics.logHelpTooltipDisplayedEvent).toHaveBeenCalledTimes(1);
      expect(analytics.logCloseButtonClickedEvent).toHaveBeenCalledTimes(1);
      expect(analytics.logAlertDisplayedEvent).toHaveBeenCalledWith(
        "NetworkError",
      );
      expect(analytics.logOnboardingDisplayedEvent).toHaveBeenCalledTimes(1);
    });
  });

  describe("timeouts", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test("triggers timeout on capturing and clears on idle", () => {
      const { cameraManager, getPlaybackCallback, stopFrameCapture } =
        createCameraManager();
      const session = createScanningSession();
      const manager = new BlinkCardUxManager(
        cameraManager,
        session,
        createSessionSettings(),
        false,
        false,
        createDeviceInfo(),
      );

      const errorSpy = vi.fn();
      manager.addOnErrorCallback(errorSpy);
      manager.setTimeoutDuration(1000);

      const playbackCallback = getPlaybackCallback();
      playbackCallback("capturing", "idle");
      vi.advanceTimersByTime(1000);

      expect(errorSpy).toHaveBeenCalledWith("timeout");
      expect(stopFrameCapture).toHaveBeenCalled();
      expect(getAnalytics().logStepTimeoutEvent).toHaveBeenCalled();

      errorSpy.mockClear();
      playbackCallback("capturing", "idle");
      playbackCallback("idle", "capturing");
      vi.advanceTimersByTime(1000);
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe("session reset", () => {
    test("starts camera stream when inactive", async () => {
      const {
        cameraManager,
        setIsActive,
        startCameraStream,
        startFrameCapture,
      } = createCameraManager();
      setIsActive(false);
      const session = createScanningSession();
      const manager = new BlinkCardUxManager(
        cameraManager,
        session,
        createSessionSettings(),
        false,
        false,
        createDeviceInfo(),
      );

      await manager.resetScanningSession(true);

      expect(startCameraStream).toHaveBeenCalledTimes(1);
      expect(startFrameCapture).toHaveBeenCalledTimes(1);
    });

    test("skips frame capture when startFrameCapture is false", async () => {
      const { cameraManager, startFrameCapture } = createCameraManager();
      const session = createScanningSession();
      const manager = new BlinkCardUxManager(
        cameraManager,
        session,
        createSessionSettings(),
        false,
        false,
        createDeviceInfo(),
      );

      await manager.resetScanningSession(false);
      expect(startFrameCapture).not.toHaveBeenCalled();
    });
  });

  describe("state-driven flows", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test("FLIP_CARD pauses capture then resumes after animation", async () => {
      const {
        cameraManager,
        getFrameCaptureCallback,
        stopFrameCapture,
        startFrameCapture,
      } = createCameraManager();
      const session = createScanningSession();
      const manager = new BlinkCardUxManager(
        cameraManager,
        session,
        createSessionSettings(),
        false,
        false,
        createDeviceInfo(),
      );

      const feedbackSpy = vi
        .spyOn(manager.feedbackStabilizer, "getNewUiState")
        .mockReturnValue(blinkCardUiStateMap.FLIP_CARD);

      const processResult = createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "awaiting-other-side",
        },
      });
      vi.mocked(session.process).mockResolvedValue(processResult);

      const frameCaptureCallback = getFrameCaptureCallback();
      await frameCaptureCallback(createTestImageData());

      expect(stopFrameCapture).toHaveBeenCalledTimes(1);
      expect(startFrameCapture).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(
        blinkCardUiStateMap.FLIP_CARD.minDuration +
          blinkCardUiStateMap.CARD_CAPTURED.minDuration,
      );

      expect(startFrameCapture).toHaveBeenCalledTimes(1);
      feedbackSpy.mockRestore();
    });

    test("CARD_CAPTURED stops capture and emits result after animation", async () => {
      const { cameraManager, getFrameCaptureCallback, stopFrameCapture } =
        createCameraManager();
      const session = createScanningSession();
      const manager = new BlinkCardUxManager(
        cameraManager,
        session,
        createSessionSettings(),
        false,
        false,
        createDeviceInfo(),
      );

      const resultCallback = vi.fn();
      manager.addOnResultCallback(resultCallback);

      const feedbackSpy = vi
        .spyOn(manager.feedbackStabilizer, "getNewUiState")
        .mockReturnValue(blinkCardUiStateMap.CARD_CAPTURED);

      const processResult = createProcessResult({
        resultCompleteness: { scanningStatus: "card-scanned" },
      });
      const scanResult = createScanningResult();

      vi.mocked(session.process).mockResolvedValue(processResult);
      vi.mocked(session.getResult).mockResolvedValue(scanResult);

      const frameCaptureCallback = getFrameCaptureCallback();
      await frameCaptureCallback(createTestImageData());

      expect(stopFrameCapture).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(
        blinkCardUiStateMap.CARD_CAPTURED.minDuration,
      );

      expect(resultCallback).toHaveBeenCalledWith(scanResult);
      feedbackSpy.mockRestore();
    });

    test("logs error message events and triggers haptics for error states", async () => {
      const { cameraManager, getFrameCaptureCallback } = createCameraManager();
      const session = createScanningSession();
      const manager = new BlinkCardUxManager(
        cameraManager,
        session,
        createSessionSettings(),
        false,
        false,
        createDeviceInfo(),
      );

      const hapticManager = manager.getHapticFeedbackManager();
      const shortSpy = vi.spyOn(hapticManager, "triggerShort");

      const feedbackSpy = vi
        .spyOn(manager.feedbackStabilizer, "getNewUiState")
        .mockReturnValue(blinkCardUiStateMap.BLUR_DETECTED);

      const processResult = createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "image-preprocessing-failed",
          blurDetectionStatus: "detected",
        },
      });

      vi.mocked(session.process).mockResolvedValue(processResult);

      const frameCaptureCallback = getFrameCaptureCallback();
      await frameCaptureCallback(createTestImageData());

      expect(getAnalytics().logErrorMessageEvent).toHaveBeenCalledWith(
        "EliminateBlur",
      );
      expect(shortSpy).toHaveBeenCalled();

      feedbackSpy.mockRestore();
      shortSpy.mockRestore();
    });
  });
});
