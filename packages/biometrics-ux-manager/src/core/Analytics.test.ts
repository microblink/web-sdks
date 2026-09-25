/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { Ping } from "@microblink/analytics/ping";
import type { DeviceInfo } from "@microblink/biometrics-core";
import type { Camera, CameraManager } from "@microblink/camera-manager/core";
import { FakeCameraManager } from "@microblink/test-utils/vitest";
import { subscribeToDeviceOrientation } from "@microblink/ux-common/deviceOrientationAnalytics";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Analytics } from "./Analytics";
import { BiometricsError } from "./BiometricsUxManager";
import type { AlertType, BiometricsUxState, CloseReason } from "./types";

vi.mock("@microblink/ux-common/deviceOrientationAnalytics", () => ({
  subscribeToDeviceOrientation: vi.fn((onOrientation: (orientation: string) => void) => {
    onOrientation("Portrait");
    return vi.fn();
  }),
}));

const analyticsInstances = new Set<Analytics>();
const deviceInfo = {} as DeviceInfo;
const closeReasons: CloseReason[] = ["User", "SystemError", "Sdk"];

function createAnalytics(
  initialState: BiometricsUxState = uxState("idle"),
  errorDialogAlertTypes?: Partial<Record<string, AlertType>>,
) {
  const camera = new FakeCameraManager();
  const pings: Ping[] = [];

  const transport = {
    ping: vi.fn((ping: Ping) => {
      pings.push(ping);
      return Promise.resolve();
    }),
    sendPinglets: vi.fn(() => Promise.resolve()),
  };

  const analytics = new Analytics(
    camera as unknown as CameraManager,
    transport,
    deviceInfo,
    initialState,
    errorDialogAlertTypes,
  );

  analyticsInstances.add(analytics);

  return { analytics, camera, pings };
}

function uxState(key: BiometricsUxState["key"], patch: Partial<BiometricsUxState> = {}): BiometricsUxState {
  return {
    key,
    sessionState: "IDLE",
    feedback: "FACE_NOT_FOUND",
    helpNudgeVisible: false,
    frameSize: { width: 0, height: 0 },
    mirrorX: false,
    ...patch,
  };
}

function uxEvents(pings: Ping[]) {
  return pings.filter((ping) => ping.schemaName === "ping.sdk.ux.event");
}

function pingsFor(pings: Ping[], schemaName: Ping["schemaName"]) {
  return pings.filter((ping) => ping.schemaName === schemaName);
}

