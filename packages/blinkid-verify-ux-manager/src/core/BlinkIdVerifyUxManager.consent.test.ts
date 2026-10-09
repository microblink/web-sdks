/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type {
  BlinkIdVerifySessionSettings,
  Consent,
  DeviceInfo,
  ProcessResultWithBuffer,
  RemoteScanningSession,
} from "@microblink/blinkid-verify-core";
import type { CameraManager } from "@microblink/camera-manager/core";
import type { CameraManagerComponent } from "@microblink/camera-manager/ui";
import {
  createFakeCameraHarness,
  createFakeImageData,
  createFakeScanningSession,
  enableRafAwareFakeTimers,
  setupDestroyableTeardown,
} from "@microblink/test-utils";
import { advanceAndFlushUi } from "@microblink/test-utils/vitest/timers";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { blinkIdVerifyUiStateMap } from "./blinkid-verify-ui-state";
import { BlinkIdVerifyConsentGate } from "./BlinkIdVerifyConsentGate";
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

const mockShowConsentUi = vi.hoisted(() =>
  vi.fn(
    (): Promise<Consent> =>
      Promise.resolve({
        durationDays: 365,
        userId: "stub-user-id",
        givenOn: "2026-01-01T00:00:00.000Z",
      }),
  ),
);

vi.mock("../ui/showConsentUi", () => ({
  showConsentUi: mockShowConsentUi,
}));

vi.mock("@microblink/ux-common/deviceOrientationAnalytics", () => ({
  subscribeToDeviceOrientation: vi.fn(() => () => undefined),
}));

const trackManager = setupDestroyableTeardown<BlinkIdVerifyUxManager>();

const sessionSettings = {
  inputImageSource: "video",
} as BlinkIdVerifySessionSettings;

const deviceInfo = { userAgent: "test" } as DeviceInfo;

const requireConsentConfig = {
  consentMode: "RequireConsent" as const,
  consent: {
    userId: "ui-user",
    durationDays: 180,
  },
};

const createManager = (
  scanningSession: ReturnType<typeof createFakeScanningSession>,
  options: ConstructorParameters<typeof BlinkIdVerifyUxManager>[2] = {
    consentUxConfig: requireConsentConfig,
  },
) => {
  const cameraHarness = createFakeCameraHarness();
  return {
    cameraHarness,
    manager: trackManager(
      new BlinkIdVerifyUxManager(
        cameraHarness.cameraManager as unknown as CameraManager,
        scanningSession as unknown as RemoteScanningSession,
        options,
        sessionSettings,
        false,
        false,
        deviceInfo,
      ),
    ),
  };
};

const createCameraUi = () => {
  const dismount = vi.fn();
  const cameraUi = {
    overlayLayerNode: document.createElement("div"),
    owner: null,
    dismount,
  } as unknown as CameraManagerComponent;

  return { cameraUi, dismount };
};

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

const createCapturedScanningSession = () =>
  createFakeScanningSession({
    processResult: createDocumentCapturedProcessResult(),
    result: {
      serializedPayload: {
        configuration: "{}",
        sdkMetadata: "{}",
      },
      typedPayload: {
        configuration: {},
      },
    },
  });

/** Completes capture, then reads the session result through the capture resolver. */
const requestSessionResult = async (
  cameraHarness: ReturnType<typeof createFakeCameraHarness>,
  manager: BlinkIdVerifyUxManager,
) => {
  manager.setTimeoutDuration(null);
  const onCaptureCompleted = vi.fn();
  manager.addOnCaptureCompletedCallback(onCaptureCompleted);

  cameraHarness.emitPlaybackState("capturing");
  await cameraHarness.emitFrame(createFakeImageData());
  await advanceAndFlushUi(blinkIdVerifyUiStateMap.INTRO_FRONT_PAGE.minDuration + 100);

  await vi.waitFor(() => {
    expect(onCaptureCompleted).toHaveBeenCalledTimes(1);
  });

  const resolver = onCaptureCompleted.mock.calls[0]?.[0] as CaptureResultResolver;
  await resolver.getCaptureResult();
};

