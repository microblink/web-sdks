/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { FaceCaptureResult } from "@microblink/biometrics-core";
import { beforeEach, describe, expect, it, vi } from "vitest";

const initializeBiometricsMock = vi.hoisted(() => vi.fn());
const createBiometricsUxManagerMock = vi.hoisted(() => vi.fn());
const createBiometricsFeedbackUiMock = vi.hoisted(() => vi.fn());
const cameraManagerConstructorMock = vi.hoisted(() => vi.fn<() => object>());
const createCameraManagerUiMock = vi.hoisted(() => vi.fn());

vi.mock("./createBiometrics", () => ({ initializeBiometrics: initializeBiometricsMock }));
vi.mock("@microblink/biometrics-ux-manager/core", () => ({
  createBiometricsUxManager: createBiometricsUxManagerMock,
}));
vi.mock("@microblink/biometrics-ux-manager/ui", () => ({
  createBiometricsFeedbackUi: createBiometricsFeedbackUiMock,
}));
vi.mock("@microblink/camera-manager/core", () => ({
  CameraError: class CameraError extends Error {},
  CameraManager: class CameraManager {
    constructor() {
      return cameraManagerConstructorMock();
    }
  },
}));
vi.mock("@microblink/camera-manager/ui", () => ({ createCameraManagerUi: createCameraManagerUiMock }));

import { createBiometricsUi } from "./createBiometricsUi";

describe("createBiometricsUi", () => {
  const session = { finish: vi.fn() };
  const sdk = { startSession: vi.fn(() => session), close: vi.fn(() => Promise.resolve()) };
  const analytics = {
    enabled: false,
    logInitFailed: vi.fn(() => Promise.resolve()),
    logNonFatal: vi.fn(() => Promise.resolve()),
    sendPinglets: vi.fn(() => Promise.resolve()),
  };
  const uxManager = { close: vi.fn() };
  const feedbackUi = { dismiss: vi.fn() };
  const cameraUi = {
    addOnDismountCallback: vi.fn(() => vi.fn()),
    dismount: vi.fn(),
  };
  const cameraManager = {
    getCameraDevices: vi.fn(() => Promise.resolve([])),
    startCameraStream: vi.fn(() => Promise.resolve()),
    reset: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    initializeBiometricsMock.mockResolvedValue({ sdk, analytics });
    cameraManagerConstructorMock.mockImplementation(() => cameraManager);
    createBiometricsUxManagerMock.mockResolvedValue(uxManager);
    createCameraManagerUiMock.mockResolvedValue(cameraUi);
    createBiometricsFeedbackUiMock.mockReturnValue(feedbackUi);
  });

  it("maps capture options without API configuration or commands", async () => {
    await createBiometricsUi({
      licenseKey: "license",
      resourcesLocation: "/assets/",
      capture: { imageOrigin: "canvas2d" },
      captureTimeoutMs: 42_000,
      captureFace: { debugMode: true },
    });

    expect(initializeBiometricsMock).toHaveBeenCalledWith(
      {
        licenseKey: "license",
        resourcesLocation: "/assets/",
        wasmVariant: undefined,
        capture: {
          imageOrigin: "canvas2d",
        },
        analytics: undefined,
      },
      expect.anything(),
    );
    expect(sdk.startSession).toHaveBeenCalledWith({
      captureTimeoutMs: 42_000,
      captureFace: { debugMode: true },
    });
  });

  it("forwards the captured face result", async () => {
    const onResult = vi.fn();
    await createBiometricsUi({ licenseKey: "license", onResult });
    const options = createBiometricsUxManagerMock.mock.calls[0]?.[2] as {
      onResult(result: FaceCaptureResult): void;
    };
    const result: FaceCaptureResult = {
      traceId: "trace-id",
      sessionNumber: 1,
      bestImage: {
        image: {} as ImageData,
        landmarks: {
          LeftEye: { x: 0.2, y: 0.3 },
          RightEye: { x: 0.8, y: 0.3 },
          NoseTip: { x: 0.5, y: 0.5 },
          Mouth: { x: 0.5, y: 0.7 },
          LeftEar: { x: 0.1, y: 0.4 },
          RightEar: { x: 0.9, y: 0.4 },
        },
      },
      supportingImages: [],
      livenessFrames: [],
    };

    options.onResult(result);

    expect(onResult).toHaveBeenCalledWith(result);
    expect(cameraUi.dismount).toHaveBeenCalledOnce();
  });

  it("destroys capture, UX, camera, and SDK resources once", async () => {
    const ui = await createBiometricsUi({ licenseKey: "license" });

    await Promise.all([ui.destroy(), ui.destroy()]);

    expect(session.finish).toHaveBeenCalledOnce();
    expect(uxManager.close).toHaveBeenCalledOnce();
    expect(cameraUi.dismount).toHaveBeenCalledOnce();
    expect(cameraManager.reset).toHaveBeenCalledOnce();
    expect(sdk.close).toHaveBeenCalledOnce();
  });
});