describe("Analytics", () => {
  beforeEach(() => {
    vi.mocked(subscribeToDeviceOrientation).mockClear();
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
  });

  afterEach(() => {
    for (const analytics of analyticsInstances) {
      analytics.dispose();
    }

    analyticsInstances.clear();
    vi.useRealTimers();
  });

  it("reports camera permission transitions", () => {
    const { camera, pings } = createAnalytics();

    camera.emitState({ cameraPermission: "prompt" });
    camera.emitState({ cameraPermission: "granted" });

    expect(pingsFor(pings, "ping.sdk.camera.permission")).toEqual([
      expect.objectContaining({ data: { eventType: "CameraPermissionCheck", cameraPermissionGranted: false } }),
      expect.objectContaining({ data: { eventType: "CameraPermissionRequest" } }),
      expect.objectContaining({
        data: { eventType: "CameraPermissionUserResponse", cameraPermissionGranted: true },
      }),
    ]);
  });

  it("reports initial camera failures once", () => {
    const { camera, pings } = createAnalytics();
    const failure = new BiometricsError({
      message: "denied",
      code: "CAMERA_ACCESS_DENIED",
      stage: "capture",
      component: "camera",
      isRetryable: true,
    });

    camera.emitState({ errorState: failure });
    camera.emitError(failure);

    expect(uxEvents(pings).filter((ping) => ping.data.eventType === "CameraOpenFailed")).toEqual([
      expect.objectContaining({
        data: { eventType: "CameraOpenFailed", cameraFailureCategory: "CAMERA_ACCESS_DENIED" },
      }),
    ]);
  });

  it("preserves camera close reasons", () => {
    for (const closeReason of closeReasons) {
      const { analytics, camera, pings } = createAnalytics();

      camera.emitState({ playbackState: "playback", errorState: undefined });

      if (closeReason === "SystemError") {
        camera.emitError(new Error("stream ended"));
      } else {
        analytics.cameraWillClose(closeReason);
      }

      camera.emitState({ playbackState: "idle" });

      expect(uxEvents(pings).filter((ping) => ping.data.eventType === "CameraClosed")).toEqual([
        expect.objectContaining({ data: { eventType: "CameraClosed", closeReason } }),
      ]);

      if (closeReason === "User") {
        expect(uxEvents(pings).filter((ping) => ping.data.eventType === "CloseButtonClicked")).toHaveLength(1);
      }
    }
  });

  it("deduplicates camera hardware and input information", async () => {
    vi.useFakeTimers();

    const { camera, pings } = createAnalytics();
    const front = { name: "front-cam", facingMode: "front", singleShotSupported: false } as Camera;

    camera.emitState({ cameras: [front], videoElement: document.createElement("video") });
    camera.emitState({ cameras: [front], videoElement: document.createElement("video") });
    expect(pingsFor(pings, "ping.hardware.camera.info")).toHaveLength(1);

    camera.emitState({ selectedCamera: front, videoResolution: { width: 1280, height: 720 } });

    camera.emitState({ extractionArea: { x: 0, y: 0, width: 1280, height: 720 } });
    await vi.runOnlyPendingTimersAsync();
    expect(pingsFor(pings, "ping.sdk.camera.input.info")).toHaveLength(1);

    camera.emitState({ extractionArea: { x: 10, y: 10, width: 1260, height: 700 } });
    await vi.runOnlyPendingTimersAsync();
    expect(pingsFor(pings, "ping.sdk.camera.input.info")).toHaveLength(2);
  });

  it("maps UX state, orientation, and visibility events", () => {
    const onboarding = uxState("onboarding");
    const { analytics, pings } = createAnalytics(onboarding);

    const starting = uxState("starting", { helpNudgeVisible: true });

    analytics.stateChanged(onboarding, starting);

    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));

    const help = uxState("help");
    analytics.stateChanged(starting, help);

    const error = uxState("error", { errorDialogKind: "scanningUnsuccessful" });
    analytics.stateChanged(help, error);

    expect(pingsFor(pings, "ping.sdk.scan.conditions")).toEqual([
      expect.objectContaining({ data: { updateType: "DeviceOrientation", deviceOrientation: "Portrait" } }),
    ]);
    expect(uxEvents(pings)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ data: { eventType: "OnboardingInfoDisplayed" } }),
        expect.objectContaining({ data: { eventType: "HelpTooltipDisplayed" } }),
        expect.objectContaining({ data: { eventType: "AppMovedToBackground" } }),
        expect.objectContaining({ data: { eventType: "HelpOpened" } }),
        expect.objectContaining({ data: { eventType: "HelpClosed" } }),
        expect.objectContaining({ data: { eventType: "AlertDisplayed", alertType: "StepTimeout" } }),
      ]),
    );
  });

  it("reports configured alert types for custom error dialogs", () => {
    const capturing = uxState("capturing");
    const { analytics, pings } = createAnalytics(capturing, { networkError: "NetworkError" });

    const error: BiometricsUxState<unknown, "networkError"> = { ...uxState("error"), errorDialogKind: "networkError" };
    analytics.stateChanged(capturing, error);

    expect(uxEvents(pings)).toContainEqual(
      expect.objectContaining({ data: { eventType: "AlertDisplayed", alertType: "NetworkError" } }),
    );
  });
});
