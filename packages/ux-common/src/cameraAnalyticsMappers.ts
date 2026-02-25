/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  PingCameraHardwareInfoData,
  PingCameraInputInfoData,
} from "@microblink/analytics/ping";
import type {
  Camera,
  ExtractionArea,
  FacingMode,
  Resolution,
} from "@microblink/camera-manager";

/**
 * Maps a camera facing mode to the analytics ping facing value.
 */
function mapCameraFacingToPingFacing(
  facing: FacingMode,
): PingCameraInputInfoData["cameraFacing"] {
  switch (facing) {
    case "front":
      return "Front";
    case "back":
      return "Back";
    default:
      return "Unknown";
  }
}

/**
 * Converts camera input data to the analytics ping shape.
 */
export function convertCameraInputToPingData(
  selectedCamera: Camera,
  videoResolution: Resolution,
  extractionArea: ExtractionArea | undefined,
): PingCameraInputInfoData {
  const roiW = extractionArea?.width ?? videoResolution.width;
  const roiH = extractionArea?.height ?? videoResolution.height;

  return {
    deviceId: selectedCamera.name,
    cameraFacing: mapCameraFacingToPingFacing(selectedCamera.facingMode),
    cameraFrameWidth: videoResolution.width,
    cameraFrameHeight: videoResolution.height,
    roiWidth: roiW,
    roiHeight: roiH,
    viewPortAspectRatio: roiW / roiH,
  };
}

/**
 * Converts a camera to the analytics ping camera hardware shape.
 */
export function convertCameraToPingCamera(
  camera: Camera,
): PingCameraHardwareInfoData["availableCameras"][number] {
  return {
    deviceId: camera.name,
    cameraFacing: mapCameraFacingToPingFacing(camera.facingMode),
    availableResolutions: undefined,
    focus: camera.singleShotSupported ? "Auto" : "Fixed",
  };
}

/**
 * Derives a stable deduplication key for a camera, used to detect hardware list changes.
 */
export function buildCameraAnalyticsKey(camera: Camera): string {
  const facing = camera.facingMode ?? "unknown";
  const focus = camera.singleShotSupported ? "auto" : "fixed";
  return `${camera.name}|${facing}|${focus}`;
}

/**
 * Returns true if the set of camera keys differs from the previously reported set.
 */
export function hasCameraListChanged(
  nextKeys: Set<string>,
  reportedCameraKeys: Set<string>,
): boolean {
  if (nextKeys.size !== reportedCameraKeys.size) {
    return true;
  }
  for (const key of nextKeys) {
    if (!reportedCameraKeys.has(key)) {
      return true;
    }
  }
  return false;
}
