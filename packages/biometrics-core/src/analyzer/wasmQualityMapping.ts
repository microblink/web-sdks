/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { NativeFrameResult } from "@microblink/biometrics-wasm";
import { NativeFaceFeedback, NativeFrameStatus } from "@microblink/biometrics-wasm";

import type { UnifiedFeedback } from "./feedback";

export function mapNativeFeedbackToFeedback(
  feedback: NativeFaceFeedback | null | undefined,
): UnifiedFeedback | undefined {
  if (feedback === null || feedback === undefined) {
    return undefined;
  }

  switch (feedback) {
    case NativeFaceFeedback.Ok:
      return "OK";
    case NativeFaceFeedback.FaceNotFound:
      return "FACE_NOT_FOUND";
    case NativeFaceFeedback.FaceTooClose:
      return "TOO_CLOSE";
    case NativeFaceFeedback.FaceTooFar:
      return "TOO_FAR";
    case NativeFaceFeedback.FaceCloseToBorder:
      return "TOO_CLOSE_TO_BORDER";
    case NativeFaceFeedback.FaceAngledPitch:
      return "ANGLED_PITCH";
    case NativeFaceFeedback.FaceAngledRoll:
      return "ANGLED_ROLL";
    case NativeFaceFeedback.FaceAngledYaw:
      return "ANGLED_YAW";
    case NativeFaceFeedback.TooDark:
      return "TOO_DARK";
    case NativeFaceFeedback.TooBright:
      return "TOO_BRIGHT";
    case NativeFaceFeedback.Blurry:
      return "TOO_BLURRY";
    case NativeFaceFeedback.Glare:
      return "TOO_BRIGHT";
    case NativeFaceFeedback.TooManyFaces:
      return "MULTIPLE_FACES";
    default:
      return "TOO_BLURRY";
  }
}

export function mapNativeFrameResultToFeedback(
  frameResult: NativeFrameResult | null | undefined,
): UnifiedFeedback | undefined {
  return mapNativeFeedbackToFeedback(frameResult?.feedback);
}

export function isNativeCaptureComplete(frameResult: NativeFrameResult | null | undefined): boolean {
  return frameResult?.status === NativeFrameStatus.Done;
}