describe("BlinkIdVerifyUxManager consent gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enableRafAwareFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.replaceChildren();
  });

  test("generates the payload without consent when consent UI is disabled", async () => {
    const scanningSession = createCapturedScanningSession();
    const { cameraHarness, manager } = createManager(scanningSession, {
      consentUxConfig: { consentMode: "NoConsentUI" },
    });

    await requestSessionResult(cameraHarness, manager);

    expect(mockShowConsentUi).not.toHaveBeenCalled();
    expect(scanningSession.getResult).toHaveBeenCalledWith(undefined, "include-typed-payload");
  });

  test("applies external consent without showing the modal", async () => {
    const consent: Consent = {
      durationDays: 30,
      userId: "pre-supplied-user",
      givenOn: "2026-02-01T00:00:00.000Z",
    };
    const scanningSession = createCapturedScanningSession();
    const { cameraHarness, manager } = createManager(scanningSession, {
      consentUxConfig: {
        consentMode: "ProvideExternalConsent",
        consent,
      },
    });

    await requestSessionResult(cameraHarness, manager);

    expect(mockShowConsentUi).not.toHaveBeenCalled();
    expect(scanningSession.getResult).toHaveBeenCalledWith(consent, "include-typed-payload");
  });

  test("passes the consent generated by the modal into the result payload", async () => {
    const generatedConsent: Consent = {
      durationDays: 180,
      userId: "ui-user",
      givenOn: "2026-01-01T00:00:00.000Z",
    };
    mockShowConsentUi.mockResolvedValueOnce(generatedConsent);

    const scanningSession = createCapturedScanningSession();
    const { cameraHarness, manager } = createManager(scanningSession, {
      consentUxConfig: {
        consentMode: "RequireConsent",
        consent: {
          userId: "ui-user",
          durationDays: 180,
          customerContext: { customerId: "customer-1" },
        },
      },
    });
    const gate = new BlinkIdVerifyConsentGate(manager, {
      userId: "ui-user",
      durationDays: 180,
      customerContext: { customerId: "customer-1" },
    });
    const { cameraUi } = createCameraUi();

    await expect(gate.consentUiResponse(cameraUi)).resolves.toBe(manager);
    await requestSessionResult(cameraHarness, manager);

    expect(mockShowConsentUi).toHaveBeenCalledWith(
      cameraUi,
      {
        userId: "ui-user",
        durationDays: 180,
        customerContext: { customerId: "customer-1" },
      },
      undefined,
    );
    expect(scanningSession.getResult).toHaveBeenCalledWith(generatedConsent, "include-typed-payload");
  });

  test("forwards localization overrides into the consent dialog", async () => {
    const localizationStrings = {
      consent_modal: {
        title: "Custom consent title",
      },
    };
    const scanningSession = createCapturedScanningSession();
    const { manager } = createManager(scanningSession);
    const gate = new BlinkIdVerifyConsentGate(manager, requireConsentConfig.consent);
    const { cameraUi } = createCameraUi();

    await gate.consentUiResponse(cameraUi, localizationStrings);

    expect(mockShowConsentUi).toHaveBeenCalledWith(cameraUi, requireConsentConfig.consent, localizationStrings);
  });

  test("does not show the modal again after consent is accepted", async () => {
    const scanningSession = createFakeScanningSession();
    const { manager } = createManager(scanningSession);
    const gate = new BlinkIdVerifyConsentGate(manager, requireConsentConfig.consent);
    const { cameraUi } = createCameraUi();

    await expect(gate.consentUiResponse(cameraUi)).resolves.toBe(manager);
    await expect(gate.consentUiResponse(cameraUi)).resolves.toBe(manager);

    expect(mockShowConsentUi).toHaveBeenCalledTimes(1);
  });

  test("dismounts and destroys the manager when consent is declined", async () => {
    mockShowConsentUi.mockRejectedValueOnce(undefined);

    const scanningSession = createFakeScanningSession();
    const { manager } = createManager(scanningSession);
    const gate = new BlinkIdVerifyConsentGate(manager, requireConsentConfig.consent);
    const { cameraUi, dismount } = createCameraUi();
    const onResult = vi.fn();
    const onError = vi.fn();
    const destroySpy = vi.spyOn(manager, "destroy");

    manager.addOnCaptureCompletedCallback(onResult);
    manager.addOnErrorCallback(onError);

    await expect(gate.consentUiResponse(cameraUi)).resolves.toBeUndefined();

    expect(scanningSession.getResult).not.toHaveBeenCalled();
    expect(onResult).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(dismount).toHaveBeenCalledTimes(1);
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("ignores frames until RequireConsent is accepted", async () => {
    const scanningSession = createFakeScanningSession();
    const { cameraHarness, manager } = createManager(scanningSession);
    const gate = new BlinkIdVerifyConsentGate(manager, requireConsentConfig.consent);
    const { cameraUi } = createCameraUi();

    await cameraHarness.emitFrame(createFakeImageData());
    expect(scanningSession.process).not.toHaveBeenCalled();

    await gate.consentUiResponse(cameraUi);
    await cameraHarness.emitFrame(createFakeImageData());

    expect(scanningSession.process).toHaveBeenCalledTimes(1);
  });

  test("destroy abandons the flow before acceptance", async () => {
    const scanningSession = createFakeScanningSession();
    const { cameraHarness, manager } = createManager(scanningSession);
    const gate = new BlinkIdVerifyConsentGate(manager, requireConsentConfig.consent);
    const { cameraUi } = createCameraUi();

    gate.destroy();

    await expect(gate.consentUiResponse(cameraUi)).resolves.toBeUndefined();
    await cameraHarness.emitFrame(createFakeImageData());

    expect(mockShowConsentUi).not.toHaveBeenCalled();
    expect(scanningSession.process).not.toHaveBeenCalled();
  });

  test("destroy after acceptance leaves the manager to the caller", async () => {
    const scanningSession = createFakeScanningSession();
    const { manager } = createManager(scanningSession);
    const gate = new BlinkIdVerifyConsentGate(manager, requireConsentConfig.consent);
    const { cameraUi } = createCameraUi();
    const destroySpy = vi.spyOn(manager, "destroy");

    await gate.consentUiResponse(cameraUi);
    gate.destroy();

    expect(destroySpy).not.toHaveBeenCalled();
  });
});
