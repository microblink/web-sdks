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
  mockCreateBlinkIdUxManager,
  mockCreateBlinkIdFeedbackUi,
  mockAddOnResultCallback,
  mockAddOnErrorCallback,
  mockAddOnDocumentFilteredCallback,
  mockAddDocumentClassFilter,
  mockDismount,
  mockCameraUi,
  mockCreateCameraManagerUi,
} = vi.hoisted(() => {
  const mockTerminate = vi.fn().mockResolvedValue(undefined);
  const mockCreateSession = vi.fn();
  const mockAddOnResultCallback = vi.fn();
  const mockAddOnErrorCallback = vi.fn();
  const mockAddOnDocumentFilteredCallback = vi.fn();
  const mockAddDocumentClassFilter = vi.fn();
  const mockCreateBlinkIdUxManager = vi.fn().mockResolvedValue({
    addOnResultCallback: mockAddOnResultCallback,
    addOnErrorCallback: mockAddOnErrorCallback,
    addOnDocumentFilteredCallback: mockAddOnDocumentFilteredCallback,
    addDocumentClassFilter: mockAddDocumentClassFilter,
  });
  const mockCreateBlinkIdFeedbackUi = vi.fn();
  const mockDismount = vi.fn();
  const mockCameraUi = { dismount: mockDismount };
  const mockCreateCameraManagerUi = vi.fn().mockResolvedValue(mockCameraUi);

  return {
    mockTerminate,
    mockCreateSession,
    mockCreateBlinkIdUxManager,
    mockCreateBlinkIdFeedbackUi,
    mockAddOnResultCallback,
    mockAddOnErrorCallback,
    mockAddOnDocumentFilteredCallback,
    mockAddDocumentClassFilter,
    mockDismount,
    mockCameraUi,
    mockCreateCameraManagerUi,
  };
});

// ============================================================================
// Module Mocks (use test-utils: FakeCameraManager, createFakeScanningSession)
// ============================================================================

vi.mock("@microblink/blinkid-core", () => ({
  loadBlinkIdCore: vi.fn().mockResolvedValue({
    createScanningSession: mockCreateSession,
    terminate: mockTerminate,
  }),
  BlinkIdSessionSettings: class {},
}));

