/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { Ping, PingUxEventData } from "@microblink/analytics/ping";
import type { BoundingBox, CaptureSessionState, UnifiedFeedback } from "@microblink/biometrics-core";
import type {
  BiometricsDiagnosticEvent,
  BiometricsError,
  FaceCaptureResult,
  FaceLandmarks,
} from "@microblink/biometrics-core";

import type { BiometricsErrorDialogKind } from "./resolveBiometricsErrorDialogKind";

export type BiometricsCaptureTechnicalData = {
  normalizedFaceBounds?: BoundingBox;
  landmarks?: FaceLandmarks;
  inputImageSize?: {
    width: number;
    height: number;
  };
  frameNumber?: number;
};

export type BiometricsUxSessionEvent =
  | { kind: "faceGuidance"; feedback: UnifiedFeedback }
  | {
      kind: "captureTechnicalData";
      data: BiometricsCaptureTechnicalData;
    }
  | { kind: "captureFinished"; result: FaceCaptureResult }
  | { kind: "captureTimeout" };

/** Session stage that failed. `processing` covers work the session performs after capture completes. */
export type BiometricsUxFailureStage = "capture" | "processing";

export type BiometricsUxSessionState<Result = unknown, SessionError = BiometricsError> =
  | { phase: "idle" }
  | {
      phase: "capturing";
      capture: {
        sessionState: CaptureSessionState;
        feedback: UnifiedFeedback;
        technicalData?: BiometricsCaptureTechnicalData;
      };
    }
  /** Capture completed and the session is processing the result before it succeeds or fails. */
  | { phase: "processing" }
  | {
      phase: "failed";
      stage: BiometricsUxFailureStage;
      error: SessionError;
    }
  | { phase: "succeeded"; result: Result }
  | { phase: "finished" };

export type BiometricsUxSession<
  Result = unknown,
  Event = BiometricsUxSessionEvent,
  SessionError = BiometricsError,
  DiagnosticEvent = BiometricsDiagnosticEvent,
> = {
  getState(): BiometricsUxSessionState<Result, SessionError>;
  subscribe(listener: (state: BiometricsUxSessionState<Result, SessionError>) => void): () => void;
  processFrame(imageData: ImageData): Promise<ArrayBuffer>;
  setCameraSource?(videoElement: HTMLVideoElement | undefined, track: MediaStreamTrack | undefined): void;
  run(): Promise<Result>;
  retry(): Promise<Result>;
  onEvent(listener: (event: Event) => void): () => void;
  onError(listener: (error: SessionError) => void): () => void;
  onDiagnostic(listener: (event: DiagnosticEvent) => void): () => void;
  /** Pauses or resumes the active capture timeout when supported. */
  setCaptureTimeoutPaused?(paused: boolean): void;
  finish(): void;
};

export type BiometricsUxOnlyEvent = {
  kind: "ux";
  name: "onboardingShown" | "onboardingClosed" | "helpOpened" | "helpClosed";
};

export type BiometricsUxEvent<Event = BiometricsUxSessionEvent> = Event | BiometricsUxOnlyEvent;

export type CloseReason = NonNullable<PingUxEventData["closeReason"]>;

export type AlertType = NonNullable<PingUxEventData["alertType"]>;

export type BiometricsUxStateKey =
  | "idle"
  | "onboarding"
  | "starting"
  | "capturing"
  | "help"
  | "complete"
  | "processing"
  | "error"
  | "closed";

export type BiometricsUxState<SessionError = BiometricsError, DialogKind extends string = never> = {
  key: BiometricsUxStateKey;
  sessionState: CaptureSessionState;
  feedback: UnifiedFeedback;
  helpNudgeVisible: boolean;
  landmarks?: FaceLandmarks;
  boundingBox?: BoundingBox;
  faceBounds?: BoundingBox;
  frameSize: {
    width: number;
    height: number;
  };
  mirrorX: boolean;
  error?: BiometricsError | SessionError;
  errorDialogKind?: BiometricsErrorDialogKind | DialogKind;
};

export type AnalyticsTransport = {
  ping(ping: Ping): Promise<void>;
  sendPinglets(): Promise<void>;
};

export type BiometricsUxManagerOptions<
  Result = unknown,
  Event = BiometricsUxSessionEvent,
  SessionError = BiometricsError,
  DiagnosticEvent = BiometricsDiagnosticEvent,
  DialogKind extends string = never,
> = {
  showOnboarding?: boolean;
  helpNudgeDelayMs?: number | null;
  showDebugOverlay?: boolean;
  analytics?: AnalyticsTransport;
  onEvent?: (event: BiometricsUxEvent<Event>) => void;
  onResult?: (result: Result) => void;
  onError?: (error: BiometricsError | SessionError) => void;
  onDiagnostic?: (event: DiagnosticEvent) => void;
  onCaptureAnimationComplete?: () => void;
  /** Selects a custom error dialog for a session failure. Return `undefined` to use the default dialog. */
  resolveErrorDialogKind?: (error: SessionError, stage: BiometricsUxFailureStage) => DialogKind | undefined;
  /** Analytics alert types reported when a custom error dialog is shown. */
  errorDialogAlertTypes?: Partial<Record<DialogKind, AlertType>>;
};

export type StateListener<SessionError = BiometricsError, DialogKind extends string = never> = (
  state: BiometricsUxState<SessionError, DialogKind>,
) => void;
