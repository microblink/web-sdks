/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { beforeEach, describe, expect, test, vi } from "vitest";
import type { BlinkIdScanningResult } from "@microblink/blinkid-core";
import {
  createMockImageData,
  enableRafAwareFakeTimers,
  setupDestroyableTeardown,
} from "@microblink/test-utils";
import { advanceAndFlushUi } from "@microblink/test-utils/vitest/timers";
import { blinkIdUiStateMap } from "./blinkid-ui-state";
import type { BlinkIdUxManager } from "./BlinkIdUxManager";
import {
  createProcessResult,
  createScanningResult,
  createSessionSettings,
} from "./__testdata/blinkidTestFixtures";
import {
  createBlinkIdIntegrationContext,
  type CreateBlinkIdIntegrationContextOptions,
} from "./test-helpers.integration";

/**
 * Test file role:
 * - Smoke-tests public BlinkId scanning flow end-to-end with behavioral fakes.
 * - Covers frame processing, UI progression, timeout lifecycle, and result/error callbacks.
 * - Keeps mocking light and avoids internal-state forcing.
 */

const mockSleep = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock("@microblink/ux-common/utils", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@microblink/ux-common/utils")>();
  return {
    ...actual,
    sleep: mockSleep,
  };
});

describe("BlinkIdUxManager integration smoke", () => {
  const trackManager = setupDestroyableTeardown<BlinkIdUxManager>();

  beforeEach(() => {
    vi.clearAllMocks();
    enableRafAwareFakeTimers();
  });

  const defaultContextOptions: CreateBlinkIdIntegrationContextOptions = {
    fakeCameraOptions: {
      initialState: {
        selectedCamera: { name: "default-camera", facingMode: "back" as const },
        videoResolution: { width: 1920, height: 1080 },
      },
    },
    sessionSettings: createSessionSettings(),
    showDemoOverlay: false,
    showProductionOverlay: false,
  };

  test("full scan lifecycle emits result", async () => {
    const processResult = createProcessResult({
      inputImageAnalysisResult: {
        processingStatus: "success",
        documentClassInfo: { country: "usa", type: "dl" },
        documentDetectionStatus: "success",
      },
      resultCompleteness: { scanningStatus: "document-scanned" },
    });
    const result = createScanningResult();
    const context = await createBlinkIdIntegrationContext({
      ...defaultContextOptions,
      sessionOverrides: {
        process: vi.fn().mockResolvedValue(processResult),
        getResult: vi.fn().mockResolvedValue(result),
      },
    });
    const manager = trackManager(context.manager);

    const resultSpy = vi.fn();
    manager.addOnResultCallback(resultSpy);

    context.fakeCameraManager.emitPlaybackState("capturing");
    await context.fakeCameraManager.emitFrame(createMockImageData());
    await advanceAndFlushUi(
      blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration + 100,
    );

    await vi.waitFor(() => {
      expect(context.fakeCameraManager.stopFrameCapture).toHaveBeenCalled();
      expect(context.scanningSession.getResult).toHaveBeenCalled();
      expect(resultSpy).toHaveBeenCalledWith(result);
    });
  });

  test("side-scanned flow chains through transition and intro states", async () => {
    const sideScannedProcessResult = createProcessResult({
      inputImageAnalysisResult: {
        processingStatus: "success",
        documentClassInfo: { country: "usa", type: "dl" },
        documentDetectionStatus: "success",
      },
      resultCompleteness: { scanningStatus: "side-scanned" },
    });
    const context = await createBlinkIdIntegrationContext({
      ...defaultContextOptions,
      sessionSettings: createSessionSettings({ skipImagesWithBlur: true }),
      sessionOverrides: {
        process: vi.fn().mockResolvedValue(sideScannedProcessResult),
      },
    });
    const manager = trackManager(context.manager);

    const uiStates: string[] = [];
    manager.addOnUiStateChangedCallback((state) => {
      uiStates.push(state.key);
    });

    context.fakeCameraManager.emitPlaybackState("capturing");
    await context.fakeCameraManager.emitFrame(createMockImageData());
    await advanceAndFlushUi(
      blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration +
        blinkIdUiStateMap.PAGE_CAPTURED.minDuration +
        blinkIdUiStateMap.FLIP_CARD.minDuration +
        200,
    );

    expect(context.fakeCameraManager.stopFrameCapture).toHaveBeenCalled();
    expect(context.fakeCameraManager.startFrameCapture).toHaveBeenCalled();
    expect(uiStates).toContain("PAGE_CAPTURED");
    expect(uiStates).toContain("FLIP_CARD");
    expect(uiStates).toContain("INTRO_BACK_PAGE");
  });

  test("timeout lifecycle starts on capture and clears on idle", async () => {
    const context = await createBlinkIdIntegrationContext({
      ...defaultContextOptions,
    });
    const manager = trackManager(context.manager);
    manager.setTimeoutDuration(100);

    const errorSpy = vi.fn();
    manager.addOnErrorCallback(errorSpy);

    context.fakeCameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(100);
    expect(errorSpy).toHaveBeenCalledWith("timeout");
    expect(context.fakeCameraManager.stopFrameCapture).toHaveBeenCalled();

    errorSpy.mockClear();
    context.fakeCameraManager.emitPlaybackState("capturing");
    context.fakeCameraManager.emitPlaybackState("idle");
    await vi.advanceTimersByTimeAsync(100);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  test("busy guard drops overlapping frames during processing", async () => {
    let resolveFirst!: (value: ReturnType<typeof createProcessResult>) => void;
    const pendingProcess = new Promise<ReturnType<typeof createProcessResult>>(
      (resolve) => {
        resolveFirst = resolve;
      },
    );
    const context = await createBlinkIdIntegrationContext({
      ...defaultContextOptions,
      sessionOverrides: {
        process: vi.fn().mockReturnValueOnce(pendingProcess),
      },
    });
    const manager = trackManager(context.manager);

    const firstFramePromise = context.fakeCameraManager.emitFrame(
      createMockImageData(),
    );
    const secondFrameResult = await context.fakeCameraManager.emitFrame(
      createMockImageData(),
    );

    expect(secondFrameResult).toBeUndefined();
    expect(context.scanningSession.process).toHaveBeenCalledTimes(1);

    resolveFirst(
      createProcessResult({
        inputImageAnalysisResult: { processingStatus: "detection-failed" },
      }),
    );
    await firstFramePromise;
    manager.reset();
  });

  test("result retrieval failure emits error and skips result callback", async () => {
    const processResult = createProcessResult({
      inputImageAnalysisResult: {
        processingStatus: "success",
        documentClassInfo: { country: "usa", type: "dl" },
        documentDetectionStatus: "success",
      },
      resultCompleteness: { scanningStatus: "document-scanned" },
    });
    const context = await createBlinkIdIntegrationContext({
      ...defaultContextOptions,
      sessionOverrides: {
        process: vi.fn().mockResolvedValue(processResult),
        getResult: vi.fn().mockRejectedValue(new Error("Worker RPC failure")),
      },
    });
    const manager = trackManager(context.manager);

    const resultSpy = vi.fn();
    const errorSpy = vi.fn();
    manager.addOnResultCallback(resultSpy);
    manager.addOnErrorCallback(errorSpy);

    context.fakeCameraManager.emitPlaybackState("capturing");
    await context.fakeCameraManager.emitFrame(createMockImageData());
    await advanceAndFlushUi(
      blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration + 100,
    );

    await vi.waitFor(() => {
      expect(context.scanningSession.getResult).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith("result_retrieval_failed");
      expect(resultSpy).not.toHaveBeenCalled();
    });
  });
});
