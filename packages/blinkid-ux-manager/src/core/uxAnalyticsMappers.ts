/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type { PingUxEventData } from "@microblink/analytics/ping";
import { match } from "ts-pattern";
import type { BlinkIdUiErrorStateKey } from "./blinkid-ui-state";

/**
 * Error state keys that produce a concrete analytics error message type.
 * UNSUPPORTED_DOCUMENT is excluded because it is handled as a separate
 * error callback rather than an analytics error message event.
 */
export type PingableErrorUiStateKey = Exclude<
  BlinkIdUiErrorStateKey,
  "UNSUPPORTED_DOCUMENT"
>;

/**
 * Maps a UI error state key to the analytics error message type used in
 * the UX event ping.
 */
export function mapErrorStateKeyToAnalyticsType(
  errorKey: PingableErrorUiStateKey,
): PingUxEventData["errorMessageType"] {
  return match<PingableErrorUiStateKey, PingUxEventData["errorMessageType"]>(
    errorKey,
  )
    .with("BLUR_DETECTED", () => "EliminateBlur")
    .with("GLARE_DETECTED", () => "EliminateGlare")
    .with("TOO_DARK", () => "IncreaseLighting")
    .with("TOO_BRIGHT", () => "DecreaseLighting")
    .with("OCCLUDED", () => "KeepVisible")
    .with("FACE_PHOTO_OCCLUDED", () => "KeepVisible")
    .with("WRONG_SIDE", () => "FlipSide")
    .with("WRONG_TOP_PAGE", () => "FlipSide")
    .with("WRONG_LEFT_PAGE", () => "FlipSide")
    .with("WRONG_RIGHT_PAGE", () => "FlipSide")
    .with("WRONG_LAST_PAGE", () => "FlipSide")
    .with("FRONT_PAGE_NOT_IN_FRAME", () => "KeepVisible")
    .with("BACK_PAGE_NOT_IN_FRAME", () => "KeepVisible")
    .with("DATA_PAGE_NOT_IN_FRAME", () => "KeepVisible")
    .with("TOP_PAGE_NOT_IN_FRAME", () => "KeepVisible")
    .with("LEFT_PAGE_NOT_IN_FRAME", () => "KeepVisible")
    .with("RIGHT_PAGE_NOT_IN_FRAME", () => "KeepVisible")
    .with("LAST_PAGE_NOT_IN_FRAME", () => "KeepVisible")
    .with("BARCODE_NOT_IN_FRAME", () => "KeepVisible")
    .with("DOCUMENT_FRAMING_CAMERA_TOO_FAR", () => "MoveCloser")
    .with("DOCUMENT_FRAMING_CAMERA_TOO_CLOSE", () => "MoveFarther")
    .with("DOCUMENT_FRAMING_CAMERA_ANGLE_TOO_STEEP", () => "AlignDocument")
    .with("DOCUMENT_TOO_CLOSE_TO_FRAME_EDGE", () => "MoveFromEdge")
    .exhaustive();
}
