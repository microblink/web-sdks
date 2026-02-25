/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type { RemoteScanningSession } from "@microblink/blinkcard-core";
import { getDeviceInfo } from "@microblink/blinkcard-core";
import type { CameraManager } from "@microblink/camera-manager";
import { createFakeScanningSession } from "@microblink/test-utils";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { BlinkCardUxManager } from "./BlinkCardUxManager";
import { createBlinkCardUxManager } from "./createBlinkCardUxManager";

/**
 * Test file role:
 * - Verifies constructor wiring for createBlinkCardUxManager().
 * - Focuses on dependency forwarding/default setup, not scan flow behavior.
 */

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
    const scanningSession = createFakeScanningSession({
      settings: sessionSettings,
      showDemoOverlay: SHOW_DEMO_OVERLAY,
      showProductionOverlay: SHOW_PRODUCTION_OVERLAY,
    });

    const deviceInfo = { userAgent: "ua" } as Awaited<
      ReturnType<typeof getDeviceInfo>
    >;
    vi.mocked(getDeviceInfo).mockResolvedValue(deviceInfo);

    const instance = {} as BlinkCardUxManager;
    vi.mocked(BlinkCardUxManager).mockImplementation(() => instance);

    const result = await createBlinkCardUxManager(
      cameraManager,
      scanningSession as unknown as RemoteScanningSession,
    );

    expect(result).toBe(instance);
    expect(getDeviceInfo).toHaveBeenCalledTimes(1);
    expect(BlinkCardUxManager).toHaveBeenCalledWith(
      cameraManager,
      scanningSession,
      {},
      sessionSettings,
      SHOW_DEMO_OVERLAY,
      SHOW_PRODUCTION_OVERLAY,
      deviceInfo,
    );
  });
});
