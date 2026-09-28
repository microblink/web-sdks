/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { CaptureSessionState, DeviceInfo } from "@microblink/biometrics-core";
import { BiometricsError, normalizeBiometricsError, type BiometricsDiagnosticEvent } from "@microblink/biometrics-core";
import type { CameraManager } from "@microblink/camera-manager/core";

import { Analytics } from "./Analytics";
import {
  createGuidedPresentation,
  type GuidedPresentation,
  type GuidedPresentationUpdate,
  validateHelpNudgeDelay,
} from "./GuidedPresentation";
import { resolveBiometricsErrorDialogKind } from "./resolveBiometricsErrorDialogKind";
import type {
  BiometricsUxEvent,
  BiometricsUxManagerOptions,
  BiometricsUxSession,
  BiometricsUxSessionEvent,
  BiometricsUxSessionState,
  BiometricsUxState,
  CloseReason,
  StateListener,
} from "./types";

export type { BiometricsErrorDialogKind, BiometricsFailurePhase } from "./resolveBiometricsErrorDialogKind";
export {
  BiometricsError,
  type BiometricsDiagnosticCallback,
  type BiometricsDiagnosticComponent,
  type BiometricsDiagnosticEvent,
  type BiometricsDiagnosticPhase,
  type BiometricsDiagnosticResource,
  type BiometricsDiagnosticStatus,
  type BiometricsErrorCode,
  type BiometricsErrorComponent,
  type BiometricsErrorStage,
  type BiometricsResourceKind,
} from "@microblink/biometrics-core";
export { createBiometricsUxManager } from "./createBiometricsUxManager";
export type {
  AlertType,
  BiometricsCaptureTechnicalData,
  AnalyticsTransport,
  BiometricsUxEvent,
  BiometricsUxFailureStage,
  BiometricsUxManagerOptions,
  BiometricsUxOnlyEvent,
  BiometricsUxSession,
  BiometricsUxSessionEvent,
  BiometricsUxSessionState,
  BiometricsUxState,
  BiometricsUxStateKey,
  CloseReason,
  StateListener,
} from "./types";

const DEFAULT_HELP_NUDGE_DELAY_MS = 5_000;
const CAPTURE_TIMEOUT_ACTIVE_STATES = new Set<CaptureSessionState>(["IDLE", "ANALYZING", "CAPTURING"]);

function initialState<SessionError, DialogKind extends string>(
  showOnboarding: boolean,
): BiometricsUxState<SessionError, DialogKind> {
  return {
    key: showOnboarding ? "onboarding" : "idle",
    sessionState: "IDLE",
    feedback: "FACE_NOT_FOUND",
    helpNudgeVisible: false,
    frameSize: { width: 0, height: 0 },
    mirrorX: false,
  };
}

export class BiometricsUxManager<
  Result = unknown,
  Event = BiometricsUxSessionEvent,
  SessionError = BiometricsError,
  DiagnosticEvent = BiometricsDiagnosticEvent,
  DialogKind extends string = never,
