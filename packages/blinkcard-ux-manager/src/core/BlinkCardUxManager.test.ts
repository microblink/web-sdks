/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// Mock the sleep utility to resolve immediately, preventing tests from hanging
// when code awaits sleep() with fake timers enabled.
const mockSleep = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock("@microblink/ux-common/utils", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@microblink/ux-common/utils")>();
  return { ...actual, sleep: mockSleep };
});

import type {
  ProcessResultWithBuffer,
  BlinkCardSessionSettings,
  DeviceInfo,
} from "@microblink/blinkcard-core";
import type { CameraManager } from "@microblink/camera-manager";
import {
  createMockImageData,
  enableRafAwareFakeTimers,
  flushUiRaf,
  setupDestroyableTeardown,
  tickRaf,
} from "@microblink/test-utils";
import { blinkCardUiStateMap } from "./blinkcard-ui-state";
import { BlinkCardUxManager } from "./BlinkCardUxManager";
import {
  createBlinkCardCameraHarness,
  createBlinkCardManager,
  createBlinkCardUnitSessionMock,
  type BlinkCardSessionMock,
} from "./test-helpers.integration";
import {
  createDeviceInfo,
  createProcessResult,
  createScanningResult,
} from "./__testdata/blinkcardTestFixtures";

/**
 * Test file role:
 * - Verifies BlinkCardUxManager callback/lifecycle contracts.
 * - Uses a small stabilizer seam helper when tests need to assert behavior
 *   after a chosen UI state is applied.
 * - Does not own processResult -> ui-state mapping coverage (see ui-state tests),
 *   and does not own end-to-end scan flow coverage (see integration tests).
 */

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

type CreateManagerOptions = {
  sessionSettings?: BlinkCardSessionSettings;
  showDemoOverlay?: boolean;
  showProductionOverlay?: boolean;
  deviceInfo?: DeviceInfo;
};

const trackManager = setupDestroyableTeardown<BlinkCardUxManager>();

/**
 * Unit-test seam: some tests in this file validate callback wiring once a state
 * is selected, not state-selection itself (covered by ui-state + integration tests).
 * We intentionally inject a stabilizer state and flush RAF to apply it.
 */
const applyStabilizedUiStateForContractTest = async (
  manager: BlinkCardUxManager,
  uiStateKey: keyof typeof blinkCardUiStateMap,
) => {
  manager.feedbackStabilizer.reset(uiStateKey);
  await flushUiRaf();
};

