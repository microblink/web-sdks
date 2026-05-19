/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  BlinkIdScanningResult,
  BlinkIdSessionSettings,
  DeviceInfo,
  ProcessResultWithBuffer,
  RemoteScanningSession,
  ScanningStatus,
} from "@microblink/blinkid-core";
import type { CameraManager } from "@microblink/camera-manager";
import { createFakeImageData } from "@microblink/test-utils/mocks/imageData";
import {
  advanceAndFlushUi,
  createFakeScanningSession,
  enableRafAwareFakeTimers,
  FakeCameraManager,
  flushUiRaf,
} from "@microblink/test-utils/vitest";
import type { PartialDeep } from "type-fest";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { BlinkIdTimeoutConfiguration } from "./BlinkIdTimeoutConfiguration";
import type {
  BlinkIdFrameProcessCallback,
  BlinkIdProgress,
} from "./BlinkIdUxManager";
import { BlinkIdUxManager } from "./BlinkIdUxManager";
import { blankProcessResult } from "./__testdata/blankProcessResult";
import { blinkIdUiStateMap } from "./blinkid-ui-state";

const sessionSettings = {
  inputImageSource: "video",
  scanningMode: "automatic",
  scanningSettings: {},
} as BlinkIdSessionSettings;

const createProcessResult = (
  overrides: PartialDeep<ProcessResultWithBuffer> = {},
): ProcessResultWithBuffer => {
  const inputImageAnalysisResult = (overrides.inputImageAnalysisResult ??
    {}) as Partial<ProcessResultWithBuffer["inputImageAnalysisResult"]>;
  const resultCompleteness = (overrides.resultCompleteness ?? {}) as Partial<
    ProcessResultWithBuffer["resultCompleteness"]
  >;
  const arrayBuffer = overrides.arrayBuffer as ArrayBuffer | undefined;

  return {
    ...blankProcessResult,
    ...overrides,
    inputImageAnalysisResult: {
      ...blankProcessResult.inputImageAnalysisResult,
      ...inputImageAnalysisResult,
      documentClassInfo: {
        ...blankProcessResult.inputImageAnalysisResult.documentClassInfo,
        ...inputImageAnalysisResult.documentClassInfo,
      },
    } as ProcessResultWithBuffer["inputImageAnalysisResult"],
    resultCompleteness: {
      ...blankProcessResult.resultCompleteness,
      ...resultCompleteness,
    } as ProcessResultWithBuffer["resultCompleteness"],
    arrayBuffer: arrayBuffer ?? new ArrayBuffer(8),
  };
};

const frontPageNotInFrameResult = () => createProcessResult();

const cameraTooFarResult = () =>
  createProcessResult({
    inputImageAnalysisResult: {
      documentDetectionStatus: "camera-too-far",
    },
  });

const sideScannedResult = () =>
  createProcessResult({
    inputImageAnalysisResult: {
      processingStatus: "success",
      documentDetectionStatus: "success",
      documentRotation: "zero",
      documentClassInfo: {
        country: "usa",
        type: "dl",
      },
    },
  });

const barcodeNotInFrameResult = () =>
  createProcessResult({
    inputImageAnalysisResult: {
      processingStatus: "barcode-detection-failed",
      documentDetectionStatus: "success",
    },
  });

const partiallySupportedBarcodeResult = () =>
  createProcessResult({
    inputImageAnalysisResult: {
      processingStatus: "barcode-recognition-failed",
    },
    resultCompleteness: {
      barcode: {
        status: "failed",
        attribute: "mandatory",
        parsed: false,
        parsingSupported: false,
      },
    },
  });

const createManager = (
  timeoutConfiguration?: Partial<BlinkIdTimeoutConfiguration>,
) => {
  const cameraManager = new FakeCameraManager();
  const scanningSession = createFakeScanningSession<
    ProcessResultWithBuffer,
    BlinkIdSessionSettings,
    BlinkIdScanningResult,
    ScanningStatus
  >({
    settings: sessionSettings,
    processResult: frontPageNotInFrameResult(),
    scanningStatus: "scanning-side-in-progress",
  });
  let latestProgress: BlinkIdProgress | undefined;

  const manager = new BlinkIdUxManager(
    cameraManager as unknown as CameraManager,
    scanningSession as unknown as RemoteScanningSession,
    { timeoutConfiguration },
    sessionSettings,
    false,
    false,
    {} as DeviceInfo,
  );

  manager.addOnProgressCallback((progress) => {
    latestProgress = progress;
  });

  return {
    cameraManager,
    scanningSession,
    manager,
    getLatestProgress: () => {
      expect(latestProgress).toBeDefined();
      return latestProgress!;
    },
  };
};

