/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// ============================================================================
// Hoisted Mocks & State
// ============================================================================

/** Ref to the FakeCameraManager instance created when CameraManager is constructed (set by mock). */
const fakeCameraManagerRef = vi.hoisted(() => ({
  current: null as InstanceType<typeof import("@microblink/test-utils").FakeCameraManager> | null,
}));

const {
  mockCreateSession,
  mockTerminate,
  mockReportPinglet,
  mockSendPinglets,
  mockCreateBlinkIdVerifyUxManager,
  mockCreateBlinkIdVerifyFeedbackUi,
  mockAddOnCaptureCompletedCallback,
  mockVerifyOnScanningCompletion,
  mockAddOnErrorCallback,
  mockAddOnFrameProcessCallback,
  MockConsentGate,
  mockDismount,
  mockCameraUi,
  mockCreateCameraManagerUi,
} = vi.hoisted(() => {
  const mockTerminate = vi.fn().mockResolvedValue(undefined);
  const mockCreateSession = vi.fn();
  const mockReportPinglet = vi.fn().mockResolvedValue(undefined);
  const mockSendPinglets = vi.fn().mockResolvedValue(undefined);
  const mockAddOnCaptureCompletedCallback = vi.fn();
  const mockVerifyOnScanningCompletion = vi.fn();
  const mockAddOnErrorCallback = vi.fn();
  const mockAddOnFrameProcessCallback = vi.fn();
  const mockConsentUiResponse = vi.fn().mockResolvedValue(undefined);
  class MockConsentGate {
    consentUiResponse = mockConsentUiResponse;
    destroy = vi.fn();
  }
  const mockCreateBlinkIdVerifyUxManager = vi.fn().mockResolvedValue({
    addOnCaptureCompletedCallback: mockAddOnCaptureCompletedCallback,
    verifyOnScanningCompletion: mockVerifyOnScanningCompletion,
    addOnErrorCallback: mockAddOnErrorCallback,
    addOnFrameProcessCallback: mockAddOnFrameProcessCallback,
    destroy: vi.fn(),
  });
  const mockCreateBlinkIdVerifyFeedbackUi = vi.fn();
  const mockDismount = vi.fn();
  const mockCameraUi = { dismount: mockDismount };
  const mockCreateCameraManagerUi = vi.fn().mockResolvedValue(mockCameraUi);

  return {
    mockTerminate,
    mockCreateSession,
    mockReportPinglet,
    mockSendPinglets,
    mockCreateBlinkIdVerifyUxManager,
    mockCreateBlinkIdVerifyFeedbackUi,
    mockAddOnCaptureCompletedCallback,
    mockVerifyOnScanningCompletion,
    mockAddOnErrorCallback,
    mockAddOnFrameProcessCallback,
    mockConsentUiResponse,
    MockConsentGate,
    mockDismount,
    mockCameraUi,
    mockCreateCameraManagerUi,
  };
});

// ============================================================================
// Module Mocks (use test-utils: FakeCameraManager, createFakeScanningSession)
// ============================================================================

vi.mock("@microblink/blinkid-verify-core", () => ({
  loadBlinkIdVerifyCore: vi.fn().mockResolvedValue({
    createScanningSession: mockCreateSession,
    terminate: mockTerminate,
    reportPinglet: mockReportPinglet,
    sendPinglets: mockSendPinglets,
  }),
  BlinkIdVerifySessionSettings: class {},
}));

vi.mock("@microblink/blinkid-verify-ux-manager/core", () => ({
  BlinkIdVerifyConsentGate: MockConsentGate,
  get createBlinkIdVerifyUxManager() {
    return mockCreateBlinkIdVerifyUxManager;
  },
}));

vi.mock("@microblink/blinkid-verify-ux-manager/ui", () => ({
  get createBlinkIdVerifyFeedbackUi() {
    return mockCreateBlinkIdVerifyFeedbackUi;
  },
  FeedbackUiOptions: {},
  LocalizationStrings: {},
}));

vi.mock("@microblink/camera-manager/core", async () => {
  const { FakeCameraManager } = await import("@microblink/test-utils");
  return {
    CameraManager: function (this: unknown) {
      const instance = new FakeCameraManager();
      fakeCameraManagerRef.current = instance;
      return instance;
    },
  };
});

vi.mock("@microblink/camera-manager/ui", () => ({
  createCameraManagerUi: mockCreateCameraManagerUi,
}));

