/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type { PingScanningConditionsData } from "@microblink/analytics/ping";

type DeviceOrientation = NonNullable<
  PingScanningConditionsData["deviceOrientation"]
>;

type WindowWithOrientation = Window & {
  orientation?: number;
};

const DEVICE_ORIENTATION_UNAVAILABLE_LOG_MESSAGE =
  "Device orientation analytics unavailable: browser does not expose a supported orientation API.";

const DEVICE_ORIENTATION_SUBSCRIPTION_FAILED_LOG_MESSAGE =
  "Device orientation analytics unavailable: failed to subscribe to orientation changes.";

/**
 * Maps Screen Orientation API values to analytics device orientation values.
 */
export function mapScreenOrientationType(
  type: ScreenOrientation["type"],
): DeviceOrientation | undefined {
  switch (type) {
    case "portrait-primary":
      return "Portrait";
    case "portrait-secondary":
      return "PortraitUpside";
    case "landscape-primary":
      return "LandscapeLeft";
    case "landscape-secondary":
      return "LandscapeRight";
  }

  return undefined;
}

function mapWindowOrientation(
  orientation: number,
): DeviceOrientation | undefined {
  switch (orientation) {
    case 0:
      return "Portrait";
    case 180:
      return "PortraitUpside";
    case 90:
      return "LandscapeLeft";
    case -90:
      return "LandscapeRight";
  }

  return undefined;
}

function reportOrientation(
  orientation: DeviceOrientation | undefined,
  onOrientation: (orientation: DeviceOrientation) => void,
) {
  if (orientation === undefined) {
    return;
  }

  onOrientation(orientation);
}

function getScreenOrientation(): ScreenOrientation | undefined {
  try {
    if (typeof screen === "undefined") {
      return undefined;
    }

    return screen.orientation;
  } catch {
    return undefined;
  }
}

function subscribeToScreenOrientation(
  screenOrientation: ScreenOrientation,
  onOrientation: (orientation: DeviceOrientation) => void,
): (() => void) | undefined {
  try {
    screenOrientation.addEventListener("change", orientationChangeHandler);
    reportOrientation(
      mapScreenOrientationType(screenOrientation.type),
      onOrientation,
    );
  } catch {
    return undefined;
  }

  function orientationChangeHandler(event: Event) {
    const target = event.target as ScreenOrientation | null;
    reportOrientation(
      mapScreenOrientationType(target?.type ?? screenOrientation.type),
      onOrientation,
    );
  }

  return () => {
    try {
      screenOrientation.removeEventListener("change", orientationChangeHandler);
    } catch {
      // Orientation analytics must never interfere with UX manager cleanup.
    }
  };
}

function getWindowOrientation(): number | undefined {
  try {
    if (typeof window === "undefined") {
      return undefined;
    }

    return (window as WindowWithOrientation).orientation;
  } catch {
    return undefined;
  }
}

function subscribeToWindowOrientation(
  onOrientation: (orientation: DeviceOrientation) => void,
): (() => void) | undefined {
  try {
    if (typeof window === "undefined") {
      return undefined;
    }

    const initialOrientation = getWindowOrientation();
    if (typeof initialOrientation !== "number") {
      return undefined;
    }

    const orientationChangeHandler = () => {
      reportOrientation(
        mapWindowOrientation(getWindowOrientation() ?? NaN),
        onOrientation,
      );
    };

    window.addEventListener("orientationchange", orientationChangeHandler);
    reportOrientation(mapWindowOrientation(initialOrientation), onOrientation);

    return () => {
      try {
        window.removeEventListener(
          "orientationchange",
          orientationChangeHandler,
        );
      } catch {
        // Orientation analytics must never interfere with UX manager cleanup.
      }
    };
  } catch {
    return undefined;
  }
}

function reportFailure(
  logMessage: string,
  onFailure?: (logMessage: string) => void,
) {
  try {
    onFailure?.(logMessage);
  } catch {
    // Orientation analytics must never interfere with UX manager creation.
  }
}

/**
 * Subscribes to device orientation analytics changes when supported.
 *
 * Returns a cleanup callback. Unsupported or partially implemented browser
 * APIs are treated as a no-op so analytics cannot block UX manager creation.
 */
export function subscribeToDeviceOrientation(
  onOrientation: (orientation: DeviceOrientation) => void,
  onFailure?: (logMessage: string) => void,
): () => void {
  const screenOrientation = getScreenOrientation();

  if (screenOrientation !== undefined) {
    const unsubscribe = subscribeToScreenOrientation(
      screenOrientation,
      onOrientation,
    );

    if (unsubscribe !== undefined) {
      return unsubscribe;
    }
  }

  const unsubscribeFromWindowOrientation =
    subscribeToWindowOrientation(onOrientation);
  if (unsubscribeFromWindowOrientation !== undefined) {
    return unsubscribeFromWindowOrientation;
  }

  reportFailure(
    screenOrientation === undefined
      ? DEVICE_ORIENTATION_UNAVAILABLE_LOG_MESSAGE
      : DEVICE_ORIENTATION_SUBSCRIPTION_FAILED_LOG_MESSAGE,
    onFailure,
  );

  return () => {};
}
