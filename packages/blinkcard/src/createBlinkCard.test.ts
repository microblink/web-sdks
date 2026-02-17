/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import {
  createBlinkCard,
  type BlinkCardComponentOptions,
} from "./createBlinkCard";

const {
  mockCore,
  mockCreateSession,
  mockTerminate,
  mockCreateBlinkCardUxManager,
  mockCreateBlinkCardFeedbackUi,
  mockAddOnResultCallback,
  mockAddOnErrorCallback,
  playbackCallbackRef,
  mockSubscribe,
  mockStartCameraStream,
  mockStartFrameCapture,
  mockDismount,
  mockCameraUi,
  mockCreateCameraManagerUi,
} = vi.hoisted(() => {
  const mockTerminate = vi.fn().mockResolvedValue(undefined);
  const mockCreateSession = vi.fn().mockResolvedValue({});
  const mockCore = {
    createScanningSession: mockCreateSession,
    terminate: mockTerminate,
  };
  const mockAddOnResultCallback = vi.fn();
  const mockAddOnErrorCallback = vi.fn();
  const mockCreateBlinkCardUxManager = vi.fn().mockResolvedValue({
    addOnResultCallback: mockAddOnResultCallback,
    addOnErrorCallback: mockAddOnErrorCallback,
  });
  const mockCreateBlinkCardFeedbackUi = vi.fn();
  const playbackCallbackRef: { current: ((state: string) => void) | null } = {
    current: null,
  };
  const mockSubscribe = vi.fn(
    (_selector: unknown, callback: (state: string) => void) => {
      playbackCallbackRef.current = callback;
      return vi.fn();
    },
  );
  const mockStartCameraStream = vi.fn().mockResolvedValue(undefined);
  const mockStartFrameCapture = vi.fn().mockResolvedValue(undefined);
  const mockDismount = vi.fn();
  const mockCameraUi = { dismount: mockDismount };
  const mockCreateCameraManagerUi = vi.fn().mockResolvedValue(mockCameraUi);

  return {
    mockDismount,
    mockCore,
    mockCreateSession,
    mockTerminate,
    mockCreateBlinkCardUxManager,
    mockCreateBlinkCardFeedbackUi,
    mockAddOnResultCallback,
    mockAddOnErrorCallback,
    playbackCallbackRef,
    mockSubscribe,
    mockStartCameraStream,
    mockStartFrameCapture,
    mockCameraUi,
    mockCreateCameraManagerUi,
  };
});

vi.mock("@microblink/blinkcard-core", () => ({
  loadBlinkCardCore: vi.fn().mockResolvedValue(mockCore),
}));

vi.mock("@microblink/blinkcard-ux-manager", () => ({
  createBlinkCardUxManager: mockCreateBlinkCardUxManager,
  createBlinkCardFeedbackUi: mockCreateBlinkCardFeedbackUi,
}));

vi.mock("@microblink/camera-manager", () => ({
  CameraManager: vi.fn().mockImplementation(function (
    this: Record<string, unknown>,
  ) {
    this.subscribe = mockSubscribe;
    this.startCameraStream = mockStartCameraStream;
    this.startFrameCapture = mockStartFrameCapture;
    return this;
  }),
  createCameraManagerUi: mockCreateCameraManagerUi,
}));

