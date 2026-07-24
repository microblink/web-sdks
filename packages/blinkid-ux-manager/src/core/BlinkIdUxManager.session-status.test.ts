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
} from "@microblink/test-utils/vitest";
import type { PartialDeep } from "type-fest";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { BlinkIdFrameProcessCallback } from "./BlinkIdUxManager";
import { BlinkIdUxManager } from "./BlinkIdUxManager";
import { blankProcessResult } from "./__testdata/blankProcessResult";
import { blinkIdUiStateMap } from "./blinkid-ui-state";
import { createBlinkIdUxManager } from "./createBlinkIdUxManager";

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

describe("BlinkIdUxManager session status integration", () => {
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

  test("seeds PROCESSING_BARCODE when init status is scanning-barcode-in-progress", async () => {
    const cameraManager = new FakeCameraManager();
    const scanningSession = createFakeScanningSession<
      ProcessResultWithBuffer,
      BlinkIdSessionSettings,
      BlinkIdScanningResult,
      ScanningStatus
    >({
      settings: sessionSettings,
      scanningStatus: "scanning-barcode-in-progress",
    });

    const manager = await createBlinkIdUxManager(
      cameraManager as unknown as CameraManager,
      scanningSession as unknown as RemoteScanningSession,
    );
    managers.add(manager);

    expect(scanningSession.getScanningStatus).toHaveBeenCalledTimes(1);
    expect(manager.getInitialUiStateKey()).toBe("PROCESSING_BARCODE");
    expect(manager.uiState.key).toBe("PROCESSING_BARCODE");
  });

  test("preserves configured intro when init status is scanning-side-in-progress", async () => {
    const cameraManager = new FakeCameraManager();
    const scanningSession = createFakeScanningSession<
      ProcessResultWithBuffer,
      BlinkIdSessionSettings,
      BlinkIdScanningResult,
      ScanningStatus
    >({
      settings: sessionSettings,
      scanningStatus: "scanning-side-in-progress",
    });

    const manager = await createBlinkIdUxManager(
      cameraManager as unknown as CameraManager,
      scanningSession as unknown as RemoteScanningSession,
      { initialUiStateKey: "INTRO_DATA_PAGE" },
    );
    managers.add(manager);

    expect(manager.getInitialUiStateKey()).toBe("INTRO_DATA_PAGE");
    expect(manager.uiState.key).toBe("INTRO_DATA_PAGE");
  });

  test("derives extraction mode without changing initial state for single-side document capture with barcode", () => {
    const cameraManager = new FakeCameraManager();
    const singleSideDocumentWithBarcodeSettings = {
      inputImageSource: "video",
      scanningMode: "single",
      scanningSettings: {
        documentCaptureModule: {},
        barcodeModule: { presenceMandatory: true },
        mrzModule: null,
        vizModule: null,
        maxAllowedMismatchesPerField: 0,
      },
    } as BlinkIdSessionSettings;
    const scanningSession = createFakeScanningSession<
      ProcessResultWithBuffer,
      BlinkIdSessionSettings,
      BlinkIdScanningResult,
      ScanningStatus
    >({
      settings: singleSideDocumentWithBarcodeSettings,
    });

    const manager = new BlinkIdUxManager(
      cameraManager as unknown as CameraManager,
      scanningSession as unknown as RemoteScanningSession,
      {},
      singleSideDocumentWithBarcodeSettings,
      false,
      false,
      { derivedDeviceInfo: { formFactors: ["Desktop"] } } as DeviceInfo,
    );
    managers.add(manager);

    expect(manager.extractionMode).toBe("document-with-barcode");
    expect(manager.getInitialUiStateKey()).toBe("INTRO_FRONT_PAGE");
    expect(manager.uiState.key).toBe("INTRO_FRONT_PAGE");
  });

  test("keeps explicit initial state over extraction mode fallback", () => {
    const cameraManager = new FakeCameraManager();
    const singleSideDocumentWithBarcodeSettings = {
      inputImageSource: "video",
      scanningMode: "single",
      scanningSettings: {
        documentCaptureModule: {},
        barcodeModule: { presenceMandatory: true },
        mrzModule: null,
        vizModule: null,
        maxAllowedMismatchesPerField: 0,
      },
    } as BlinkIdSessionSettings;
    const scanningSession = createFakeScanningSession<
      ProcessResultWithBuffer,
      BlinkIdSessionSettings,
      BlinkIdScanningResult,
      ScanningStatus
    >({
      settings: singleSideDocumentWithBarcodeSettings,
    });

    const manager = new BlinkIdUxManager(
      cameraManager as unknown as CameraManager,
      scanningSession as unknown as RemoteScanningSession,
      { initialUiStateKey: "INTRO_DATA_PAGE" },
      singleSideDocumentWithBarcodeSettings,
      false,
      false,
      { derivedDeviceInfo: { formFactors: ["Desktop"] } } as DeviceInfo,
    );
    managers.add(manager);

    expect(manager.extractionMode).toBe("document-with-barcode");
    expect(manager.getInitialUiStateKey()).toBe("INTRO_DATA_PAGE");
    expect(manager.uiState.key).toBe("INTRO_DATA_PAGE");
  });

  test("derives barcode-only extraction mode without changing initial state", () => {
    const cameraManager = new FakeCameraManager();
    const barcodeOnlySettings = {
      inputImageSource: "video",
      scanningMode: "automatic",
      scanningSettings: {
        documentCaptureModule: null,
        barcodeModule: {},
        mrzModule: null,
        vizModule: null,
        maxAllowedMismatchesPerField: 0,
      },
    } as BlinkIdSessionSettings;
    const scanningSession = createFakeScanningSession<
      ProcessResultWithBuffer,
      BlinkIdSessionSettings,
      BlinkIdScanningResult,
      ScanningStatus
    >({
      settings: barcodeOnlySettings,
    });

    const manager = new BlinkIdUxManager(
      cameraManager as unknown as CameraManager,
      scanningSession as unknown as RemoteScanningSession,
      {},
      barcodeOnlySettings,
      false,
      false,
      { derivedDeviceInfo: { formFactors: ["Desktop"] } } as DeviceInfo,
    );
    managers.add(manager);

    expect(manager.extractionMode).toBe("barcode-only");
    expect(manager.getInitialUiStateKey()).toBe("INTRO_FRONT_PAGE");
    expect(manager.uiState.key).toBe("INTRO_FRONT_PAGE");
  });

  test("advanceToNextStep maps side-scanned into PAGE_CAPTURED and chained guidance", async () => {
    const cameraManager = new FakeCameraManager();
    const scanningSession = createFakeScanningSession<
      ProcessResultWithBuffer,
      BlinkIdSessionSettings,
      BlinkIdScanningResult,
      ScanningStatus
    >({
      settings: sessionSettings,
      processResult: createProcessResult({
        inputImageAnalysisResult: {
          processingStatus: "success",
          documentDetectionStatus: "success",
          documentRotation: "zero",
          documentClassInfo: {
            country: { id: "usa" },
            documentType: { id: "dl" },
          },
        },
      }),
    });
    // First frame: in-progress; after resolve: side-scanned. Always returning side-scanned
    // would map PAGE_CAPTURED on the frame and duplicate side effects in advanceToNextStep.
    scanningSession.getScanningStatus
      .mockResolvedValueOnce("scanning-side-in-progress")
      .mockResolvedValue("side-scanned");

    const manager = new BlinkIdUxManager(
      cameraManager as unknown as CameraManager,
      scanningSession as unknown as RemoteScanningSession,
      { initialUiStateKey: "PROCESSING_BARCODE" },
      sessionSettings,
      false,
      false,
      { derivedDeviceInfo: { formFactors: ["Desktop"] } } as DeviceInfo,
    );
    managers.add(manager);

    let advanceFn: Parameters<BlinkIdFrameProcessCallback>[1] | undefined;
    manager.addOnFrameProcessCallback((_, advanceToNextStep) => {
      advanceFn = advanceToNextStep;
    });

    await cameraManager.emitFrame(createFakeImageData());
    expect(advanceFn).toBeDefined();
    await advanceFn!();

    expect(scanningSession.resolveCurrentStep).toHaveBeenCalledTimes(1);
    expect(scanningSession.getScanningStatus).toHaveBeenCalledTimes(2);
    expect(manager.mappedUiStateKey).toBe("PAGE_CAPTURED");
    expect(cameraManager.stopFrameCapture).toHaveBeenCalledTimes(1);
    expect(
      manager.feedbackStabilizer
        .getSingleEventQueue()
        .map((event) => event.key),
    ).toContain("PAGE_CAPTURED");

    await advanceAndFlushUi(
      blinkIdUiStateMap.PROCESSING_BARCODE.minDuration + 50,
    );
    expect(manager.uiState.key).toBe("PAGE_CAPTURED");

    await advanceAndFlushUi(blinkIdUiStateMap.PAGE_CAPTURED.minDuration + 50);
    expect(manager.uiState.key).toBe("FLIP_CARD");
  });

  test("advanceToNextStep maps document-scanned into DOCUMENT_CAPTURED and emits result", async () => {
    const cameraManager = new FakeCameraManager();
    const result = {} as BlinkIdScanningResult;
    const scanningSession = createFakeScanningSession<
      ProcessResultWithBuffer,
      BlinkIdSessionSettings,
      BlinkIdScanningResult,
      ScanningStatus
    >({
      settings: sessionSettings,
      result,
      processResult: createProcessResult(),
    });
    scanningSession.getScanningStatus.mockResolvedValue("document-scanned");

    const manager = new BlinkIdUxManager(
      cameraManager as unknown as CameraManager,
      scanningSession as unknown as RemoteScanningSession,
      { initialUiStateKey: "PROCESSING_BARCODE" },
      sessionSettings,
      false,
      false,
      { derivedDeviceInfo: { formFactors: ["Desktop"] } } as DeviceInfo,
    );
    managers.add(manager);

    let advanceFn: Parameters<BlinkIdFrameProcessCallback>[1] | undefined;
    const onResult = vi.fn();
    manager.addOnFrameProcessCallback((_, advanceToNextStep) => {
      advanceFn = advanceToNextStep;
    });
    manager.addOnResultCallback(onResult);

    await cameraManager.emitFrame(createFakeImageData());
    expect(advanceFn).toBeDefined();
    await advanceFn!();

    expect(manager.mappedUiStateKey).toBe("DOCUMENT_CAPTURED");
    expect(cameraManager.stopFrameCapture).toHaveBeenCalledTimes(1);

    await advanceAndFlushUi(
      blinkIdUiStateMap.PROCESSING_BARCODE.minDuration + 50,
    );
    expect(manager.uiState.key).toBe("DOCUMENT_CAPTURED");

    await vi.advanceTimersByTimeAsync(
      blinkIdUiStateMap.DOCUMENT_CAPTURED.minDuration + 50,
    );

    expect(scanningSession.getResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith(result);
  });

  test("skips scanning status lookup when destroyed while frame processing is in-flight", async () => {
    const cameraManager = new FakeCameraManager();
    const returnedArrayBuffer = new ArrayBuffer(8);
    const scanningSession = createFakeScanningSession<
      ProcessResultWithBuffer,
      BlinkIdSessionSettings,
      BlinkIdScanningResult,
      ScanningStatus
    >({
      settings: sessionSettings,
    });

    let resolveProcess: (result: ProcessResultWithBuffer) => void;
    const processPromise = new Promise<ProcessResultWithBuffer>((resolve) => {
      resolveProcess = resolve;
    });
    scanningSession.process.mockReturnValue(processPromise);

    const manager = new BlinkIdUxManager(
      cameraManager as unknown as CameraManager,
      scanningSession as unknown as RemoteScanningSession,
      { initialUiStateKey: "INTRO_FRONT_PAGE" },
      sessionSettings,
      false,
      false,
      { derivedDeviceInfo: { formFactors: ["Desktop"] } } as DeviceInfo,
    );
    managers.add(manager);

    const framePromise = cameraManager.emitFrame(createFakeImageData());
    manager.destroy();
    resolveProcess!(
      createProcessResult({
        arrayBuffer: returnedArrayBuffer,
      }),
    );

    await expect(framePromise).resolves.toBe(returnedArrayBuffer);
    expect(scanningSession.getScanningStatus).not.toHaveBeenCalled();
  });

  test("returns the frame buffer when destroyed while scanning status lookup is in-flight", async () => {
    const cameraManager = new FakeCameraManager();
    const returnedArrayBuffer = new ArrayBuffer(8);
    const scanningSession = createFakeScanningSession<
      ProcessResultWithBuffer,
      BlinkIdSessionSettings,
      BlinkIdScanningResult,
      ScanningStatus
    >({
      settings: sessionSettings,
      processResult: createProcessResult({
        arrayBuffer: returnedArrayBuffer,
      }),
    });

    let rejectScanningStatus: (error: Error) => void;
    const scanningStatusPromise = new Promise<ScanningStatus>((_, reject) => {
      rejectScanningStatus = reject;
    });
    scanningSession.getScanningStatus.mockReturnValue(scanningStatusPromise);

    const manager = new BlinkIdUxManager(
      cameraManager as unknown as CameraManager,
      scanningSession as unknown as RemoteScanningSession,
      { initialUiStateKey: "INTRO_FRONT_PAGE" },
      sessionSettings,
      false,
      false,
      { derivedDeviceInfo: { formFactors: ["Desktop"] } } as DeviceInfo,
    );
    managers.add(manager);

    const framePromise = cameraManager.emitFrame(createFakeImageData());
    await Promise.resolve();
    manager.destroy();
    rejectScanningStatus!(new Error("Cannot pass deleted object"));

    await expect(framePromise).resolves.toBe(returnedArrayBuffer);
  });

  test("skips scanning status lookup when destroyed while resolving the current step", async () => {
    const cameraManager = new FakeCameraManager();
    const scanningSession = createFakeScanningSession<
      ProcessResultWithBuffer,
      BlinkIdSessionSettings,
      BlinkIdScanningResult,
      ScanningStatus
    >({
      settings: sessionSettings,
      processResult: createProcessResult(),
    });
    scanningSession.getScanningStatus.mockResolvedValue(
      "scanning-side-in-progress",
    );

    let resolveCurrentStep: () => void;
    const resolveCurrentStepPromise = new Promise<void>((resolve) => {
      resolveCurrentStep = resolve;
    });
    scanningSession.resolveCurrentStep.mockReturnValue(
      resolveCurrentStepPromise,
    );

    const manager = new BlinkIdUxManager(
      cameraManager as unknown as CameraManager,
      scanningSession as unknown as RemoteScanningSession,
      { initialUiStateKey: "PROCESSING_BARCODE" },
      sessionSettings,
      false,
      false,
      { derivedDeviceInfo: { formFactors: ["Desktop"] } } as DeviceInfo,
    );
    managers.add(manager);

    let advanceFn: Parameters<BlinkIdFrameProcessCallback>[1] | undefined;
    manager.addOnFrameProcessCallback((_, advanceToNextStep) => {
      advanceFn = advanceToNextStep;
    });

    await cameraManager.emitFrame(createFakeImageData());
    expect(advanceFn).toBeDefined();

    const advancePromise = advanceFn!();
    manager.destroy();
    resolveCurrentStep!();

    await expect(advancePromise).resolves.toBeUndefined();
    expect(scanningSession.resolveCurrentStep).toHaveBeenCalledTimes(1);
    expect(scanningSession.getScanningStatus).toHaveBeenCalledTimes(1);
  });

  test("resolveCurrentStep ignores non-success statuses", async () => {
    const cameraManager = new FakeCameraManager();
    const scanningSession = createFakeScanningSession<
      ProcessResultWithBuffer,
      BlinkIdSessionSettings,
      BlinkIdScanningResult,
      ScanningStatus
    >({
      settings: sessionSettings,
      processResult: createProcessResult(),
    });
    scanningSession.getScanningStatus.mockResolvedValue(
      "scanning-side-in-progress",
    );

    const manager = new BlinkIdUxManager(
      cameraManager as unknown as CameraManager,
      scanningSession as unknown as RemoteScanningSession,
      { initialUiStateKey: "PROCESSING_BARCODE" },
      sessionSettings,
      false,
      false,
      { derivedDeviceInfo: { formFactors: ["Desktop"] } } as DeviceInfo,
    );
    managers.add(manager);

    let advanceFn: Parameters<BlinkIdFrameProcessCallback>[1] | undefined;
    manager.addOnFrameProcessCallback((_, advanceToNextStep) => {
      advanceFn = advanceToNextStep;
    });

    await cameraManager.emitFrame(createFakeImageData());
    const mappedUiStateKeyBeforeResolve = manager.mappedUiStateKey;

    expect(advanceFn).toBeDefined();
    await advanceFn!();

    expect(mappedUiStateKeyBeforeResolve).toBe("FRONT_PAGE_NOT_IN_FRAME");
    expect(manager.mappedUiStateKey).toBe(mappedUiStateKeyBeforeResolve);
    expect(cameraManager.stopFrameCapture).not.toHaveBeenCalled();
    expect(manager.feedbackStabilizer.getSingleEventQueue()).toHaveLength(0);
  });
});
