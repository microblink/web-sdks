/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { CapturedImage, FaceCaptureResult, FaceLandmarks } from "@microblink/biometrics-common";

import type { CaptureSessionContext } from "./captureTypes";

type CompletedCapture = {
  image: ImageData;
  landmarks: FaceLandmarks;
  boundingBox?: FaceCaptureResult["bestImage"]["boundingBox"];
  engineFrames?: Pick<FaceCaptureResult, "captureFrame" | "livenessFrames" | "livenessBatchSignature">;
};

export function createFaceCaptureResult(capture: CompletedCapture, context: CaptureSessionContext): FaceCaptureResult {
  const bestImage: CapturedImage = {
    image: capture.image,
    landmarks: capture.landmarks,
    boundingBox: capture.boundingBox,
  };

  return {
    bestImage,
    supportingImages: [],
    captureFrame: capture.engineFrames?.captureFrame,
    livenessFrames: capture.engineFrames?.livenessFrames ?? [],
    livenessBatchSignature: capture.engineFrames?.livenessBatchSignature,
    details: {
      boundingBox: capture.boundingBox,
      landmarks: capture.landmarks,
      inputImageSize: {
        width: capture.image.width,
        height: capture.image.height,
      },
    },
    traceId: context.traceId,
    sessionNumber: context.sessionNumber,
  };
}
