/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { afterEach, describe, expect, test, vi } from "vitest";
import {
  mapScreenOrientationType,
  subscribeToDeviceOrientation,
} from "./deviceOrientationAnalytics";

type MockScreenOrientation = ScreenOrientation & {
  dispatchChange: () => void;
  setType: (type: ScreenOrientation["type"]) => void;
};

const originalWindowOrientationDescriptor = Object.getOwnPropertyDescriptor(
  window,
  "orientation",
);

function createScreenOrientationMock(
  initialType: ScreenOrientation["type"],
): MockScreenOrientation {
  const eventTarget = new EventTarget();
  let type = initialType;

  return {
    get type() {
      return type;
    },
    angle: 0,
    onchange: null,
    addEventListener: eventTarget.addEventListener.bind(eventTarget),
    removeEventListener: eventTarget.removeEventListener.bind(eventTarget),
    dispatchEvent: eventTarget.dispatchEvent.bind(eventTarget),
    dispatchChange: () => eventTarget.dispatchEvent(new Event("change")),
    setType: (nextType) => {
      type = nextType;
    },
  } as MockScreenOrientation;
}

function setWindowOrientation(orientation: number | undefined) {
  Object.defineProperty(window, "orientation", {
    configurable: true,
    value: orientation,
  });
}

function restoreWindowOrientation() {
  if (originalWindowOrientationDescriptor) {
    Object.defineProperty(
      window,
      "orientation",
      originalWindowOrientationDescriptor,
    );
    return;
  }

  Reflect.deleteProperty(window, "orientation");
}

describe("deviceOrientationAnalytics", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    restoreWindowOrientation();
  });

  test("maps Screen Orientation API types to analytics orientations", () => {
    expect(mapScreenOrientationType("portrait-primary")).toBe("Portrait");
    expect(mapScreenOrientationType("portrait-secondary")).toBe(
      "PortraitUpside",
    );
    expect(mapScreenOrientationType("landscape-primary")).toBe("LandscapeLeft");
    expect(mapScreenOrientationType("landscape-secondary")).toBe(
      "LandscapeRight",
    );
  });

  test("reports the initial screen orientation and change events", () => {
    const orientation = createScreenOrientationMock("portrait-primary");
    const onOrientation = vi.fn();
    const onFailure = vi.fn();

    vi.stubGlobal("screen", { orientation });

    const cleanup = subscribeToDeviceOrientation(onOrientation, onFailure);

    expect(onOrientation).toHaveBeenCalledTimes(1);
    expect(onOrientation).toHaveBeenLastCalledWith("Portrait");
    expect(onFailure).not.toHaveBeenCalled();

    orientation.setType("landscape-secondary");
    orientation.dispatchChange();

    expect(onOrientation).toHaveBeenCalledTimes(2);
    expect(onOrientation).toHaveBeenLastCalledWith("LandscapeRight");

    cleanup();
    orientation.setType("portrait-secondary");
    orientation.dispatchChange();

    expect(onOrientation).toHaveBeenCalledTimes(2);
  });

  test("falls back to legacy window orientation changes", () => {
    const onOrientation = vi.fn();
    const onFailure = vi.fn();

    vi.stubGlobal("screen", {});
    setWindowOrientation(0);

    const cleanup = subscribeToDeviceOrientation(onOrientation, onFailure);

    expect(onOrientation).toHaveBeenCalledTimes(1);
    expect(onOrientation).toHaveBeenLastCalledWith("Portrait");
    expect(onFailure).not.toHaveBeenCalled();

    setWindowOrientation(-90);
    window.dispatchEvent(new Event("orientationchange"));

    expect(onOrientation).toHaveBeenCalledTimes(2);
    expect(onOrientation).toHaveBeenLastCalledWith("LandscapeRight");

    cleanup();
    setWindowOrientation(180);
    window.dispatchEvent(new Event("orientationchange"));

    expect(onOrientation).toHaveBeenCalledTimes(2);
  });

  test("does not throw when screen orientation is undefined", () => {
    const onOrientation = vi.fn();
    const onFailure = vi.fn();

    vi.stubGlobal("screen", {});
    setWindowOrientation(undefined);

    expect(() =>
      subscribeToDeviceOrientation(onOrientation, onFailure),
    ).not.toThrow();
    expect(onOrientation).not.toHaveBeenCalled();
    expect(onFailure).toHaveBeenCalledWith(
      "Device orientation analytics unavailable: browser does not expose a supported orientation API.",
    );
  });

  test("does not throw when orientation APIs are missing", () => {
    const onOrientation = vi.fn();
    const onFailure = vi.fn();
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");

    vi.stubGlobal("screen", {});
    setWindowOrientation(undefined);

    const cleanup = subscribeToDeviceOrientation(onOrientation, onFailure);

    expect(cleanup).toEqual(expect.any(Function));
    expect(onOrientation).not.toHaveBeenCalled();
    expect(onFailure).toHaveBeenCalledTimes(1);
    expect(addEventListenerSpy).not.toHaveBeenCalled();
    expect(() => cleanup()).not.toThrow();
  });
});
