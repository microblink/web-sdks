/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  BlinkIdSessionSettings,
  RemoteScanningSession,
} from "@microblink/blinkid-core";
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
      resolvedSettings: sessionSettings,
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

  test("does not derive initial state from extraction mode", async () => {
    const cameraManager = {} as CameraManager;
    const sessionSettings = {
      inputImageSource: "video",
      scanningMode: "single",
      scanningSettings: {
        documentCaptureModule: {},
        barcodeModule: {},
      },
    } as BlinkIdSessionSettings;
    const scanningSession = createFakeScanningSession({
      resolvedSettings: sessionSettings,
    });

    vi.mocked(getDeviceInfo).mockResolvedValue({ userAgent: "ua" } as Awaited<
      ReturnType<typeof getDeviceInfo>
    >);
    vi.mocked(BlinkIdUxManager).mockImplementation(
      () => ({}) as BlinkIdUxManager,
    );

    await createBlinkIdUxManager(
      cameraManager,
      scanningSession as unknown as RemoteScanningSession,
    );

    expect(BlinkIdUxManager).toHaveBeenCalledWith(
      cameraManager,
      scanningSession,
      {},
      sessionSettings,
      expect.any(Boolean),
      expect.any(Boolean),
      expect.any(Object),
    );
  });

  test("passes status-derived initial state into the manager", async () => {
    const cameraManager = {} as CameraManager;
    const sessionSettings = {
      inputImageSource: "video",
      scanningSettings: {},
    };
    const scanningSession = createFakeScanningSession({
      resolvedSettings: sessionSettings,
      scanningStatus: "scanning-barcode-in-progress",
    });

    vi.mocked(getDeviceInfo).mockResolvedValue({ userAgent: "ua" } as Awaited<
      ReturnType<typeof getDeviceInfo>
    >);
    vi.mocked(BlinkIdUxManager).mockImplementation(
      () => ({}) as BlinkIdUxManager,
    );

    await createBlinkIdUxManager(
      cameraManager,
      scanningSession as unknown as RemoteScanningSession,
    );

    expect(BlinkIdUxManager).toHaveBeenCalledWith(
      cameraManager,
      scanningSession,
      expect.objectContaining({
        initialUiStateKey: "PROCESSING_BARCODE",
      }),
      sessionSettings,
      expect.any(Boolean),
      expect.any(Boolean),
      expect.any(Object),
    );
  });

  test("preserves explicit initial state over barcode prompt default", async () => {
    const cameraManager = {} as CameraManager;
    const sessionSettings = {
      inputImageSource: "video",
      scanningMode: "single",
      scanningSettings: {
        documentCaptureModule: {},
        barcodeModule: {},
      },
    } as BlinkIdSessionSettings;
    const scanningSession = createFakeScanningSession({
      resolvedSettings: sessionSettings,
    });

    vi.mocked(getDeviceInfo).mockResolvedValue({ userAgent: "ua" } as Awaited<
      ReturnType<typeof getDeviceInfo>
    >);
    vi.mocked(BlinkIdUxManager).mockImplementation(
      () => ({}) as BlinkIdUxManager,
    );

    await createBlinkIdUxManager(
      cameraManager,
      scanningSession as unknown as RemoteScanningSession,
      { initialUiStateKey: "INTRO_DATA_PAGE" },
    );

    expect(BlinkIdUxManager).toHaveBeenCalledWith(
      cameraManager,
      scanningSession,
      expect.objectContaining({
        initialUiStateKey: "INTRO_DATA_PAGE",
      }),
      sessionSettings,
      expect.any(Boolean),
      expect.any(Boolean),
      expect.any(Object),
    );
  });

  test("best-effort reports setup failures through the scanning session", async () => {
    const cameraManager = {} as CameraManager;
    const scanningSession = createFakeScanningSession({
      overrides: {
        getResolvedSessionSettings: vi
          .fn()
          .mockRejectedValue(new Error("rpc failed")),
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
