/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

/** Represents a landmark point in 2D space. */
export type LandmarkPoint = {
  x: number;
  y: number;
};

/** Represents the 6 main landmarks of a face. */
export type FaceLandmarks = {
  LeftEye: LandmarkPoint;
  RightEye: LandmarkPoint;
  NoseTip: LandmarkPoint;
  Mouth: LandmarkPoint;
  LeftEar: LandmarkPoint;
  RightEar: LandmarkPoint;
};

/** Normalized face bounding box in frame coordinates. */
export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Represents an image captured by Biometrics, including security metadata. */
export type FaceImage = {
  /** The underlying image data. */
  image: ImageData;
  /** Security metadata associated with the image. */
  securityBlob: {
    /** Verification hash for the image and configuration. */
    hash: string;

    /** JSON stringified configuration used during image capture. */
    config: string;
  };
};

/** Represents a face capture result with image data and landmarks. */
export type BiometricsFace = {
  /** Captured image and security metadata. */
  image: FaceImage;
  /** Detected landmarks for the captured face. */
  landmarks: FaceLandmarks;
};

/** User-visible image selected by capture. */
export type CapturedImage = {
  image: ImageData;
  landmarks: FaceLandmarks;
  boundingBox?: BoundingBox;
};

/** Engine-produced authenticity signature attached to capture frames. */
export type CaptureSignature = {
  signature: ArrayBuffer;
  algorithm: "engine";
};

/** Engine-produced JPEG frame intended for face matching/template extraction. */
export type CaptureFrame = {
  data: ArrayBuffer;
  mimeType: "image/jpeg";
  frameNumber: number;
  captureTimeMs: number;
  signature?: CaptureSignature;
};

/** Quality metrics attached to an engine liveness frame when available. */
export type LivenessFrameQuality = {
  laplacian?: number;
  luminance?: number;
  rmsContrast?: number;
  brisque?: number;
  faceScore?: number;
};

/** Engine-produced QOI frame included in capture evidence. */
export type LivenessFrame = {
  data: ArrayBuffer;
  mimeType: "image/qoi";
  frameNumber: number;
  captureTimeMs: number;
  timestamp: string;
  signature?: CaptureSignature;
  imgQuality?: LivenessFrameQuality;
};

/** Complete result produced by a face capture session. */
export type FaceCaptureResult = {
  bestImage: CapturedImage;
  supportingImages: CapturedImage[];
  captureFrame?: CaptureFrame;
  livenessFrames: LivenessFrame[];
  livenessBatchSignature?: CaptureSignature;
  livenessMetadata?: string;
  details?: {
    boundingBox?: BoundingBox;
    landmarks?: FaceLandmarks;
    inputImageSize?: {
      width: number;
      height: number;
    };
  };
  traceId: string;
  sessionNumber: number;
};

export function isFaceCaptureResult(value: BiometricsFace | FaceCaptureResult): value is FaceCaptureResult {
  return "bestImage" in value;
}

export function getBiometricsFaceFromCaptureResult(result: FaceCaptureResult): BiometricsFace {
  return {
    image: {
      image: result.bestImage.image,
      securityBlob: {
        hash: "",
        config: JSON.stringify({ captureMode: "engineFrames" }),
      },
    },
    landmarks: result.bestImage.landmarks,
  };
}
