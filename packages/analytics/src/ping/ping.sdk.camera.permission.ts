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

export type PingCameraPermissionData = {
  eventType: EventType;
  cameraPermissionGranted?: boolean;
};
type EventType =
  | "CameraPermissionCheck"
  | "CameraPermissionRequest"
  | "CameraPermissionUserResponse";

/**
 * Ping type for ping.sdk.camera.permission
 */
export type PingCameraPermission = PingBase<
  "ping.sdk.camera.permission",
  "1.0.0",
  PingCameraPermissionData
>;
