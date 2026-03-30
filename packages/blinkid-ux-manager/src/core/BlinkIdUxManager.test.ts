/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// ============================================================================
// Hoisted Mocks & State
// ============================================================================

const mockSleep = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

// Mock the sleep utility to resolve immediately, preventing tests from hanging
// when code awaits sleep() with fake timers enabled
vi.mock("@microblink/ux-common/utils", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@microblink/ux-common/utils")>();
  return {
    ...actual,
    sleep: mockSleep,
  };
});

import { AnalyticService } from "@microblink/analytics/AnalyticService";
import type {
  BlinkIdScanningResult,
  DocumentClassInfo,
} from "@microblink/blinkid-core";
import {
  createFakeImageData,
  enableRafAwareFakeTimers,
  flushUiRaf,
  jumpTime,
  setupDestroyableTeardown,
  tickRaf,
} from "@microblink/test-utils";
import type { BlinkIdUiState, BlinkIdUiStateKey } from "./blinkid-ui-state";
import { blinkIdUiStateMap } from "./blinkid-ui-state";
import type { BlinkIdUxManager } from "./BlinkIdUxManager";
import {
  createBlinkIdUxManager as createBlinkIdUxManagerFactory,
  type BlinkIdUxManagerOptions,
} from "./createBlinkIdUxManager";
import {
  createBlinkIdCameraHarness,
  createBlinkIdUnitSessionMock,
  type BlinkIdUnitSessionMock,
} from "./test-helpers.integration";
import { createProcessResult } from "./__testdata/blinkidTestFixtures";

/**
 * Test file role:
 * - Verifies BlinkIdUxManager callback/lifecycle contracts.
 * - Uses a small stabilizer seam helper when tests need to assert behavior
 *   after a chosen UI state is applied.
 * - Does not own processResult -> ui-state mapping coverage (see ui-state tests),
 *   and does not own end-to-end scan flow coverage (see integration tests).
 */

type BlinkIdCameraHarness = ReturnType<typeof createBlinkIdCameraHarness>;
type MockScanningSession = BlinkIdUnitSessionMock;

const trackManager = setupDestroyableTeardown<BlinkIdUxManager>();

/**
 * Unit-test seam: tests that call this are validating manager callback/lifecycle
 * behavior after a chosen UI state is applied, not mapping from process results.
 * Mapping is covered in ui-state + integration suites.
 */
const applyStabilizedUiStateForContractTest = async (
  manager: BlinkIdUxManager,
  uiStateKey: BlinkIdUiStateKey,
) => {
  manager.feedbackStabilizer.reset(uiStateKey);
  await flushUiRaf();
};

const createManagedBlinkIdUxManager = async (
  cameraHarness: BlinkIdCameraHarness,
  mockScanningSession: MockScanningSession,
  options?: BlinkIdUxManagerOptions,
): Promise<BlinkIdUxManager> =>
  trackManager(
    await createBlinkIdUxManagerFactory(
      cameraHarness.cameraManager,
      mockScanningSession as unknown as Parameters<
        typeof createBlinkIdUxManagerFactory
      >[1],
      options,
    ),
  );