describe("BlinkIdUxManager timeout behavior", () => {
  const managers = new Set<BlinkIdUxManager>();

  beforeEach(() => {
    enableRafAwareFakeTimers();
  });

  afterEach(() => {
    managers.forEach((manager) => manager.destroy());
    managers.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("uses configured inactivity timeout and fires when mapped state does not change", async () => {
    const { cameraManager, scanningSession, manager } = createManager({
      inactivityTimeoutMs: 100,
      scanStepTimeoutMs: 1000,
    });
    managers.add(manager);

    expect(manager.getTimeoutConfiguration()).toEqual({
      inactivityTimeoutMs: 100,
      scanStepTimeoutMs: 1000,
      partiallySupportedBarcodeResolveTimeoutMs: 8_000,
    });

    const errorSpy = vi.fn();
    manager.addOnErrorCallback(errorSpy);

    cameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(100);

    expect(errorSpy).toHaveBeenCalledWith("timeout");
    expect(cameraManager.stopFrameCapture).toHaveBeenCalledTimes(1);
    expect(scanningSession.reset).toHaveBeenCalledTimes(1);
  });

  test("does not fire when inactivity and scan-step timeouts are disabled with null", async () => {
    const { cameraManager, manager, getLatestProgress } = createManager({
      inactivityTimeoutMs: null,
      scanStepTimeoutMs: null,
    });
    managers.add(manager);

    const errorSpy = vi.fn();
    manager.addOnErrorCallback(errorSpy);

    expect(manager.getTimeoutConfiguration()).toEqual({
      inactivityTimeoutMs: null,
      scanStepTimeoutMs: null,
      partiallySupportedBarcodeResolveTimeoutMs: 8_000,
    });

    cameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(10_000);

    expect(errorSpy).not.toHaveBeenCalled();
    expect(getLatestProgress()).toMatchObject({
      inactivity: {
        configuredMs: null,
        remainingMs: null,
        status: "disabled",
      },
      perSide: {
        configuredMs: null,
        remainingMs: null,
        status: "disabled",
      },
    });
  });

  test("restarts inactivity timeout only after the stabilized BlinkID UI state changes", async () => {
    const inactivityTimeoutMs =
      blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration + 200;
    const { cameraManager, manager, getLatestProgress } = createManager({
      inactivityTimeoutMs,
      scanStepTimeoutMs: 5000,
    });
    managers.add(manager);

    cameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(
      blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration - 100,
    );
    await cameraManager.emitFrame(createFakeImageData());
    await vi.advanceTimersByTimeAsync(40);

    expect(getLatestProgress()).toMatchObject({
      uiStateKey: "INTRO_FRONT_PAGE",
      mappedUiStateKey: "FRONT_PAGE_NOT_IN_FRAME",
      inactivityResetUiStateKey: "INTRO_FRONT_PAGE",
      inactivity: {
        status: "running",
      },
    });

    await advanceAndFlushUi(150);

    expect(manager.uiState.key).toBe("FRONT_PAGE_NOT_IN_FRAME");
    const progress = getLatestProgress();
    expect(progress.uiStateKey).toBe("FRONT_PAGE_NOT_IN_FRAME");
    expect(progress.mappedUiStateKey).toBe("FRONT_PAGE_NOT_IN_FRAME");
    expect(progress.inactivityResetUiStateKey).toBe("FRONT_PAGE_NOT_IN_FRAME");
    expect(progress.inactivity.configuredMs).toBe(inactivityTimeoutMs);
    expect(progress.inactivity.remainingMs).toBeGreaterThan(0);
    expect(progress.inactivity.remainingMs).toBeLessThanOrEqual(
      inactivityTimeoutMs,
    );
  });

  test("does not reset inactivity timeout for repeated identical mapped states", async () => {
    const { cameraManager, manager } = createManager({
      inactivityTimeoutMs: 100,
      scanStepTimeoutMs: 1000,
    });
    managers.add(manager);

    const errorSpy = vi.fn();
    manager.addOnErrorCallback(errorSpy);

    cameraManager.emitPlaybackState("capturing");
    await cameraManager.emitFrame(createFakeImageData());

    await vi.advanceTimersByTimeAsync(90);
    await cameraManager.emitFrame(createFakeImageData());

    await vi.advanceTimersByTimeAsync(9);
    expect(errorSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(errorSpy).toHaveBeenCalledWith("timeout");
  });

  test("fires scan-step timeout when the inactivity timeout is disabled", async () => {
    const { cameraManager, manager } = createManager({
      inactivityTimeoutMs: null,
      scanStepTimeoutMs: 250,
    });
    managers.add(manager);

    const errorSpy = vi.fn();
    manager.addOnErrorCallback(errorSpy);

    cameraManager.emitPlaybackState("capturing");

    await vi.advanceTimersByTimeAsync(249);
    expect(errorSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(errorSpy).toHaveBeenCalledWith("timeout");
  });

  test("does not fire inactivity timeout while PROCESSING_BARCODE is visible", async () => {
    const { cameraManager, scanningSession, manager } = createManager({
      inactivityTimeoutMs: blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration + 500,
      scanStepTimeoutMs: 20_000,
    });
    managers.add(manager);

    const errorSpy = vi.fn();
    manager.addOnErrorCallback(errorSpy);
    scanningSession.getScanningStatus.mockResolvedValue(
      "scanning-barcode-in-progress",
    );

    cameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(
      blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration - 100,
    );
    await cameraManager.emitFrame(createFakeImageData());
    await advanceAndFlushUi(150);

    expect(manager.uiState.key).toBe("PROCESSING_BARCODE");

    await vi.advanceTimersByTimeAsync(
      blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration + 1_000,
    );

    expect(errorSpy).not.toHaveBeenCalled();
    expect(cameraManager.stopFrameCapture).not.toHaveBeenCalled();
  });

  test("fires scan-step timeout while PROCESSING_BARCODE is visible", async () => {
    const scanStepTimeoutMs =
      blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration + 1_000;
    const { cameraManager, scanningSession, manager, getLatestProgress } =
      createManager({
        inactivityTimeoutMs: null,
        scanStepTimeoutMs,
      });
    managers.add(manager);

    const errorSpy = vi.fn();
    manager.addOnErrorCallback(errorSpy);
    scanningSession.getScanningStatus.mockResolvedValue(
      "scanning-barcode-in-progress",
    );

    cameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(
      blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration - 100,
    );
    await cameraManager.emitFrame(createFakeImageData());
    await advanceAndFlushUi(150);

    expect(manager.uiState.key).toBe("PROCESSING_BARCODE");

    const perSideRemainingMs = getLatestProgress().perSide.remainingMs;
    expect(perSideRemainingMs).not.toBeNull();
    expect(perSideRemainingMs).toBeGreaterThan(scanStepTimeoutMs - 250);

    await vi.advanceTimersByTimeAsync(perSideRemainingMs! - 50);
    expect(errorSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(50);
    expect(errorSpy).toHaveBeenCalledWith("timeout");
  });

  test("resets scan-step timeout when PROCESSING_BARCODE becomes visible", async () => {
    const scanStepTimeoutMs =
      blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration + 1_000;
    const { cameraManager, scanningSession, manager, getLatestProgress } =
      createManager({
        inactivityTimeoutMs: null,
        scanStepTimeoutMs,
      });
    managers.add(manager);

    const errorSpy = vi.fn();
    manager.addOnErrorCallback(errorSpy);
    scanningSession.getScanningStatus.mockResolvedValue(
      "scanning-barcode-in-progress",
    );

    cameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(
      blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration + 500,
    );
    await cameraManager.emitFrame(createFakeImageData());
    await flushUiRaf();

    expect(manager.uiState.key).toBe("PROCESSING_BARCODE");

    const perSideRemainingMs = getLatestProgress().perSide.remainingMs;
    expect(perSideRemainingMs).not.toBeNull();
    expect(perSideRemainingMs).toBeGreaterThan(scanStepTimeoutMs - 250);

    await vi.advanceTimersByTimeAsync(perSideRemainingMs! - 50);
    expect(errorSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(50);
    expect(errorSpy).toHaveBeenCalledWith("timeout");
  });

  test("keeps inactivity timeout active for BARCODE_NOT_IN_FRAME", async () => {
    const inactivityTimeoutMs =
      blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration + 500;
    const { cameraManager, scanningSession, manager, getLatestProgress } =
      createManager({
        inactivityTimeoutMs,
        scanStepTimeoutMs: 20_000,
      });
    managers.add(manager);

    const errorSpy = vi.fn();
    manager.addOnErrorCallback(errorSpy);
    scanningSession.process.mockResolvedValue(barcodeNotInFrameResult());

    cameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(
      blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration - 100,
    );
    await cameraManager.emitFrame(createFakeImageData());
    await advanceAndFlushUi(150);

    expect(manager.uiState.key).toBe("BARCODE_NOT_IN_FRAME");

    const inactivityRemainingMs = getLatestProgress().inactivity.remainingMs;
    expect(inactivityRemainingMs).not.toBeNull();
    expect(inactivityRemainingMs).toBeGreaterThan(inactivityTimeoutMs - 250);

    await vi.advanceTimersByTimeAsync(inactivityRemainingMs! - 50);
    expect(errorSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(50);
    expect(errorSpy).toHaveBeenCalledWith("timeout");
  });

  test("reports paused inactivity progress while PROCESSING_BARCODE is visible", async () => {
    const inactivityTimeoutMs =
      blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration + 500;
    const { cameraManager, scanningSession, manager, getLatestProgress } =
      createManager({
        inactivityTimeoutMs,
        scanStepTimeoutMs: 20_000,
      });
    managers.add(manager);

    scanningSession.getScanningStatus.mockResolvedValue(
      "scanning-barcode-in-progress",
    );

    cameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(
      blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration - 100,
    );
    await cameraManager.emitFrame(createFakeImageData());
    await advanceAndFlushUi(150);

    expect(manager.uiState.key).toBe("PROCESSING_BARCODE");
    expect(getLatestProgress()).toMatchObject({
      uiStateKey: "PROCESSING_BARCODE",
      inactivityResetUiStateKey: "PROCESSING_BARCODE",
      inactivity: {
        configuredMs: inactivityTimeoutMs,
        remainingMs: inactivityTimeoutMs,
        status: "paused",
      },
      perSide: {
        configuredMs: 20_000,
        status: "running",
      },
    });
  });

  test("resolves partially supported barcode step after the configured active-capture delay", async () => {
    const { cameraManager, scanningSession, manager } = createManager({
      inactivityTimeoutMs: null,
      scanStepTimeoutMs: null,
      partiallySupportedBarcodeResolveTimeoutMs: 100,
    });
    managers.add(manager);

    scanningSession.process.mockResolvedValue(
      partiallySupportedBarcodeResult(),
    );
    scanningSession.getScanningStatus
      .mockResolvedValueOnce("scanning-barcode-in-progress")
      .mockResolvedValue("side-scanned");

    cameraManager.emitPlaybackState("capturing");
    await cameraManager.emitFrame(createFakeImageData());

    await vi.advanceTimersByTimeAsync(99);
    expect(scanningSession.resolveCurrentStep).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);

    expect(scanningSession.resolveCurrentStep).toHaveBeenCalledTimes(1);
    expect(manager.mappedUiStateKey).toBe("PAGE_CAPTURED");
    expect(cameraManager.stopFrameCapture).toHaveBeenCalledTimes(1);
  });

  test.each<{
    name: string;
    processResult: ProcessResultWithBuffer;
    scanningStatus: ScanningStatus;
  }>([
    {
      name: "barcode parsing is supported",
      processResult: createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "barcode-recognition-failed",
        },
        resultCompleteness: {
          barcode: {
            status: "failed",
            attribute: "mandatory",
            parsed: false,
            parsingSupported: true,
          },
        },
      }),
      scanningStatus: "scanning-barcode-in-progress",
    },
    {
      name: "barcode completeness is missing",
      processResult: createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "barcode-recognition-failed",
        },
      }),
      scanningStatus: "scanning-barcode-in-progress",
    },
    {
      name: "processing status is not barcode recognition failed",
      processResult: createProcessResult({
        resultCompleteness: {
          barcode: {
            status: "failed",
            attribute: "mandatory",
            parsed: false,
            parsingSupported: false,
          },
        },
      }),
      scanningStatus: "scanning-barcode-in-progress",
    },
    {
      name: "session is not in barcode scanning step",
      processResult: partiallySupportedBarcodeResult(),
      scanningStatus: "scanning-side-in-progress",
    },
  ])(
    "does not resolve partially supported barcode step when $name",
    async ({ processResult, scanningStatus }) => {
      const { cameraManager, scanningSession, manager } = createManager({
        inactivityTimeoutMs: null,
        scanStepTimeoutMs: null,
        partiallySupportedBarcodeResolveTimeoutMs: 100,
      });
      managers.add(manager);

      scanningSession.process.mockResolvedValue(processResult);
      scanningSession.getScanningStatus.mockResolvedValue(scanningStatus);

      cameraManager.emitPlaybackState("capturing");
      await cameraManager.emitFrame(createFakeImageData());
      await vi.advanceTimersByTimeAsync(100);

      expect(scanningSession.resolveCurrentStep).not.toHaveBeenCalled();
    },
  );

  test("does not resolve partially supported barcode step when the timer is disabled", async () => {
    const { cameraManager, scanningSession, manager, getLatestProgress } =
      createManager({
        inactivityTimeoutMs: null,
        scanStepTimeoutMs: null,
        partiallySupportedBarcodeResolveTimeoutMs: null,
      });
    managers.add(manager);

    scanningSession.process.mockResolvedValue(
      partiallySupportedBarcodeResult(),
    );
    scanningSession.getScanningStatus.mockResolvedValue(
      "scanning-barcode-in-progress",
    );

    cameraManager.emitPlaybackState("capturing");
    await cameraManager.emitFrame(createFakeImageData());
    await flushUiRaf();

    expect(getLatestProgress().partiallySupportedBarcodeResolve).toEqual({
      configuredMs: null,
      remainingMs: null,
      status: "disabled",
    });

    await vi.advanceTimersByTimeAsync(1_000);

    expect(scanningSession.resolveCurrentStep).not.toHaveBeenCalled();
  });

  test("pauses and resumes partially supported barcode resolve timer with capture playback", async () => {
    const { cameraManager, scanningSession, manager } = createManager({
      inactivityTimeoutMs: null,
      scanStepTimeoutMs: null,
      partiallySupportedBarcodeResolveTimeoutMs: 100,
    });
    managers.add(manager);

    scanningSession.process.mockResolvedValue(
      partiallySupportedBarcodeResult(),
    );
    scanningSession.getScanningStatus
      .mockResolvedValueOnce("scanning-barcode-in-progress")
      .mockResolvedValue("side-scanned");

    cameraManager.emitPlaybackState("capturing");
    await cameraManager.emitFrame(createFakeImageData());

    await vi.advanceTimersByTimeAsync(60);
    cameraManager.emitPlaybackState("playback");
    await vi.advanceTimersByTimeAsync(1_000);
    expect(scanningSession.resolveCurrentStep).not.toHaveBeenCalled();

    cameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(39);
    expect(scanningSession.resolveCurrentStep).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(scanningSession.resolveCurrentStep).toHaveBeenCalledTimes(1);
  });

  test("reports partially supported barcode resolve timer progress", async () => {
    const { cameraManager, scanningSession, manager, getLatestProgress } =
      createManager({
        inactivityTimeoutMs: null,
        scanStepTimeoutMs: null,
        partiallySupportedBarcodeResolveTimeoutMs: 100,
      });
    managers.add(manager);

    scanningSession.process.mockResolvedValue(
      partiallySupportedBarcodeResult(),
    );
    scanningSession.getScanningStatus.mockResolvedValue(
      "scanning-barcode-in-progress",
    );

    cameraManager.emitPlaybackState("capturing");
    await cameraManager.emitFrame(createFakeImageData());
    await flushUiRaf();

    const runningProgress = getLatestProgress();
    expect(runningProgress.partiallySupportedBarcodeResolve.configuredMs).toBe(
      100,
    );
    expect(runningProgress.partiallySupportedBarcodeResolve.status).toBe(
      "running",
    );
    expect(
      runningProgress.partiallySupportedBarcodeResolve.remainingMs,
    ).toBeLessThanOrEqual(100);

    cameraManager.emitPlaybackState("playback");
    await flushUiRaf();

    expect(getLatestProgress().partiallySupportedBarcodeResolve.status).toBe(
      "paused",
    );
  });

  test("clears partially supported barcode resolve timer on reset", async () => {
    const { cameraManager, scanningSession, manager } = createManager({
      inactivityTimeoutMs: null,
      scanStepTimeoutMs: null,
      partiallySupportedBarcodeResolveTimeoutMs: 100,
    });
    managers.add(manager);

    scanningSession.process.mockResolvedValue(
      partiallySupportedBarcodeResult(),
    );
    scanningSession.getScanningStatus.mockResolvedValue(
      "scanning-barcode-in-progress",
    );

    cameraManager.emitPlaybackState("capturing");
    await cameraManager.emitFrame(createFakeImageData());
    await vi.advanceTimersByTimeAsync(90);

    await manager.resetScanningSession(false);
    await vi.advanceTimersByTimeAsync(20);

    expect(scanningSession.resolveCurrentStep).not.toHaveBeenCalled();
  });

  test("clears partially supported barcode resolve timer on step success", async () => {
    const { cameraManager, scanningSession, manager } = createManager({
      inactivityTimeoutMs: null,
      scanStepTimeoutMs: null,
      partiallySupportedBarcodeResolveTimeoutMs: 100,
    });
    managers.add(manager);

    scanningSession.process
      .mockResolvedValueOnce(partiallySupportedBarcodeResult())
      .mockResolvedValueOnce(sideScannedResult());
    scanningSession.getScanningStatus
      .mockResolvedValueOnce("scanning-barcode-in-progress")
      .mockResolvedValue("side-scanned");

    cameraManager.emitPlaybackState("capturing");
    await cameraManager.emitFrame(createFakeImageData());
    await vi.advanceTimersByTimeAsync(90);

    await cameraManager.emitFrame(createFakeImageData());
    await vi.advanceTimersByTimeAsync(20);

    expect(scanningSession.resolveCurrentStep).not.toHaveBeenCalled();
    expect(manager.mappedUiStateKey).toBe("PAGE_CAPTURED");
  });

  test("does not retry partially supported barcode resolve after a failed attempt", async () => {
    const { cameraManager, scanningSession, manager } = createManager({
      inactivityTimeoutMs: null,
      scanStepTimeoutMs: null,
      partiallySupportedBarcodeResolveTimeoutMs: 100,
    });
    managers.add(manager);

    scanningSession.process.mockResolvedValue(
      partiallySupportedBarcodeResult(),
    );
    scanningSession.getScanningStatus.mockResolvedValue(
      "scanning-barcode-in-progress",
    );
    scanningSession.resolveCurrentStep.mockRejectedValue(new Error("nope"));

    cameraManager.emitPlaybackState("capturing");
    await cameraManager.emitFrame(createFakeImageData());
    await vi.advanceTimersByTimeAsync(100);

    await cameraManager.emitFrame(createFakeImageData());
    await vi.advanceTimersByTimeAsync(100);

    expect(scanningSession.resolveCurrentStep).toHaveBeenCalledTimes(1);
  });

  test("restarts inactivity timeout when capture stops and resumes from a fresh window", async () => {
    const { cameraManager, manager } = createManager({
      inactivityTimeoutMs: 100,
      scanStepTimeoutMs: 1000,
    });
    managers.add(manager);

    const errorSpy = vi.fn();
    manager.addOnErrorCallback(errorSpy);

    cameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(60);

    cameraManager.emitPlaybackState("playback");
    await vi.advanceTimersByTimeAsync(500);
    expect(errorSpy).not.toHaveBeenCalled();

    cameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(99);
    expect(errorSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(errorSpy).toHaveBeenCalledWith("timeout");
  });

  test("resets both timers after the flip-card transition when the second side starts", async () => {
    const { cameraManager, scanningSession, manager } = createManager({
      inactivityTimeoutMs: 100,
      scanStepTimeoutMs: 100,
    });
    managers.add(manager);

    const errorSpy = vi.fn();
    manager.addOnErrorCallback(errorSpy);

    scanningSession.process.mockResolvedValueOnce(sideScannedResult());
    scanningSession.getScanningStatus.mockResolvedValueOnce("side-scanned");

    cameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(90);
    await cameraManager.emitFrame(createFakeImageData());
    cameraManager.emitPlaybackState("playback");

    await advanceAndFlushUi(
      blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration +
        blinkIdUiStateMap.PAGE_CAPTURED.minDuration +
        blinkIdUiStateMap.FLIP_CARD.minDuration +
        100,
    );

    expect(manager.uiState.key).toBe("INTRO_BACK_PAGE");

    cameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(90);
    expect(errorSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(10);
    expect(errorSpy).toHaveBeenCalledWith("timeout");
  });

  test("resets both timers when the app returns from the background", async () => {
    const { cameraManager, manager } = createManager({
      inactivityTimeoutMs: 100,
      scanStepTimeoutMs: 100,
    });
    managers.add(manager);

    const errorSpy = vi.fn();
    manager.addOnErrorCallback(errorSpy);

    let visibilityState: DocumentVisibilityState = "visible";
    vi.spyOn(document, "visibilityState", "get").mockImplementation(
      () => visibilityState,
    );

    cameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(90);

    visibilityState = "hidden";
    document.dispatchEvent(new Event("visibilitychange"));
    cameraManager.emitPlaybackState("playback");

    await vi.advanceTimersByTimeAsync(500);
    expect(errorSpy).not.toHaveBeenCalled();

    visibilityState = "visible";
    document.dispatchEvent(new Event("visibilitychange"));
    cameraManager.emitPlaybackState("capturing");

    await vi.advanceTimersByTimeAsync(90);
    expect(errorSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(10);
    expect(errorSpy).toHaveBeenCalledWith("timeout");
  });

  test("advanceToNextStep restarts inactivity timeout only after the stabilized UI state changes", async () => {
    const inactivityTimeoutMs =
      blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration + 200;
    const { cameraManager, scanningSession, manager, getLatestProgress } =
      createManager({
        inactivityTimeoutMs,
        scanStepTimeoutMs: 5000,
      });
    managers.add(manager);

    let advance: Parameters<BlinkIdFrameProcessCallback>[1] | undefined;
    manager.addOnFrameProcessCallback((_, advanceToNextStep) => {
      advance = advanceToNextStep;
    });

    scanningSession.getScanningStatus.mockResolvedValue("side-scanned");

    cameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(
      blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration - 100,
    );
    await cameraManager.emitFrame(createFakeImageData());
    expect(advance).toBeDefined();

    await advance!();
    await vi.advanceTimersByTimeAsync(40);

    expect(getLatestProgress()).toMatchObject({
      uiStateKey: "INTRO_FRONT_PAGE",
      mappedUiStateKey: "PAGE_CAPTURED",
      inactivityResetUiStateKey: "INTRO_FRONT_PAGE",
      inactivity: {
        status: "running",
      },
    });

    await advanceAndFlushUi(150);

    expect(manager.uiState.key).toBe("PAGE_CAPTURED");
    const progress = getLatestProgress();
    expect(progress.uiStateKey).toBe("PAGE_CAPTURED");
    expect(progress.mappedUiStateKey).toBe("PAGE_CAPTURED");
    expect(progress.inactivityResetUiStateKey).toBe("PAGE_CAPTURED");
    expect(progress.inactivity.configuredMs).toBe(inactivityTimeoutMs);
    expect(progress.inactivity.remainingMs).toBeGreaterThan(0);
    expect(progress.inactivity.remainingMs).toBeLessThanOrEqual(
      inactivityTimeoutMs,
    );
  });

  test("triggerStepTimeout from frame process callback invokes timeout handling", async () => {
    const { cameraManager, scanningSession, manager } = createManager({
      inactivityTimeoutMs: 60_000,
      scanStepTimeoutMs: 60_000,
    });
    managers.add(manager);

    const errorSpy = vi.fn();
    manager.addOnErrorCallback(errorSpy);

    let trigger: Parameters<BlinkIdFrameProcessCallback>[2] | undefined;
    manager.addOnFrameProcessCallback((_, __, triggerStepTimeout) => {
      trigger = triggerStepTimeout;
    });

    cameraManager.emitPlaybackState("capturing");
    await cameraManager.emitFrame(createFakeImageData());

    expect(trigger).toBeDefined();
    trigger!();

    expect(errorSpy).toHaveBeenCalledWith("timeout");
    expect(cameraManager.stopFrameCapture).toHaveBeenCalled();
    expect(scanningSession.reset).toHaveBeenCalled();
  });

  test("resetScanningSession clears timeout state", async () => {
    const { cameraManager, manager } = createManager({
      inactivityTimeoutMs: 100,
      scanStepTimeoutMs: 1000,
    });
    managers.add(manager);

    const errorSpy = vi.fn();
    manager.addOnErrorCallback(errorSpy);

    cameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(90);

    await manager.resetScanningSession(false);
    await vi.advanceTimersByTimeAsync(1000);

    expect(errorSpy).not.toHaveBeenCalled();
  });

  test("destroy clears timeout state", async () => {
    const { cameraManager, manager } = createManager({
      inactivityTimeoutMs: 100,
      scanStepTimeoutMs: 1000,
    });
    managers.add(manager);

    const errorSpy = vi.fn();
    manager.addOnErrorCallback(errorSpy);

    cameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(90);

    manager.destroy();
    managers.delete(manager);
    await vi.advanceTimersByTimeAsync(1000);

    expect(errorSpy).not.toHaveBeenCalled();
  });

  test("onProgress reports live remaining time while timers are running and paused", async () => {
    const { cameraManager, manager, getLatestProgress } = createManager({
      inactivityTimeoutMs: 100,
      scanStepTimeoutMs: 500,
    });
    managers.add(manager);

    await flushUiRaf();

    expect(getLatestProgress()).toEqual({
      uiStateKey: "INTRO_FRONT_PAGE",
      inactivity: {
        configuredMs: 100,
        remainingMs: 100,
        status: "idle",
      },
      perSide: {
        configuredMs: 500,
        remainingMs: 500,
        status: "idle",
      },
      partiallySupportedBarcodeResolve: {
        configuredMs: 8_000,
        remainingMs: 8_000,
        status: "idle",
      },
      isTimingActiveScanStep: false,
      playbackState: "idle",
      mappedUiStateKey: "INTRO_FRONT_PAGE",
      inactivityResetUiStateKey: undefined,
    });

    cameraManager.emitPlaybackState("capturing");
    await flushUiRaf();

    const runningProgress = getLatestProgress();
    expect(runningProgress.uiStateKey).toBe("INTRO_FRONT_PAGE");
    expect(runningProgress.inactivity.configuredMs).toBe(100);
    expect(runningProgress.inactivity.status).toBe("running");
    expect(runningProgress.inactivity.remainingMs).toBeLessThan(100);
    expect(runningProgress.perSide.configuredMs).toBe(500);
    expect(runningProgress.perSide.status).toBe("running");
    expect(runningProgress.perSide.remainingMs).toBeLessThan(500);
    expect(runningProgress.partiallySupportedBarcodeResolve).toEqual({
      configuredMs: 8_000,
      remainingMs: 8_000,
      status: "idle",
    });
    expect(runningProgress.isTimingActiveScanStep).toBe(true);
    expect(runningProgress.playbackState).toBe("capturing");
    expect(runningProgress.mappedUiStateKey).toBe("INTRO_FRONT_PAGE");
    expect(runningProgress.inactivityResetUiStateKey).toBe("INTRO_FRONT_PAGE");

    const runningPerSideRemainingMs = runningProgress.perSide.remainingMs;
    expect(runningPerSideRemainingMs).not.toBeNull();

    cameraManager.emitPlaybackState("playback");
    await flushUiRaf();

    const pausedProgress = getLatestProgress();
    expect(pausedProgress.perSide.remainingMs).toBeLessThanOrEqual(
      runningPerSideRemainingMs!,
    );
    expect(pausedProgress).toEqual({
      uiStateKey: "INTRO_FRONT_PAGE",
      inactivity: {
        configuredMs: 100,
        remainingMs: 100,
        status: "idle",
      },
      perSide: {
        configuredMs: 500,
        remainingMs: pausedProgress.perSide.remainingMs,
        status: "paused",
      },
      partiallySupportedBarcodeResolve: {
        configuredMs: 8_000,
        remainingMs: 8_000,
        status: "idle",
      },
      isTimingActiveScanStep: true,
      playbackState: "playback",
      mappedUiStateKey: "INTRO_FRONT_PAGE",
      inactivityResetUiStateKey: "INTRO_FRONT_PAGE",
    });

    await vi.advanceTimersByTimeAsync(200);
    await flushUiRaf();

    expect(getLatestProgress()).toEqual({
      uiStateKey: "INTRO_FRONT_PAGE",
      inactivity: {
        configuredMs: 100,
        remainingMs: 100,
        status: "idle",
      },
      perSide: {
        configuredMs: 500,
        remainingMs: pausedProgress.perSide.remainingMs,
        status: "paused",
      },
      partiallySupportedBarcodeResolve: {
        configuredMs: 8_000,
        remainingMs: 8_000,
        status: "idle",
      },
      isTimingActiveScanStep: true,
      playbackState: "playback",
      mappedUiStateKey: "INTRO_FRONT_PAGE",
      inactivityResetUiStateKey: "INTRO_FRONT_PAGE",
    });
  });

  test("onProgress exposes the stabilized UI state key that last reset inactivity", async () => {
    const { cameraManager, manager, getLatestProgress } = createManager({
      inactivityTimeoutMs: 200,
      scanStepTimeoutMs: 500,
    });
    managers.add(manager);

    cameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(90);
    await cameraManager.emitFrame(createFakeImageData());
    await vi.advanceTimersByTimeAsync(40);

    expect(getLatestProgress()).toMatchObject({
      uiStateKey: "INTRO_FRONT_PAGE",
      mappedUiStateKey: "FRONT_PAGE_NOT_IN_FRAME",
      inactivityResetUiStateKey: "INTRO_FRONT_PAGE",
      inactivity: {
        configuredMs: 200,
        status: "running",
      },
    });
  });

  test("onProgress updates the inactivity reset key after the stabilized UI state changes", async () => {
    const inactivityTimeoutMs =
      blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration + 200;
    const { cameraManager, scanningSession, manager, getLatestProgress } =
      createManager({
        inactivityTimeoutMs,
        scanStepTimeoutMs: 5000,
      });
    managers.add(manager);

    scanningSession.process.mockResolvedValueOnce(cameraTooFarResult());

    cameraManager.emitPlaybackState("capturing");
    await vi.advanceTimersByTimeAsync(
      blinkIdUiStateMap.INTRO_FRONT_PAGE.minDuration - 100,
    );
    await cameraManager.emitFrame(createFakeImageData());
    await advanceAndFlushUi(150);

    const progress = getLatestProgress();
    expect(progress.uiStateKey).toBe("DOCUMENT_FRAMING_CAMERA_TOO_FAR");
    expect(progress.mappedUiStateKey).toBe("DOCUMENT_FRAMING_CAMERA_TOO_FAR");
    expect(progress.inactivityResetUiStateKey).toBe(
      "DOCUMENT_FRAMING_CAMERA_TOO_FAR",
    );
    expect(progress.inactivity.configuredMs).toBe(inactivityTimeoutMs);
    expect(progress.inactivity.remainingMs).toBeGreaterThan(0);
    expect(progress.inactivity.remainingMs).toBeLessThanOrEqual(
      inactivityTimeoutMs,
    );
    expect(progress.inactivity.status).toBe("running");
  });
});