vi.mock("@microblink/blinkid-ux-manager", () => ({
  get createBlinkIdUxManager() {
    return mockCreateBlinkIdUxManager;
  },
  get createBlinkIdFeedbackUi() {
    return mockCreateBlinkIdFeedbackUi;
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
import { createBlinkId, type BlinkIdComponentOptions } from "./createBlinkIdUi";

/**
 * Test file role:
 * - Verifies that createBlinkId correctly initializes and wires all SDK components.
 * - Uses FakeCameraManager and createFakeScanningSession from @microblink/test-utils.
 * - Covers option forwarding, playback subscription, destroy lifecycle, and callback delegation.
 * - Does not own BlinkIdUxManager behavior (see blinkid-ux-manager package tests).
 * - Does not own camera-manager behavior (see camera-manager package tests).
 */
describe("createBlinkId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fakeCameraManagerRef.current = null;
    mockCreateSession.mockResolvedValue(createFakeScanningSession());
    mockCreateBlinkIdUxManager.mockResolvedValue({
      addOnResultCallback: mockAddOnResultCallback,
      addOnErrorCallback: mockAddOnErrorCallback,
      addOnDocumentFilteredCallback: mockAddOnDocumentFilteredCallback,
      addDocumentClassFilter: mockAddDocumentClassFilter,
    });
    mockCreateCameraManagerUi.mockResolvedValue(mockCameraUi);
  });

  afterEach(() => {
    fakeCameraManagerRef.current = null;
  });

  test("returns a BlinkIdComponent with all required properties", async () => {
    const component = await createBlinkId({ licenseKey: "test-key" });

    expect(component).toHaveProperty("blinkIdCore");
    expect(component).toHaveProperty("cameraManager");
    expect(component).toHaveProperty("blinkIdUxManager");
    expect(component).toHaveProperty("cameraUi", mockCameraUi);
    expect(component).toHaveProperty("destroy");
    expect(component).toHaveProperty("addOnResultCallback");
    expect(component).toHaveProperty("addOnErrorCallback");
    expect(component).toHaveProperty("addDocumentClassFilter");
    expect(component).toHaveProperty("addOnDocumentFilteredCallback");
    expect(typeof component.destroy).toBe("function");
    expect(typeof component.addOnResultCallback).toBe("function");
    expect(typeof component.addOnErrorCallback).toBe("function");
    expect(typeof component.addDocumentClassFilter).toBe("function");
    expect(typeof component.addOnDocumentFilteredCallback).toBe("function");
  });

  test("calls loadBlinkIdCore with init options (licenseKey and optional fields)", async () => {
    const { loadBlinkIdCore } = await import("@microblink/blinkid-core");

    await createBlinkId({
      licenseKey: "my-license",
      microblinkProxyUrl: "https://proxy.example.com",
      initialMemory: 32,
      resourcesLocation: "https://resources.example.com",
      wasmVariant: "basic",
      useLightweightBuild: true,
    });

    expect(loadBlinkIdCore).toHaveBeenCalledTimes(1);
    expect(loadBlinkIdCore).toHaveBeenCalledWith({
      licenseKey: "my-license",
      microblinkProxyUrl: "https://proxy.example.com",
      initialMemory: 32,
      resourcesLocation: "https://resources.example.com",
      wasmVariant: "basic",
      useLightweightBuild: true,
    });
  });

  test("calls createScanningSession with scanningSettings and scanningMode when provided", async () => {
    const scanningSettings = {
      blur: { detectionThreshold: 0.5 },
    } as unknown as BlinkIdComponentOptions["scanningSettings"];

    await createBlinkId({
      licenseKey: "test-key",
      scanningMode: "single-side" as BlinkIdComponentOptions["scanningMode"],
      scanningSettings,
    });

    expect(mockCreateSession).toHaveBeenCalledTimes(1);
    expect(mockCreateSession).toHaveBeenCalledWith({
      scanningMode: "single-side",
      scanningSettings,
    });
  });

  test("resolves with minimal options (licenseKey only)", async () => {
    const component = await createBlinkId({ licenseKey: "test-key" });

    expect(component).toBeDefined();
    expect(component.blinkIdCore).toBeDefined();
    expect(mockCreateSession).toHaveBeenCalledWith({
      scanningMode: undefined,
      scanningSettings: undefined,
    });
  });

  test("calls createBlinkIdUxManager with cameraManager and scanningSession", async () => {
    await createBlinkId({ licenseKey: "test-key" });

    expect(mockCreateBlinkIdUxManager).toHaveBeenCalledTimes(1);
    const [cameraManagerArg, sessionArg] =
      mockCreateBlinkIdUxManager.mock.calls[0];
    expect(cameraManagerArg).toBe(fakeCameraManagerRef.current);
    expect(sessionArg).toBeDefined();
    expect(sessionArg).toHaveProperty("process");
  });

  test("calls createCameraManagerUi with cameraManager, targetNode, and cameraManagerUiOptions", async () => {
    await createBlinkId({
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
    } as BlinkIdComponentOptions["cameraManagerUiOptions"];

    await createBlinkId({
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

  test("subscribes to playbackState and calls createBlinkIdFeedbackUi when playback is triggered", async () => {
    await createBlinkId({
      licenseKey: "test-key",
      feedbackUiOptions: { showOnboardingGuide: true },
    });

    expect(fakeCameraManagerRef.current).not.toBeNull();
    expect(fakeCameraManagerRef.current!.subscribe).toHaveBeenCalledTimes(1);

    fakeCameraManagerRef.current!.emitPlaybackState("playback");

    expect(mockCreateBlinkIdFeedbackUi).toHaveBeenCalledTimes(1);
    expect(mockCreateBlinkIdFeedbackUi).toHaveBeenCalledWith(
      await mockCreateBlinkIdUxManager(),
      mockCameraUi,
      { showOnboardingGuide: true },
    );
  });

  test("passes empty object to createBlinkIdFeedbackUi when feedbackUiOptions is undefined", async () => {
    await createBlinkId({ licenseKey: "test-key" });

    fakeCameraManagerRef.current!.emitPlaybackState("playback");

    expect(mockCreateBlinkIdFeedbackUi).toHaveBeenCalledWith(
      expect.any(Object),
      mockCameraUi,
      {},
    );
  });

  test("calls startFrameCapture when feedbackUiOptions.showOnboardingGuide is false and playback fires", async () => {
    await createBlinkId({
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
    await createBlinkId({
      licenseKey: "test-key",
      feedbackUiOptions: { showOnboardingGuide: true },
    });

    fakeCameraManagerRef.current!.emitPlaybackState("playback");

    expect(
      fakeCameraManagerRef.current!.startFrameCapture,
    ).not.toHaveBeenCalled();
  });

  test("calls startCameraStream after setup", async () => {
    await createBlinkId({ licenseKey: "test-key" });

    expect(
      fakeCameraManagerRef.current!.startCameraStream,
    ).toHaveBeenCalledTimes(1);
  });

  test("creates feedback UI only once even if playbackState fires multiple times", async () => {
    await createBlinkId({ licenseKey: "test-key" });

    fakeCameraManagerRef.current!.emitPlaybackState("playback");
    fakeCameraManagerRef.current!.emitPlaybackState("playback");

    expect(mockCreateBlinkIdFeedbackUi).toHaveBeenCalledTimes(1);
  });

  test("destroy() calls cameraUi.dismount() and blinkIdCore.terminate()", async () => {
    const component = await createBlinkId({ licenseKey: "test-key" });

    await component.destroy();

    expect(mockDismount).toHaveBeenCalledTimes(1);
    expect(mockTerminate).toHaveBeenCalledTimes(1);
  });

  test("destroy() does not throw when terminate() rejects", async () => {
    mockTerminate.mockRejectedValueOnce(new Error("terminate failed"));
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    const component = await createBlinkId({ licenseKey: "test-key" });

    await expect(component.destroy()).resolves.toBeUndefined();
    expect(consoleWarnSpy).toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
  });

  test("addOnResultCallback and addOnErrorCallback invoke UX manager methods", async () => {
    const component = await createBlinkId({ licenseKey: "test-key" });
    const resultCb = vi.fn();
    const errorCb = vi.fn();
    const filterCb = vi.fn();
    const filteredCb = vi.fn();

    component.addOnResultCallback(resultCb);
    component.addOnErrorCallback(errorCb);
    component.addDocumentClassFilter(filterCb);
    component.addOnDocumentFilteredCallback(filteredCb);

    expect(mockAddOnResultCallback).toHaveBeenCalledWith(resultCb);
    expect(mockAddOnErrorCallback).toHaveBeenCalledWith(errorCb);
    expect(mockAddDocumentClassFilter).toHaveBeenCalledWith(filterCb);
    expect(mockAddOnDocumentFilteredCallback).toHaveBeenCalledWith(filteredCb);
  });
});
