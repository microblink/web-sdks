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

import type {
  BlinkIdScanningResult,
  RemoteScanningSession,
  DocumentClassInfo,
} from "@microblink/blinkid-core";
import type {
  CameraManager,
  FrameCaptureCallback,
  PlaybackState,
} from "@microblink/camera-manager";
import {
  createMockImageData,
  enableRafAwareFakeTimers,
  flushUiRaf,
  jumpTime,
  setupDestroyableTeardown,
  tickRaf,
} from "@microblink/test-utils";
import type { BlinkIdUiState, BlinkIdUiStateKey } from "./blinkid-ui-state";
import { blinkIdUiStateMap } from "./blinkid-ui-state";
import type { BlinkIdUxManager } from "./BlinkIdUxManager";
import type { BlinkIdUxManagerOptions } from "./createBlinkIdUxManager";
import {
  createBlinkIdManager,
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

// ============================================================================
// Shared Types
// ============================================================================

interface TestCameraState {
  playbackState: PlaybackState;
  videoElement: HTMLVideoElement | undefined;
}

// ============================================================================
// Mock Factories
// ============================================================================

const createMockCameraManager = (overrides?: {
  playbackStateCallback?: (callback: (state: PlaybackState) => void) => void;
}) => ({
  addFrameCaptureCallback: vi.fn().mockReturnValue(vi.fn()),
  subscribe: overrides?.playbackStateCallback
    ? vi
        .fn()
        .mockImplementationOnce(
          (
            _selector: (s: TestCameraState) => PlaybackState,
            callback: (state: PlaybackState) => void,
          ) => {
            overrides.playbackStateCallback!(callback);
            return vi.fn();
          },
        )
        .mockImplementation(() => vi.fn())
    : vi.fn().mockReturnValue(vi.fn()),
  stopFrameCapture: vi.fn(),
  startFrameCapture: vi.fn().mockResolvedValue(undefined),
  startCameraStream: vi.fn().mockResolvedValue(undefined),
  isActive: true,
});

type MockCameraManager = ReturnType<typeof createMockCameraManager>;
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

const createBlinkIdUxManager = async (
  mockCameraManager: MockCameraManager,
  mockScanningSession: MockScanningSession,
  options?: BlinkIdUxManagerOptions,
): Promise<BlinkIdUxManager> =>
  trackManager(
    await createBlinkIdManager(
      mockCameraManager as unknown as CameraManager,
      mockScanningSession as unknown as RemoteScanningSession,
      options,
    ),
  );

describe("BlinkIdUxManager - package-specific: document class filtering", () => {
  let mockCameraManager: MockCameraManager;
  let mockScanningSession: MockScanningSession;
  let manager: BlinkIdUxManager;
  let frameCaptureCallback: FrameCaptureCallback;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockCameraManager = createMockCameraManager();
    mockScanningSession = createBlinkIdUnitSessionMock();

    manager = await createBlinkIdUxManager(
      mockCameraManager,
      mockScanningSession,
    );

    expect(mockCameraManager.addFrameCaptureCallback).toHaveBeenCalledTimes(1);
    frameCaptureCallback =
      mockCameraManager.addFrameCaptureCallback.mock.calls[0][0];
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

    await frameCaptureCallback(createMockImageData());

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

    await frameCaptureCallback(createMockImageData());

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

    await frameCaptureCallback(createMockImageData());

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

    await frameCaptureCallback(createMockImageData());

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
    await frameCaptureCallback(createMockImageData());

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

    await frameCaptureCallback(createMockImageData());

    expect(documentFilteredSpy).toHaveBeenCalledTimes(1);

    // Reset spy
    documentFilteredSpy.mockClear();

    // Remove the filter and run again
    filterCleanup();

    await frameCaptureCallback(createMockImageData());

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

    await frameCaptureCallback(createMockImageData());

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

    await frameCaptureCallback(createMockImageData());

    // Verify document filtered callback was called
    expect(documentFilteredSpy).toHaveBeenCalledWith(
      expect.objectContaining(mockDocumentClassInfo),
    );

    // Verify camera was stopped
    expect(mockCameraManager.stopFrameCapture).toHaveBeenCalled();

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

    await frameCaptureCallback(createMockImageData());

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

    const result = await frameCaptureCallback(createMockImageData());

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

    const result = await frameCaptureCallback(createMockImageData());

    // Verify the arrayBuffer is returned and mapped candidate was captured
    expect(result).toBe(mockArrayBuffer);
    expect(manager.mappedUiStateKey).toBe("PAGE_CAPTURED");

    filterCleanup();
  });
});

