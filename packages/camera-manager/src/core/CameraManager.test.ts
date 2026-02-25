/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { beforeEach, describe, expect, test, vi } from "vitest";
import { enableFakeTimers } from "@microblink/test-utils";
import { VideoResolutionName } from "./Camera";
import { CameraManager, defaultCameraManagerOptions } from "./CameraManager";
import {
  cameraManagerStore as store,
  resetCameraManagerStore,
} from "./cameraManagerStore";

// Mock VideoFrameProcessor
vi.mock("./VideoFrameProcessor", () => ({
  VideoFrameProcessor: vi.fn().mockImplementation(() => ({
    getImageData: vi.fn(),
    reattachArrayBuffer: vi.fn(),
    getCurrentImageData: vi.fn(),
  })),
  isBufferDetached: vi.fn().mockReturnValue(false),
}));

describe("CameraManager - Default Resolution", () => {
  let cameraManager: CameraManager;

  beforeEach(() => {
    vi.clearAllMocks();
    cameraManager = new CameraManager();
  });

  test("should have default resolution of 1080p", () => {
    expect(cameraManager.resolution).toBe("1080p");
  });

  test("should be able to set resolution", async () => {
    await cameraManager.setResolution("4k");
    expect(cameraManager.resolution).toBe("4k");

    await cameraManager.setResolution("720p");
    expect(cameraManager.resolution).toBe("720p");
  });

  test("should validate that default options include mirrorFrontCameras", () => {
    expect(defaultCameraManagerOptions.mirrorFrontCameras).toBe(true);
  });

  test("should create CameraManager with custom options", () => {
    const customManager = new CameraManager({ mirrorFrontCameras: false });
    expect(customManager.resolution).toBe("1080p"); // Default resolution should still apply
  });

  test("should maintain resolution property getter", () => {
    const manager = new CameraManager();
    expect(manager.resolution).toBe("1080p");

    // Resolution should be read-only from outside (only settable via setResolution method)
    expect(typeof manager.resolution).toBe("string");
  });
});

describe("CameraManager - Resolution Settings", () => {
  let cameraManager: CameraManager;

  beforeEach(() => {
    vi.clearAllMocks();
    cameraManager = new CameraManager();
  });

  test("should handle resolution changes for all valid values", async () => {
    const validResolutions: VideoResolutionName[] = ["720p", "1080p", "4k"];

    for (const resolution of validResolutions) {
      await cameraManager.setResolution(resolution);
      expect(cameraManager.resolution).toBe(resolution);
    }
  });

  test("should set resolution passed in constructor options", () => {
    const manager1 = new CameraManager({ preferredResolution: "720p" });
    const manager2 = new CameraManager({ preferredResolution: "1080p" });
    const manager3 = new CameraManager({ preferredResolution: "4k" });

    expect(manager1.resolution).toBe("720p");
    expect(manager2.resolution).toBe("1080p");
    expect(manager3.resolution).toBe("4k");
  });

  test("should start with 1080p as default even after construction", () => {
    const manager1 = new CameraManager();
    const manager2 = new CameraManager({});
    const manager3 = new CameraManager({ mirrorFrontCameras: false });

    expect(manager1.resolution).toBe("1080p");
    expect(manager2.resolution).toBe("1080p");
    expect(manager3.resolution).toBe("1080p");
  });

  test("should handle setResolution method existence and basic functionality", async () => {
    expect(typeof cameraManager.setResolution).toBe("function");

    // Should not throw when setting valid resolutions
    await expect(cameraManager.setResolution("720p")).resolves.not.toThrow();
    await expect(cameraManager.setResolution("1080p")).resolves.not.toThrow();
    await expect(cameraManager.setResolution("4k")).resolves.not.toThrow();
  });

  test("should preserve resolution state across multiple sets", async () => {
    // Initial state
    expect(cameraManager.resolution).toBe("1080p");

    // Change to 4k
    await cameraManager.setResolution("4k");
    expect(cameraManager.resolution).toBe("4k");

    // Change to 720p
    await cameraManager.setResolution("720p");
    expect(cameraManager.resolution).toBe("720p");

    // Change back to 1080p
    await cameraManager.setResolution("1080p");
    expect(cameraManager.resolution).toBe("1080p");
  });
});

describe("CameraManager - Visibility Guards", () => {
  let cameraManager: CameraManager;

  beforeEach(() => {
    vi.clearAllMocks();
    resetCameraManagerStore();
    cameraManager = new CameraManager();
  });

  test("should not start camera stream while document is hidden", async () => {
    const startStreamSpy = vi.fn();
    const videoElement = document.createElement("video");

    store.setState({
      videoElement,
      selectedCamera: {
        startStream: startStreamSpy,
      } as never,
    });

    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");

    await cameraManager.startCameraStream();

    expect(startStreamSpy).not.toHaveBeenCalled();
    expect(store.getState().playbackState).toBe("idle");
  });

  test("should not transition to capturing while document is hidden", async () => {
    const startStreamSpy = vi.fn();
    const playSpy = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockResolvedValue(undefined);
    const videoElement = document.createElement("video");

    store.setState({
      videoElement,
      selectedCamera: {
        startStream: startStreamSpy,
        facingMode: "back",
      } as never,
    });

    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");

    await cameraManager.startFrameCapture();

    expect(startStreamSpy).not.toHaveBeenCalled();
    expect(playSpy).not.toHaveBeenCalled();
    expect(store.getState().playbackState).toBe("idle");
  });

  test("should resume queued playback when tab becomes visible again", async () => {
    enableFakeTimers();

    const stream = new MediaStream();
    const camera = {
      activeStream: undefined as MediaStream | undefined,
      facingMode: "back",
      stopStream: vi.fn(),
      startStream: vi.fn(() => {
        camera.activeStream = stream;
        return stream;
      }),
    };
    const playSpy = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockResolvedValue(undefined);
    const videoElement = document.createElement("video");
    document.body.appendChild(videoElement);
    cameraManager.initVideoElement(videoElement);

    store.setState({
      selectedCamera: camera as never,
    });

    let visibilityState: DocumentVisibilityState = "hidden";
    vi.spyOn(document, "visibilityState", "get").mockImplementation(
      () => visibilityState,
    );

    window.setTimeout(() => {
      void cameraManager.startPlayback();
    }, 3000);

    vi.advanceTimersByTime(3000);
    await Promise.resolve();

    expect(camera.startStream).not.toHaveBeenCalled();
    expect(playSpy).not.toHaveBeenCalled();
    expect(store.getState().playbackState).toBe("idle");

    visibilityState = "visible";
    document.dispatchEvent(new Event("visibilitychange"));
    await Promise.resolve();
    await Promise.resolve();

    expect(camera.startStream).toHaveBeenCalledTimes(1);
    expect(playSpy).toHaveBeenCalled();
    expect(store.getState().playbackState).toBe("playback");

    videoElement.remove();
    vi.useRealTimers();
  });
});
