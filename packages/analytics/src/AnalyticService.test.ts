/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { AnalyticService } from "./AnalyticService";
import type {
  PingBrowserDeviceInfoData,
  PingCameraHardwareInfoData,
} from "./ping";

describe("AnalyticsService", () => {
  let mockPingFn: ReturnType<typeof vi.fn>;
  let mockSendPingletsFn: ReturnType<typeof vi.fn>;
  let analyticsService: AnalyticService;

  beforeEach(() => {
    mockPingFn = vi.fn().mockResolvedValue(undefined);
    mockSendPingletsFn = vi.fn().mockResolvedValue(undefined);
    analyticsService = new AnalyticService({
      pingFn: mockPingFn,
      sendPingletsFn: mockSendPingletsFn,
    });
  });

  describe("constructor", () => {
    it("should initialize with ping functions", () => {
      expect(analyticsService).toBeInstanceOf(AnalyticService);
    });
  });

  describe("sendPinglets", () => {
    it("should call sendPingletsFn successfully", async () => {
      await analyticsService.sendPinglets();
      expect(mockSendPingletsFn).toHaveBeenCalledOnce();
    });

    it("should handle sendPingletsFn errors gracefully", async () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      mockSendPingletsFn.mockRejectedValue(new Error("Network error"));

      await analyticsService.sendPinglets();

      expect(mockSendPingletsFn).toHaveBeenCalledOnce();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Send pinglets failed:",
        expect.any(Error),
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe("camera events", () => {
    it("should log camera started event", async () => {
      await analyticsService.logCameraStartedEvent();

      expect(mockPingFn).toHaveBeenCalledWith({
        schemaName: "ping.sdk.ux.event",
        schemaVersion: "1.0.0",
        data: {
          eventType: "CameraStarted",
        },
      });
    });

    it("should log camera closed event", async () => {
      await analyticsService.logCameraClosedEvent();

      expect(mockPingFn).toHaveBeenCalledWith({
        schemaName: "ping.sdk.ux.event",
        schemaVersion: "1.0.0",
        data: {
          eventType: "CameraClosed",
        },
      });
    });
  });

  describe("help system events", () => {
    it("should log help opened event", async () => {
      await analyticsService.logHelpOpenedEvent();

      expect(mockPingFn).toHaveBeenCalledWith({
        schemaName: "ping.sdk.ux.event",
        schemaVersion: "1.0.0",
        data: {
          eventType: "HelpOpened",
        },
      });
    });

    it("should log help closed with content fully viewed", async () => {
      await analyticsService.logHelpClosedEvent(true);

      expect(mockPingFn).toHaveBeenCalledWith({
        schemaName: "ping.sdk.ux.event",
        schemaVersion: "1.0.0",
        data: {
          eventType: "HelpClosed",
          helpCloseType: "ContentFullyViewed",
        },
      });
    });

    it("should log help closed with content skipped", async () => {
      await analyticsService.logHelpClosedEvent(false);

      expect(mockPingFn).toHaveBeenCalledWith({
        schemaName: "ping.sdk.ux.event",
        schemaVersion: "1.0.0",
        data: {
          eventType: "HelpClosed",
          helpCloseType: "ContentSkipped",
        },
      });
    });

    it("should log help tooltip displayed", async () => {
      await analyticsService.logHelpTooltipDisplayedEvent();

      expect(mockPingFn).toHaveBeenCalledWith({
        schemaName: "ping.sdk.ux.event",
        schemaVersion: "1.0.0",
        data: {
          eventType: "HelpTooltipDisplayed",
        },
      });
    });
  });

  describe("UI interaction events", () => {
    it("should log close button clicked", async () => {
      await analyticsService.logCloseButtonClickedEvent();

      expect(mockPingFn).toHaveBeenCalledWith({
        schemaName: "ping.sdk.ux.event",
        schemaVersion: "1.0.0",
        data: {
          eventType: "CloseButtonClicked",
        },
      });
    });

    it("should log onboarding displayed", async () => {
      await analyticsService.logOnboardingDisplayedEvent();

      expect(mockPingFn).toHaveBeenCalledWith({
        schemaName: "ping.sdk.ux.event",
        schemaVersion: "1.0.0",
        data: {
          eventType: "OnboardingInfoDisplayed",
        },
      });
    });
  });

  describe("alert events", () => {
    it("should log alert event", async () => {
      await analyticsService.logAlertDisplayedEvent("NetworkError");

      expect(mockPingFn).toHaveBeenCalledWith({
        schemaName: "ping.sdk.ux.event",
        schemaVersion: "1.0.0",
        data: {
          eventType: "AlertDisplayed",
          alertType: "NetworkError",
        },
      });
    });
  });

  describe("error message events", () => {
    it("should log error message for valid error state", async () => {
      await analyticsService.logErrorMessageEvent("EliminateBlur");

      expect(mockPingFn).toHaveBeenCalledWith({
        schemaName: "ping.sdk.ux.event",
        schemaVersion: "1.0.0",
        data: {
          eventType: "ErrorMessage",
          errorMessageType: "EliminateBlur",
        },
      });
    });
  });

  describe("background events", () => {
    it("should log app moved to background", async () => {
      await analyticsService.logAppMovedToBackgroundEvent();

      expect(mockPingFn).toHaveBeenCalledWith({
        schemaName: "ping.sdk.ux.event",
        schemaVersion: "1.0.0",
        data: {
          eventType: "AppMovedToBackground",
        },
      });
    });
  });

  describe("timeout events", () => {
    it("should log step timeout", async () => {
      await analyticsService.logStepTimeoutEvent();

      expect(mockPingFn).toHaveBeenCalledWith({
        schemaName: "ping.sdk.ux.event",
        schemaVersion: "1.0.0",
        data: {
          eventType: "StepTimeout",
        },
      });
    });
  });

  describe("camera system events", () => {
    const mockCamera = {
      name: "MyCamera1",
      facingMode: "Front",
      singleShotSupported: true,
    };

    const mockVideoResolution = {
      width: 1920,
      height: 1080,
    };

    const mockExtractionArea = {
      width: 800,
      height: 600,
      x: 560,
      y: 240,
    };

    it("should log camera input info with extraction area", async () => {
      await analyticsService.logCameraInputInfo({
        deviceId: mockCamera.name,
        cameraFacing: mockCamera.facingMode as "Front" | "Back" | "Unknown",
        cameraFrameWidth: mockVideoResolution.width,
        cameraFrameHeight: mockVideoResolution.height,
        roiWidth: mockExtractionArea.width,
        roiHeight: mockExtractionArea.height,
        viewPortAspectRatio:
          mockExtractionArea.width / mockExtractionArea.height,
      });

      expect(mockPingFn).toHaveBeenCalledWith({
        schemaName: "ping.sdk.camera.input.info",
        schemaVersion: "1.0.2",
        data: {
          deviceId: "MyCamera1",
          cameraFacing: "Front",
          cameraFrameWidth: 1920,
          cameraFrameHeight: 1080,
          roiWidth: 800,
          roiHeight: 600,
          viewPortAspectRatio: 800 / 600,
        },
      });
    });

    it("should log hardware camera info", async () => {
      const cameras = [
        {
          deviceId: "Front Camera 1",
          cameraFacing: "Front",
          focus: "Auto",
          availableResolutions: undefined,
        },
        {
          deviceId: "Back Camera 1",
          cameraFacing: "Back",
          focus: "Fixed",
          availableResolutions: undefined,
        },
      ] as PingCameraHardwareInfoData["availableCameras"];

      await analyticsService.logHardwareCameraInfo(cameras);

      expect(mockPingFn).toHaveBeenCalledWith({
        schemaName: "ping.hardware.camera.info",
        schemaVersion: "1.0.3",
        data: {
          availableCameras: [
            {
              deviceId: "Front Camera 1",
              cameraFacing: "Front",
              availableResolutions: undefined,
              focus: "Auto",
            },
            {
              deviceId: "Back Camera 1",
              cameraFacing: "Back",
              availableResolutions: undefined,
              focus: "Fixed",
            },
          ],
        },
      });
    });
  });

  describe("camera permission events", () => {
    it("should log camera permission check granted", async () => {
      await analyticsService.logCameraPermissionCheck(true);

      expect(mockPingFn).toHaveBeenCalledWith({
        schemaName: "ping.sdk.camera.permission",
        schemaVersion: "1.0.0",
        data: {
          eventType: "CameraPermissionCheck",
          cameraPermissionGranted: true,
        },
      });
    });

    it("should log camera permission check denied", async () => {
      await analyticsService.logCameraPermissionCheck(false);

      expect(mockPingFn).toHaveBeenCalledWith({
        schemaName: "ping.sdk.camera.permission",
        schemaVersion: "1.0.0",
        data: {
          eventType: "CameraPermissionCheck",
          cameraPermissionGranted: false,
        },
      });
    });

    it("should log camera permission request", async () => {
      await analyticsService.logCameraPermissionRequest();

      expect(mockPingFn).toHaveBeenCalledWith({
        schemaName: "ping.sdk.camera.permission",
        schemaVersion: "1.0.0",
        data: {
          eventType: "CameraPermissionRequest",
        },
      });
    });

    it("should log camera permission user response", async () => {
      await analyticsService.logCameraPermissionUserResponse(true);

      expect(mockPingFn).toHaveBeenCalledWith({
        schemaName: "ping.sdk.camera.permission",
        schemaVersion: "1.0.0",
        data: {
          eventType: "CameraPermissionUserResponse",
          cameraPermissionGranted: true,
        },
      });
    });
  });

  describe("scan conditions events", () => {
    it("should log device orientation", async () => {
      await analyticsService.logDeviceOrientation("Portrait");

      expect(mockPingFn).toHaveBeenCalledWith({
        schemaName: "ping.sdk.scan.conditions",
        schemaVersion: "1.0.0",
        data: {
          updateType: "DeviceOrientation",
          deviceOrientation: "Portrait",
        },
      });
    });

    it("should log flashlight state", async () => {
      await analyticsService.logFlashlightState(true);

      expect(mockPingFn).toHaveBeenCalledWith({
        schemaName: "ping.sdk.scan.conditions",
        schemaVersion: "1.0.0",
        data: {
          updateType: "FlashlightState",
          flashlightOn: true,
        },
      });
    });
  });

  describe("device info events", () => {
    const mockDeviceInfo = {
      userAgent: "Mozilla/5.0...",
      threads: 4,
      memory: 8192,
      gpu: {
        renderer: "WebKit WebGL",
        vendor: "WebKit",
        shadingLanguageVersion: "1.0",
        version: "WebGL 2.0",
      },
      screen: {
        width: 1920,
        height: 1080,
        colorDepth: 24,
        pixelDepth: 24,
      },
      browserStorageSupport: {
        localStorage: true,
        sessionStorage: true,
        indexedDB: true,
      },
      derivedDeviceInfo: {
        model: "MacBook Pro",
        formFactors: ["Desktop"],
        platform: "macOS",
        browser: { brand: "Chrome", version: "91.0.0" },
      },
    } as unknown as PingBrowserDeviceInfoData;

    it("should log device info with known platform", async () => {
      await analyticsService.logDeviceInfo(mockDeviceInfo);

      expect(mockPingFn).toHaveBeenCalledWith({
        schemaName: "ping.browser.device.info",
        schemaVersion: "1.0.0",
        data: {
          userAgentData: undefined,
          userAgent: "Mozilla/5.0...",
          threads: 4,
          memory: 8192,
          gpu: {
            renderer: "WebKit WebGL",
            vendor: "WebKit",
            shadingLanguageVersion: "1.0",
            version: "WebGL 2.0",
          },
          screen: { width: 1920, height: 1080, colorDepth: 24, pixelDepth: 24 },
          browserStorageSupport: {
            localStorage: true,
            sessionStorage: true,
            indexedDB: true,
          },
          derivedDeviceInfo: {
            model: "MacBook Pro",
            formFactors: ["Desktop"],
            platform: "macOS",
            browser: { brand: "Chrome", version: "91.0.0" },
          },
        },
      });
    });
  });

  describe("error handling", () => {
    it("should handle ping function errors gracefully", async () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      mockPingFn.mockRejectedValue(new Error("Network error"));

      await analyticsService.logCameraStartedEvent();

      expect(mockPingFn).toHaveBeenCalledOnce();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "UX analytics ping failed:",
        expect.any(Error),
      );

      consoleWarnSpy.mockRestore();
    });
  });
});
