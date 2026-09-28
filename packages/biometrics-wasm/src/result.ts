/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

/** Native per-frame capture status exposed by the Biometrics WASM session. */
export enum NativeFrameStatus {
  Continue = 0,
  Done = 1,
}

/** Native feedback codes emitted by the Biometrics WASM session. */
export enum NativeFaceFeedback {
  Ok = 0,
  Undefined = 1,
  FaceNotFound = 2,
  FaceTooClose = 3,
  FaceTooFar = 4,
  FaceCloseToBorder = 5,
  FaceAngledPitch = 6,
  FaceAngledRoll = 7,
  FaceAngledYaw = 8,
  TooDark = 9,
  TooBright = 10,
  Blurry = 11,
  Glare = 12,
  TooManyFaces = 13,
}

/**
 * Session-level failure modes returned by {@link BiometricsWasmSession.process} and {@link BiometricsWasmSession.reset}.
 *
 * Mirrors `MB::BioBlink::Session::SessionError`.
 */
export enum SessionError {
  NotInitialized = 0,
  Cancelled = 1,
  Internal = 2,
  Unknown = 3,
}

/** Point returned by native face detection. Landmarks are normalized; bounding box corners are in pixels. */
export type NativePoint = { x: number; y: number };

export type NativeFaceLandmarks = {
  eyeLeft: NativePoint;
  eyeRight: NativePoint;
  earLeft: NativePoint;
  earRight: NativePoint;
  noseTip: NativePoint;
  mouthCenter: NativePoint;
};

export type NativeBoundingBox = {
  topLeft: NativePoint;
  bottomRight: NativePoint;
};

/**
 * Image-data validation failures returned by {@link BiometricsWasmSession.process} before the session is engaged.
 *
 * Mirrors `MB::BioBlink::Wasm::Detail::ImageDataError`.
 */
export enum ImageDataError {
  InvalidDimensions = 0,
  InvalidDataLength = 1,
}

/**
 * Input-shape validation failures returned by {@link BiometricsWasmSession.process} before image conversion starts.
 *
 * Mirrors `MB::BioBlink::Wasm::ProcessInputError`.
 */
export enum InputError {
  InvalidImageData = 0,
  InvalidLandmarks = 1,
}

/**
 * Failure modes returned by `createBiometricsWasmSession` via a thrown JS `Error` whose message is a JSON string of
 * shape `{ kind: "loadError", code: LoadError }`.
 *
 * Mirrors `MB::BioBlink::Session::LoadError`.
 */
export enum LoadError {
  InvalidSettings = 0,
  MissingResources = 1,
  InvalidLicense = 2,
  Unknown = 3,
  InvalidResources = 4,
  MemoryReserveFailed = 5,
}

/** Native result of the last processed frame. */
export interface NativeFrameResult {
  status: NativeFrameStatus;
  feedback: NativeFaceFeedback;
  landmarks?: NativeFaceLandmarks | null;
  boundingBox?: NativeBoundingBox | null;
}

/** Result of face analysis for a session. */
export interface FaceAnalysisResult {
  faceOk: boolean;
  lastFrameResult: NativeFrameResult | null;
  success?: WasmSuccessPayload;
}

/** Native authenticity signature bytes emitted by the engine. */
export type WasmCaptureSignature = ArrayBuffer;

/** Engine-selected JPEG frame intended for face matching. */
export type WasmCaptureFrame = {
  /** Compressed JPEG bytes copied from native memory. */
  data: ArrayBuffer;
  mimeType: "image/jpeg";
  /** One-based frame number assigned by the native capture session. */
  frameNumber: number;
  /** Native capture time for this frame in milliseconds. */
  captureTimeMs: number;
  /** Optional per-frame engine signature bytes. */
  signature?: ArrayBuffer;
};

/** Unitless image-quality metrics emitted by the engine when available. */
export type WasmLivenessFrameQuality = {
  laplacian?: number;
  luminance?: number;
  rmsContrast?: number;
  brisque?: number;
  faceScore?: number;
};

/** Engine-selected QOI frame intended for liveness verification. */
export type WasmLivenessFrame = {
  /** Compressed QOI bytes copied from native memory. */
  data: ArrayBuffer;
  mimeType: "image/qoi";
  /** One-based frame number assigned by the native capture session. */
  frameNumber: number;
  /** Native capture time for this frame in milliseconds. */
  captureTimeMs: number;
  /** Optional per-frame engine signature bytes. */
  signature?: ArrayBuffer;
  imgQuality?: WasmLivenessFrameQuality;
};

/** Native success payload returned when the engine completes face capture. */
export type WasmSuccessPayload = {
  captureFrame: WasmCaptureFrame;
  livenessFrames?: WasmLivenessFrame[];
  /** Optional signature covering the liveness frame batch. */
  livenessBatchSignature?: ArrayBuffer;
};

/**
 * Discriminated failure attached to a {@link ProcessResultPayload} whose `status` is -1.
 *
 * - `kind: "input"` — `code` is an {@link InputError} ordinal.
 * - `kind: "image"` — `code` is an {@link ImageDataError} ordinal.
 * - `kind: "session"` — `code` is a {@link SessionError} ordinal.
 */
export type ProcessError =
  | { kind: "input"; code: InputError }
  | { kind: "image"; code: ImageDataError }
  | { kind: "session"; code: SessionError };

/**
 * Structured result returned by {@link BiometricsWasmSession.process}.
 *
 * - On success: `{ status: NativeFrameStatus, feedback: NativeFaceFeedback, error: null }`.
 * - On failure: `{ status: -1, error: ProcessError }`.
 */
export type ProcessResultPayload =
  | {
      status: NativeFrameStatus;
      feedback: NativeFaceFeedback;
      landmarks?: NativeFaceLandmarks | null;
      boundingBox?: NativeBoundingBox | null;
      success?: WasmSuccessPayload;
      error: null;
    }
  | {
      status: -1;
      error: ProcessError;
    };

/**
 * Structured result returned by {@link BiometricsWasmSession.reset}.
 *
 * - On success: `{ error: null }`.
 * - On failure: `{ error: SessionError }`.
 */
export interface ResetResultPayload {
  error: SessionError | null;
}

/**
 * @deprecated Use {@link NativeFrameStatus} plus the `error` field on
 *             {@link ProcessResultPayload}. This enum collapses all failure
 *             modes into `Error = 2`, which is no longer expressible in the
 *             new contract.
 */
export enum ProcessResult {
  Continue = 0,
  Done = 1,
  Error = 2,
}
