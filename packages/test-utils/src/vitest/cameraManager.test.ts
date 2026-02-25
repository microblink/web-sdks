/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { describe, expect, test, vi } from "vitest";
import { FakeCameraManager, type FakeCameraManagerState } from "./cameraManager";

describe("FakeCameraManager", () => {
  const imageData = {} as ImageData;

  test("registers and unregisters frame callback", async () => {
    const manager = new FakeCameraManager();
    const callback = vi.fn();

    const cleanup = manager.addFrameCaptureCallback(callback);
    await manager.emitFrame(imageData);
    expect(callback).toHaveBeenCalledTimes(1);

    expect(cleanup()).toBe(true);
    await manager.emitFrame(imageData);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("emits root and selector subscriptions", () => {
    const manager = new FakeCameraManager();
    const rootListener = vi.fn();
    const selectorListener = vi.fn();

    manager.subscribe(rootListener);
    manager.subscribe(
      (state: FakeCameraManagerState) => state.playbackState,
      selectorListener,
      { fireImmediately: true },
    );

    manager.emitPlaybackState("capturing");
    manager.emitPlaybackState("capturing");
    manager.emitPlaybackState("idle");

    expect(rootListener).toHaveBeenCalledTimes(3);
    // fireImmediately + capturing + idle (second capturing should be filtered by Object.is)
    expect(selectorListener).toHaveBeenCalledTimes(3);
    expect(selectorListener).toHaveBeenNthCalledWith(
      2,
      "capturing",
      "idle",
    );
  });

  test("supports custom selector equality function", () => {
    const manager = new FakeCameraManager();
    const selectorListener = vi.fn();

    manager.subscribe(
      (state: FakeCameraManagerState) => state.videoResolution?.width ?? 0,
      selectorListener,
      {
        equalityFn: (next: number, previous: number) =>
          Math.abs(next - previous) < 100,
      },
    );

    manager.emitState({ videoResolution: { width: 1050, height: 720 } });
    manager.emitState({ videoResolution: { width: 1100, height: 720 } });
    manager.emitState({ videoResolution: { width: 1300, height: 720 } });

    // Only 0->1050 and 1050->1300 should notify.
    expect(selectorListener).toHaveBeenCalledTimes(2);
  });

  test("returns undefined when no frame callback is set", async () => {
    const manager = new FakeCameraManager();

    const result = await manager.emitFrame(imageData);

    expect(result).toBeUndefined();
  });
});
