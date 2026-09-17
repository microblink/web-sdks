/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { RemoteScanningSession } from "@microblink/blinkcard-core";
import { getDeviceInfo } from "@microblink/blinkcard-core";
import type { CameraManager } from "@microblink/camera-manager/core";
import { createFakeScanningSession } from "@microblink/test-utils";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { BlinkCardUxManager } from "./BlinkCardUxManager";
import { createBlinkCardUxManager } from "./createBlinkCardUxManager";

/**
 * Test file role:
 *
 * - Verifies constructor wiring for createBlinkCardUxManager().
 * - Focuses on dependency forwarding/default setup, not scan flow behavior.
 */

vi.mock("./BlinkCardUxManager", () => ({
  BlinkCardUxManager: vi.fn(class BlinkCardUxManagerMock {}),
}));

vi.mock("@microblink/blinkcard-core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@microblink/blinkcard-core")>();
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
    const scanningSession = createFakeScanningSession({
      settings: sessionSettings,
      showDemoOverlay: SHOW_DEMO_OVERLAY,
      showProductionOverlay: SHOW_PRODUCTION_OVERLAY,
    });

    const deviceInfo = { userAgent: "ua" } as Awaited<ReturnType<typeof getDeviceInfo>>;
    vi.mocked(getDeviceInfo).mockResolvedValue(deviceInfo);
    const options = {
      timeoutConfiguration: {
        inactivityTimeoutMs: 5_000,
        scanStepTimeoutMs: null,
      },
    };

    const instance = {} as BlinkCardUxManager;
    vi.mocked(BlinkCardUxManager).mockImplementation(function BlinkCardUxManagerMock() {
      return instance;
    });

    const result = await createBlinkCardUxManager(
      cameraManager,
      scanningSession as unknown as RemoteScanningSession,
      options,
    );

    expect(result).toBe(instance);
    expect(getDeviceInfo).toHaveBeenCalledTimes(1);
    expect(BlinkCardUxManager).toHaveBeenCalledWith(
      cameraManager,
      scanningSession,
      options,
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
      createBlinkCardUxManager(cameraManager, scanningSession as unknown as RemoteScanningSession),
    ).rejects.toThrow("rpc failed");

    expect(scanningSession.ping).toHaveBeenCalledWith(
      expect.objectContaining({
        schemaName: "ping.error",
        data: expect.objectContaining({
          errorType: "Crash",
          errorMessage: "ux.createBlinkCardUxManager: rpc failed",
        }),
      }),
    );
    expect(scanningSession.sendPinglets).toHaveBeenCalledTimes(1);
  });
});
