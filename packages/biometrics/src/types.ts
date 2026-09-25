/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { Ping } from "@microblink/analytics/ping";
import type {
  CaptureFaceConfig,
  CaptureLogLevel,
  CaptureSessionState,
  FaceAnalysisSessionSettings,
  ImageOrigin,
  UnifiedFeedback,
} from "@microblink/biometrics-core";
import type {
  BiometricsDiagnosticCallback,
  BiometricsError,
  FaceCaptureResult,
  FaceLandmarks,
  WasmVariant,
} from "@microblink/biometrics-core";
import type { FeedbackUiOptions } from "@microblink/biometrics-ux-manager/ui";
import type { CameraManagerUiOptions } from "@microblink/camera-manager/ui";

export type BiometricsCaptureSettings = {
  imageOrigin?: ImageOrigin;
  logLevel?: CaptureLogLevel;
  faceAnalysis?: FaceAnalysisSessionSettings;
};

export type BiometricsAnalyticsSettings = {
  enabled?: boolean;
  pingProxyUrl?: string;
  userId?: string;
};

/** Progress reported while SDK resources are downloaded. */
export type DownloadProgress = {
  loaded: number;
  contentLength: number;
  progress: number;
  finished: boolean;
};

export type ProgressStatusCallback = (progress: DownloadProgress) => void;

export type BiometricsAnalyticsEvent = Ping extends infer Event
  ? Event extends { sessionNumber?: number }
    ? Omit<Event, "sessionNumber">
    : never
  : never;

/** Session-scoped access to the native analytics transport. */
export type BiometricsSessionContext = {
  readonly sessionId: string;
  readonly traceId: string;
  readonly sessionNumber: number;
  report(event: BiometricsAnalyticsEvent): Promise<void>;
  flush(): Promise<void>;
};

/** Root SDK settings for face capture. */
export type BiometricsSettings = {
  licenseKey: string;
  resourcesLocation?: string;
  /** WebAssembly module variant to use. Defaults to automatic feature detection. */
  wasmVariant?: WasmVariant;
  /** Maximum initialization duration in milliseconds. @default 60000 */
  initializationTimeoutMs?: number;
  capture?: BiometricsCaptureSettings;
  analytics?: BiometricsAnalyticsSettings;
  onDiagnostic?: BiometricsDiagnosticCallback;
  /** Optional callback for WASM and data-file download progress. */
  onDownloadProgress?: ProgressStatusCallback;
};

/** Per-session face capture options. */
export type BiometricsSessionConfig = {
  /** Capture timeout in milliseconds. Set to `null` to disable. @default 60000 */
  captureTimeoutMs?: number | null;
  /** Additional capture session and attempt options. */
  captureFace?: Omit<
    CaptureFaceConfig,
    "timeoutMs" | "onFeedbackChange" | "onStateChange" | "onCapture" | "onTimeout" | "onError" | "onAnalysisResult"
  > & {
    /** Native quality thresholds fixed for this session and reused by every capture attempt. */
    thresholds?: FaceAnalysisSessionSettings;
  };
};

/** Events surfaced by {@link BiometricsSession}. */
export type BiometricsSessionEvent =
  | { kind: "faceGuidance"; feedback: UnifiedFeedback }
  | { kind: "captureTechnicalData"; data: CaptureTechnicalData }
  | { kind: "captureFinished"; result: FaceCaptureResult }
  | { kind: "captureTimeout" };

export type BiometricsUiEvent =
  | BiometricsSessionEvent
  | { kind: "ux"; name: "onboardingShown" | "onboardingClosed" | "helpOpened" | "helpClosed" };

export type CaptureTechnicalData = {
  normalizedFaceBounds?: { x: number; y: number; width: number; height: number };
  landmarks?: FaceLandmarks;
  inputImageSize?: { width: number; height: number };
  frameNumber?: number;
};

export type BiometricsSessionState =
  | { phase: "idle" }
  | {
      phase: "capturing";
      capture: {
        sessionState: CaptureSessionState;
        feedback: UnifiedFeedback;
        technicalData?: CaptureTechnicalData;
      };
    }
  | { phase: "failed"; stage: "capture"; error: BiometricsError }
  | { phase: "succeeded"; result: FaceCaptureResult }
  | { phase: "finished" };

/** Headless session for one face capture. */
export type BiometricsSession = {
  getState(): BiometricsSessionState;
  subscribe(listener: (state: BiometricsSessionState) => void): () => void;
  /** Feed camera frames while {@link BiometricsSession.run} is in progress. */
  processFrame(imageData: ImageData): Promise<ArrayBuffer>;
  /** Set the camera source used by subsequent capture attempts. */
  setCameraSource(videoElement: HTMLVideoElement | undefined, track: MediaStreamTrack | undefined): void;
  /** Pauses or resumes the active capture attempt's timeout. */
  setCaptureTimeoutPaused(paused: boolean): void;
  /** Starts face capture. */
  run(): Promise<FaceCaptureResult>;
  retry(): Promise<FaceCaptureResult>;
  onEvent(listener: (event: BiometricsSessionEvent) => void): () => void;
  onError(listener: (error: BiometricsError) => void): () => void;
  onDiagnostic(listener: BiometricsDiagnosticCallback): () => void;
  getSessionContext(): Promise<BiometricsSessionContext>;
  finish(): void;
};

/** Initialized Biometrics capture SDK instance. */
export type BiometricsSdk = {
  /** Creates a face capture session. */
  startSession(config?: BiometricsSessionConfig): BiometricsSession;
  close(): Promise<void>;
};

export type BiometricsFeedbackUiOptions = Pick<FeedbackUiOptions, "localizationStrings" | "showHelpButton"> & {
  showOnboardingGuide?: boolean;
  helpTooltipShowDelay?: number | null;
};

export type BiometricsUiOptions = {
  licenseKey: string;
  targetNode?: HTMLElement;
  cameraManagerUiOptions?: Partial<CameraManagerUiOptions>;
  preferredCameraDeviceId?: string;
  /** Called whenever the selected camera changes. */
  onSelectedCameraDeviceIdChange?: (deviceId: string | undefined) => void;
  resourcesLocation?: string;
  /** WebAssembly module variant to use. Defaults to automatic feature detection. */
  wasmVariant?: WasmVariant;
  /** Maximum SDK initialization duration in milliseconds. @default 60000 */
  initializationTimeoutMs?: number;
  capture?: BiometricsCaptureSettings;
  analytics?: BiometricsAnalyticsSettings;
  /** Capture timeout in milliseconds. Set to `null` to disable. @default 60000 */
  captureTimeoutMs?: number | null;
  captureFace?: BiometricsSessionConfig["captureFace"];
  feedbackUiOptions?: BiometricsFeedbackUiOptions;
  onEvent?: (event: BiometricsUiEvent) => void;
  onResult?: (result: FaceCaptureResult) => void;
  onError?: (error: BiometricsError) => void;
  onDiagnostic?: BiometricsDiagnosticCallback;
};

export type BiometricsUi = {
  destroy(): Promise<void>;
};
