/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// ============================================================================
// Hoisted Mocks & State
// ============================================================================

const mockSleep = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

// Mock the sleep utility to resolve immediately, preventing tests from hanging
// when code awaits sleep() with fake timers enabled.
vi.mock("@microblink/ux-common/utils", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@microblink/ux-common/utils")>();
  return {
    ...actual,
    sleep: mockSleep,
  };
});

import { AnalyticService } from "@microblink/analytics/AnalyticService";
import type { ProcessResultWithBuffer } from "@microblink/blinkcard-core";
import {
  createFakeImageData,
  enableRafAwareFakeTimers,
  flushUiRaf,
  setupDestroyableTeardown,
  tickRaf,
} from "@microblink/test-utils";
import { blinkCardUiStateMap } from "./blinkcard-ui-state";
import { BlinkCardUxManager } from "./BlinkCardUxManager";
import {
  createBlinkCardCameraHarness,
  createBlinkCardUnitSessionMock,
  type BlinkCardSessionMock,
} from "./test-helpers.integration";
import {
  createDeviceInfo,
  createProcessResult,
  createScanningResult,
  createSessionSettings,
} from "./__testdata/blinkcardTestFixtures";

/**
 * Test file role:
 * - Verifies BlinkCardUxManager callback/lifecycle contracts.
 * - Uses a small stabilizer seam helper when tests need to assert behavior
 *   after a chosen UI state is applied.
 * - Does not own processResult -> ui-state mapping coverage (see ui-state tests),
 *   and does not own end-to-end scan flow coverage (see integration tests).
 */

type BlinkCardCameraHarness = ReturnType<typeof createBlinkCardCameraHarness>;
type CreateManagerOptions = {
  sessionSettings?: Parameters<typeof createBlinkCardUnitSessionMock>[0];
  showDemoOverlay?: boolean;
  showProductionOverlay?: boolean;
  deviceInfo?: ReturnType<typeof createDeviceInfo>;
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
  cameraHarness: BlinkCardCameraHarness,
  scanningSession: BlinkCardSessionMock,
  options: CreateManagerOptions = {},
) =>
  trackManager(
    new BlinkCardUxManager(
      cameraHarness.cameraManager,
      scanningSession as unknown as ConstructorParameters<
        typeof BlinkCardUxManager
      >[1],
      {},
      options.sessionSettings ?? createSessionSettings(),
      options.showDemoOverlay ?? false,
      options.showProductionOverlay ?? false,
      options.deviceInfo ?? createDeviceInfo(),
    ),
  );

