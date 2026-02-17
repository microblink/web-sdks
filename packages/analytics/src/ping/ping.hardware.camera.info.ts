/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Copyright (c) Microblink. All rights reserved.
 *
 * AUTO-GENERATED FILE!!! DO NOT MODIFY!!!
 *
 * ANY UNAUTHORIZED USE OR SALE, DUPLICATION, OR DISTRIBUTION
 * OF THIS PROGRAM OR ANY OF ITS PARTS, IN SOURCE OR BINARY FORMS,
 * WITH OR WITHOUT MODIFICATION, WITH THE PURPOSE OF ACQUIRING
 * UNLAWFUL MATERIAL OR ANY OTHER BENEFIT IS PROHIBITED!
 * THIS PROGRAM IS PROTECTED BY COPYRIGHT LAWS AND YOU MAY NOT
 * REVERSE ENGINEER, DECOMPILE, OR DISASSEMBLE IT.
 */

import type { PingBase } from "./ping.base";

export type PingCameraHardwareInfoData = {
  availableCameras: AvailableCamerasItem[];
};
type AvailableCamerasItem = {
  deviceId: string;
  cameraFacing: CameraFacing;
  focus?: Focus;
  availableResolutions?: AvailableResolutionsItem[];
};
type AvailableResolutionsItem = {
  width: number;
  height: number;
};
type CameraFacing = "Front" | "Back" | "Unknown";
type Focus = "Auto" | "Fixed";

/**
 * Ping type for ping.hardware.camera.info
 */
export type PingCameraHardwareInfo = PingBase<
  "ping.hardware.camera.info",
  "1.0.3",
  PingCameraHardwareInfoData
>;