const createBlinkIdTestContext = async ({
  initialCameraPermission,
  fakeCameraOptions,
  sessionSettings,
  managerOptions,
}: {
  initialCameraPermission?: "prompt" | "granted" | "denied" | "blocked";
  fakeCameraOptions?: Parameters<typeof createBlinkIdCameraHarness>[0];
  sessionSettings?: Parameters<typeof createBlinkIdUnitSessionMock>[0];
  managerOptions?: BlinkIdUxManagerOptions;
} = {}) => {
  const cameraHarness = createBlinkIdCameraHarness(
    fakeCameraOptions ??
      (initialCameraPermission
        ? { initialState: { cameraPermission: initialCameraPermission } }
        : undefined),
  );
  const scanningSession = createBlinkIdUnitSessionMock(sessionSettings);
  const manager = await createManagedBlinkIdUxManager(
    cameraHarness,
    scanningSession,
    managerOptions,
  );

  // Even already-resolved async setup uses microtasks before session data is visible.
  await Promise.resolve();

  return {
    cameraHarness,
    scanningSession,
    manager,
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("BlinkIdUxManager - startup and camera analytics", () => {
  test("logs device info and playback events", async () => {
    const logDeviceInfoSpy = vi.spyOn(
      AnalyticService.prototype,
      "logDeviceInfo",
    );

    const { cameraHarness, manager } = await createBlinkIdTestContext();

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

describe("BlinkIdUxManager - package-specific: camera permission analytics", () => {
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

  test.each(permissionTransitionCases)("$name", async (testCase) => {
    const { cameraHarness, manager } = await createBlinkIdTestContext({
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

describe("BlinkIdUxManager - package-specific: camera input analytics", () => {
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
    const { cameraHarness, manager } = await createBlinkIdTestContext({
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
    const { cameraHarness, manager } = await createBlinkIdTestContext({
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
    const resetContext = await createBlinkIdTestContext({ fakeCameraOptions });
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

    const cleanupContext = await createBlinkIdTestContext({
      fakeCameraOptions,
    });
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

describe("BlinkIdUxManager - package-specific: camera frame-capture loop errors", () => {
  test("logs a non-fatal ping when camera manager reports a frame-loop error", async () => {
    const { cameraHarness, manager } = await createBlinkIdTestContext();
    const error = new Error(
      "Frame capture callback did not return an ArrayBuffer.",
    );
    const logErrorSpy = vi.spyOn(manager.analytics, "logErrorEvent");
    const sendPingletsSpy = vi.spyOn(manager.analytics, "sendPinglets");

    logErrorSpy.mockClear();
    sendPingletsSpy.mockClear();

    cameraHarness.fakeCameraManager.emitError(error);

    expect(logErrorSpy).toHaveBeenCalledWith({
      origin: "cameraManager.error",
      error,
      errorType: "NonFatal",
    });
    expect(sendPingletsSpy).toHaveBeenCalledTimes(1);
  });
});

describe("BlinkIdUxManager - package-specific: document class filtering", () => {
  let cameraHarness: BlinkIdCameraHarness;
  let mockScanningSession: MockScanningSession;
  let manager: BlinkIdUxManager;
  let emitFrame: BlinkIdCameraHarness["emitFrame"];

  beforeEach(async () => {
    cameraHarness = createBlinkIdCameraHarness();
    mockScanningSession = createBlinkIdUnitSessionMock();
    manager = await createManagedBlinkIdUxManager(
      cameraHarness,
      mockScanningSession,
    );
    emitFrame = cameraHarness.emitFrame;
  });

  afterEach(() => {
    manager.reset();
  });

  test("should call document filtered callback when filter returns false", async () => {
    const mockDocumentClassInfo: DocumentClassInfo = {
      country: "usa",
      type: "dl",
    };

    const mockProcessResult = createProcessResult({
      inputImageAnalysisResult: {
        processingStatus: "success",
        documentClassInfo: mockDocumentClassInfo,
        documentDetectionStatus: "success",
      },
    });
    mockScanningSession.process.mockResolvedValue(mockProcessResult);

    // Add a spy for the document filtered callback
    const documentFilteredSpy = vi.fn();
    const cleanupFilteredCallback =
      manager.addOnDocumentFilteredCallback(documentFilteredSpy);

    // Add filter that rejects USA documents
    const filterCleanup = manager.addDocumentClassFilter((docInfo) => {
      return docInfo.country !== "usa";
    });

    await emitFrame(createFakeImageData());

    // Verify callback was invoked with the document class info
    expect(documentFilteredSpy).toHaveBeenCalledWith(
      expect.objectContaining(mockDocumentClassInfo),
    );

    cleanupFilteredCallback();
    filterCleanup();
  });

  test("should not call document filtered callback when filter returns true", async () => {
    const mockDocumentClassInfo: DocumentClassInfo = {
      country: "usa",
      type: "dl",
    };

    const mockProcessResult = createProcessResult({
      inputImageAnalysisResult: {
        processingStatus: "success",
        documentClassInfo: mockDocumentClassInfo,
        documentDetectionStatus: "success",
      },
    });
    mockScanningSession.process.mockResolvedValue(mockProcessResult);

    // Add a spy for the document filtered callback
    const documentFilteredSpy = vi.fn();
    const cleanupFilteredCallback =
      manager.addOnDocumentFilteredCallback(documentFilteredSpy);

    // Add filter that rejects USA documents
    const filterCleanup = manager.addDocumentClassFilter((docInfo) => {
      return docInfo.country === "usa";
    });

    await emitFrame(createFakeImageData());

    // Verify callback was invoked with the document class info
    expect(documentFilteredSpy).not.toHaveBeenCalledWith(mockDocumentClassInfo);

    cleanupFilteredCallback();
    filterCleanup();
  });

  test("should not apply filter when document class info is incomplete", async () => {
    // Missing type field
    const mockDocumentClassInfo: DocumentClassInfo = {
      country: "usa",
    };

    const mockProcessResult = createProcessResult({
      inputImageAnalysisResult: {
        processingStatus: "success",
        documentClassInfo: mockDocumentClassInfo,
        documentDetectionStatus: "success",
      },
    });
    mockScanningSession.process.mockResolvedValue(mockProcessResult);

    // Add filter that would reject all documents
    const filterCleanup = manager.addDocumentClassFilter(() => false);

    await emitFrame(createFakeImageData());

    // Filter shouldn't be applied because document info is incomplete
    expect(mockProcessResult.inputImageAnalysisResult?.processingStatus).toBe(
      "success",
    );
    filterCleanup();
  });

  test("should not apply filter when documentClassInfo is undefined", async () => {
    const mockProcessResult = createProcessResult({
      inputImageAnalysisResult: {
        processingStatus: "success",
        documentDetectionStatus: "success",
      },
    });
    mockScanningSession.process.mockResolvedValue(mockProcessResult);

    // Add filter that would reject all documents
    const filterCleanup = manager.addDocumentClassFilter(() => false);

    await emitFrame(createFakeImageData());

    // Filter shouldn't be applied because document info is undefined
    expect(mockProcessResult.inputImageAnalysisResult?.processingStatus).toBe(
      "success",
    );
    filterCleanup();
  });

  test("should not apply filtering when no filter is added", async () => {
    const mockDocumentClassInfo: DocumentClassInfo = {
      country: "usa",
      type: "dl",
    };

    const mockProcessResult = createProcessResult({
      inputImageAnalysisResult: {
        processingStatus: "success",
        documentClassInfo: mockDocumentClassInfo,
        documentDetectionStatus: "success",
      },
    });
    mockScanningSession.process.mockResolvedValue(mockProcessResult);

    // No filter added
    await emitFrame(createFakeImageData());

    expect(mockProcessResult.inputImageAnalysisResult?.processingStatus).toBe(
      "success",
    );
  });

  test("should remove filter and not invoke callback when cleanup function is called", async () => {
    const mockDocumentClassInfo: DocumentClassInfo = {
      country: "usa",
      type: "dl",
    };

    // Add a spy for the document filtered callback
    const documentFilteredSpy = vi.fn();
    const cleanupFilteredCallback =
      manager.addOnDocumentFilteredCallback(documentFilteredSpy);

    // First run with active filter that would filter document
    const mockProcessResult = createProcessResult({
      inputImageAnalysisResult: {
        processingStatus: "success",
        documentClassInfo: mockDocumentClassInfo,
        documentDetectionStatus: "success",
      },
    });
    mockScanningSession.process.mockResolvedValue(mockProcessResult);
    const filterCleanup = manager.addDocumentClassFilter(() => false);

    await emitFrame(createFakeImageData());

    expect(documentFilteredSpy).toHaveBeenCalledTimes(1);

    // Reset spy
    documentFilteredSpy.mockClear();

    // Remove the filter and run again
    filterCleanup();

    await emitFrame(createFakeImageData());

    // Should not invoke callback when filter is removed
    expect(documentFilteredSpy).not.toHaveBeenCalled();

    cleanupFilteredCallback();
  });

  test("should use the most recently added filter", async () => {
    const mockDocumentClassInfo: DocumentClassInfo = {
      country: "usa",
      type: "dl",
    };

    const mockProcessResult = createProcessResult({
      inputImageAnalysisResult: {
        processingStatus: "success",
        documentClassInfo: mockDocumentClassInfo,
        documentDetectionStatus: "success",
      },
    });
    mockScanningSession.process.mockResolvedValue(mockProcessResult);

    // Add first filter that would reject all documents
    const firstFilterCleanup = manager.addDocumentClassFilter(() => false);

    // Add second filter that accepts all documents
    const secondFilterCleanup = manager.addDocumentClassFilter(() => true);

    await emitFrame(createFakeImageData());

    // Second filter should take precedence
    expect(mockProcessResult.inputImageAnalysisResult?.processingStatus).toBe(
      "success",
    );

    firstFilterCleanup();
    secondFilterCleanup();
  });

  test("should stop camera capture and not emit result when document is filtered out", async () => {
    const mockDocumentClassInfo: DocumentClassInfo = {
      country: "usa",
      type: "dl",
    };

    // Mock both process result and final scanning result
    const mockProcessResult = createProcessResult({
      inputImageAnalysisResult: {
        processingStatus: "success",
        documentClassInfo: mockDocumentClassInfo,
        documentDetectionStatus: "success",
      },
    });
    mockScanningSession.process.mockResolvedValue(mockProcessResult);

    // Add filter that rejects USA documents
    const filterCleanup = manager.addDocumentClassFilter(() => false);

    // Add a spy for the document filtered callback
    const documentFilteredSpy = vi.fn();
    const cleanupFilteredCallback =
      manager.addOnDocumentFilteredCallback(documentFilteredSpy);

    // Track results
    const resultsReceived: BlinkIdScanningResult[] = [];
    const cleanupResultListener = manager.addOnResultCallback((result) => {
      resultsReceived.push(result);
    });

    await emitFrame(createFakeImageData());

    // Verify document filtered callback was called
    expect(documentFilteredSpy).toHaveBeenCalledWith(
      expect.objectContaining(mockDocumentClassInfo),
    );

    // Verify camera was stopped
    expect(cameraHarness.stopFrameCapture).toHaveBeenCalled();

    // Verify no results were emitted
    expect(resultsReceived.length).toBe(0);
    expect(mockScanningSession.getResult).not.toHaveBeenCalled();

    cleanupResultListener();
    cleanupFilteredCallback();
    filterCleanup();
  });

  test("should invoke frame process callbacks even when document is filtered out", async () => {
    const mockDocumentClassInfo: DocumentClassInfo = {
      country: "usa",
      type: "dl",
    };

    const mockProcessResult = createProcessResult({
      inputImageAnalysisResult: {
        processingStatus: "success",
        documentClassInfo: mockDocumentClassInfo,
        documentDetectionStatus: "success",
      },
    });
    mockScanningSession.process.mockResolvedValue(mockProcessResult);

    // Add filter that rejects all documents
    const filterCleanup = manager.addDocumentClassFilter(() => false);

    // Add frame process callback spy
    const frameProcessSpy = vi.fn();
    const cleanupFrameProcessCallback =
      manager.addOnFrameProcessCallback(frameProcessSpy);

    await emitFrame(createFakeImageData());

    // Verify frame process callback was called with the process result
    expect(frameProcessSpy).toHaveBeenCalledWith(mockProcessResult);

    cleanupFrameProcessCallback();
    filterCleanup();
  });

  test("should return arrayBuffer from process result when document is filtered out", async () => {
    const mockDocumentClassInfo: DocumentClassInfo = {
      country: "usa",
      type: "dl",
    };

    const mockArrayBuffer = new ArrayBuffer(8);
    const mockProcessResult = {
      ...createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "success",
          documentClassInfo: mockDocumentClassInfo,
          documentDetectionStatus: "success",
        },
      }),
      arrayBuffer: mockArrayBuffer,
    };
    mockScanningSession.process.mockResolvedValue(mockProcessResult);

    // Add filter that rejects all documents
    const filterCleanup = manager.addDocumentClassFilter(() => false);

    const result = await emitFrame(createFakeImageData());

    // Verify the arrayBuffer is returned from the callback
    expect(result).toBe(mockArrayBuffer);

    filterCleanup();
  });

  test("should return arrayBuffer and update UI state when document passes filter", async () => {
    const mockDocumentClassInfo: DocumentClassInfo = {
      country: "usa",
      type: "dl",
    };

    const mockArrayBuffer = new ArrayBuffer(16);

    const mockProcessResult = createProcessResult({
      inputImageAnalysisResult: {
        processingStatus: "success",
        documentClassInfo: mockDocumentClassInfo,
        documentDetectionStatus: "success",
      },
      resultCompleteness: {
        scanningStatus: "side-scanned",
      },
      arrayBuffer: mockArrayBuffer,
    });
    mockScanningSession.process.mockResolvedValue(mockProcessResult);

    // Add filter that accepts all documents
    const filterCleanup = manager.addDocumentClassFilter(() => true);

    const result = await emitFrame(createFakeImageData());

    // Verify the arrayBuffer is returned and mapped candidate was captured
    expect(result).toBe(mockArrayBuffer);
    expect(manager.mappedUiStateKey).toBe("PAGE_CAPTURED");

    filterCleanup();
  });
});

describe("BlinkIdUxManager - session lifecycle: reset behavior", () => {
  let manager: BlinkIdUxManager;
  let cameraHarness: BlinkIdCameraHarness;
  let mockScanningSession: MockScanningSession;

  beforeEach(async () => {
    vi.useFakeTimers();

    cameraHarness = createBlinkIdCameraHarness();
    mockScanningSession = createBlinkIdUnitSessionMock();
    manager = await createManagedBlinkIdUxManager(
      cameraHarness,
      mockScanningSession,
    );
  });

  afterEach(() => {
    manager.reset();
    vi.useRealTimers();
  });

  test("resetScanningSession should reset internal state and scanning session", async () => {
    // Setup initial state
    const uiStateChangedSpy = vi.fn();
    manager.addOnUiStateChangedCallback(uiStateChangedSpy);

    // Call reset
    await manager.resetScanningSession(true);

    // Verify internal state reset
    expect(mockScanningSession.reset).toHaveBeenCalled();
    expect(uiStateChangedSpy).toHaveBeenCalled();
    expect(cameraHarness.startFrameCapture).toHaveBeenCalled();
  });

  test("resetScanningSession should start camera if not active", async () => {
    cameraHarness.setIsActive(false);

    await manager.resetScanningSession(true);

    expect(cameraHarness.startCameraStream).toHaveBeenCalled();
    expect(cameraHarness.startFrameCapture).toHaveBeenCalled();
  });

  test("resetScanningSession should not start frame capture when startFrameCapture is false", async () => {
    await manager.resetScanningSession(false);

    expect(cameraHarness.startFrameCapture).not.toHaveBeenCalled();
  });

  test("should allow overriding initial UI state through manager API", async () => {
    expect(manager.getInitialUiStateKey()).toBe("INTRO_FRONT_PAGE");

    manager.setInitialUiStateKey("INTRO_DATA_PAGE", true);

    expect(manager.getInitialUiStateKey()).toBe("INTRO_DATA_PAGE");
    expect(manager.uiState.key).toBe("INTRO_DATA_PAGE");
    expect(manager.uiStateKey).toBe("INTRO_DATA_PAGE");

    await manager.resetScanningSession(false);
    expect(manager.uiState.key).toBe("INTRO_DATA_PAGE");
    expect(manager.uiStateKey).toBe("INTRO_DATA_PAGE");
  });

  test("should use constructor initialUiStateKey override", async () => {
    const customManager = await createManagedBlinkIdUxManager(
      cameraHarness,
      mockScanningSession,
      {
        initialUiStateKey: "INTRO_DATA_PAGE",
      },
    );

    expect(customManager.getInitialUiStateKey()).toBe("INTRO_DATA_PAGE");
    expect(customManager.uiState.key).toBe("INTRO_DATA_PAGE");
    expect(customManager.uiStateKey).toBe("INTRO_DATA_PAGE");

    await customManager.resetScanningSession(false);
    expect(customManager.uiState.key).toBe("INTRO_DATA_PAGE");
    expect(customManager.uiStateKey).toBe("INTRO_DATA_PAGE");

    customManager.reset();
  });

  test("reset should clear all callbacks", async () => {
    // Setup callbacks
    const uiStateChangedSpy = vi.fn();
    const resultSpy = vi.fn();
    const frameProcessSpy = vi.fn();
    const errorSpy = vi.fn();
    const documentFilteredSpy = vi.fn();

    manager.addOnUiStateChangedCallback(uiStateChangedSpy);
    manager.addOnResultCallback(resultSpy);
    manager.addOnFrameProcessCallback(frameProcessSpy);
    manager.addOnErrorCallback(errorSpy);
    manager.addOnDocumentFilteredCallback(documentFilteredSpy);

    // Call reset
    manager.reset();

    // Trigger events that would normally call callbacks
    const mockProcessResult = createProcessResult({
      inputImageAnalysisResult: {
        processingStatus: "success",
        documentClassInfo: {
          country: "usa",
          type: "dl",
        },
        documentDetectionStatus: "success",
      },
    });
    mockScanningSession.process.mockResolvedValue(mockProcessResult);

    // Process a frame to trigger potential callbacks
    await cameraHarness.emitFrame(createFakeImageData());

    // Simulate timeout to trigger error callback
    const timeoutDuration = 5000;
    manager.setTimeoutDuration(timeoutDuration);
    cameraHarness.emitPlaybackState("capturing");
    vi.advanceTimersByTime(timeoutDuration);

    // Verify no callbacks were called
    expect(uiStateChangedSpy).not.toHaveBeenCalled();
    expect(resultSpy).not.toHaveBeenCalled();
    expect(frameProcessSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(documentFilteredSpy).not.toHaveBeenCalled();
  });
});

describe("BlinkIdUxManager - timeout behavior", () => {
  let manager: BlinkIdUxManager;
  let cameraHarness: BlinkIdCameraHarness;
  let mockScanningSession: MockScanningSession;

  beforeEach(async () => {
    vi.useFakeTimers();

    cameraHarness = createBlinkIdCameraHarness();
    mockScanningSession = createBlinkIdUnitSessionMock();
    manager = await createManagedBlinkIdUxManager(
      cameraHarness,
      mockScanningSession,
    );
  });

  afterEach(() => {
    manager.reset();
    vi.useRealTimers();
  });

  test("should trigger timeout and error callback", () => {
    const timeoutDuration = 5000;
    manager.setTimeoutDuration(timeoutDuration);

    const errorCallback = vi.fn();
    manager.addOnErrorCallback(errorCallback);

    // Simulate camera starting capture
    cameraHarness.emitPlaybackState("capturing");

    // Advance timer to trigger timeout (fake timers: instant, no real wait)
    vi.advanceTimersByTime(timeoutDuration);

    expect(errorCallback).toHaveBeenCalledWith("timeout");
    expect(cameraHarness.stopFrameCapture).toHaveBeenCalled();
  });

  test("should clear timeout when stopping capture", () => {
    const timeoutDuration = 5000;
    manager.setTimeoutDuration(timeoutDuration);

    const errorCallback = vi.fn();
    manager.addOnErrorCallback(errorCallback);

    // Simulate camera starting capture
    cameraHarness.emitPlaybackState("capturing");

    // Simulate camera stopping capture
    cameraHarness.emitPlaybackState("idle");

    // Advance timer past timeout duration (fake timers: instant)
    vi.advanceTimersByTime(timeoutDuration + 1000);

    expect(errorCallback).not.toHaveBeenCalled();
  });

  test("should not set timeout when timeout duration is null", () => {
    manager.setTimeoutDuration(null);

    const errorCallback = vi.fn();
    manager.addOnErrorCallback(errorCallback);

    // Simulate camera starting capture
    cameraHarness.emitPlaybackState("capturing");

    // Advance timer (fake timers: instant, no real wait)
    vi.advanceTimersByTime(20000);

    expect(errorCallback).not.toHaveBeenCalled();
  });

  test("should reset UI state when timeout occurs", () => {
    const timeoutDuration = 5000;
    manager.setTimeoutDuration(timeoutDuration);

    const uiStateChangedSpy = vi.fn();
    manager.addOnUiStateChangedCallback(uiStateChangedSpy);

    // Simulate camera starting capture
    cameraHarness.emitPlaybackState("capturing");

    // Advance timer to trigger timeout (fake timers: instant)
    vi.advanceTimersByTime(timeoutDuration);

    // Verify UI state was reset
    expect(uiStateChangedSpy).toHaveBeenCalled();
    expect(manager.uiState.key).toBe("INTRO_FRONT_PAGE"); // Initial state after reset
  });

  test("should clear timeout when UI state changes", async () => {
    const timeoutDuration = 5000;
    manager.setTimeoutDuration(timeoutDuration);

    const errorCallback = vi.fn();
    manager.addOnErrorCallback(errorCallback);

    // Setup process result
    const mockProcessResult = createProcessResult({
      inputImageAnalysisResult: {
        processingStatus: "success",
        documentClassInfo: {
          country: "usa",
          type: "dl",
        },
        documentDetectionStatus: "success",
      },
    });
    mockScanningSession.process.mockResolvedValue(mockProcessResult);

    // Start capture and process a frame
    cameraHarness.emitPlaybackState("capturing");
    await cameraHarness.emitFrame(createFakeImageData());

    // Advance timer but not enough to trigger timeout
    vi.advanceTimersByTime(timeoutDuration / 2);

    // Stop capture (this should clear the timeout)
    cameraHarness.emitPlaybackState("idle");

    // Advance timer past where original timeout would have triggered
    vi.advanceTimersByTime(timeoutDuration / 2 + 100);

    // Verify timeout was cleared (error not called)
    expect(errorCallback).not.toHaveBeenCalled();
  });
});

describe("BlinkIdUxManager - state transitions: shared callback contracts", () => {
  beforeEach(() => {
    enableRafAwareFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("logs error message events when UI state changes to an error state", async () => {
    const { manager } = await createBlinkIdTestContext();
    const logErrorMessageEventSpy = vi.spyOn(
      manager.analytics,
      "logErrorMessageEvent",
    );

    logErrorMessageEventSpy.mockClear();
    await applyStabilizedUiStateForContractTest(manager, "BLUR_DETECTED");

    expect(logErrorMessageEventSpy).toHaveBeenCalledWith("EliminateBlur");
  });

  test("triggers short haptic feedback when the RAF loop transitions to an error state", async () => {
    const { manager } = await createBlinkIdTestContext();
    const shortSpy = vi.spyOn(
      manager.getHapticFeedbackManager(),
      "triggerShort",
    );

    shortSpy.mockClear();
    await applyStabilizedUiStateForContractTest(manager, "BLUR_DETECTED");

    expect(shortSpy).toHaveBeenCalled();
  });
});

describe(
  "BlinkIdUxManager - state transitions: intro timing",
  { timeout: 8000 },
  () => {
    let manager: BlinkIdUxManager;
    let cameraHarness: BlinkIdCameraHarness;
    let mockScanningSession: MockScanningSession;

    beforeEach(async () => {
      vi.useFakeTimers();

      const context = await createBlinkIdTestContext({
        sessionSettings: {
          skipImagesWithBlur: true,
        },
      });
      cameraHarness = context.cameraHarness;
      mockScanningSession = context.scanningSession;
      manager = context.manager;
    });

    afterEach(() => {
      manager.reset();
      vi.useRealTimers();
    });

    test("should start with INTRO_FRONT_PAGE state", () => {
      expect(manager.uiState.key).toBe("INTRO_FRONT_PAGE");
    });

    test("should anchor INTRO_FRONT_PAGE duration to capture start", async () => {
      const mockSuccessResult = createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "success",
          documentClassInfo: { country: "usa", type: "dl" },
          documentDetectionStatus: "success",
        },
        resultCompleteness: { scanningStatus: "side-scanned" },
      });
      mockScanningSession.process.mockResolvedValue(mockSuccessResult);

      // Simulate long idle before capture starts without flushing RAF callbacks.
      vi.setSystemTime(Date.now() + 10_000);

      cameraHarness.emitPlaybackState("capturing");
      await cameraHarness.emitFrame(createFakeImageData());
      await tickRaf();

      // Intro should still be active immediately after first captured frame.
      expect(manager.uiState.key).toBe("INTRO_FRONT_PAGE");

      await jumpTime(blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration + 100);
      await cameraHarness.emitFrame(createFakeImageData());
      await tickRaf();
      expect(manager.mappedUiStateKey).toBe("PAGE_CAPTURED");
    });

    test("should maintain INTRO_FRONT_PAGE state during its minDuration even when frames are processed", async () => {
      const uiStateChanges: BlinkIdUiStateKey[] = [];
      const uiStateCallback = vi.fn((state: BlinkIdUiState) => {
        uiStateChanges.push(state.key);
      });

      manager.addOnUiStateChangedCallback(uiStateCallback);

      // Mock process result that would normally trigger a different state
      const mockProcessResult = createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "success",
          documentClassInfo: { country: "usa", type: "dl" },
          documentDetectionStatus: "success",
        },
      });
      mockScanningSession.process.mockResolvedValue(mockProcessResult);

      // Process first frame at 100ms
      await jumpTime(100);
      await cameraHarness.emitFrame(createFakeImageData());
      await tickRaf();

      // UI state should still be INTRO_FRONT_PAGE
      expect(manager.uiState.key).toBe("INTRO_FRONT_PAGE");

      // Process another frame at 500ms
      await jumpTime(400);
      await cameraHarness.emitFrame(createFakeImageData());
      await tickRaf();

      // UI state should still be INTRO_FRONT_PAGE
      expect(manager.uiState.key).toBe("INTRO_FRONT_PAGE");

      // Process another frame at 1500ms (still within intro duration)
      await jumpTime(1000);
      await cameraHarness.emitFrame(createFakeImageData());
      await tickRaf();

      // UI state should still be INTRO_FRONT_PAGE
      expect(manager.uiState.key).toBe("INTRO_FRONT_PAGE");

      // Verify no UI state change callbacks were triggered during intro
      // (the intro state is the initial state, no change from it yet)
      expect(uiStateChanges).not.toContain("BLUR_DETECTED");
      expect(uiStateChanges).not.toContain("GLARE_DETECTED");
    });

    test("should transition to new state after intro duration elapses", async () => {
      const mockProcessResult = createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "success",
          documentClassInfo: { country: "usa", type: "dl" },
          documentDetectionStatus: "success",
          blurDetectionStatus: "detected",
        },
      });
      mockScanningSession.process.mockResolvedValue(mockProcessResult);

      // Process first frame during intro period (before minDuration elapses)
      await cameraHarness.emitFrame(createFakeImageData());
      await tickRaf();

      // First frame is processed without asserting eventual mapped output timing.

      // Advance time past intro duration
      const introDuration = blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration;
      await jumpTime(introDuration + 100);

      // Process another frame after intro duration
      await cameraHarness.emitFrame(createFakeImageData());
      await tickRaf();

      // Candidate state should now be mapped from process result.
      expect(manager.mappedUiStateKey).toBe("BLUR_DETECTED");
    });

    test("should not switch away from intro state before minDuration even with success states", async () => {
      const uiStateChanges: BlinkIdUiStateKey[] = [];
      const uiStateCallback = vi.fn((state: BlinkIdUiState) => {
        uiStateChanges.push(state.key);
      });

      manager.addOnUiStateChangedCallback(uiStateCallback);

      // Mock process result that would trigger PAGE_CAPTURED if allowed
      const mockSuccessResult = createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "success",
          documentClassInfo: { country: "usa", type: "dl" },
          documentDetectionStatus: "success",
        },
        resultCompleteness: { scanningStatus: "side-scanned" },
      });
      mockScanningSession.process.mockResolvedValue(mockSuccessResult);

      // Process a frame during intro duration (before minDuration elapses)
      // The FeedbackStabilizer should block state changes until minDuration passes
      await cameraHarness.emitFrame(createFakeImageData());
      await tickRaf();

      // Should still be INTRO_FRONT_PAGE because minDuration hasn't elapsed yet
      // The FeedbackStabilizer's canShowNewUiState() returns false during intro
      expect(manager.uiState.key).toBe("INTRO_FRONT_PAGE");
      expect(uiStateChanges).not.toContain("PAGE_CAPTURED");
    });

    test("should allow state transition after intro minDuration with success states", async () => {
      const mockSuccessResult = createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "success",
          documentClassInfo: { country: "usa", type: "dl" },
          documentDetectionStatus: "success",
        },
        resultCompleteness: { scanningStatus: "side-scanned" },
      });
      mockScanningSession.process.mockResolvedValue(mockSuccessResult);

      // Process a frame after mapping produces PAGE_CAPTURED.
      await cameraHarness.emitFrame(createFakeImageData());
      await tickRaf();

      // PAGE_CAPTURED should be the mapped candidate
      expect(manager.mappedUiStateKey).toBe("PAGE_CAPTURED");
    });

    test("should not re-anchor intro timer after pending anchor is consumed", async () => {
      const restartStateTimerSpy = vi.spyOn(
        manager.feedbackStabilizer,
        "restartCurrentStateTimer",
      );

      const mockSuccessResult = createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "success",
          documentClassInfo: { country: "usa", type: "dl" },
          documentDetectionStatus: "success",
        },
        resultCompleteness: { scanningStatus: "side-scanned" },
      });
      mockScanningSession.process.mockResolvedValue(mockSuccessResult);

      // First capture transition consumes pending intro anchor.
      cameraHarness.emitPlaybackState("capturing");
      await cameraHarness.emitFrame(createFakeImageData());
      await tickRaf();
      expect(restartStateTimerSpy).toHaveBeenCalledTimes(1);
      expect(manager.uiState.key).toBe("INTRO_FRONT_PAGE");

      await jumpTime(blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration - 100);
      await tickRaf();
      expect(manager.uiState.key).toBe("INTRO_FRONT_PAGE");

      // Toggling capture again should not restart INTRO_FRONT_PAGE timing.
      cameraHarness.emitPlaybackState("idle");
      cameraHarness.emitPlaybackState("capturing");
      await jumpTime(150);
      await cameraHarness.emitFrame(createFakeImageData());
      await tickRaf();

      expect(restartStateTimerSpy).toHaveBeenCalledTimes(1);
      restartStateTimerSpy.mockRestore();
    });

    test("feedbackStabilizer canShowNewUiState should respect intro minDuration", () => {
      // Initially, canShowNewUiState should return false (just started)
      expect(manager.feedbackStabilizer.canShowNewUiState()).toBe(false);

      const baseNow = performance.now();
      const performanceNowSpy = vi
        .spyOn(performance, "now")
        .mockReturnValue(
          baseNow + blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration + 1,
        );

      // After intro duration passes, new states can be shown.
      expect(manager.feedbackStabilizer.canShowNewUiState()).toBe(true);
      performanceNowSpy.mockRestore();
    });
  },
);

