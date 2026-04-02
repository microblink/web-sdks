/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// ============================================================================
// Hoisted Mocks & State
// ============================================================================

/** Ref to the FakeCameraManager instance created when CameraManager is constructed (set by mock). */
const fakeCameraManagerRef = vi.hoisted(() => ({
  current: null as InstanceType<
    typeof import("@microblink/test-utils").FakeCameraManager
  > | null,
}));

const {
  mockCreateSession,
  mockTerminate,
  mockReportPinglet,
  mockSendPinglets,
  mockCreateBlinkIdVerifyUxManager,
  mockCreateBlinkIdVerifyFeedbackUi,
  mockAddOnResultCallback,
  mockAddOnErrorCallback,
  mockAddOnFrameProcessCallback,
  mockDismount,
  mockCameraUi,
  mockCreateCameraManagerUi,
} = vi.hoisted(() => {
  const mockTerminate = vi.fn().mockResolvedValue(undefined);
  const mockCreateSession = vi.fn();
  const mockReportPinglet = vi.fn().mockResolvedValue(undefined);
  const mockSendPinglets = vi.fn().mockResolvedValue(undefined);
  const mockAddOnResultCallback = vi.fn();
  const mockAddOnErrorCallback = vi.fn();
  const mockAddOnFrameProcessCallback = vi.fn();
  const mockCreateBlinkIdVerifyUxManager = vi.fn().mockResolvedValue({
    addOnResultCallback: mockAddOnResultCallback,
    addOnErrorCallback: mockAddOnErrorCallback,
    addOnFrameProcessCallback: mockAddOnFrameProcessCallback,
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
    mockAddOnResultCallback,
    mockAddOnErrorCallback,
    mockAddOnFrameProcessCallback,
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

vi.mock("@microblink/blinkid-verify-ux-manager", () => ({
  get createBlinkIdVerifyUxManager() {
    return mockCreateBlinkIdVerifyUxManager;
  },
  get createBlinkIdVerifyFeedbackUi() {
    return mockCreateBlinkIdVerifyFeedbackUi;
  },
  FeedbackUiOptions: {},
  LocalizationStrings: {},
}));

vi.mock("@microblink/camera-manager", async () => {
  const { FakeCameraManager } = await import("@microblink/test-utils");
  return {
    CameraManager: function (this: unknown) {
      const instance = new FakeCameraManager();
      fakeCameraManagerRef.current = instance;
      return instance;
    },
    createCameraManagerUi: mockCreateCameraManagerUi,
  };
});

import { createFakeScanningSession } from "@microblink/test-utils";
import {
  createBlinkIdVerify,
  type BlinkIdVerifyComponentOptions,
} from "./createBlinkIdVerify";

/**
 * Test file role:
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
      addOnResultCallback: mockAddOnResultCallback,
      addOnErrorCallback: mockAddOnErrorCallback,
      addOnFrameProcessCallback: mockAddOnFrameProcessCallback,
    });
    mockCreateCameraManagerUi.mockResolvedValue(mockCameraUi);
  });

  afterEach(() => {
    fakeCameraManagerRef.current = null;
  });

  test("returns a BlinkIdVerifyComponent with all required properties", async () => {
    const component = await createBlinkIdVerify({ licenseKey: "test-key" });

    expect(component).toHaveProperty("blinkIdVerifyCore");
    expect(component).toHaveProperty("cameraManager");
    expect(component).toHaveProperty("blinkIdVerifyUxManager");
    expect(component).toHaveProperty("cameraUi", mockCameraUi);
    expect(component).toHaveProperty("destroy");
    expect(component).toHaveProperty("addOnResultCallback");
    expect(component).toHaveProperty("addOnErrorCallback");
    expect(component).toHaveProperty("addOnFrameProcessCallback");
    expect(typeof component.destroy).toBe("function");
    expect(typeof component.addOnResultCallback).toBe("function");
    expect(typeof component.addOnErrorCallback).toBe("function");
    expect(typeof component.addOnFrameProcessCallback).toBe("function");
  });

  test("calls loadBlinkIdVerifyCore with init options (licenseKey and optional fields)", async () => {
    const { loadBlinkIdVerifyCore } =
      await import("@microblink/blinkid-verify-core");

    await createBlinkIdVerify({
      licenseKey: "my-license",
      microblinkProxyUrl: "https://proxy.example.com",
      initialMemory: 32,
      resourcesLocation: "https://resources.example.com",
      wasmVariant: "advanced",
    });

    expect(loadBlinkIdVerifyCore).toHaveBeenCalledTimes(1);
    expect(loadBlinkIdVerifyCore).toHaveBeenCalledWith({
      licenseKey: "my-license",
      microblinkProxyUrl: "https://proxy.example.com",
      initialMemory: 32,
      resourcesLocation: "https://resources.example.com",
      wasmVariant: "advanced",
    });
  });

  test("calls createScanningSession with scanningSettings when provided", async () => {
    const scanningSettings = {
      blur: { detectionThreshold: 0.5 },
    } as unknown as BlinkIdVerifyComponentOptions["scanningSettings"];

    await createBlinkIdVerify({
      licenseKey: "test-key",

      scanningSettings,
    });

    expect(mockCreateSession).toHaveBeenCalledTimes(1);
    expect(mockCreateSession).toHaveBeenCalledWith({
      scanningSettings,
    });
  });

  test("resolves with minimal options (licenseKey only)", async () => {
    const component = await createBlinkIdVerify({ licenseKey: "test-key" });

    expect(component).toBeDefined();
    expect(component.blinkIdVerifyCore).toBeDefined();
    expect(mockCreateSession).toHaveBeenCalledWith({
      scanningSettings: undefined,
    });
  });

  test("calls createBlinkIdVerifyUxManager with cameraManager and scanningSession", async () => {
    await createBlinkIdVerify({ licenseKey: "test-key" });

    expect(mockCreateBlinkIdVerifyUxManager).toHaveBeenCalledTimes(1);
    const [cameraManagerArg, sessionArg] =
      mockCreateBlinkIdVerifyUxManager.mock.calls[0];
    expect(cameraManagerArg).toBe(fakeCameraManagerRef.current);
    expect(sessionArg).toBeDefined();
    expect(sessionArg).toHaveProperty("process");
  });

  test("calls createCameraManagerUi with cameraManager, targetNode, and cameraManagerUiOptions", async () => {
    await createBlinkIdVerify({
      licenseKey: "test-key",
      targetNode: undefined,
    });

    expect(mockCreateCameraManagerUi).toHaveBeenCalledTimes(1);
    expect(mockCreateCameraManagerUi).toHaveBeenCalledWith(
      fakeCameraManagerRef.current,
      undefined,
      undefined,
    );
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

    expect(mockCreateBlinkIdVerifyFeedbackUi).toHaveBeenCalledWith(
      expect.any(Object),
      mockCameraUi,
      {},
    );
  });

  test("calls startFrameCapture when feedbackUiOptions.showOnboardingGuide is false and playback fires", async () => {
    await createBlinkIdVerify({
      licenseKey: "test-key",
      feedbackUiOptions: { showOnboardingGuide: false },
    });

    expect(
      fakeCameraManagerRef.current!.startFrameCapture,
    ).not.toHaveBeenCalled();

    fakeCameraManagerRef.current!.emitPlaybackState("playback");

    expect(
      fakeCameraManagerRef.current!.startFrameCapture,
    ).toHaveBeenCalledTimes(1);
  });

  test("does not call startFrameCapture when showOnboardingGuide is true or omitted", async () => {
    await createBlinkIdVerify({
      licenseKey: "test-key",
      feedbackUiOptions: { showOnboardingGuide: true },
    });

    fakeCameraManagerRef.current!.emitPlaybackState("playback");

    expect(
      fakeCameraManagerRef.current!.startFrameCapture,
    ).not.toHaveBeenCalled();
  });

  test("calls startCameraStream after setup", async () => {
    await createBlinkIdVerify({ licenseKey: "test-key" });

    expect(
      fakeCameraManagerRef.current!.startCameraStream,
    ).toHaveBeenCalledTimes(1);
  });

  test("best-effort reports crashes through the core before a session exists", async () => {
    mockCreateSession.mockRejectedValueOnce(new Error("session failed"));

    await expect(
      createBlinkIdVerify({ licenseKey: "test-key" }),
    ).rejects.toThrow("session failed");

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
    mockCreateBlinkIdVerifyUxManager.mockRejectedValueOnce(
      new Error("ux failed"),
    );

    await expect(
      createBlinkIdVerify({ licenseKey: "test-key" }),
    ).rejects.toThrow("ux failed");

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
    const firstPinglet = mockReportPinglet.mock.calls[0]?.[0] as
      | { sessionNumber?: number }
      | undefined;

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
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    const component = await createBlinkIdVerify({ licenseKey: "test-key" });

    await expect(component.destroy()).resolves.toBeUndefined();
    expect(consoleWarnSpy).toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
  });

  test("addOnResultCallback, addOnErrorCallback, and addOnFrameProcessCallback invoke UX manager methods", async () => {
    const component = await createBlinkIdVerify({ licenseKey: "test-key" });
    const resultCb = vi.fn();
    const errorCb = vi.fn();
    const frameCb = vi.fn();

    component.addOnResultCallback(resultCb);
    component.addOnErrorCallback(errorCb);
    component.addOnFrameProcessCallback(frameCb);

    expect(mockAddOnResultCallback).toHaveBeenCalledWith(resultCb);
    expect(mockAddOnErrorCallback).toHaveBeenCalledWith(errorCb);
    expect(mockAddOnFrameProcessCallback).toHaveBeenCalledWith(frameCb);
  });
});
