/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { Consent, RemoteScanningSession } from "@microblink/blinkid-verify-core";
import { getDeviceInfo } from "@microblink/blinkid-verify-core";
import type { CameraManager } from "@microblink/camera-manager/core";
import { createFakeScanningSession } from "@microblink/test-utils";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { BlinkIdVerifyConsentGate } from "./BlinkIdVerifyConsentGate";
import { BlinkIdVerifyUxManager } from "./BlinkIdVerifyUxManager";
import { createBlinkIdVerifyUxManager } from "./createBlinkIdVerifyUxManager";

vi.mock("./BlinkIdVerifyUxManager", () => ({
  BlinkIdVerifyUxManager: vi.fn(),
  acceptRequireConsent: vi.fn(),
}));

vi.mock("@microblink/blinkid-verify-core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@microblink/blinkid-verify-core")>();
  return {
    ...actual,
    getDeviceInfo: vi.fn(),
  };
});

describe("createBlinkIdVerifyUxManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("forwards consent options into the BlinkIdVerifyUxManager constructor", async () => {
    const consent: Consent = {
      durationDays: 30,
      userId: "user-1",
    };
    const cameraManager = {} as CameraManager;
    const sessionSettings = { inputImageSource: "video" };
    const scanningSession = createFakeScanningSession({
      settings: sessionSettings,
      showDemoOverlay: true,
      showProductionOverlay: false,
    });

    const deviceInfo = { userAgent: "ua" } as Awaited<ReturnType<typeof getDeviceInfo>>;
    vi.mocked(getDeviceInfo).mockResolvedValue(deviceInfo);

    const instance = {} as BlinkIdVerifyUxManager;
    vi.mocked(BlinkIdVerifyUxManager).mockImplementation(function () {
      return instance;
    });

    const options = {
      consentUxConfig: {
        consentMode: "ProvideExternalConsent" as const,
        consent,
      },
    };
    const result = await createBlinkIdVerifyUxManager(
      cameraManager,
      scanningSession as unknown as RemoteScanningSession,
      options,
    );

    expect(result).toBe(instance);
    expect(BlinkIdVerifyUxManager).toHaveBeenCalledWith(
      cameraManager,
      scanningSession,
      options,
      sessionSettings,
      true,
      false,
      deviceInfo,
    );
  });

  test("defaults consent UX to NoConsentUI when consentUxConfig is omitted", async () => {
    const cameraManager = {} as CameraManager;
    const sessionSettings = { inputImageSource: "video" };
    const scanningSession = createFakeScanningSession({
      settings: sessionSettings,
      showDemoOverlay: true,
      showProductionOverlay: false,
    });

    const deviceInfo = { userAgent: "ua" } as Awaited<ReturnType<typeof getDeviceInfo>>;
    vi.mocked(getDeviceInfo).mockResolvedValue(deviceInfo);

    const instance = {} as BlinkIdVerifyUxManager;
    vi.mocked(BlinkIdVerifyUxManager).mockImplementation(function () {
      return instance;
    });

    await createBlinkIdVerifyUxManager(cameraManager, scanningSession as unknown as RemoteScanningSession);

    expect(BlinkIdVerifyUxManager).toHaveBeenCalledWith(
      cameraManager,
      scanningSession,
      { consentUxConfig: { consentMode: "NoConsentUI" } },
      sessionSettings,
      true,
      false,
      deviceInfo,
    );
  });

  test("returns a consent gate for RequireConsent and still constructs the manager", async () => {
    const cameraManager = {} as CameraManager;
    const sessionSettings = { inputImageSource: "video" };
    const scanningSession = createFakeScanningSession({
      settings: sessionSettings,
      showDemoOverlay: false,
      showProductionOverlay: false,
    });
    const deviceInfo = { userAgent: "ua" } as Awaited<ReturnType<typeof getDeviceInfo>>;
    vi.mocked(getDeviceInfo).mockResolvedValue(deviceInfo);

    const instance = {} as BlinkIdVerifyUxManager;
    vi.mocked(BlinkIdVerifyUxManager).mockImplementation(function () {
      return instance;
    });

    const options = {
      consentUxConfig: {
        consentMode: "RequireConsent" as const,
        consent: {
          userId: "ui-user",
          durationDays: 180,
        },
      },
    };
    const result = await createBlinkIdVerifyUxManager(
      cameraManager,
      scanningSession as unknown as RemoteScanningSession,
      options,
    );

    expect(result).toBeInstanceOf(BlinkIdVerifyConsentGate);
    expect(BlinkIdVerifyUxManager).toHaveBeenCalledWith(
      cameraManager,
      scanningSession,
      options,
      sessionSettings,
      false,
      false,
      deviceInfo,
    );
  });
});
