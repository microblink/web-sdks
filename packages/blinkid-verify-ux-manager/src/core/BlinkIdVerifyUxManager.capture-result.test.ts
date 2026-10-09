/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type {
  BlinkIdVerifyProcessResult,
  BlinkIdVerifySessionResult,
  BlinkIdVerifySessionSettings,
  Consent,
  DeviceInfo,
  ProcessResultWithBuffer,
  RemoteScanningSession,
  VerifyApiResult,
} from "@microblink/blinkid-verify-core";
import { VerifyApiError } from "@microblink/blinkid-verify-core";
import type { CameraManager } from "@microblink/camera-manager/core";
import {
  createFakeCameraHarness,
  createFakeImageData,
  createFakeScanningSession,
  enableRafAwareFakeTimers,
  setupDestroyableTeardown,
} from "@microblink/test-utils";
import { advanceAndFlushUi } from "@microblink/test-utils/vitest/timers";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { createVerifyApiResult } from "./__testdata/verifyApiResult";
import { blinkIdVerifyUiStateMap } from "./blinkid-verify-ui-state";
import { BlinkIdVerifyUxManager } from "./BlinkIdVerifyUxManager";
import type { CaptureResultResolver } from "./capture-result-resolver";

const mockSleep = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock("@microblink/ux-common/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@microblink/ux-common/utils")>();
  return {
    ...actual,
    sleep: mockSleep,
  };
});

vi.mock("@microblink/ux-common/deviceOrientationAnalytics", () => ({
  subscribeToDeviceOrientation: vi.fn(() => () => undefined),
}));

const trackManager = setupDestroyableTeardown<BlinkIdVerifyUxManager>();

const sessionSettings = {
  inputImageSource: "video",
} as BlinkIdVerifySessionSettings;

const deviceInfo = { userAgent: "test" } as DeviceInfo;

const serializedResult: BlinkIdVerifySessionResult = {
  serializedPayload: {
    configuration: "{}",
    sdkMetadata: "{}",
  },
};

const apiResult = createVerifyApiResult();

const createDocumentCapturedProcessResult = (): ProcessResultWithBuffer =>
  ({
    arrayBuffer: new ArrayBuffer(8),
    inputImageAnalysisResult: {
      blurDetected: false,
      glareDetected: false,
      occlusionDetected: false,
      tiltDetected: false,
      screenPresenceDetected: false,
      scanningSide: "first",
      hasBarcodeReadingIssue: false,
      extractionInputImageAnalysisResult: {
        documentLocation: {
          upperLeft: { x: 0, y: 0 },
          upperRight: { x: 0, y: 0 },
          lowerLeft: { x: 0, y: 0 },
          lowerRight: { x: 0, y: 0 },
        },
        processingStatus: "success",
        detectionStatus: "sucess",
        isPassport: false,
        isPassportWithBarcode: false,
        documentOrientation: "horizontal",
        documentRotation: "zero",
      },
    },
    resultCompleteness: {
      scanningStatus: "document-scanned",
    },
  }) as ProcessResultWithBuffer;

type VerifySessionExtra = {
  prepareVerifyRequest?: ReturnType<typeof vi.fn>;
  submitResult?: ReturnType<typeof vi.fn>;
};

const createManager = (
  scanningSession: ReturnType<typeof createFakeScanningSession>,
  options: ConstructorParameters<typeof BlinkIdVerifyUxManager>[2] = {
    consentUxConfig: { consentMode: "NoConsentUI" },
  },
) => {
  const cameraHarness = createFakeCameraHarness();
  const manager = trackManager(
    new BlinkIdVerifyUxManager(
      cameraHarness.cameraManager as unknown as CameraManager,
      scanningSession as unknown as RemoteScanningSession,
      options,
      sessionSettings,
      false,
      false,
      deviceInfo,
    ),
  );
  manager.setTimeoutDuration(null);
  return { cameraHarness, manager };
};

const captureDocument = async (cameraHarness: ReturnType<typeof createFakeCameraHarness>): Promise<void> => {
  cameraHarness.emitPlaybackState("capturing");
  await cameraHarness.emitFrame(createFakeImageData());
  await advanceAndFlushUi(blinkIdVerifyUiStateMap.INTRO_FRONT_PAGE.minDuration + 100);
};

