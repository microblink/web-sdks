/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { describe, expect, test, vi, beforeEach } from "vitest";
import type { RemoteScanningSession } from "@microblink/blinkcard-core";
import { createBlinkCardUxManager } from "./createBlinkCardUxManager";
import { BlinkCardUxManager } from "./BlinkCardUxManager";
import { getDeviceInfo } from "@microblink/blinkcard-core";
import type { CameraManager } from "@microblink/camera-manager";

vi.mock("./BlinkCardUxManager", () => ({
  BlinkCardUxManager: vi.fn(),
}));

vi.mock("@microblink/blinkcard-core", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@microblink/blinkcard-core")>();
  return {
    ...actual,
    getDeviceInfo: vi.fn(),
  };
});

describe("createBlinkCardUxManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("wires async dependencies into the BlinkCardUxManager constructor", async () => {
    const SHOW_DEMO_OVERLAY = true;
    const SHOW_PRODUCTION_OVERLAY = false;

    const cameraManager = {} as CameraManager;
    const sessionSettings = { inputImageSource: "video", scanningSettings: {} };
    const scanningSession = {
      getSettings: vi.fn().mockResolvedValue(sessionSettings),
      showDemoOverlay: vi.fn().mockResolvedValue(SHOW_DEMO_OVERLAY),
      showProductionOverlay: vi.fn().mockResolvedValue(SHOW_PRODUCTION_OVERLAY),
    } as unknown as RemoteScanningSession;

    const deviceInfo = { userAgent: "ua" };
    vi.mocked(getDeviceInfo).mockResolvedValue(deviceInfo as never);

    const instance = { manager: "instance" };
    vi.mocked(BlinkCardUxManager).mockImplementation(() => instance as never);

    const result = await createBlinkCardUxManager(
      cameraManager,
      scanningSession,
    );

    expect(result).toBe(instance);
    expect(getDeviceInfo).toHaveBeenCalledTimes(1);
    expect(BlinkCardUxManager).toHaveBeenCalledWith(
      cameraManager,
      scanningSession,
      sessionSettings,
      SHOW_DEMO_OVERLAY,
      SHOW_PRODUCTION_OVERLAY,
      deviceInfo,
    );
  });
});
