/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { CapturedImage, CaptureSignature, FaceCaptureResult, FaceLandmarks } from "@microblink/biometrics-common";

import type { CaptureSessionContext } from "./captureTypes";

type CompletedCapture = {
  image: ImageData;
  landmarks: FaceLandmarks;
  boundingBox?: FaceCaptureResult["bestImage"]["boundingBox"];
  engineFrames?: Pick<
    FaceCaptureResult,
    "captureFrame" | "livenessFrames" | "livenessBatchSignature" | "signatureVersion"
  >;
};

function encodeSignature(signature: CaptureSignature): string {
  return btoa(String.fromCharCode(...new Uint8Array(signature.signature)));
}

function captureFrameMetadata(engineFrames: CompletedCapture["engineFrames"]): string | undefined {
  const frame = engineFrames?.captureFrame;

  if (!frame?.signature || !engineFrames?.signatureVersion) {
    return undefined;
  }

  return JSON.stringify({
    signatureVersion: engineFrames.signatureVersion,
    frameNumber: frame.frameNumber,
    captureTimeMs: frame.captureTimeMs,
    signature: encodeSignature(frame.signature),
  });
}

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
    signatureVersion: capture.engineFrames?.signatureVersion,
    captureFrameMetadata: captureFrameMetadata(capture.engineFrames),
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