import { createFakeScanningSession } from "@microblink/test-utils";

import {
  BlinkIdVerifyConsentDeclinedError,
  createBlinkIdVerify,
  type BlinkIdVerifyComponentOptions,
} from "./createBlinkIdVerify";

/**
 * Test file role:
 *
 * - Verifies that createBlinkIdVerify correctly initializes and wires all SDK components.
 * - Uses FakeCameraManager and createFakeScanningSession from @microblink/test-utils.
 * - Covers option forwarding, playback subscription, destroy lifecycle, and callback delegation.
 * - Does not own UX manager behavior (see blinkid-verify-ux-manager package tests).
 * - Does not own camera-manager behavior (see camera-manager package tests).
 */
describe("createBlinkIdVerify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fakeCameraManagerRef.current = null;
    mockCreateSession.mockResolvedValue(createFakeScanningSession());
    mockCreateBlinkIdVerifyUxManager.mockResolvedValue({
      addOnCaptureCompletedCallback: mockAddOnCaptureCompletedCallback,
      verifyOnScanningCompletion: mockVerifyOnScanningCompletion,
      addOnErrorCallback: mockAddOnErrorCallback,
      addOnFrameProcessCallback: mockAddOnFrameProcessCallback,
      destroy: vi.fn(),
    });
    mockCreateCameraManagerUi.mockResolvedValue(mockCameraUi);
  });

  afterEach(async () => {
    await Promise.resolve();
    await Promise.resolve();
    fakeCameraManagerRef.current = null;
  });

  test("returns a BlinkIdVerifyComponent with all required properties", async () => {
    const component = await createBlinkIdVerify({ licenseKey: "test-key" });

    expect(component).toHaveProperty("blinkIdVerifyCore");
    expect(component).toHaveProperty("cameraManager");
    expect(component).toHaveProperty("blinkIdVerifyUxManager");
    expect(component).toHaveProperty("cameraUi", mockCameraUi);
    expect(component).toHaveProperty("destroy");
    expect(component).toHaveProperty("addOnCaptureCompletedCallback");
    expect(component).toHaveProperty("verifyOnScanningCompletion");
    expect(component).toHaveProperty("addOnErrorCallback");
    expect(component).toHaveProperty("addOnFrameProcessCallback");
    expect(typeof component.destroy).toBe("function");
    expect(typeof component.addOnCaptureCompletedCallback).toBe("function");
    expect(typeof component.verifyOnScanningCompletion).toBe("function");
  });

  test("calls loadBlinkIdVerifyCore with init options (licenseKey and optional fields)", async () => {
    const { loadBlinkIdVerifyCore } = await import("@microblink/blinkid-verify-core");

    await createBlinkIdVerify({
      licenseKey: "my-license",
      microblinkProxyUrl: "https://proxy.example.com",
      initialMemory: 32,
      resourcesLocation: "https://resources.example.com",
      wasmVariant: "simd",
    });

    expect(loadBlinkIdVerifyCore).toHaveBeenCalledTimes(1);
    expect(loadBlinkIdVerifyCore).toHaveBeenCalledWith({
      licenseKey: "my-license",
      microblinkProxyUrl: "https://proxy.example.com",
      initialMemory: 32,
      resourcesLocation: "https://resources.example.com",
      wasmVariant: "simd",
    });
  });

  test("calls createScanningSession with native session settings when provided", async () => {
    const configuration = {
      verification: {
        settings: {
          rejectExpiredDocuments: true,
        },
      },
    } satisfies NonNullable<BlinkIdVerifyComponentOptions["configuration"]>;

    await createBlinkIdVerify({
      licenseKey: "test-key",
      configuration,
      traceId: "verify-trace-id",
    });

    expect(mockCreateSession).toHaveBeenCalledTimes(1);
    expect(mockCreateSession).toHaveBeenCalledWith({
      configuration,
      traceId: "verify-trace-id",
    });
  });

  test("resolves with minimal options (licenseKey only)", async () => {
    const component = await createBlinkIdVerify({ licenseKey: "test-key" });

    expect(component).toBeDefined();
    expect(component.blinkIdVerifyCore).toBeDefined();
    expect(mockCreateSession).toHaveBeenCalledWith({
      configuration: undefined,
      traceId: undefined,
    });
  });

  test("calls createBlinkIdVerifyUxManager with cameraManager and scanningSession", async () => {
    await createBlinkIdVerify({ licenseKey: "test-key" });

    expect(mockCreateBlinkIdVerifyUxManager).toHaveBeenCalledTimes(1);
    const [cameraManagerArg, sessionArg] = mockCreateBlinkIdVerifyUxManager.mock.calls[0];
    expect(cameraManagerArg).toBe(fakeCameraManagerRef.current);
    expect(sessionArg).toBeDefined();
    expect(sessionArg).toHaveProperty("process");
    expect(mockCreateBlinkIdVerifyUxManager).toHaveBeenCalledWith(fakeCameraManagerRef.current, sessionArg, undefined);
  });

  test("passes uxManagerOptions to createBlinkIdVerifyUxManager", async () => {
    const uxManagerOptions = {
      consentUxConfig: {
        consentMode: "ProvideExternalConsent",
        consent: {
          durationDays: 30,
          userId: "pre-supplied-user",
          givenOn: "2026-02-01T00:00:00.000Z",
        },
      },
    } satisfies NonNullable<BlinkIdVerifyComponentOptions["uxManagerOptions"]>;

    await createBlinkIdVerify({
      licenseKey: "test-key",
      uxManagerOptions,
    });

    expect(mockCreateBlinkIdVerifyUxManager).toHaveBeenCalledTimes(1);
    expect(mockCreateBlinkIdVerifyUxManager.mock.calls[0]?.[2]).toEqual(uxManagerOptions);
  });

  test("forwards verifyApiBaseUrl to loadBlinkIdVerifyCore", async () => {
    const { loadBlinkIdVerifyCore } = await import("@microblink/blinkid-verify-core");

    const component = await createBlinkIdVerify({
      licenseKey: "test-key",
      verifyApiBaseUrl: "https://verify.example.com",
    });

    expect(loadBlinkIdVerifyCore).toHaveBeenCalledWith(
      expect.objectContaining({
        licenseKey: "test-key",
        verifyApiBaseUrl: "https://verify.example.com",
      }),
    );
    expect(mockCreateBlinkIdVerifyUxManager.mock.calls[0]?.[2]).toBeUndefined();
    expect(typeof component.verifyOnScanningCompletion).toBe("function");
  });

  test("calls createCameraManagerUi with cameraManager, targetNode, and cameraManagerUiOptions", async () => {
    await createBlinkIdVerify({
      licenseKey: "test-key",
      targetNode: undefined,
    });

    expect(mockCreateCameraManagerUi).toHaveBeenCalledTimes(1);
    expect(mockCreateCameraManagerUi).toHaveBeenCalledWith(fakeCameraManagerRef.current, undefined, undefined);
  });

  test("passes custom targetNode and cameraManagerUiOptions to createCameraManagerUi", async () => {
    const targetNode = {} as HTMLElement;
    const cameraManagerUiOptions = {
      someOption: true,
    } as BlinkIdVerifyComponentOptions["cameraManagerUiOptions"];

    await createBlinkIdVerify({
      licenseKey: "test-key",
      targetNode,
      cameraManagerUiOptions,
    });

    expect(mockCreateCameraManagerUi).toHaveBeenCalledWith(
      fakeCameraManagerRef.current,
      targetNode,
      cameraManagerUiOptions,
    );
  });

  test("subscribes to playbackState and calls createBlinkIdVerifyFeedbackUi when playback is triggered", async () => {
    await createBlinkIdVerify({
      licenseKey: "test-key",
      feedbackUiOptions: { showOnboardingGuide: true },
    });

    expect(fakeCameraManagerRef.current).not.toBeNull();
    expect(fakeCameraManagerRef.current!.subscribe).toHaveBeenCalledTimes(1);

    fakeCameraManagerRef.current!.emitPlaybackState("playback");

    expect(mockCreateBlinkIdVerifyFeedbackUi).toHaveBeenCalledTimes(1);
    expect(mockCreateBlinkIdVerifyFeedbackUi).toHaveBeenCalledWith(
      await mockCreateBlinkIdVerifyUxManager(),
      mockCameraUi,
      { showOnboardingGuide: true },
    );
  });

  test("passes empty object to createBlinkIdVerifyFeedbackUi when feedbackUiOptions is undefined", async () => {
    await createBlinkIdVerify({ licenseKey: "test-key" });

    fakeCameraManagerRef.current!.emitPlaybackState("playback");

    expect(mockCreateBlinkIdVerifyFeedbackUi).toHaveBeenCalledWith(expect.any(Object), mockCameraUi, {});
  });

  test("calls startFrameCapture when feedbackUiOptions.showOnboardingGuide is false and playback fires", async () => {
    await createBlinkIdVerify({
      licenseKey: "test-key",
      feedbackUiOptions: { showOnboardingGuide: false },
    });

    expect(fakeCameraManagerRef.current!.startFrameCapture).not.toHaveBeenCalled();

    fakeCameraManagerRef.current!.emitPlaybackState("playback");

    expect(fakeCameraManagerRef.current!.startFrameCapture).toHaveBeenCalledTimes(1);
  });

  test("does not call startFrameCapture when showOnboardingGuide is true or omitted", async () => {
    await createBlinkIdVerify({
      licenseKey: "test-key",
      feedbackUiOptions: { showOnboardingGuide: true },
    });

    fakeCameraManagerRef.current!.emitPlaybackState("playback");

    expect(fakeCameraManagerRef.current!.startFrameCapture).not.toHaveBeenCalled();
  });

  test("awaits the consent gate before starting the camera stream", async () => {
    const manager = {
      addOnCaptureCompletedCallback: mockAddOnCaptureCompletedCallback,
      verifyOnScanningCompletion: mockVerifyOnScanningCompletion,
      addOnErrorCallback: mockAddOnErrorCallback,
      addOnFrameProcessCallback: mockAddOnFrameProcessCallback,
    };
    let resolveConsent!: (value: typeof manager | undefined) => void;
    const gate = new MockConsentGate();
    gate.consentUiResponse = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveConsent = resolve;
        }),
    );
    mockCreateBlinkIdVerifyUxManager.mockResolvedValueOnce(gate);

    const pendingComponent = createBlinkIdVerify({
      licenseKey: "test-key",
      uxManagerOptions: {
        consentUxConfig: {
          consentMode: "RequireConsent",
          consent: {
            userId: "ui-user",
            durationDays: 30,
          },
        },
      },
    });

    await vi.waitFor(() => {
      expect(gate.consentUiResponse).toHaveBeenCalledWith(mockCameraUi, undefined);
    });
    expect(fakeCameraManagerRef.current!.startCameraStream).not.toHaveBeenCalled();

    resolveConsent(manager);
    const component = await pendingComponent;

    expect(component.blinkIdVerifyUxManager).toBe(manager);
    expect(fakeCameraManagerRef.current!.startCameraStream).toHaveBeenCalledTimes(1);
  });

  test("passes feedback localization strings to the consent dialog", async () => {
    const localizationStrings = {
      consent_modal: {
        title: "Custom consent title",
      },
    };
    const gate = new MockConsentGate();
    gate.consentUiResponse = vi.fn().mockResolvedValue({
      addOnCaptureCompletedCallback: mockAddOnCaptureCompletedCallback,
      verifyOnScanningCompletion: mockVerifyOnScanningCompletion,
      addOnErrorCallback: mockAddOnErrorCallback,
      addOnFrameProcessCallback: mockAddOnFrameProcessCallback,
    });
    mockCreateBlinkIdVerifyUxManager.mockResolvedValueOnce(gate);

    await createBlinkIdVerify({
      licenseKey: "test-key",
      feedbackUiOptions: { localizationStrings },
      uxManagerOptions: {
        consentUxConfig: {
          consentMode: "RequireConsent",
          consent: {
            userId: "ui-user",
            durationDays: 30,
          },
        },
      },
    });

    expect(gate.consentUiResponse).toHaveBeenCalledWith(mockCameraUi, localizationStrings);
  });

  test("throws when consent is declined and does not start the camera stream", async () => {
    const gate = new MockConsentGate();
    gate.consentUiResponse = vi.fn().mockResolvedValue(undefined);
    mockCreateBlinkIdVerifyUxManager.mockResolvedValueOnce(gate);

    await expect(
      createBlinkIdVerify({
        licenseKey: "test-key",
        uxManagerOptions: {
          consentUxConfig: {
            consentMode: "RequireConsent",
            consent: {
              userId: "ui-user",
              durationDays: 30,
            },
          },
        },
      }),
    ).rejects.toBeInstanceOf(BlinkIdVerifyConsentDeclinedError);

    expect(mockTerminate).toHaveBeenCalledTimes(1);
    expect(fakeCameraManagerRef.current!.startCameraStream).not.toHaveBeenCalled();
    expect(mockReportPinglet).not.toHaveBeenCalled();
  });

  test("best-effort reports crashes through the core before a session exists", async () => {
    mockCreateSession.mockRejectedValueOnce(new Error("session failed"));

    await expect(createBlinkIdVerify({ licenseKey: "test-key" })).rejects.toThrow("session failed");

    expect(mockReportPinglet).toHaveBeenCalledWith(
      expect.objectContaining({
        schemaName: "ping.error",
        sessionNumber: 0,
        data: expect.objectContaining({
          errorType: "Crash",
          errorMessage: "sdk.createBlinkIdVerify: session failed",
        }),
      }),
    );
    expect(mockSendPinglets).toHaveBeenCalledTimes(1);
  });

  test("best-effort reports crashes through the core after session creation", async () => {
    const scanningSession = createFakeScanningSession();
    mockCreateSession.mockResolvedValueOnce(scanningSession);
    mockCreateBlinkIdVerifyUxManager.mockRejectedValueOnce(new Error("ux failed"));

    await expect(createBlinkIdVerify({ licenseKey: "test-key" })).rejects.toThrow("ux failed");

    expect(mockReportPinglet).toHaveBeenCalledWith(
      expect.objectContaining({
        schemaName: "ping.error",
        sessionNumber: 0,
        data: expect.objectContaining({
          errorType: "Crash",
          errorMessage: "sdk.createBlinkIdVerify: ux failed",
        }),
      }),
    );
    const firstPinglet = mockReportPinglet.mock.calls[0]?.[0] as { sessionNumber?: number } | undefined;

    expect(firstPinglet?.sessionNumber).toBe(0);
    expect(mockSendPinglets).toHaveBeenCalledTimes(1);
    expect(scanningSession.ping).not.toHaveBeenCalled();
    expect(scanningSession.sendPinglets).not.toHaveBeenCalled();
  });

  test("creates feedback UI only once even if playbackState fires multiple times", async () => {
    await createBlinkIdVerify({ licenseKey: "test-key" });

    fakeCameraManagerRef.current!.emitPlaybackState("playback");
    fakeCameraManagerRef.current!.emitPlaybackState("playback");

    expect(mockCreateBlinkIdVerifyFeedbackUi).toHaveBeenCalledTimes(1);
  });

  test("destroy() calls cameraUi.dismount() and blinkIdVerifyCore.terminate()", async () => {
    const component = await createBlinkIdVerify({ licenseKey: "test-key" });

    await component.destroy();

    expect(mockDismount).toHaveBeenCalledTimes(1);
    expect(mockTerminate).toHaveBeenCalledTimes(1);
  });

  test("destroy() does not throw when terminate() rejects", async () => {
    mockTerminate.mockRejectedValueOnce(new Error("terminate failed"));
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const component = await createBlinkIdVerify({ licenseKey: "test-key" });

    await expect(component.destroy()).resolves.toBeUndefined();
    expect(consoleWarnSpy).toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
  });

  test("addOnCaptureCompletedCallback, verifyOnScanningCompletion, addOnErrorCallback, and addOnFrameProcessCallback invoke UX manager methods", async () => {
    const component = await createBlinkIdVerify({ licenseKey: "test-key" });
    const captureCompletedCb = vi.fn();
    const verifySuccessCb = vi.fn();
    const verifyErrorCb = vi.fn();
    const errorCb = vi.fn();
    const frameCb = vi.fn();

    component.addOnCaptureCompletedCallback(captureCompletedCb);
    component.verifyOnScanningCompletion({ onSuccess: verifySuccessCb, onError: verifyErrorCb });
    component.addOnErrorCallback(errorCb);
    component.addOnFrameProcessCallback(frameCb);

    expect(mockAddOnCaptureCompletedCallback).toHaveBeenCalledWith(captureCompletedCb);
    expect(mockVerifyOnScanningCompletion).toHaveBeenCalledWith({
      onSuccess: verifySuccessCb,
      onError: verifyErrorCb,
    });
    expect(mockAddOnErrorCallback).toHaveBeenCalledWith(errorCb);
    expect(mockAddOnFrameProcessCallback).toHaveBeenCalledWith(frameCb);
  });
});