describe("createBlinkCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    playbackCallbackRef.current = null;
    mockCreateSession.mockResolvedValue({});
    mockTerminate.mockResolvedValue(undefined);
    mockCreateBlinkCardUxManager.mockResolvedValue({
      addOnResultCallback: mockAddOnResultCallback,
      addOnErrorCallback: mockAddOnErrorCallback,
    });
    mockStartCameraStream.mockResolvedValue(undefined);
    mockStartFrameCapture.mockResolvedValue(undefined);
    mockCreateCameraManagerUi.mockResolvedValue(mockCameraUi);
  });

  test("returns a BlinkCardComponent with all required properties", async () => {
    const component = await createBlinkCard({ licenseKey: "test-key" });

    expect(component).toHaveProperty("blinkCardCore", mockCore);
    expect(component).toHaveProperty("cameraManager");
    expect(component).toHaveProperty("blinkCardUxManager");
    expect(component).toHaveProperty("cameraUi", mockCameraUi);
    expect(component).toHaveProperty("destroy");
    expect(component).toHaveProperty("addOnResultCallback");
    expect(component).toHaveProperty("addOnErrorCallback");
    expect(typeof component.destroy).toBe("function");
    expect(typeof component.addOnResultCallback).toBe("function");
    expect(typeof component.addOnErrorCallback).toBe("function");
  });

  test("calls loadBlinkCardCore with init options (licenseKey and optional fields)", async () => {
    const { loadBlinkCardCore } = await import("@microblink/blinkcard-core");

    await createBlinkCard({
      licenseKey: "my-license",
      microblinkProxyUrl: "https://proxy.example.com",
      initialMemory: 32,
      resourcesLocation: "https://resources.example.com",
      wasmVariant: "basic",
    });

    expect(loadBlinkCardCore).toHaveBeenCalledTimes(1);
    expect(loadBlinkCardCore).toHaveBeenCalledWith({
      licenseKey: "my-license",
      microblinkProxyUrl: "https://proxy.example.com",
      initialMemory: 32,
      resourcesLocation: "https://resources.example.com",
      wasmVariant: "basic",
    });
  });

  test("calls createScanningSession with scanningSettings when provided", async () => {
    const scanningSettings = {
      someSetting: true,
    } as unknown as BlinkCardComponentOptions["scanningSettings"];

    await createBlinkCard({
      licenseKey: "test-key",
      scanningSettings,
    });

    expect(mockCreateSession).toHaveBeenCalledTimes(1);
    expect(mockCreateSession).toHaveBeenCalledWith({ scanningSettings });
  });

  test("calls createBlinkCardUxManager with cameraManager and scanningSession", async () => {
    await createBlinkCard({ licenseKey: "test-key" });

    expect(mockCreateBlinkCardUxManager).toHaveBeenCalledTimes(1);
    const [cameraManagerArg, sessionArg] =
      mockCreateBlinkCardUxManager.mock.calls[0];
    expect(cameraManagerArg).toBeDefined();
    expect(sessionArg).toEqual(await mockCreateSession());
  });

  test("calls createCameraManagerUi with cameraManager, targetNode, and cameraManagerUiOptions", async () => {
    await createBlinkCard({
      licenseKey: "test-key",
      targetNode: undefined,
    });

    expect(mockCreateCameraManagerUi).toHaveBeenCalledTimes(1);
    expect(mockCreateCameraManagerUi).toHaveBeenCalledWith(
      expect.any(Object),
      undefined,
      undefined,
    );
  });

  test("passes custom targetNode and cameraManagerUiOptions to createCameraManagerUi", async () => {
    const targetNode = document.createElement("div");
    const cameraManagerUiOptions = {
      someOption: true,
    } as BlinkCardComponentOptions["cameraManagerUiOptions"];

    await createBlinkCard({
      licenseKey: "test-key",
      targetNode,
      cameraManagerUiOptions,
    });

    expect(mockCreateCameraManagerUi).toHaveBeenCalledWith(
      expect.any(Object),
      targetNode,
      cameraManagerUiOptions,
    );
  });

  test("subscribes to playbackState and calls createBlinkCardFeedbackUi when playback is triggered", async () => {
    const component = await createBlinkCard({
      licenseKey: "test-key",
      feedbackUiOptions: { showHelpButton: false },
    });

    expect(mockSubscribe).toHaveBeenCalledTimes(1);
    expect(playbackCallbackRef.current).toBeDefined();

    playbackCallbackRef.current?.("playback");

    expect(mockCreateBlinkCardFeedbackUi).toHaveBeenCalledTimes(1);
    expect(mockCreateBlinkCardFeedbackUi).toHaveBeenCalledWith(
      await mockCreateBlinkCardUxManager(),
      mockCameraUi,
      { showHelpButton: false },
    );
  });

  test("passes empty object to createBlinkCardFeedbackUi when feedbackUiOptions is undefined", async () => {
    await createBlinkCard({ licenseKey: "test-key" });

    playbackCallbackRef.current?.("playback");

    expect(mockCreateBlinkCardFeedbackUi).toHaveBeenCalledWith(
      expect.any(Object),
      mockCameraUi,
      {},
    );
  });

  test("calls startFrameCapture when feedbackUiOptions.showOnboardingGuide is false and playback fires", async () => {
    await createBlinkCard({
      licenseKey: "test-key",
      feedbackUiOptions: { showOnboardingGuide: false },
    });

    expect(mockStartFrameCapture).not.toHaveBeenCalled();

    playbackCallbackRef.current?.("playback");

    expect(mockStartFrameCapture).toHaveBeenCalledTimes(1);
  });

  test("does not call startFrameCapture when showOnboardingGuide is true or omitted", async () => {
    await createBlinkCard({
      licenseKey: "test-key",
      feedbackUiOptions: { showOnboardingGuide: true },
    });

    playbackCallbackRef.current?.("playback");

    expect(mockStartFrameCapture).not.toHaveBeenCalled();
  });

  test("calls startCameraStream after setup", async () => {
    await createBlinkCard({ licenseKey: "test-key" });

    expect(mockStartCameraStream).toHaveBeenCalledTimes(1);
  });

  test("destroy() calls cameraUi.dismount() and blinkCardCore.terminate()", async () => {
    const component = await createBlinkCard({ licenseKey: "test-key" });

    await component.destroy();

    expect(mockDismount).toHaveBeenCalledTimes(1);
    expect(mockTerminate).toHaveBeenCalledTimes(1);
  });

  test("destroy() does not throw when terminate() rejects", async () => {
    mockTerminate.mockRejectedValueOnce(new Error("terminate failed"));
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    const component = await createBlinkCard({ licenseKey: "test-key" });

    await expect(component.destroy()).resolves.toBeUndefined();
    expect(consoleWarnSpy).toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
  });

  test("addOnResultCallback and addOnErrorCallback invoke UX manager methods", async () => {
    const component = await createBlinkCard({ licenseKey: "test-key" });
    const resultCb = vi.fn();
    const errorCb = vi.fn();

    component.addOnResultCallback(resultCb);
    component.addOnErrorCallback(errorCb);

    expect(mockAddOnResultCallback).toHaveBeenCalledWith(resultCb);
    expect(mockAddOnErrorCallback).toHaveBeenCalledWith(errorCb);
  });

  test("resolves with minimal options (licenseKey only)", async () => {
    const component = await createBlinkCard({ licenseKey: "test-key" });

    expect(component).toBeDefined();
    expect(component.blinkCardCore).toBe(mockCore);
    expect(mockCreateSession).toHaveBeenCalledWith({
      scanningSettings: undefined,
    });
  });
});