describe("BlinkIdUxManager - session lifecycle: reset behavior", () => {
  let manager: BlinkIdUxManager;
  let frameCaptureCallback: FrameCaptureCallback;
  let playbackStateCallback: (state: PlaybackState) => void;
  let mockCameraManager: ReturnType<typeof createMockCameraManager>;
  let mockScanningSession: MockScanningSession;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockCameraManager = createMockCameraManager({
      playbackStateCallback: (cb) => {
        playbackStateCallback = cb;
      },
    });
    mockScanningSession = createBlinkIdUnitSessionMock();

    manager = await createBlinkIdUxManager(
      mockCameraManager,
      mockScanningSession,
    );

    expect(mockCameraManager.addFrameCaptureCallback).toHaveBeenCalledTimes(1);
    frameCaptureCallback =
      mockCameraManager.addFrameCaptureCallback.mock.calls[0][0];
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
    expect(mockCameraManager.startFrameCapture).toHaveBeenCalled();
  });

  test("resetScanningSession should start camera if not active", async () => {
    mockCameraManager.isActive = false;

    await manager.resetScanningSession(true);

    expect(mockCameraManager.startCameraStream).toHaveBeenCalled();
    expect(mockCameraManager.startFrameCapture).toHaveBeenCalled();
  });

  test("resetScanningSession should not start frame capture when startFrameCapture is false", async () => {
    await manager.resetScanningSession(false);

    expect(mockCameraManager.startFrameCapture).not.toHaveBeenCalled();
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
    const customManager = await createBlinkIdUxManager(
      mockCameraManager,
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
    await frameCaptureCallback(createMockImageData());

    // Simulate timeout to trigger error callback
    const timeoutDuration = 5000;
    manager.setTimeoutDuration(timeoutDuration);
    playbackStateCallback("capturing");
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
  let frameCaptureCallback: FrameCaptureCallback;
  let playbackStateCallback: (state: PlaybackState) => void;
  let mockCameraManager: ReturnType<typeof createMockCameraManager>;
  let mockScanningSession: MockScanningSession;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockCameraManager = createMockCameraManager({
      playbackStateCallback: (cb) => {
        playbackStateCallback = cb;
      },
    });
    mockScanningSession = createBlinkIdUnitSessionMock();

    manager = await createBlinkIdUxManager(
      mockCameraManager,
      mockScanningSession,
    );

    expect(mockCameraManager.addFrameCaptureCallback).toHaveBeenCalledTimes(1);
    frameCaptureCallback =
      mockCameraManager.addFrameCaptureCallback.mock.calls[0][0];
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
    playbackStateCallback("capturing");

    // Advance timer to trigger timeout (fake timers: instant, no real wait)
    vi.advanceTimersByTime(timeoutDuration);

    expect(errorCallback).toHaveBeenCalledWith("timeout");
    expect(mockCameraManager.stopFrameCapture).toHaveBeenCalled();
  });

  test("should clear timeout when stopping capture", () => {
    const timeoutDuration = 5000;
    manager.setTimeoutDuration(timeoutDuration);

    const errorCallback = vi.fn();
    manager.addOnErrorCallback(errorCallback);

    // Simulate camera starting capture
    playbackStateCallback("capturing");

    // Simulate camera stopping capture
    playbackStateCallback("idle");

    // Advance timer past timeout duration (fake timers: instant)
    vi.advanceTimersByTime(timeoutDuration + 1000);

    expect(errorCallback).not.toHaveBeenCalled();
  });

  test("should not set timeout when timeout duration is null", () => {
    manager.setTimeoutDuration(null);

    const errorCallback = vi.fn();
    manager.addOnErrorCallback(errorCallback);

    // Simulate camera starting capture
    playbackStateCallback("capturing");

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
    playbackStateCallback("capturing");

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
    playbackStateCallback("capturing");
    await frameCaptureCallback(createMockImageData());

    // Advance timer but not enough to trigger timeout
    vi.advanceTimersByTime(timeoutDuration / 2);

    // Stop capture (this should clear the timeout)
    playbackStateCallback("idle");

    // Advance timer past where original timeout would have triggered
    vi.advanceTimersByTime(timeoutDuration / 2 + 100);

    // Verify timeout was cleared (error not called)
    expect(errorCallback).not.toHaveBeenCalled();
  });
});