const createBlinkCardTestContext = ({
  initialCameraPermission,
  fakeCameraOptions,
  sessionSettings,
  managerOptions,
}: {
  initialCameraPermission?: "prompt" | "granted" | "denied" | "blocked";
  fakeCameraOptions?: Parameters<typeof createBlinkCardCameraHarness>[0];
  sessionSettings?: Parameters<typeof createBlinkCardUnitSessionMock>[0];
  managerOptions?: CreateManagerOptions;
} = {}) => {
  const cameraHarness = createBlinkCardCameraHarness(
    fakeCameraOptions ??
      (initialCameraPermission
        ? { initialState: { cameraPermission: initialCameraPermission } }
        : undefined),
  );
  const scanningSession = createBlinkCardUnitSessionMock(sessionSettings);
  const manager = createBlinkCardUxManager(
    cameraHarness,
    scanningSession,
    managerOptions,
  );

  return {
    cameraHarness,
    scanningSession,
    manager,
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("BlinkCardUxManager - startup and camera analytics", () => {
  test("logs device info and playback events", () => {
    const logDeviceInfoSpy = vi.spyOn(
      AnalyticService.prototype,
      "logDeviceInfo",
    );
    const { cameraHarness, manager } = createBlinkCardTestContext();

    expect(logDeviceInfoSpy).toHaveBeenCalledWith(manager.deviceInfo);
    logDeviceInfoSpy.mockRestore();

    const logCameraStartedEventSpy = vi.spyOn(
      manager.analytics,
      "logCameraStartedEvent",
    );
    const logCameraClosedEventSpy = vi.spyOn(
      manager.analytics,
      "logCameraClosedEvent",
    );
    const sendPingletsSpy = vi.spyOn(manager.analytics, "sendPinglets");

    logCameraStartedEventSpy.mockClear();
    logCameraClosedEventSpy.mockClear();
    sendPingletsSpy.mockClear();

    cameraHarness.emitPlaybackState("capturing");
    expect(logCameraStartedEventSpy).toHaveBeenCalledTimes(1);
    expect(sendPingletsSpy).toHaveBeenCalled();

    cameraHarness.emitPlaybackState("idle");
    expect(logCameraClosedEventSpy).toHaveBeenCalledTimes(1);
  });
});

describe("BlinkCardUxManager - package-specific: camera permission analytics", () => {
  type PermissionTransitionCase = {
    name: string;
    initialCameraPermission?: "prompt" | "granted" | "denied" | "blocked";
    nextCameraPermission: "prompt" | "granted" | "denied";
    expectedCheck?: boolean;
    expectedRequest: boolean;
    expectedResponse?: boolean;
  };

  const permissionTransitionCases: PermissionTransitionCase[] = [
    {
      name: "logs permission check and request for undefined -> prompt",
      nextCameraPermission: "prompt",
      expectedCheck: false,
      expectedRequest: true,
    },
    {
      name: "logs permission check and request for denied -> prompt",
      initialCameraPermission: "denied",
      nextCameraPermission: "prompt",
      expectedCheck: false,
      expectedRequest: true,
    },
    {
      name: "logs user response for prompt -> granted",
      initialCameraPermission: "prompt",
      nextCameraPermission: "granted",
      expectedRequest: false,
      expectedResponse: true,
    },
    {
      name: "logs user response for prompt -> denied",
      initialCameraPermission: "prompt",
      nextCameraPermission: "denied",
      expectedRequest: false,
      expectedResponse: false,
    },
  ];

  test.each(permissionTransitionCases)("$name", (testCase) => {
    const { cameraHarness, manager } = createBlinkCardTestContext({
      initialCameraPermission: testCase.initialCameraPermission,
    });

    const checkSpy = vi.spyOn(manager.analytics, "logCameraPermissionCheck");
    const requestSpy = vi.spyOn(
      manager.analytics,
      "logCameraPermissionRequest",
    );
    const responseSpy = vi.spyOn(
      manager.analytics,
      "logCameraPermissionUserResponse",
    );
    const sendSpy = vi.spyOn(manager.analytics, "sendPinglets");

    checkSpy.mockClear();
    requestSpy.mockClear();
    responseSpy.mockClear();
    sendSpy.mockClear();

    cameraHarness.fakeCameraManager.emitState({
      cameraPermission: testCase.nextCameraPermission,
    });

    if (testCase.expectedCheck === undefined) {
      expect(checkSpy).not.toHaveBeenCalled();
    } else {
      expect(checkSpy).toHaveBeenCalledTimes(1);
      expect(checkSpy).toHaveBeenCalledWith(testCase.expectedCheck);
    }

    if (testCase.expectedRequest) {
      expect(requestSpy).toHaveBeenCalledTimes(1);
    } else {
      expect(requestSpy).not.toHaveBeenCalled();
    }

    if (testCase.expectedResponse === undefined) {
      expect(responseSpy).not.toHaveBeenCalled();
    } else {
      expect(responseSpy).toHaveBeenCalledTimes(1);
      expect(responseSpy).toHaveBeenCalledWith(testCase.expectedResponse);
    }

    expect(sendSpy).toHaveBeenCalledTimes(1);
  });
});

describe("BlinkCardUxManager - package-specific: camera input analytics", () => {
  beforeEach(() => {
    enableRafAwareFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const fakeCameraOptions = {
    initialState: {
      selectedCamera: { name: "default-camera", facingMode: "back" as const },
      videoResolution: { width: 1920, height: 1080 },
    },
  };

  test("coalesces orientation-like updates into one camera input ping", async () => {
    const { cameraHarness, manager } = createBlinkCardTestContext({
      fakeCameraOptions,
    });
    const logCameraInputInfoSpy = vi.spyOn(
      manager.analytics,
      "logCameraInputInfo",
    );

    logCameraInputInfoSpy.mockClear();

    cameraHarness.emitCameraState({
      videoResolution: { width: 1080, height: 1920 },
      extractionArea: { x: 0, y: 0, width: 1080, height: 1920 },
    });

    cameraHarness.emitCameraState({
      videoResolution: { width: 1920, height: 1080 },
    });

    cameraHarness.emitCameraState({
      videoResolution: { width: 1080, height: 1920 },
      extractionArea: { x: 0, y: 5, width: 1080, height: 1910 },
    });

    expect(logCameraInputInfoSpy).not.toHaveBeenCalled();
    await vi.runOnlyPendingTimersAsync();

    expect(logCameraInputInfoSpy).toHaveBeenCalledTimes(1);
    expect(logCameraInputInfoSpy).toHaveBeenCalledWith({
      deviceId: "default-camera",
      cameraFacing: "Back",
      cameraFrameWidth: 1080,
      cameraFrameHeight: 1920,
      roiWidth: 1080,
      roiHeight: 1910,
      viewPortAspectRatio: 1080 / 1910,
    });
  });

  test("sends immediate and debounced pings for separated updates", async () => {
    const { cameraHarness, manager } = createBlinkCardTestContext({
      fakeCameraOptions,
    });
    const logCameraInputInfoSpy = vi.spyOn(
      manager.analytics,
      "logCameraInputInfo",
    );

    logCameraInputInfoSpy.mockClear();

    cameraHarness.emitCameraState({
      selectedCamera: { name: "default-camera", facingMode: "back" },
    });
    expect(logCameraInputInfoSpy).toHaveBeenCalledTimes(1);

    cameraHarness.emitCameraState({
      extractionArea: { x: 0, y: 5, width: 1080, height: 1910 },
    });
    expect(logCameraInputInfoSpy).toHaveBeenCalledTimes(1);

    await vi.runOnlyPendingTimersAsync();
    expect(logCameraInputInfoSpy).toHaveBeenCalledTimes(2);
  });

  test("does not send delayed camera input ping after reset or observer cleanup", async () => {
    const resetContext = createBlinkCardTestContext({ fakeCameraOptions });
    const resetSpy = vi.spyOn(
      resetContext.manager.analytics,
      "logCameraInputInfo",
    );

    resetSpy.mockClear();
    resetContext.cameraHarness.emitCameraState({
      videoResolution: { width: 1000, height: 500 },
    });
    resetContext.manager.reset();
    await vi.runOnlyPendingTimersAsync();
    expect(resetSpy).not.toHaveBeenCalled();

    const cleanupContext = createBlinkCardTestContext({ fakeCameraOptions });
    const cleanupSpy = vi.spyOn(
      cleanupContext.manager.analytics,
      "logCameraInputInfo",
    );

    cleanupSpy.mockClear();
    cleanupContext.cameraHarness.emitCameraState({
      videoResolution: { width: 1000, height: 500 },
    });
    cleanupContext.manager.cleanupAllObservers();
    await vi.runOnlyPendingTimersAsync();
    expect(cleanupSpy).not.toHaveBeenCalled();
  });
});

describe("BlinkCardUxManager - package-specific: camera frame-capture loop errors", () => {
  test("logs a non-fatal ping when camera manager reports a frame-loop error", () => {
    const { cameraHarness, manager } = createBlinkCardTestContext();
    const logErrorEventSpy = vi.spyOn(manager.analytics, "logErrorEvent");
    const sendPingletsSpy = vi.spyOn(manager.analytics, "sendPinglets");
    const error = new Error(
      "Frame capture callback did not return an ArrayBuffer.",
    );

    logErrorEventSpy.mockClear();
    sendPingletsSpy.mockClear();

    cameraHarness.fakeCameraManager.emitError(error);

    expect(logErrorEventSpy).toHaveBeenCalledWith({
      origin: "cameraManager.error",
      error,
      errorType: "NonFatal",
    });
    expect(sendPingletsSpy).toHaveBeenCalledTimes(1);
  });
});

describe("BlinkCardUxManager - session lifecycle: reset behavior", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("resetScanningSession starts camera stream when inactive", async () => {
    const { cameraHarness, manager } = createBlinkCardTestContext();
    cameraHarness.setIsActive(false);

    await manager.resetScanningSession(true);

    expect(cameraHarness.startCameraStream).toHaveBeenCalledTimes(1);
    expect(cameraHarness.startFrameCapture).toHaveBeenCalledTimes(1);
  });

  test("resetScanningSession skips frame capture when startFrameCapture is false", async () => {
    const { manager, cameraHarness } = createBlinkCardTestContext();

    await manager.resetScanningSession(false);

    expect(cameraHarness.startFrameCapture).not.toHaveBeenCalled();
  });

  test("reset clears all callbacks", async () => {
    const { cameraHarness, manager, scanningSession } =
      createBlinkCardTestContext();
    const uiStateSpy = vi.fn();
    const resultSpy = vi.fn();
    const frameProcessSpy = vi.fn();
    const errorSpy = vi.fn();

    manager.addOnUiStateChangedCallback(uiStateSpy);
    manager.addOnResultCallback(resultSpy);
    manager.addOnFrameProcessCallback(frameProcessSpy);
    manager.addOnErrorCallback(errorSpy);

    manager.reset();

    scanningSession.process.mockResolvedValue(
      createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "awaiting-other-side",
        },
      }),
    );

    await cameraHarness.emitFrame(createFakeImageData());
    await flushUiRaf();

    manager.setTimeoutDuration(1000);
    cameraHarness.emitPlaybackState("capturing");
    vi.advanceTimersByTime(1000);

    expect(uiStateSpy).not.toHaveBeenCalled();
    expect(resultSpy).not.toHaveBeenCalled();
    expect(frameProcessSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });
});

describe("BlinkCardUxManager - timeout behavior", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("triggers timeout and error callback", () => {
    const { cameraHarness, manager } = createBlinkCardTestContext();
    const timeoutSpy = vi.spyOn(manager.analytics, "logStepTimeoutEvent");
    const errorCallback = vi.fn();

    manager.addOnErrorCallback(errorCallback);
    manager.setTimeoutDuration(1000);

    timeoutSpy.mockClear();
    cameraHarness.emitPlaybackState("capturing");
    vi.advanceTimersByTime(1000);

    expect(errorCallback).toHaveBeenCalledWith("timeout");
    expect(cameraHarness.stopFrameCapture).toHaveBeenCalled();
    expect(timeoutSpy).toHaveBeenCalledTimes(1);
  });

  test("clears timeout when stopping capture", () => {
    const { cameraHarness, manager } = createBlinkCardTestContext();
    const errorCallback = vi.fn();

    manager.addOnErrorCallback(errorCallback);
    manager.setTimeoutDuration(1000);

    cameraHarness.emitPlaybackState("capturing");
    cameraHarness.emitPlaybackState("idle");
    vi.advanceTimersByTime(1100);

    expect(errorCallback).not.toHaveBeenCalled();
  });

  test("does not set timeout when timeout duration is null", () => {
    const { cameraHarness, manager } = createBlinkCardTestContext();
    const errorCallback = vi.fn();

    manager.addOnErrorCallback(errorCallback);
    manager.setTimeoutDuration(null);

    cameraHarness.emitPlaybackState("capturing");
    vi.advanceTimersByTime(20_000);

    expect(errorCallback).not.toHaveBeenCalled();
  });
});

