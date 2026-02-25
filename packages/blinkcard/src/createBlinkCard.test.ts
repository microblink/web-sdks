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
  mockCreateBlinkCardUxManager,
  mockCreateBlinkCardFeedbackUi,
  mockAddOnResultCallback,
  mockAddOnErrorCallback,
  mockDismount,
  mockCameraUi,
  mockCreateCameraManagerUi,
} = vi.hoisted(() => {
  const mockTerminate = vi.fn().mockResolvedValue(undefined);
  const mockCreateSession = vi.fn();
  const mockAddOnResultCallback = vi.fn();
  const mockAddOnErrorCallback = vi.fn();
  const mockCreateBlinkCardUxManager = vi.fn().mockResolvedValue({
    addOnResultCallback: mockAddOnResultCallback,
    addOnErrorCallback: mockAddOnErrorCallback,
  });
  const mockCreateBlinkCardFeedbackUi = vi.fn();
  const mockDismount = vi.fn();
  const mockCameraUi = { dismount: mockDismount };
  const mockCreateCameraManagerUi = vi.fn().mockResolvedValue(mockCameraUi);

  return {
    mockTerminate,
    mockCreateSession,
    mockCreateBlinkCardUxManager,
    mockCreateBlinkCardFeedbackUi,
    mockAddOnResultCallback,
    mockAddOnErrorCallback,
    mockDismount,
    mockCameraUi,
    mockCreateCameraManagerUi,
  };
});

// ============================================================================
// Module Mocks (use test-utils: FakeCameraManager, createFakeScanningSession)
// ============================================================================

vi.mock("@microblink/blinkcard-core", () => {
  return {
    loadBlinkCardCore: vi.fn().mockResolvedValue({
      createScanningSession: mockCreateSession,
      terminate: mockTerminate,
    }),
  };
});

vi.mock("@microblink/blinkcard-ux-manager", () => ({
  get createBlinkCardUxManager() {
    return mockCreateBlinkCardUxManager;
  },
  get createBlinkCardFeedbackUi() {
    return mockCreateBlinkCardFeedbackUi;
  },
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
  createBlinkCard,
  type BlinkCardComponentOptions,
} from "./createBlinkCard";

/**
 * Test file role:
 * - Verifies that createBlinkCard correctly initializes and wires all SDK components.
 * - Uses FakeCameraManager and createFakeScanningSession from @microblink/test-utils.
 * - Covers option forwarding, playback subscription, destroy lifecycle, and callback delegation.
 * - Does not own BlinkCardUxManager behavior (see blinkcard-ux-manager package tests).
 * - Does not own camera-manager behavior (see camera-manager package tests).
 */
describe("createBlinkCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fakeCameraManagerRef.current = null;
    mockCreateSession.mockResolvedValue(createFakeScanningSession());
    mockCreateBlinkCardUxManager.mockResolvedValue({
      addOnResultCallback: mockAddOnResultCallback,
      addOnErrorCallback: mockAddOnErrorCallback,
    });
    mockCreateCameraManagerUi.mockResolvedValue(mockCameraUi);
  });

  afterEach(() => {
    fakeCameraManagerRef.current = null;
  });

  test("returns a BlinkCardComponent with all required properties", async () => {
    const component = await createBlinkCard({ licenseKey: "test-key" });

    expect(component).toHaveProperty("blinkCardCore");
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

  test("resolves with minimal options (licenseKey only)", async () => {
    const component = await createBlinkCard({ licenseKey: "test-key" });

    expect(component).toBeDefined();
    expect(component.blinkCardCore).toBeDefined();
    expect(mockCreateSession).toHaveBeenCalledWith({
      scanningSettings: undefined,
    });
  });

  test("calls createBlinkCardUxManager with cameraManager and scanningSession", async () => {
    await createBlinkCard({ licenseKey: "test-key" });

    expect(mockCreateBlinkCardUxManager).toHaveBeenCalledTimes(1);
    const [cameraManagerArg, sessionArg] =
      mockCreateBlinkCardUxManager.mock.calls[0];
    expect(cameraManagerArg).toBe(fakeCameraManagerRef.current);
    expect(sessionArg).toBeDefined();
    expect(sessionArg).toHaveProperty("process");
  });

  test("calls createCameraManagerUi with cameraManager, targetNode, and cameraManagerUiOptions", async () => {
    await createBlinkCard({
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
    } as BlinkCardComponentOptions["cameraManagerUiOptions"];

    await createBlinkCard({
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

  test("subscribes to playbackState and calls createBlinkCardFeedbackUi when playback is triggered", async () => {
    await createBlinkCard({
      licenseKey: "test-key",
      feedbackUiOptions: { showOnboardingGuide: false },
    });

    expect(fakeCameraManagerRef.current).not.toBeNull();
    expect(fakeCameraManagerRef.current!.subscribe).toHaveBeenCalledTimes(1);

    fakeCameraManagerRef.current!.emitPlaybackState("playback");

    expect(mockCreateBlinkCardFeedbackUi).toHaveBeenCalledTimes(1);
    expect(mockCreateBlinkCardFeedbackUi).toHaveBeenCalledWith(
      await mockCreateBlinkCardUxManager(),
      mockCameraUi,
      { showOnboardingGuide: false },
    );
  });

  test("passes empty object to createBlinkCardFeedbackUi when feedbackUiOptions is undefined", async () => {
    await createBlinkCard({ licenseKey: "test-key" });

    fakeCameraManagerRef.current!.emitPlaybackState("playback");

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

    expect(
      fakeCameraManagerRef.current!.startFrameCapture,
    ).not.toHaveBeenCalled();

    fakeCameraManagerRef.current!.emitPlaybackState("playback");

    expect(
      fakeCameraManagerRef.current!.startFrameCapture,
    ).toHaveBeenCalledTimes(1);
  });

  test("does not call startFrameCapture when showOnboardingGuide is true or omitted", async () => {
    await createBlinkCard({
      licenseKey: "test-key",
      feedbackUiOptions: { showOnboardingGuide: true },
    });

    fakeCameraManagerRef.current!.emitPlaybackState("playback");

    expect(
      fakeCameraManagerRef.current!.startFrameCapture,
    ).not.toHaveBeenCalled();
  });

  test("calls startCameraStream after setup", async () => {
    await createBlinkCard({ licenseKey: "test-key" });

    expect(
      fakeCameraManagerRef.current!.startCameraStream,
    ).toHaveBeenCalledTimes(1);
  });

  test("creates feedback UI only once even if playbackState fires multiple times", async () => {
    await createBlinkCard({ licenseKey: "test-key" });

    fakeCameraManagerRef.current!.emitPlaybackState("playback");
    fakeCameraManagerRef.current!.emitPlaybackState("playback");

    expect(mockCreateBlinkCardFeedbackUi).toHaveBeenCalledTimes(1);
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
});
