/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { Ping } from "@microblink/analytics/ping";
import type {
  BiometricsDiagnosticCallback,
  BiometricsError,
  BoundingBox,
  FaceCaptureResult,
  FaceLandmarks,
  WasmVariant,
} from "@microblink/biometrics-common";
import type { ProgressStatusCallback } from "@microblink/biometrics-worker";

import type { UnifiedFeedback } from "../analyzer/feedback";
import type { CaptureSessionState } from "../session/session";
import type { CaptureStore } from "./captureStore";

/** Coordinate system used by input `ImageData`. */
export type ImageOrigin = "canvas2d" | "webgl";

/** Logging verbosity used by Biometrics capture. */
export type CaptureLogLevel = "debug" | "warn" | "error" | "silent";
export type CaptureMode = "single" | "engineFrames";

export type CaptureAnalyticsSettings = {
  userId?: string;
  pingProxyUrl?: string;
};

export type FacePositionThresholds = {
  minEyeDistance?: number;
  maxEyeDistance?: number;
  closeToBorderMargin?: number;
  maxPitchUpAngle?: number;
  maxPitchDownAngle?: number;
  maxRollAngle?: number;
  maxYawAngle?: number;
};

export type LightingThresholds = {
  tooDarkThreshold?: number;
  tooBrightThreshold?: number;
};

export type LandmarkStabilityThresholds = {
  maxCaptures?: number;
  differenceThreshold?: number;
  sharpnessWeight?: number;
};

export type FaceAnalysisSessionSettings = {
  maximumInputLongEdge?: number;
  maximumInputShortEdge?: number;
  facePositionThresholds?: FacePositionThresholds;
  lightingThresholds?: LightingThresholds;
  landmarkStabilityThresholds?: LandmarkStabilityThresholds;
  livenessFramesCount?: number;
};

/** Configuration options for initializing the capture client. */
export type CaptureConfig = {
  /** License key used for capture module validation. */
  licenseKey: string;
  /** Optional override base path for model and WASM assets. */
  resourcePath?: string;
  /** WebAssembly module variant to use. Defaults to automatic feature detection. */
  wasmVariant?: WasmVariant;
  /**
   * Coordinate system used by provided frame images.
   *
   * @default "canvas2d"
   */
  imageOrigin?: ImageOrigin;
  /**
   * Minimum log level. Set to "debug" for verbose diagnostics, "silent" to disable logging.
   *
   * @default "warn"
   */
  logLevel?: CaptureLogLevel;
  /** Optional WASM session settings passed to the Biometrics worker. */
  faceAnalysis?: FaceAnalysisSessionSettings;
  /** Native Ping lifecycle settings. */
  analytics?: CaptureAnalyticsSettings;
  /** Maximum duration for complete capture initialization. @default 60000 */
  initializationTimeoutMs?: number;
  /** Receives safe lifecycle and component diagnostics. */
  onDiagnostic?: BiometricsDiagnosticCallback;
  /** Optional callback for WASM and data-file download progress. */
  onDownloadProgress?: ProgressStatusCallback;
};

/** Configuration options for one face capture attempt. */
export type CaptureFaceConfig = {
  /**
   * Keeps the session in analysis/capturing mode for QA validation.
   *
   * @default false
   */
  debugMode?: boolean;
  /** Optional quality settings for the face capture. */
  quality?: {
    /**
     * "engineFrames" preserves native frames; "single" keeps only the best image.
     *
     * @default "engineFrames"
     */
    captureMode?: CaptureMode;
  };
  /**
   * Minimum time in milliseconds before capture can complete.
   *
   * @default 1000
   */
  initialDelayMs?: number;
  /** Called for every analyzed frame. */
  onAnalysisResult?: (result: CaptureAnalysisResult) => void;
  /** Called when stabilized feedback changes. */
  onFeedbackChange?: (feedback: UnifiedFeedback) => void;
  /** Called when the capture session state changes. */
  onStateChange?: (state: CaptureSessionState) => void;
  /** Called when a face is captured successfully. */
  onCapture?: (result: FaceCaptureResult) => void;
  /**
   * Maximum capture duration in milliseconds. Set to `null` to disable.
   *
   * @default 60000
   */
  timeoutMs?: number | null;
  /** Called when capture times out. */
  onTimeout?: () => void;
  /** Called when capture fails. */
  onError?: (error: BiometricsError) => void;
};

/** Captured analysis payload returned through `onAnalysisResult`. */
export type CaptureAnalysisResult = {
  feedback: UnifiedFeedback;
  landmarks?: FaceLandmarks;
  boundingBox?: BoundingBox;
  inputImageSize: {
    width: number;
    height: number;
  };
};

/** `BiometricsCaptureSession.subscribe`. */
export type CaptureSubscribe = {
  (listener: (state: CaptureStore, prevState: CaptureStore) => void): () => void;
  <T>(
    selector: (state: CaptureStore) => T,
    listener: (selectedState: T, previousSelectedState: T) => void,
    options?: {
      equalityFn?: (a: T, b: T) => boolean;
      fireImmediately?: boolean;
    },
  ): () => void;
};

/** Analytics context for a capture session. */
export type CaptureSessionContext = Readonly<{
  sessionId: string;
  traceId: string;
  sessionNumber: number;
}>;

/** Capture session that can contain multiple capture attempts. */
export type BiometricsCaptureSession = {
  readonly context: CaptureSessionContext;
  capture(config: CaptureFaceConfig): Promise<FaceCaptureResult>;
  processFrame(imageData: ImageData): Promise<ArrayBuffer>;
  setCameraSource(videoElement: HTMLVideoElement | undefined, track: MediaStreamTrack | undefined): void;
  setCaptureTimeoutPaused(paused: boolean): void;
  close(): Promise<void>;
  subscribe: CaptureSubscribe;
  getState: () => CaptureStore;
};

/** Runtime capture client returned by `createBiometricsCapture`. */
export type BiometricsCaptureClient = {
  startSession(settings?: FaceAnalysisSessionSettings): Promise<BiometricsCaptureSession>;
  close(): Promise<void>;
  ping(pinglet: Ping): Promise<void>;
  sendPinglets(): Promise<void>;
};