describe("BlinkCardUxManager - state transitions: shared callback contracts", () => {
  beforeEach(() => {
    enableRafAwareFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("logs error message events when UI state changes to an error state", async () => {
    const { manager } = createBlinkCardTestContext();
    const logErrorMessageEventSpy = vi.spyOn(
      manager.analytics,
      "logErrorMessageEvent",
    );

    logErrorMessageEventSpy.mockClear();
    await applyStabilizedUiStateForContractTest(manager, "BLUR_DETECTED");

    expect(logErrorMessageEventSpy).toHaveBeenCalledWith("EliminateBlur");
  });

  test("triggers short haptic feedback when the RAF loop transitions to an error state", async () => {
    const { manager } = createBlinkCardTestContext();
    const shortSpy = vi.spyOn(
      manager.getHapticFeedbackManager(),
      "triggerShort",
    );

    shortSpy.mockClear();
    await applyStabilizedUiStateForContractTest(manager, "BLUR_DETECTED");

    expect(shortSpy).toHaveBeenCalled();
  });
});

describe("BlinkCardUxManager - state transitions: capture flow integration", () => {
  beforeEach(() => {
    enableRafAwareFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("stops capture after first-side success and resumes capture on INTRO_BACK", async () => {
    const { cameraHarness, manager, scanningSession } =
      createBlinkCardTestContext();

    scanningSession.process.mockResolvedValue(
      createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "awaiting-other-side",
        },
      }),
    );

    await cameraHarness.emitFrame(createFakeImageData());

    expect(cameraHarness.stopFrameCapture).toHaveBeenCalledTimes(1);
    expect(cameraHarness.startFrameCapture).not.toHaveBeenCalled();

    await applyStabilizedUiStateForContractTest(manager, "INTRO_BACK");

    expect(cameraHarness.startFrameCapture).toHaveBeenCalled();
  });

  test("emits scan result when CARD_CAPTURED UI state is applied", async () => {
    const { cameraHarness, manager, scanningSession } =
      createBlinkCardTestContext();
    const resultCallback = vi.fn();

    manager.addOnResultCallback(resultCallback);
    scanningSession.process.mockResolvedValue(
      createProcessResult({
        resultCompleteness: { scanningStatus: "card-scanned" },
      }),
    );
    scanningSession.getResult.mockResolvedValue(createScanningResult());

    await cameraHarness.emitFrame(createFakeImageData());

    expect(cameraHarness.stopFrameCapture).toHaveBeenCalledTimes(1);

    await applyStabilizedUiStateForContractTest(manager, "CARD_CAPTURED");

    expect(resultCallback).toHaveBeenCalledWith(createScanningResult());
  });

  test("fires result_retrieval_failed error when getResult rejects", async () => {
    const { manager, scanningSession } = createBlinkCardTestContext();
    const errorCallback = vi.fn();
    const resultCallback = vi.fn();

    manager.addOnErrorCallback(errorCallback);
    manager.addOnResultCallback(resultCallback);
    scanningSession.getResult.mockRejectedValue(
      new Error("Worker RPC failure"),
    );

    await applyStabilizedUiStateForContractTest(manager, "CARD_CAPTURED");

    await vi.waitFor(() => {
      expect(scanningSession.getResult).toHaveBeenCalled();
      expect(errorCallback).toHaveBeenCalledWith("result_retrieval_failed");
      expect(resultCallback).not.toHaveBeenCalled();
      expect(scanningSession.ping).toHaveBeenCalledWith(
        expect.objectContaining({
          schemaName: "ping.error",
          data: expect.objectContaining({
            errorType: "NonFatal",
            errorMessage: "ux.getSessionResult: Worker RPC failure",
          }),
        }),
      );
      expect(scanningSession.sendPinglets).toHaveBeenCalledTimes(1);
    });
  });

  test("reports non-fatal pinglets when frame processing rejects with a recoverable error", async () => {
    const { cameraHarness, scanningSession } = createBlinkCardTestContext();
    scanningSession.process.mockRejectedValue(
      new Error("Worker process failure"),
    );

    await expect(
      cameraHarness.emitFrame(createFakeImageData()),
    ).rejects.toThrow("Worker process failure");

    expect(scanningSession.ping).toHaveBeenCalledWith(
      expect.objectContaining({
        schemaName: "ping.error",
        data: expect.objectContaining({
          errorType: "NonFatal",
          errorMessage: "ux.frameCapture: Worker process failure",
        }),
      }),
    );
    expect(scanningSession.sendPinglets).toHaveBeenCalledTimes(1);
  });

  test("reports non-fatal pinglets when frame processing rejects with a WASM runtime error", async () => {
    const { cameraHarness, scanningSession } = createBlinkCardTestContext();
    scanningSession.process.mockRejectedValue(
      new Error("table index is out of bounds RuntimeError"),
    );

    await expect(
      cameraHarness.emitFrame(createFakeImageData()),
    ).rejects.toThrow("table index is out of bounds RuntimeError");

    expect(scanningSession.ping).toHaveBeenCalledWith(
      expect.objectContaining({
        schemaName: "ping.error",
        data: expect.objectContaining({
          errorType: "NonFatal",
          errorMessage:
            "ux.frameCapture: table index is out of bounds RuntimeError",
        }),
      }),
    );
    expect(scanningSession.sendPinglets).toHaveBeenCalledTimes(1);
  });

  test("reports non-fatal pinglets when frame processing rejects with a frame transfer error", async () => {
    const { cameraHarness, scanningSession } = createBlinkCardTestContext();
    const frameTransferError = new Error("Failed to transfer frame to worker");
    frameTransferError.name = "FrameTransferError";

    scanningSession.process.mockRejectedValue(frameTransferError);

    await expect(
      cameraHarness.emitFrame(createFakeImageData()),
    ).rejects.toThrow("Failed to transfer frame to worker");

    expect(scanningSession.ping).toHaveBeenCalledWith(
      expect.objectContaining({
        schemaName: "ping.error",
        data: expect.objectContaining({
          errorType: "NonFatal",
          errorMessage: "ux.frameCapture: Failed to transfer frame to worker",
        }),
      }),
    );
    expect(scanningSession.sendPinglets).toHaveBeenCalledTimes(1);
  });

  test("skips overlapping process calls while a previous frame is still processing", async () => {
    const { cameraHarness, scanningSession } = createBlinkCardTestContext();
    let resolveFirst!: (value: ProcessResultWithBuffer) => void;
    const firstProcessPromise = new Promise<ProcessResultWithBuffer>(
      (resolve) => {
        resolveFirst = resolve;
      },
    );

    scanningSession.process.mockReturnValueOnce(firstProcessPromise);

    const firstFramePromise = cameraHarness.emitFrame(createFakeImageData());
    const secondFrameResult = await cameraHarness.emitFrame(
      createFakeImageData(),
    );

    expect(secondFrameResult).toBeUndefined();
    expect(scanningSession.process).toHaveBeenCalledTimes(1);

    resolveFirst(
      createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "detection-failed",
        },
      }),
    );
    await firstFramePromise;
    await tickRaf();

    expect(scanningSession.process).toHaveBeenCalledTimes(1);
  });

  test("skips further process calls after terminal card capture", async () => {
    const { cameraHarness, scanningSession } = createBlinkCardTestContext();

    scanningSession.process.mockResolvedValue(
      createProcessResult({
        resultCompleteness: { scanningStatus: "card-scanned" },
      }),
    );
    scanningSession.getResult.mockResolvedValue(createScanningResult());

    await cameraHarness.emitFrame(createFakeImageData());
    await tickRaf();
    await cameraHarness.emitFrame(createFakeImageData());

    expect(scanningSession.process).toHaveBeenCalledTimes(1);
  });
});
