/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type { RemoteScanningSession } from "@microblink/blinkid-core";
import { getDeviceInfo } from "@microblink/blinkid-core";
import type { CameraManager } from "@microblink/camera-manager";
import { createFakeScanningSession } from "@microblink/test-utils";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { BlinkIdUxManager } from "./BlinkIdUxManager";
import { createBlinkIdUxManager } from "./createBlinkIdUxManager";

vi.mock("./BlinkIdUxManager", () => ({
  BlinkIdUxManager: vi.fn(),
}));

vi.mock("@microblink/blinkid-core", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@microblink/blinkid-core")>();
  return {
    ...actual,
    getDeviceInfo: vi.fn(),
  };
});

describe("createBlinkIdUxManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("wires async dependencies into the BlinkIdUxManager constructor", async () => {
    const SHOW_DEMO_OVERLAY = true;
    const SHOW_PRODUCTION_OVERLAY = false;

    const cameraManager = {} as CameraManager;
    const sessionSettings = { inputImageSource: "video", scanningSettings: {} };
    const scanningSession = createFakeScanningSession({
      settings: sessionSettings,
      showDemoOverlay: SHOW_DEMO_OVERLAY,
      showProductionOverlay: SHOW_PRODUCTION_OVERLAY,
    });

    const deviceInfo = { userAgent: "ua" } as Awaited<
      ReturnType<typeof getDeviceInfo>
    >;
    vi.mocked(getDeviceInfo).mockResolvedValue(deviceInfo);

    const instance = {} as BlinkIdUxManager;
    vi.mocked(BlinkIdUxManager).mockImplementation(() => instance);

    const result = await createBlinkIdUxManager(
      cameraManager,
      scanningSession as unknown as RemoteScanningSession,
    );

    expect(result).toBe(instance);
    expect(getDeviceInfo).toHaveBeenCalledTimes(1);
    expect(BlinkIdUxManager).toHaveBeenCalledWith(
      cameraManager,
      scanningSession,
      {},
      sessionSettings,
      SHOW_DEMO_OVERLAY,
      SHOW_PRODUCTION_OVERLAY,
      deviceInfo,
    );
  });

  test("best-effort reports setup failures through the scanning session", async () => {
    const cameraManager = {} as CameraManager;
    const scanningSession = createFakeScanningSession({
      overrides: {
        getSettings: vi.fn().mockRejectedValue(new Error("rpc failed")),
      },
    });

    await expect(
      createBlinkIdUxManager(
        cameraManager,
        scanningSession as unknown as RemoteScanningSession,
      ),
    ).rejects.toThrow("rpc failed");

    expect(scanningSession.ping).toHaveBeenCalledWith(
      expect.objectContaining({
        schemaName: "ping.error",
        data: expect.objectContaining({
          errorType: "Crash",
          errorMessage: "ux.createBlinkIdUxManager: rpc failed",
        }),
      }),
    );
    expect(scanningSession.sendPinglets).toHaveBeenCalledTimes(1);
  });
});