describe(
  "BlinkIdUxManager - state transitions: capture flow integration",
  { timeout: 8000 },
  () => {
    let manager: BlinkIdUxManager;
    let cameraHarness: BlinkIdCameraHarness;
    let mockScanningSession: MockScanningSession;

    beforeEach(async () => {
      enableRafAwareFakeTimers();

      const context = await createBlinkIdTestContext();
      cameraHarness = context.cameraHarness;
      mockScanningSession = context.scanningSession;
      manager = context.manager;
    });

    afterEach(() => {
      manager.reset();
      vi.useRealTimers();
    });

    test("should handle successful document capture flow", async () => {
      const mockResult = { someData: "test" };
      const resultCallback = vi.fn();
      const uiStateCallback = vi.fn();

      manager.addOnResultCallback(resultCallback);
      manager.addOnUiStateChangedCallback(uiStateCallback);

      // Mock successful document capture
      const mockProcessResult = createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "success",
          documentClassInfo: { country: "usa", type: "dl" },
          documentDetectionStatus: "success",
        },
        resultCompleteness: { scanningStatus: "document-scanned" },
      });

      mockScanningSession.process.mockResolvedValue(mockProcessResult);
      mockScanningSession.getResult.mockResolvedValue(mockResult);

      cameraHarness.emitPlaybackState("capturing");

      // Simulate frame capture
      await cameraHarness.emitFrame(createFakeImageData());

      // Flush RAF-driven state update
      await tickRaf();
      await vi.advanceTimersByTimeAsync(
        blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration + 100,
      );
      await tickRaf();
      // This describe does not fake `performance.now`, so advance to terminal UI
      // deterministically to assert result lifecycle callbacks.
      await applyStabilizedUiStateForContractTest(manager, "DOCUMENT_CAPTURED");

      // Verify the complete flow
      expect(manager.uiState.key).toBe("DOCUMENT_CAPTURED");
      expect(cameraHarness.stopFrameCapture).toHaveBeenCalled();
      await vi.waitFor(() => {
        expect(mockScanningSession.getResult).toHaveBeenCalled();
        expect(resultCallback).toHaveBeenCalledWith(mockResult);
      });

      // Verify UI state transition callback
      expect(uiStateCallback).toHaveBeenCalledWith(
        expect.objectContaining({ key: "DOCUMENT_CAPTURED" }),
      );
    });

    test("should apply PAGE_CAPTURED to uiState and emit ui state callback", async () => {
      const uiStateCallback = vi.fn();
      manager.addOnUiStateChangedCallback(uiStateCallback);

      await applyStabilizedUiStateForContractTest(manager, "PAGE_CAPTURED");

      expect(manager.uiStateKey).toBe("PAGE_CAPTURED");
      expect(manager.uiState.key).toBe("PAGE_CAPTURED");
      expect(uiStateCallback).toHaveBeenCalledWith(
        expect.objectContaining({ key: "PAGE_CAPTURED" }),
      );
    });

    test("should apply DOCUMENT_CAPTURED to uiState and emit callbacks", async () => {
      const mockResult = { someData: "test" };
      const uiStateCallback = vi.fn();
      const resultCallback = vi.fn();
      manager.addOnUiStateChangedCallback(uiStateCallback);
      manager.addOnResultCallback(resultCallback);
      mockScanningSession.getResult.mockResolvedValue(mockResult);

      await applyStabilizedUiStateForContractTest(manager, "DOCUMENT_CAPTURED");

      expect(manager.uiStateKey).toBe("DOCUMENT_CAPTURED");
      expect(manager.uiState.key).toBe("DOCUMENT_CAPTURED");
      expect(uiStateCallback).toHaveBeenCalledWith(
        expect.objectContaining({ key: "DOCUMENT_CAPTURED" }),
      );
      await vi.waitFor(() => {
        expect(resultCallback).toHaveBeenCalledWith(mockResult);
      });
    });

    test("UNSUPPORTED_DOCUMENT invokes error callback and does not notify uiStateChanged (modal only)", async () => {
      const errorCallback = vi.fn();
      const uiStateChangedCallback = vi.fn();
      manager.addOnErrorCallback(errorCallback);
      manager.addOnUiStateChangedCallback(uiStateChangedCallback);

      await applyStabilizedUiStateForContractTest(
        manager,
        "UNSUPPORTED_DOCUMENT",
      );

      expect(manager.uiState.key).toBe("UNSUPPORTED_DOCUMENT");
      expect(errorCallback).toHaveBeenCalledTimes(1);
      expect(errorCallback).toHaveBeenCalledWith("unsupported_document");
      // Spinner + user guidance are not updated; only the unsupported-document modal opens via error callback.
      expect(uiStateChangedCallback).not.toHaveBeenCalled();
    });

    test(
      "should handle chained states after a side has been captured",
      { timeout: 5000 },
      async () => {
        // Mock process result for a captured side (not the full document)
        const mockProcessResult = createProcessResult({
          inputImageAnalysisResult: {
            documentClassInfo: { country: "usa", type: "dl" },
            documentDetectionStatus: "success",
          },
          resultCompleteness: { scanningStatus: "side-scanned" },
        });

        mockScanningSession.process.mockResolvedValue(mockProcessResult);

        // Simulate frame capture
        await cameraHarness.emitFrame(createFakeImageData());

        // Wait for PAGE_CAPTURED state (SUCCESS_DURATION = 800ms)
        await jumpTime(blinkIdUiStateMap.PAGE_CAPTURED.minDuration + 100);

        // Wait for FLIP_CARD state (TRANSITION_DURATION = 2000ms)
        await jumpTime(blinkIdUiStateMap.FLIP_CARD.minDuration + 100);

        // Wait for INTRO_BACK_PAGE state (INTRO_DURATION = 2000ms)
        await jumpTime(blinkIdUiStateMap.INTRO_BACK_PAGE.minDuration + 100);

        await tickRaf();

        expect(manager.mappedUiStateKey).toBe("PAGE_CAPTURED");

        // Verify camera capture was stopped when PAGE_CAPTURED state was reached
        expect(cameraHarness.stopFrameCapture).toHaveBeenCalled();
      },
    );

    test("should defer DOCUMENT_CAPTURED while INTRO_BACK_PAGE minDuration is active", async () => {
      mockScanningSession.process.mockResolvedValue(
        createProcessResult({
          inputImageAnalysisResult: {
            processingStatus: "success",
            documentClassInfo: { country: "usa", type: "dl" },
            documentDetectionStatus: "success",
          },
          resultCompleteness: { scanningStatus: "document-scanned" },
        }),
      );
      mockScanningSession.getResult.mockResolvedValue({ someData: "done" });

      // Put manager into INTRO_BACK_PAGE through the public API so all internal
      // state (stabilizer, mappedUiStateKey, pendingIntroAnchorKey) is consistent.
      manager.setInitialUiStateKey("INTRO_BACK_PAGE", true);

      cameraHarness.emitPlaybackState("capturing");
      await cameraHarness.emitFrame(createFakeImageData());
      await tickRaf();
      expect(manager.mappedUiStateKey).toBe("DOCUMENT_CAPTURED");

      // Even if document is already scannable, intro step should complete first.
      expect(manager.uiState.key).toBe("INTRO_BACK_PAGE");

      await jumpTime(blinkIdUiStateMap.INTRO_BACK_PAGE.minDuration - 100);
      await tickRaf();
      expect(manager.uiState.key).toBe("INTRO_BACK_PAGE");
    });

    test("scanningStatus 'document-scanned' should map to DOCUMENT_CAPTURED without side-capture chaining", async () => {
      const uiStateChanges: BlinkIdUiStateKey[] = [];
      manager.addOnUiStateChangedCallback((state) => {
        uiStateChanges.push(state.key);
      });

      const mockProcessResult = createProcessResult({
        inputImageAnalysisResult: {
          documentClassInfo: { country: "usa", type: "dl" },
          documentDetectionStatus: "success",
        },
        resultCompleteness: { scanningStatus: "document-scanned" },
      });

      mockScanningSession.process.mockResolvedValue(mockProcessResult);
      mockScanningSession.getResult.mockResolvedValue({ someData: "test" });

      await cameraHarness.emitFrame(createFakeImageData());
      await tickRaf();
      await jumpTime(blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration + 100);
      await tickRaf();

      expect(manager.mappedUiStateKey).toBe("DOCUMENT_CAPTURED");
      expect(uiStateChanges).not.toContain("PAGE_CAPTURED");
      expect(uiStateChanges).not.toContain("FLIP_CARD");
      expect(uiStateChanges).not.toContain("INTRO_BACK_PAGE");
    });

    test("should not chain states when full document is captured", async () => {
      // Mock process result for a fully scanned document
      const mockProcessResult = createProcessResult({
        inputImageAnalysisResult: {
          documentClassInfo: { country: "usa", type: "dl" },
          documentDetectionStatus: "success",
        },
        resultCompleteness: { scanningStatus: "document-scanned" },
      });

      mockScanningSession.process.mockResolvedValue(mockProcessResult);
      mockScanningSession.getResult.mockResolvedValue({ someData: "test" });

      // Simulate frame capture
      await cameraHarness.emitFrame(createFakeImageData());

      expect(manager.mappedUiStateKey).toBe("DOCUMENT_CAPTURED");

      // Verify camera capture was stopped when DOCUMENT_CAPTURED state was reached
      expect(cameraHarness.stopFrameCapture).toHaveBeenCalled();
    });

    test("should not trigger document capture flow for incomplete results", async () => {
      const resultCallback = vi.fn();
      manager.addOnResultCallback(resultCallback);

      // Mock incomplete document detection
      const mockProcessResult = createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "success",
          documentClassInfo: { country: "usa", type: "dl" },
          documentDetectionStatus: "failed",
        },
      });

      mockScanningSession.process.mockResolvedValue(mockProcessResult);

      // Simulate frame capture
      await cameraHarness.emitFrame(createFakeImageData());

      await tickRaf();

      // Verify no result processing occurred
      expect(mockScanningSession.getResult).not.toHaveBeenCalled();
      expect(resultCallback).not.toHaveBeenCalled();
      expect(mockScanningSession.delete).not.toHaveBeenCalled();
    });

    test("should dedupe PAGE_CAPTURED queue entries when multiple frames map to side-scanned", async () => {
      const mockProcessResult = createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "success",
          documentClassInfo: { country: "usa", type: "dl" },
          documentDetectionStatus: "success",
        },
        resultCompleteness: { scanningStatus: "side-scanned" },
      });
      mockScanningSession.process.mockResolvedValue(mockProcessResult);

      await cameraHarness.emitFrame(createFakeImageData());
      await cameraHarness.emitFrame(createFakeImageData());
      await tickRaf();

      const pageCapturedQueueEntries = manager.feedbackStabilizer
        .getSingleEventQueue()
        .filter((event) => event.key === "PAGE_CAPTURED");

      // Two frames may map to PAGE_CAPTURED, but queue should dedupe to a single entry.
      expect(vi.mocked(mockScanningSession.process).mock.calls.length).toBe(2);
      expect(pageCapturedQueueEntries.length).toBe(1);
      expect(manager.mappedUiStateKey).toBe("PAGE_CAPTURED");
    });

    test("should skip overlapping process calls while previous frame is still processing", async () => {
      let resolveProcess!: (
        value: ReturnType<typeof createProcessResult>,
      ) => void;
      const pendingProcessResult = new Promise<
        ReturnType<typeof createProcessResult>
      >((resolve) => {
        resolveProcess = resolve;
      });

      const resolvedProcessResult = createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "success",
          documentClassInfo: { country: "usa", type: "dl" },
          documentDetectionStatus: "success",
        },
      });

      mockScanningSession.process.mockImplementationOnce(
        async () => pendingProcessResult,
      );

      const firstFramePromise = cameraHarness.emitFrame(createFakeImageData());
      const secondFrameResult = await cameraHarness.emitFrame(
        createFakeImageData(),
      );

      // Second frame should be dropped by busy guard while first frame is in flight.
      expect(secondFrameResult).toBeUndefined();
      expect(mockScanningSession.process).toHaveBeenCalledTimes(1);

      resolveProcess(resolvedProcessResult);
      await firstFramePromise;
      await tickRaf();

      expect(mockScanningSession.process).toHaveBeenCalledTimes(1);
    });

    test("reports non-fatal pinglets when frame processing rejects with a recoverable error", async () => {
      mockScanningSession.process.mockRejectedValue(
        new Error("Worker process failure"),
      );

      await expect(
        cameraHarness.emitFrame(createFakeImageData()),
      ).rejects.toThrow("Worker process failure");

      expect(mockScanningSession.ping).toHaveBeenCalledWith(
        expect.objectContaining({
          schemaName: "ping.error",
          data: expect.objectContaining({
            errorType: "NonFatal",
            errorMessage: "ux.frameCapture: Worker process failure",
          }),
        }),
      );
      expect(mockScanningSession.sendPinglets).toHaveBeenCalledTimes(1);
    });

    test("reports non-fatal pinglets when frame processing rejects with a WASM runtime error", async () => {
      mockScanningSession.process.mockRejectedValue(
        new Error("RuntimeError: Out of bounds memory access"),
      );

      await expect(
        cameraHarness.emitFrame(createFakeImageData()),
      ).rejects.toThrow("RuntimeError: Out of bounds memory access");

      expect(mockScanningSession.ping).toHaveBeenCalledWith(
        expect.objectContaining({
          schemaName: "ping.error",
          data: expect.objectContaining({
            errorType: "NonFatal",
            errorMessage:
              "ux.frameCapture: RuntimeError: Out of bounds memory access",
          }),
        }),
      );
      expect(mockScanningSession.sendPinglets).toHaveBeenCalledTimes(1);
    });

    test("reports non-fatal pinglets when frame processing rejects with a frame transfer error", async () => {
      const frameTransferError = new Error(
        "Failed to transfer frame to worker",
      );
      frameTransferError.name = "FrameTransferError";

      mockScanningSession.process.mockRejectedValue(frameTransferError);

      await expect(
        cameraHarness.emitFrame(createFakeImageData()),
      ).rejects.toThrow("Failed to transfer frame to worker");

      expect(mockScanningSession.ping).toHaveBeenCalledWith(
        expect.objectContaining({
          schemaName: "ping.error",
          data: expect.objectContaining({
            errorType: "NonFatal",
            errorMessage: "ux.frameCapture: Failed to transfer frame to worker",
          }),
        }),
      );
      expect(mockScanningSession.sendPinglets).toHaveBeenCalledTimes(1);
    });

    test("should skip further process calls after terminal document capture", async () => {
      const mockProcessResult = createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "success",
          documentClassInfo: { country: "usa", type: "dl" },
          documentDetectionStatus: "success",
        },
        resultCompleteness: { scanningStatus: "document-scanned" },
      });

      mockScanningSession.process.mockResolvedValue(mockProcessResult);
      mockScanningSession.getResult.mockResolvedValue({ someData: "done" });

      await cameraHarness.emitFrame(createFakeImageData());
      await tickRaf();
      await cameraHarness.emitFrame(createFakeImageData());

      expect(mockScanningSession.process).toHaveBeenCalledTimes(1);
    });

    test("should handle timeout during document capture", async () => {
      const errorCallback = vi.fn();
      manager.addOnErrorCallback(errorCallback);

      // Set a short timeout
      manager.setTimeoutDuration(1000);

      // Simulate starting capture
      cameraHarness.emitPlaybackState("capturing");

      // Advance time past timeout
      await vi.advanceTimersByTimeAsync(1100);

      // Verify timeout handling
      expect(cameraHarness.stopFrameCapture).toHaveBeenCalled();
      expect(errorCallback).toHaveBeenCalledWith("timeout");
      expect(mockScanningSession.getResult).not.toHaveBeenCalled();
    });

    test("should fire result_retrieval_failed error when getResult rejects", async () => {
      const errorCallback = vi.fn();
      const resultCallback = vi.fn();
      manager.addOnErrorCallback(errorCallback);
      manager.addOnResultCallback(resultCallback);

      mockScanningSession.getResult.mockRejectedValue(
        new Error("Worker RPC failure"),
      );

      await applyStabilizedUiStateForContractTest(manager, "DOCUMENT_CAPTURED");

      await vi.waitFor(() => {
        expect(mockScanningSession.getResult).toHaveBeenCalled();
        // error callback fired with the dedicated error type
        expect(errorCallback).toHaveBeenCalledWith("result_retrieval_failed");
        // result callback must NOT fire — no result was retrieved
        expect(resultCallback).not.toHaveBeenCalled();
        expect(mockScanningSession.ping).toHaveBeenCalledWith(
          expect.objectContaining({
            schemaName: "ping.error",
            data: expect.objectContaining({
              errorType: "NonFatal",
              errorMessage: "ux.getSessionResult: Worker RPC failure",
            }),
          }),
        );
        expect(mockScanningSession.sendPinglets).toHaveBeenCalledTimes(1);
      });
    });
  },
);