describe("BlinkIdVerifyUxManager capture result resolver", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enableRafAwareFakeTimers();
  });

  test("does not call getResult when capture completes", async () => {
    const scanningSession = createFakeScanningSession<
      BlinkIdVerifyProcessResult & { arrayBuffer: ArrayBuffer },
      BlinkIdVerifySessionSettings,
      BlinkIdVerifySessionResult,
      unknown,
      VerifySessionExtra
    >({
      processResult: createDocumentCapturedProcessResult(),
      extra: {
        prepareVerifyRequest: vi.fn(),
        submitResult: vi.fn(),
      },
    });
    const { cameraHarness, manager } = createManager(scanningSession);
    const onCaptureCompleted = vi.fn();
    manager.addOnCaptureCompletedCallback(onCaptureCompleted);

    await captureDocument(cameraHarness);

    await vi.waitFor(() => {
      expect(onCaptureCompleted).toHaveBeenCalledTimes(1);
    });
    expect(scanningSession.getResult).not.toHaveBeenCalled();
    expect(scanningSession.submitResult).not.toHaveBeenCalled();
  });

  test("verifyOnScanningCompletion submits once then invokes success with the same resolver", async () => {
    const scanningSession = createFakeScanningSession<
      BlinkIdVerifyProcessResult & { arrayBuffer: ArrayBuffer },
      BlinkIdVerifySessionSettings,
      BlinkIdVerifySessionResult,
      unknown,
      VerifySessionExtra
    >({
      processResult: createDocumentCapturedProcessResult(),
      extra: {
        submitResult: vi.fn().mockResolvedValue(apiResult),
      },
    });
    const { cameraHarness, manager } = createManager(scanningSession);
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const onCaptureCompleted = vi.fn();
    manager.verifyOnScanningCompletion({ onSuccess, onError });
    manager.addOnCaptureCompletedCallback(onCaptureCompleted);

    await captureDocument(cameraHarness);

    await vi.waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    const resolver = onSuccess.mock.calls[0]?.[1] as CaptureResultResolver;
    expect(onSuccess).toHaveBeenCalledWith(apiResult, resolver);
    expect(onCaptureCompleted).toHaveBeenCalledTimes(1);
    expect(onCaptureCompleted).toHaveBeenCalledWith(resolver);
    expect(scanningSession.submitResult).toHaveBeenCalledTimes(1);
    expect(scanningSession.getResult).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  test("onCaptureCompleted runs while verify submit is still pending", async () => {
    let resolveSubmit!: (value: VerifyApiResult) => void;
    const scanningSession = createFakeScanningSession<
      BlinkIdVerifyProcessResult & { arrayBuffer: ArrayBuffer },
      BlinkIdVerifySessionSettings,
      BlinkIdVerifySessionResult,
      unknown,
      VerifySessionExtra
    >({
      processResult: createDocumentCapturedProcessResult(),
      extra: {
        submitResult: vi.fn(
          () =>
            new Promise<VerifyApiResult>((resolve) => {
              resolveSubmit = resolve;
            }),
        ),
      },
    });
    const { cameraHarness, manager } = createManager(scanningSession);
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const onCaptureCompleted = vi.fn();
    manager.verifyOnScanningCompletion({ onSuccess, onError });
    manager.addOnCaptureCompletedCallback(onCaptureCompleted);

    await captureDocument(cameraHarness);

    await vi.waitFor(() => {
      expect(onCaptureCompleted).toHaveBeenCalledTimes(1);
    });
    expect(scanningSession.submitResult).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();

    resolveSubmit(apiResult);

    await vi.waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
    expect(onSuccess).toHaveBeenCalledWith(apiResult, onCaptureCompleted.mock.calls[0]?.[0]);
    expect(onError).not.toHaveBeenCalled();
  });

  test("verify API failure goes to onError and is not result_retrieval_failed", async () => {
    const apiError = new VerifyApiError("backend failed", { status: 400, body: { error: "bad request" } });
    const scanningSession = createFakeScanningSession<
      BlinkIdVerifyProcessResult & { arrayBuffer: ArrayBuffer },
      BlinkIdVerifySessionSettings,
      BlinkIdVerifySessionResult,
      unknown,
      VerifySessionExtra
    >({
      processResult: createDocumentCapturedProcessResult(),
      extra: {
        submitResult: vi.fn().mockRejectedValue(apiError),
      },
    });
    const { cameraHarness, manager } = createManager(scanningSession);
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const onProcessingError = vi.fn();
    const onCaptureCompleted = vi.fn();
    manager.verifyOnScanningCompletion({ onSuccess, onError });
    manager.addOnErrorCallback(onProcessingError);
    manager.addOnCaptureCompletedCallback(onCaptureCompleted);

    await captureDocument(cameraHarness);

    await vi.waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onCaptureCompleted).toHaveBeenCalledTimes(1);
    });
    expect(onError.mock.calls[0]?.[0]).toBe(apiError);
    expect(onError.mock.calls[0]?.[1]).toBe(onCaptureCompleted.mock.calls[0]?.[0]);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onProcessingError).not.toHaveBeenCalled();
  });

  test("onError can resubmit the same capture without a new scan", async () => {
    const apiError = new VerifyApiError("backend failed", { status: 503, body: { error: "unavailable" } });
    const retryResult = createVerifyApiResult();
    const scanningSession = createFakeScanningSession<
      BlinkIdVerifyProcessResult & { arrayBuffer: ArrayBuffer },
      BlinkIdVerifySessionSettings,
      BlinkIdVerifySessionResult,
      unknown,
      VerifySessionExtra
    >({
      processResult: createDocumentCapturedProcessResult(),
      extra: {
        submitResult: vi.fn().mockRejectedValueOnce(apiError).mockResolvedValueOnce(retryResult),
      },
    });
    const { cameraHarness, manager } = createManager(scanningSession);
    const onSuccess = vi.fn();
    let resubmitted: VerifyApiResult | undefined;
    const onError = vi.fn(async (_error: VerifyApiError, resolver: CaptureResultResolver) => {
      const retry = await resolver.verifyCaptureResult();
      if (retry.ok) {
        resubmitted = retry.result;
      }
    });
    manager.verifyOnScanningCompletion({ onSuccess, onError });

    await captureDocument(cameraHarness);

    await vi.waitFor(() => {
      expect(resubmitted).toBe(retryResult);
    });
    expect(onError).toHaveBeenCalledTimes(1);
    expect(scanningSession.submitResult).toHaveBeenCalledTimes(2);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  test("resetScanningSession from the capture callback accepts later frames", async () => {
    const scanningSession = createFakeScanningSession<
      BlinkIdVerifyProcessResult & { arrayBuffer: ArrayBuffer },
      BlinkIdVerifySessionSettings,
      BlinkIdVerifySessionResult
    >({
      processResult: createDocumentCapturedProcessResult(),
    });
    const { cameraHarness, manager } = createManager(scanningSession);
    const onCaptureCompleted = vi.fn(async () => {
      await manager.resetScanningSession();
    });
    manager.addOnCaptureCompletedCallback(onCaptureCompleted);

    await captureDocument(cameraHarness);

    await vi.waitFor(() => {
      expect(onCaptureCompleted).toHaveBeenCalledTimes(1);
    });
    await onCaptureCompleted.mock.results[0]?.value;

    const processedFrames = scanningSession.process.mock.calls.length;
    cameraHarness.emitPlaybackState("capturing");
    await cameraHarness.emitFrame(createFakeImageData());

    expect(scanningSession.process).toHaveBeenCalledTimes(processedFrames + 1);
  });

  test("resolver methods forward stored consent after external consent is applied", async () => {
    const consent: Consent = {
      durationDays: 14,
      userId: "external-user",
      givenOn: "2026-02-01T00:00:00.000Z",
    };
    const scanningSession = createFakeScanningSession<
      BlinkIdVerifyProcessResult & { arrayBuffer: ArrayBuffer },
      BlinkIdVerifySessionSettings,
      BlinkIdVerifySessionResult,
      unknown,
      VerifySessionExtra
    >({
      processResult: createDocumentCapturedProcessResult(),
      result: {
        serializedPayload: serializedResult.serializedPayload,
        typedPayload: {
          configuration: {},
          consent,
        },
      },
      extra: {
        prepareVerifyRequest: vi.fn().mockResolvedValue({
          url: "https://verify.example.com/verify",
          method: "POST",
          headers: {},
          body: new Uint8Array(),
        }),
        submitResult: vi.fn().mockResolvedValue(apiResult),
      },
    });
    const { cameraHarness, manager } = createManager(scanningSession, {
      consentUxConfig: {
        consentMode: "ProvideExternalConsent",
        consent,
      },
    });
    const onCaptureCompleted = vi.fn();
    manager.addOnCaptureCompletedCallback(onCaptureCompleted);

    await captureDocument(cameraHarness);

    await vi.waitFor(() => {
      expect(onCaptureCompleted).toHaveBeenCalledTimes(1);
    });

    const resolver = onCaptureCompleted.mock.calls[0]?.[0] as CaptureResultResolver;
    await resolver.getCaptureResult();
    await resolver.verifyCaptureResult();

    expect(scanningSession.getResult).toHaveBeenCalledWith(consent, "include-typed-payload");
    expect(scanningSession.submitResult).toHaveBeenCalledWith(consent);
  });
});