> {
  readonly deviceInfo: DeviceInfo;
  readonly #cameraManager: CameraManager;
  readonly #session: BiometricsUxSession<Result, Event, SessionError, DiagnosticEvent>;
  readonly #options: Required<
    Pick<
      BiometricsUxManagerOptions<Result, Event, SessionError, DiagnosticEvent, DialogKind>,
      "showOnboarding" | "helpNudgeDelayMs" | "showDebugOverlay"
    >
  > &
    Omit<
      BiometricsUxManagerOptions<Result, Event, SessionError, DiagnosticEvent, DialogKind>,
      "showOnboarding" | "helpNudgeDelayMs" | "showDebugOverlay"
    >;
  readonly #listeners = new Set<StateListener<SessionError, DialogKind>>();
  readonly #removeSessionSubscriptions: (() => void)[] = [];
  readonly #analytics?: Analytics;

  #state: BiometricsUxState<SessionError, DialogKind>;
  #sessionState: BiometricsUxSessionState<Result, SessionError>;
  #presentation?: GuidedPresentation<Result, SessionError, DialogKind>;
  #removeFrameCallback?: () => void;
  #pendingFrame?: Promise<ArrayBuffer>;
  #captureAttemptId = 0;
  #closed = false;

  constructor(
    cameraManager: CameraManager,
    session: BiometricsUxSession<Result, Event, SessionError, DiagnosticEvent>,
    deviceInfo: DeviceInfo,
    options: BiometricsUxManagerOptions<Result, Event, SessionError, DiagnosticEvent, DialogKind> = {},
  ) {
    this.#cameraManager = cameraManager;
    this.#session = session;
    this.deviceInfo = deviceInfo;
    this.#options = {
      showOnboarding: options.showOnboarding ?? true,
      helpNudgeDelayMs: options.helpNudgeDelayMs === undefined ? DEFAULT_HELP_NUDGE_DELAY_MS : options.helpNudgeDelayMs,
      showDebugOverlay: options.showDebugOverlay ?? false,
      onResult: options.onResult,
      onError: options.onError,
      onDiagnostic: options.onDiagnostic,
      onEvent: options.onEvent,
      onCaptureAnimationComplete: options.onCaptureAnimationComplete,
      resolveErrorDialogKind: options.resolveErrorDialogKind,
    };

    validateHelpNudgeDelay(this.#options.helpNudgeDelayMs);

    this.#state = initialState(this.#options.showOnboarding);
    this.#sessionState = session.getState();
    this.#presentation = this.#createPresentation();

    const analyticsTransport = options.analytics;

    if (analyticsTransport) {
      this.#analytics = new Analytics(
        cameraManager,
        analyticsTransport,
        deviceInfo,
        this.#state,
        options.errorDialogAlertTypes,
      );
    }

    this.#removeSessionSubscriptions.push(
      session.subscribe((state) => this.#handleSessionState(state)),
      session.onEvent((event) => this.#emitEvent(event)),
      session.onError((error) => this.#invoke(this.#options.onError, error)),
      session.onDiagnostic((event) => this.#invoke(this.#options.onDiagnostic, event)),
    );

    if (this.#options.showOnboarding) {
      this.#emitEvent({ kind: "ux", name: "onboardingShown" });
    }
  }

  get cameraManager(): CameraManager {
    return this.#cameraManager;
  }

  get isDesktop(): boolean {
    return this.deviceInfo.derivedDeviceInfo.formFactors.includes("Desktop");
  }

  getState(): BiometricsUxState<SessionError, DialogKind> {
    return this.#state;
  }

  subscribe(listener: StateListener<SessionError, DialogKind>): () => void {
    this.#listeners.add(listener);
    this.#invoke(listener, this.#state);

    return () => {
      this.#listeners.delete(listener);
    };
  }

  beginCapture(): Promise<Result> {
    if (this.#state.key === "onboarding") {
      this.#emitEvent({ kind: "ux", name: "onboardingClosed" });
    }

    if (this.#closed) {
      return this.#rejectClosed();
    }

    this.#prepareCaptureAttempt();

    if (this.#closed) {
      return this.#rejectClosed();
    }

    return this.#run(() => this.#session.run());
  }

  openHelp(): void {
    if (this.#state.key !== "capturing") {
      return;
    }

    this.#cameraManager.stopFrameCapture();
    this.#session.setCaptureTimeoutPaused?.(true);
    this.#presentation?.openHelp();

    if (this.#closed) {
      return;
    }

    this.#emitEvent({ kind: "ux", name: "helpOpened" });
  }

  async closeHelp(): Promise<void> {
    if (this.#state.key !== "help") {
      return;
    }

    this.#emitEvent({ kind: "ux", name: "helpClosed" });

    if (this.#closed) {
      return;
    }

    const shouldResumeFrameCapture =
      this.#sessionState.phase === "capturing" &&
      CAPTURE_TIMEOUT_ACTIVE_STATES.has(this.#sessionState.capture.sessionState);

    this.#presentation?.closeHelp();

    if (this.#closed) {
      return;
    }

    if (!shouldResumeFrameCapture) {
      return;
    }

    const captureAttemptId = this.#captureAttemptId;
    await this.#cameraManager.startFrameCapture();

    const canResumeCapture =
      !this.#closed &&
      captureAttemptId === this.#captureAttemptId &&
      this.getState().key === "capturing" &&
      this.#sessionState.phase === "capturing" &&
      CAPTURE_TIMEOUT_ACTIVE_STATES.has(this.#sessionState.capture.sessionState);

    if (!canResumeCapture) {
      this.#cameraManager.stopFrameCapture();

      return;
    }

    this.#session.setCaptureTimeoutPaused?.(false);
  }

  retry(): Promise<Result> {
    if (this.#sessionState.phase !== "failed" || this.#state.key !== "error") {
      return Promise.reject(
        new BiometricsError({
          message: "The session is not retryable",
          code: "SESSION_NOT_RETRYABLE",
          stage: "capture",
          component: "sdk",
          isRetryable: false,
        }),
      );
    }

    if (this.#sessionState.stage === "processing") {
      this.#setState({
        key: "processing",
        error: undefined,
        errorDialogKind: undefined,
      });

      return this.#run(() => this.#session.retry());
    }

    const pendingFrame = this.#pendingFrame;

    this.#prepareCaptureAttempt();

    if (this.#closed) {
      return this.#rejectClosed();
    }

    return this.#run(async () => {
      await pendingFrame?.catch(() => undefined);

      return this.#session.retry();
    });
  }

  captureAnimationComplete(): void {
    if (this.#closed) {
      return;
    }

    if (!this.#presentation?.animationCompleted()) {
      return;
    }

    this.#invoke(this.#options.onCaptureAnimationComplete);
  }

  close(closeReason: CloseReason = "Sdk"): void {
    if (this.#closed) {
      return;
    }

    this.#closed = true;
    this.#captureAttemptId += 1;
    this.#presentation?.dispose();
    this.#presentation = undefined;
    this.#stopFrameCapture();

    for (const remove of this.#removeSessionSubscriptions.splice(0)) {
      remove();
    }

    this.#setState({ key: "closed", helpNudgeVisible: false });
    this.#session.finish();
    this.#cameraManager.userInitiatedAbort = true;

    this.#analytics?.cameraWillClose(closeReason);
    this.#cameraManager.reset();
    this.#analytics?.dispose();
  }

  #prepareCaptureAttempt(): void {
    this.#captureAttemptId += 1;
    this.#presentation?.dispose();
    this.#stopFrameCapture();

    const cameraState = this.#cameraManager.getState();

    this.#session.setCameraSource?.(cameraState.videoElement, cameraState.selectedCamera?.getVideoTrack());
    this.#setState({
      key: "starting",
      sessionState: "IDLE",
      feedback: "FACE_NOT_FOUND",
      error: undefined,
      errorDialogKind: undefined,
      landmarks: undefined,
      boundingBox: undefined,
      faceBounds: undefined,
      frameSize: { width: 0, height: 0 },
      helpNudgeVisible: false,
      mirrorX: cameraState.mirrorX,
    });

    this.#presentation = this.#createPresentation();

    if (this.#closed) {
      return;
    }

    this.#removeFrameCallback = this.#cameraManager.addFrameCaptureCallback((frame) => {
      const promise = this.#session.processFrame(frame);
      this.#pendingFrame = promise;

      void promise.then(
        () => this.#clearPendingFrame(promise),
        () => this.#clearPendingFrame(promise),
      );

      return promise;
    });
  }

  #run(operation: () => Promise<Result>): Promise<Result> {
    const promise = (async () => operation())();
    void promise.catch(() => undefined);

    return promise;
  }

  #rejectClosed(): Promise<Result> {
    return this.#run(() =>
      Promise.reject(
        new BiometricsError({
          message: "The guided session is closed",
          code: "SESSION_CLOSED",
          stage: "capture",
          component: "sdk",
          isRetryable: false,
        }),
      ),
    );
  }

  #handleSessionState(state: BiometricsUxSessionState<Result, SessionError>): void {
    if (this.#closed) {
      return;
    }

    this.#sessionState = state;
    this.#presentation?.sessionChanged(state);
  }

  #createPresentation(): GuidedPresentation<Result, SessionError, DialogKind> {
    return createGuidedPresentation<Result, SessionError, DialogKind>(
      {
        getState: () => this.#state,
        showDebugOverlay: this.#options.showDebugOverlay,
        helpNudgeDelayMs: this.#options.helpNudgeDelayMs,
        resolveErrorDialogKind: this.#options.resolveErrorDialogKind,
      },
      (update) => this.#applyPresentationUpdate(update),
    );
  }

  #applyPresentationUpdate(update: GuidedPresentationUpdate<Result, SessionError, DialogKind>): void {
    if (update.state) {
      this.#setState(update.state);
    }

    if (this.#closed) {
      return;
    }

    for (const action of update.actions) {
      switch (action.type) {
        case "startFrameCapture":
          this.#startFrameCapture();
          break;
        case "stopFrameCapture":
          this.#stopFrameCapture();
          break;
        case "resultReady":
          this.#invoke(this.#options.onResult, action.result);
          break;
      }

      if (this.#closed) {
        return;
      }
    }
  }

  #startFrameCapture(): void {
    const captureAttemptId = this.#captureAttemptId;

    void this.#cameraManager.startFrameCapture().then(
      () => {
        if (this.#state.key !== "capturing") {
          this.#cameraManager.stopFrameCapture();
        }
      },
      (error) => {
        if (this.#closed || captureAttemptId !== this.#captureAttemptId) {
          return;
        }

        const cameraError = normalizeBiometricsError(error, {
          code: "CAMERA_START_FAILED",
          stage: "capture",
          component: "camera",
          isRetryable: true,
        });

        this.#presentation?.interrupt();
        this.#setState({
          key: "error",
          error: cameraError,
          errorDialogKind: resolveBiometricsErrorDialogKind(cameraError, "runtime"),
        });

        if (!this.#closed) {
          this.#invoke(this.#options.onError, cameraError);
        }
      },
    );
  }

  #stopFrameCapture(): void {
    this.#cameraManager.stopFrameCapture();
    this.#removeFrameCallback?.();
    this.#removeFrameCallback = undefined;
  }

  #clearPendingFrame(promise: Promise<ArrayBuffer>): void {
    if (this.#pendingFrame === promise) {
      this.#pendingFrame = undefined;
    }
  }

  #setState(patch: Partial<BiometricsUxState<SessionError, DialogKind>>): void {
    const previous = this.#state;
    this.#state = { ...this.#state, ...patch };

    this.#analytics?.stateChanged(previous, this.#state);

    for (const listener of this.#listeners) {
      this.#invoke(listener, this.#state);
    }
  }

  #emitEvent(event: BiometricsUxEvent<Event>): void {
    this.#invoke(this.#options.onEvent, event);
  }

  #invoke<Args extends unknown[]>(callback: ((...args: Args) => void) | undefined, ...args: Args): void {
    try {
      callback?.(...args);
    } catch {
      return;
    }
  }
}
