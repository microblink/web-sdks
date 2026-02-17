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

export type PingUxEventData = {
  eventType: EventType;
  errorMessageType?: ErrorMessageType;
  alertType?: AlertType;
  helpCloseType?: HelpCloseType;
};
type EventType =
  | "CameraStarted"
  | "CameraClosed"
  | "OnboardingInfoDisplayed"
  | "CloseButtonClicked"
  | "HelpTooltipDisplayed"
  | "HelpOpened"
  | "HelpClosed"
  | "AlertDisplayed"
  | "ErrorMessage"
  | "StepTimeout"
  | "AppMovedToBackground";
type ErrorMessageType =
  | "MoveCloser"
  | "MoveFarther"
  | "KeepVisible"
  | "FlipSide"
  | "AlignDocument"
  | "MoveFromEdge"
  | "IncreaseLighting"
  | "DecreaseLighting"
  | "EliminateBlur"
  | "EliminateGlare";
type AlertType =
  | "InvalidLicenseKey"
  | "NetworkError"
  | "DocumentClassNotAllowed"
  | "StepTimeout";
type HelpCloseType = "ContentSkipped" | "ContentFullyViewed";

/**
 * Ping type for ping.sdk.ux.event
 */
export type PingUxEvent = PingBase<
  "ping.sdk.ux.event",
  "1.0.0",
  PingUxEventData
>;
