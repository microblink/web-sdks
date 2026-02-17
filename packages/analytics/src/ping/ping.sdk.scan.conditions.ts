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

export type PingScanningConditionsData = {
  updateType: UpdateType;
  deviceOrientation?: DeviceOrientation;
  flashlightOn?: boolean;
};
type UpdateType = "DeviceOrientation" | "FlashlightState";
type DeviceOrientation =
  | "Portrait"
  | "LandscapeRight"
  | "LandscapeLeft"
  | "PortraitUpside";

/**
 * Ping type for ping.sdk.scan.conditions
 */
export type PingScanningConditions = PingBase<
  "ping.sdk.scan.conditions",
  "1.0.0",
  PingScanningConditionsData
>;