const createBlinkCardUxManager = (
  cameraManager: CameraManager,
  scanningSession: BlinkCardSessionMock,
  options: CreateManagerOptions = {},
) =>
  trackManager(createBlinkCardManager(cameraManager, scanningSession, options));

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

  describe("construction and configuration", () => {
    test("logs device info and playback events", () => {
      const { cameraManager, emitPlaybackState } =
        createBlinkCardCameraHarness();
      const session = createBlinkCardUnitSessionMock();
      const deviceInfo = createDeviceInfo();
      const manager = createBlinkCardUxManager(cameraManager, session, {
        showProductionOverlay: true,
        deviceInfo,
      });

      expect(manager.getShowDemoOverlay()).toBe(false);
      expect(manager.getShowProductionOverlay()).toBe(true);

      const analytics = getAnalytics();
      expect(analytics.logDeviceInfo).toHaveBeenCalledWith(deviceInfo);

      emitPlaybackState("capturing");
      expect(analytics.logCameraStartedEvent).toHaveBeenCalledTimes(1);
      expect(analytics.sendPinglets).toHaveBeenCalled();

      emitPlaybackState("idle");
      expect(analytics.logCameraClosedEvent).toHaveBeenCalledTimes(1);
    });
  });

  describe("package-specific: camera input analytics", () => {
    beforeEach(() => {
      enableRafAwareFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test("coalesces orientation-like updates into one camera input ping", async () => {
      const { cameraManager, emitCameraState } = createBlinkCardCameraHarness();
      const session = createBlinkCardUnitSessionMock();
      createBlinkCardUxManager(cameraManager, session);

      const analytics = getAnalytics();

      emitCameraState({
        videoResolution: { width: 1080, height: 1920 },
        extractionArea: { x: 0, y: 0, width: 1080, height: 1920 },
      });

      emitCameraState({ videoResolution: { width: 1920, height: 1080 } });

      emitCameraState({
        videoResolution: { width: 1080, height: 1920 },
        extractionArea: { x: 0, y: 5, width: 1080, height: 1910 },
      });

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
      const { cameraManager, emitCameraState } = createBlinkCardCameraHarness();
      const session = createBlinkCardUnitSessionMock();
      createBlinkCardUxManager(cameraManager, session);

      const analytics = getAnalytics();

      emitCameraState({
        selectedCamera: { name: "default-camera", facingMode: "back" },
      });
      expect(analytics.logCameraInputInfo).toHaveBeenCalledTimes(1);

      emitCameraState({
        extractionArea: { x: 0, y: 5, width: 1080, height: 1910 },
      });
      expect(analytics.logCameraInputInfo).toHaveBeenCalledTimes(1);

      await vi.runOnlyPendingTimersAsync();
      expect(analytics.logCameraInputInfo).toHaveBeenCalledTimes(2);
    });

    test("does not send delayed camera input ping after reset", async () => {
      const { cameraManager, emitCameraState } = createBlinkCardCameraHarness();
      const session = createBlinkCardUnitSessionMock();
      const manager = createBlinkCardUxManager(cameraManager, session);

      emitCameraState({ videoResolution: { width: 1000, height: 500 } });
      manager.reset();
      await vi.runOnlyPendingTimersAsync();

      expect(getAnalytics().logCameraInputInfo).not.toHaveBeenCalled();
    });

    test("does not send delayed camera input ping after observer cleanup", async () => {
      const { cameraManager, emitCameraState } = createBlinkCardCameraHarness();
      const session = createBlinkCardUnitSessionMock();
      const manager = createBlinkCardUxManager(cameraManager, session);

      emitCameraState({ videoResolution: { width: 1000, height: 500 } });
      manager.cleanupAllObservers();
      await vi.runOnlyPendingTimersAsync();

      expect(getAnalytics().logCameraInputInfo).not.toHaveBeenCalled();
    });
  });

  describe("callbacks and public API", () => {
    beforeEach(() => {
      enableRafAwareFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test("registers and cleans up UI state callbacks via RAF loop", async () => {
      const { cameraManager } = createBlinkCardCameraHarness();
      const session = createBlinkCardUnitSessionMock();
      const manager = createBlinkCardUxManager(cameraManager, session);

      const uiStateSpy = vi.fn();
      const cleanup = manager.addOnUiStateChangedCallback(uiStateSpy);

      // Inject a deterministic UI state into the stabilizer to assert RAF callback wiring.
      await applyStabilizedUiStateForContractTest(manager, "BLUR_DETECTED");

      expect(uiStateSpy).toHaveBeenCalledWith(
        blinkCardUiStateMap.BLUR_DETECTED,
      );
      expect(uiStateSpy).toHaveBeenCalledTimes(1);

      cleanup();

      // Inject another UI state; cleanup should prevent further callback notifications.
      await applyStabilizedUiStateForContractTest(
        manager,
        "CARD_NOT_IN_FRAME_FRONT",
      );

      expect(uiStateSpy).toHaveBeenCalledTimes(1);
    });

    test("forwards help/alert analytics events", () => {
      const { cameraManager } = createBlinkCardCameraHarness();
      const session = createBlinkCardUnitSessionMock();
      const manager = createBlinkCardUxManager(cameraManager, session);

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

    test("reset() clears all callbacks", async () => {
      const { cameraManager, emitFrame } = createBlinkCardCameraHarness();
      const session = createBlinkCardUnitSessionMock();
      const manager = createBlinkCardUxManager(cameraManager, session);

      const uiStateSpy = vi.fn();
      const resultSpy = vi.fn();
      const frameProcessSpy = vi.fn();
      const errorSpy = vi.fn();

      manager.addOnUiStateChangedCallback(uiStateSpy);
      manager.addOnResultCallback(resultSpy);
      manager.addOnFrameProcessCallback(frameProcessSpy);
      manager.addOnErrorCallback(errorSpy);

      manager.reset();

      vi.mocked(session.process).mockResolvedValue(
        createProcessResult({
          inputImageAnalysisResult: {
            processingStatus: "awaiting-other-side",
          },
        }),
      );

      await emitFrame(createMockImageData());
      await flushUiRaf();

      expect(uiStateSpy).not.toHaveBeenCalled();
      expect(resultSpy).not.toHaveBeenCalled();
      expect(frameProcessSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe("timeout behavior", () => {
    beforeEach(() => {
      enableRafAwareFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test("triggers timeout on capturing and clears on idle", async () => {
      const { cameraManager, emitPlaybackState, stopFrameCapture } =
        createBlinkCardCameraHarness();
      const session = createBlinkCardUnitSessionMock();
      const manager = createBlinkCardUxManager(cameraManager, session);

      const errorSpy = vi.fn();
      manager.addOnErrorCallback(errorSpy);
      manager.setTimeoutDuration(1000);

      emitPlaybackState("capturing");
      await vi.advanceTimersByTimeAsync(1000);

      expect(errorSpy).toHaveBeenCalledWith("timeout");
      expect(stopFrameCapture).toHaveBeenCalled();
      expect(getAnalytics().logStepTimeoutEvent).toHaveBeenCalled();

      errorSpy.mockClear();
      emitPlaybackState("capturing");
      emitPlaybackState("idle");
      await vi.advanceTimersByTimeAsync(1000);
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe("session lifecycle: reset behavior", () => {
    test("starts camera stream when inactive", async () => {
      const {
        cameraManager,
        setIsActive,
        startCameraStream,
        startFrameCapture,
      } = createBlinkCardCameraHarness();
      setIsActive(false);
      const session = createBlinkCardUnitSessionMock();
      const manager = createBlinkCardUxManager(cameraManager, session);

      await manager.resetScanningSession(true);

      expect(startCameraStream).toHaveBeenCalledTimes(1);
      expect(startFrameCapture).toHaveBeenCalledTimes(1);
    });

    test("skips frame capture when startFrameCapture is false", async () => {
      const { cameraManager, startFrameCapture } =
        createBlinkCardCameraHarness();
      const session = createBlinkCardUnitSessionMock();
      const manager = createBlinkCardUxManager(cameraManager, session);

      await manager.resetScanningSession(false);
      expect(startFrameCapture).not.toHaveBeenCalled();
    });
  });

  describe("state transitions and capture flow", () => {
    beforeEach(() => {
      enableRafAwareFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test("FIRST_SIDE_CAPTURED stops capture immediately and INTRO_BACK resumes capture", async () => {
      const { cameraManager, emitFrame, stopFrameCapture, startFrameCapture } =
        createBlinkCardCameraHarness();
      const session = createBlinkCardUnitSessionMock();
      const manager = createBlinkCardUxManager(cameraManager, session);

      const processResult = createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "awaiting-other-side",
        },
      });
      vi.mocked(session.process).mockResolvedValue(processResult);

      await emitFrame(createMockImageData());

      // stopFrameCapture called immediately from frame processing side-effects
      expect(stopFrameCapture).toHaveBeenCalledTimes(1);
      expect(startFrameCapture).not.toHaveBeenCalled();

      // Intro states should resume frame capture when they become active.
      await applyStabilizedUiStateForContractTest(manager, "INTRO_BACK");

      expect(startFrameCapture).toHaveBeenCalled();
    });

    test("CARD_CAPTURED stops capture from frame processing and emits result when CARD_CAPTURED UI state is applied", async () => {
      const { cameraManager, emitFrame, stopFrameCapture } =
        createBlinkCardCameraHarness();
      const session = createBlinkCardUnitSessionMock();
      const manager = createBlinkCardUxManager(cameraManager, session);

      const resultCallback = vi.fn();
      manager.addOnResultCallback(resultCallback);

      const processResult = createProcessResult({
        resultCompleteness: { scanningStatus: "card-scanned" },
      });
      const scanResult = createScanningResult();

      vi.mocked(session.process).mockResolvedValue(processResult);
      vi.mocked(session.getResult).mockResolvedValue(scanResult);

      await emitFrame(createMockImageData());

      // stopFrameCapture called immediately
      expect(stopFrameCapture).toHaveBeenCalledTimes(1);

      // Inject CARD_CAPTURED directly to isolate result emission behavior.
      // sleep(uiState.minDuration) is mocked to resolve immediately in this file.
      await applyStabilizedUiStateForContractTest(manager, "CARD_CAPTURED");

      expect(resultCallback).toHaveBeenCalledWith(scanResult);
    });

    test("logs error message events when UI state changes to an error state", async () => {
      const { cameraManager } = createBlinkCardCameraHarness();
      const session = createBlinkCardUnitSessionMock();
      const manager = createBlinkCardUxManager(cameraManager, session);

      // logErrorMessageEvent is called from #updateUiState when the RAF loop
      // applies an error state, not from the processing loop.
      await applyStabilizedUiStateForContractTest(manager, "BLUR_DETECTED");

      expect(getAnalytics().logErrorMessageEvent).toHaveBeenCalledWith(
        "EliminateBlur",
      );
    });

    test("triggers short haptic feedback when the RAF loop transitions to an error state", async () => {
      const { cameraManager } = createBlinkCardCameraHarness();
      const session = createBlinkCardUnitSessionMock();
      const manager = createBlinkCardUxManager(cameraManager, session);

      const hapticManager = manager.getHapticFeedbackManager();
      const shortSpy = vi.spyOn(hapticManager, "triggerShort");

      // Inject an error state directly to verify haptic behavior on RAF transition.
      await applyStabilizedUiStateForContractTest(manager, "BLUR_DETECTED");

      expect(shortSpy).toHaveBeenCalled();
    });

    test("fires result_retrieval_failed error and does not emit result when getResult rejects", async () => {
      const { cameraManager } = createBlinkCardCameraHarness();
      const session = createBlinkCardUnitSessionMock();
      const manager = createBlinkCardUxManager(cameraManager, session);

      const errorCallback = vi.fn();
      const resultCallback = vi.fn();
      manager.addOnErrorCallback(errorCallback);
      manager.addOnResultCallback(resultCallback);

      vi.mocked(session.getResult).mockRejectedValue(
        new Error("Worker RPC failure"),
      );

      await applyStabilizedUiStateForContractTest(manager, "CARD_CAPTURED");

      await vi.waitFor(() => {
        expect(session.getResult).toHaveBeenCalled();
        expect(errorCallback).toHaveBeenCalledWith("result_retrieval_failed");
        expect(resultCallback).not.toHaveBeenCalled();
      });
    });

    test("drops second frame while first is still processing (busy guard)", async () => {
      const { cameraManager, emitFrame } = createBlinkCardCameraHarness();
      const session = createBlinkCardUnitSessionMock();
      createBlinkCardUxManager(cameraManager, session);

      let resolveFirst!: (value: ProcessResultWithBuffer) => void;
      const firstProcessPromise = new Promise<ProcessResultWithBuffer>(
        (resolve) => {
          resolveFirst = resolve;
        },
      );

      vi.mocked(session.process).mockReturnValueOnce(firstProcessPromise);

      const firstFramePromise = emitFrame(createMockImageData());
      const secondFrameResult = await emitFrame(createMockImageData());

      expect(secondFrameResult).toBeUndefined();
      expect(session.process).toHaveBeenCalledTimes(1);

      resolveFirst(
        createProcessResult({
          inputImageAnalysisResult: {
            processingStatus: "detection-failed",
          },
        }),
      );
      await firstFramePromise;
      await tickRaf();

      expect(session.process).toHaveBeenCalledTimes(1);
    });
  });
});