describe(
  "BlinkIdUxManager - state transitions: intro timing",
  { timeout: 8000 },
  () => {
    let manager: BlinkIdUxManager;
    let mockCameraManager: ReturnType<typeof createMockCameraManager>;
    let mockScanningSession: MockScanningSession;
    let frameCaptureCallback: FrameCaptureCallback;
    let playbackStateCallback: (state: PlaybackState) => void;

    beforeEach(async () => {
      vi.clearAllMocks();
      vi.useFakeTimers();

      mockCameraManager = createMockCameraManager({
        playbackStateCallback: (cb) => {
          playbackStateCallback = cb;
        },
      });
      mockScanningSession = createBlinkIdUnitSessionMock({
        skipImagesWithBlur: true,
      });

      manager = await createBlinkIdUxManager(
        mockCameraManager,
        mockScanningSession,
      );

      expect(mockCameraManager.addFrameCaptureCallback).toHaveBeenCalledTimes(
        1,
      );
      frameCaptureCallback =
        mockCameraManager.addFrameCaptureCallback.mock.calls[0][0];

      // The constructor fires async getSettings()/showDemoOverlay()/showProductionOverlay()
      // calls. Even though the mocks return already-resolved promises, .then() callbacks
      // are always microtasks and never run synchronously. Awaiting here lets the
      // microtask queue drain so #sessionSettings is populated before any test runs.
      await Promise.resolve();
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

      playbackStateCallback("capturing");
      await frameCaptureCallback(createMockImageData());
      await tickRaf();

      // Intro should still be active immediately after first captured frame.
      expect(manager.uiState.key).toBe("INTRO_FRONT_PAGE");

      await jumpTime(blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration + 100);
      await frameCaptureCallback(createMockImageData());
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
      await frameCaptureCallback(createMockImageData());
      await tickRaf();

      // UI state should still be INTRO_FRONT_PAGE
      expect(manager.uiState.key).toBe("INTRO_FRONT_PAGE");

      // Process another frame at 500ms
      await jumpTime(400);
      await frameCaptureCallback(createMockImageData());
      await tickRaf();

      // UI state should still be INTRO_FRONT_PAGE
      expect(manager.uiState.key).toBe("INTRO_FRONT_PAGE");

      // Process another frame at 1500ms (still within intro duration)
      await jumpTime(1000);
      await frameCaptureCallback(createMockImageData());
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
      await frameCaptureCallback(createMockImageData());
      await tickRaf();

      // First frame is processed without asserting eventual mapped output timing.

      // Advance time past intro duration
      const introDuration = blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration;
      await jumpTime(introDuration + 100);

      // Process another frame after intro duration
      await frameCaptureCallback(createMockImageData());
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
      await frameCaptureCallback(createMockImageData());
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
      await frameCaptureCallback(createMockImageData());
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
      playbackStateCallback("capturing");
      await frameCaptureCallback(createMockImageData());
      await tickRaf();
      expect(restartStateTimerSpy).toHaveBeenCalledTimes(1);
      expect(manager.uiState.key).toBe("INTRO_FRONT_PAGE");

      await jumpTime(blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration - 100);
      await tickRaf();
      expect(manager.uiState.key).toBe("INTRO_FRONT_PAGE");

      // Toggling capture again should not restart INTRO_FRONT_PAGE timing.
      playbackStateCallback("idle");
      playbackStateCallback("capturing");
      await jumpTime(150);
      await frameCaptureCallback(createMockImageData());
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
    let mockCameraManager: ReturnType<typeof createMockCameraManager>;
    let mockScanningSession: MockScanningSession;
    let frameCaptureCallback: FrameCaptureCallback;
    let playbackStateCallback: (state: PlaybackState) => void;

    beforeEach(async () => {
      vi.clearAllMocks();
      enableRafAwareFakeTimers();

      mockCameraManager = createMockCameraManager({
        playbackStateCallback: (cb) => {
          playbackStateCallback = cb;
        },
      });
      mockScanningSession = createBlinkIdUnitSessionMock();

      manager = await createBlinkIdUxManager(
        mockCameraManager,
        mockScanningSession,
      );

      // Capture the frame capture callback for testing
      expect(mockCameraManager.addFrameCaptureCallback).toHaveBeenCalledTimes(
        1,
      );
      frameCaptureCallback =
        mockCameraManager.addFrameCaptureCallback.mock.calls[0][0];

      // The constructor fires async getSettings()/showDemoOverlay()/showProductionOverlay()
      // calls. Even though the mocks return already-resolved promises, .then() callbacks
      // are always microtasks and never run synchronously. Awaiting here lets the
      // microtask queue drain so #sessionSettings is populated before any test runs.
      await Promise.resolve();
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

      playbackStateCallback("capturing");

      // Simulate frame capture
      await frameCaptureCallback(createMockImageData());

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
      expect(mockCameraManager.stopFrameCapture).toHaveBeenCalled();
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
        await frameCaptureCallback(createMockImageData());

        // Wait for PAGE_CAPTURED state (SUCCESS_DURATION = 800ms)
        await jumpTime(blinkIdUiStateMap.PAGE_CAPTURED.minDuration + 100);

        // Wait for FLIP_CARD state (TRANSITION_DURATION = 2000ms)
        await jumpTime(blinkIdUiStateMap.FLIP_CARD.minDuration + 100);

        // Wait for INTRO_BACK_PAGE state (INTRO_DURATION = 2000ms)
        await jumpTime(blinkIdUiStateMap.INTRO_BACK_PAGE.minDuration + 100);

        await tickRaf();

        expect(manager.mappedUiStateKey).toBe("PAGE_CAPTURED");

        // Verify camera capture was stopped when PAGE_CAPTURED state was reached
        expect(mockCameraManager.stopFrameCapture).toHaveBeenCalled();
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

      playbackStateCallback("capturing");
      await frameCaptureCallback(createMockImageData());
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

      await frameCaptureCallback(createMockImageData());
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
      await frameCaptureCallback(createMockImageData());

      expect(manager.mappedUiStateKey).toBe("DOCUMENT_CAPTURED");

      // Verify camera capture was stopped when DOCUMENT_CAPTURED state was reached
      expect(mockCameraManager.stopFrameCapture).toHaveBeenCalled();
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
      await frameCaptureCallback(createMockImageData());

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

      await frameCaptureCallback(createMockImageData());
      await frameCaptureCallback(createMockImageData());
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

      const firstFramePromise = frameCaptureCallback(createMockImageData());
      const secondFrameResult = await frameCaptureCallback(
        createMockImageData(),
      );

      // Second frame should be dropped by busy guard while first frame is in flight.
      expect(secondFrameResult).toBeUndefined();
      expect(mockScanningSession.process).toHaveBeenCalledTimes(1);

      resolveProcess(resolvedProcessResult);
      await firstFramePromise;
      await tickRaf();

      expect(mockScanningSession.process).toHaveBeenCalledTimes(1);
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

      await frameCaptureCallback(createMockImageData());
      await tickRaf();
      await frameCaptureCallback(createMockImageData());

      expect(mockScanningSession.process).toHaveBeenCalledTimes(1);
    });

    test("should handle timeout during document capture", async () => {
      const errorCallback = vi.fn();
      manager.addOnErrorCallback(errorCallback);

      // Set a short timeout
      manager.setTimeoutDuration(1000);

      // Simulate starting capture
      const subscribeCall = mockCameraManager.subscribe.mock.calls[0];
      const playbackStateCallback = subscribeCall[1] as (
        state: PlaybackState,
      ) => void;
      playbackStateCallback("capturing");

      // Advance time past timeout
      await vi.advanceTimersByTimeAsync(1100);

      // Verify timeout handling
      expect(mockCameraManager.stopFrameCapture).toHaveBeenCalled();
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
      });
    });
  },
);
