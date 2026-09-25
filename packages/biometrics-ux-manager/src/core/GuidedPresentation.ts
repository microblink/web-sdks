/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { BoundingBox, CaptureSessionState, UnifiedFeedback } from "@microblink/biometrics-core";
import { ConfigurationError, type BiometricsError } from "@microblink/biometrics-core";

import { resolveBiometricsErrorDialogKind } from "./resolveBiometricsErrorDialogKind";
import type { BiometricsUxFailureStage, BiometricsUxSessionState, BiometricsUxState } from "./types";

const INITIAL_GUIDANCE_DURATION_MS = 2_000;
const GUIDANCE_SUCCESS_MIN_DURATION_MS = 1_000;
const CAPTURE_TIMEOUT_ACTIVE_STATES = new Set<CaptureSessionState>(["IDLE", "ANALYZING", "CAPTURING"]);
const CORRECTIVE_GUIDANCE = new Set<UnifiedFeedback>([
  "FACE_NOT_FOUND",
  "MULTIPLE_FACES",
  "TOO_CLOSE",
  "TOO_FAR",
  "ANGLED_PITCH",
  "ANGLED_ROLL",
  "ANGLED_YAW",
  "TOO_CLOSE_TO_BORDER",
  "NOT_STILL",
  "TOO_BLURRY",
  "TOO_DARK",
  "TOO_BRIGHT",
]);

export type GuidedPresentationAction<Result = unknown> =
  | { type: "startFrameCapture" }
  | { type: "stopFrameCapture" }
  | { type: "resultReady"; result: Result };

export type GuidedPresentationUpdate<
  Result = unknown,
  SessionError = BiometricsError,
  DialogKind extends string = never,
> = {
  state?: BiometricsUxState<SessionError, DialogKind>;
  actions: GuidedPresentationAction<Result>[];
};

export type GuidedPresentation<Result = unknown, SessionError = BiometricsError, DialogKind extends string = never> = {
  sessionChanged(state: BiometricsUxSessionState<Result, SessionError>): void;
  openHelp(): void;
  closeHelp(): void;
  animationCompleted(): boolean;
  interrupt(): void;
  dispose(): void;
};

export type GuidedPresentationOptions<SessionError = BiometricsError, DialogKind extends string = never> = {
  getState: () => BiometricsUxState<SessionError, DialogKind>;
  showDebugOverlay: boolean;
  helpNudgeDelayMs: number | null;
  resolveErrorDialogKind?: (error: SessionError, stage: BiometricsUxFailureStage) => DialogKind | undefined;
};

export function validateHelpNudgeDelay(delayMs: number | null): void {
  if (delayMs !== null && (!Number.isFinite(delayMs) || delayMs < 0)) {
    throw new ConfigurationError(
      "Help nudge delay must be null or a finite, non-negative number.",
      "INVALID_HELP_NUDGE_DELAY",
    );
  }
}

function latchFaceBounds(
  previous: BoundingBox | undefined,
  next: BoundingBox | undefined,
  sessionState: CaptureSessionState,
): BoundingBox | undefined {
  if (sessionState === "PROCESSING" || sessionState === "COMPLETE") {
    return previous;
  }

  return next ?? previous;
}

function presentFailure<SessionError, DialogKind extends string>(
  state: BiometricsUxState<SessionError, DialogKind>,
  stage: BiometricsUxFailureStage,
  error: SessionError,
  resolveErrorDialogKind: GuidedPresentationOptions<SessionError, DialogKind>["resolveErrorDialogKind"],
): Partial<BiometricsUxState<SessionError, DialogKind>> | undefined {
  const errorDialogKind = resolveErrorDialogKind?.(error, stage) ?? resolveBiometricsErrorDialogKind(error, stage);

  if (errorDialogKind === undefined) {
    return undefined;
  }

  return {
    key: "error",
    sessionState: stage === "capture" ? "ERROR" : state.sessionState,
    error,
    errorDialogKind,
    helpNudgeVisible: false,
  };
}

class GuidedPresentationController<Result, SessionError, DialogKind extends string> implements GuidedPresentation<
  Result,
  SessionError,
  DialogKind
> {
  readonly #showDebugOverlay: boolean;
  readonly #helpNudgeDelayMs: number | null;
  readonly #resolveErrorDialogKind: GuidedPresentationOptions<SessionError, DialogKind>["resolveErrorDialogKind"];
  readonly #onUpdate: (update: GuidedPresentationUpdate<Result, SessionError, DialogKind>) => void;
  readonly #getState: () => BiometricsUxState<SessionError, DialogKind>;
  #sessionState: BiometricsUxSessionState<Result, SessionError> = { phase: "idle" };
  #previousPhase?: BiometricsUxSessionState<Result, SessionError>["phase"];
  #helpNudgeTimer?: ReturnType<typeof setTimeout>;
  #initialGuidanceStartedAtMs?: number;
  #initialGuidanceCompleted = false;
  #initialGuidanceTimer?: ReturnType<typeof setTimeout>;
  #visibleCorrectiveFeedback?: UnifiedFeedback;
  #visibleCorrectiveStartedAtMs?: number;
  #pendingCompleteState?: BiometricsUxState<SessionError, DialogKind>;
  #pendingCompleteTimer?: ReturnType<typeof setTimeout>;
  #captureAnimationPending = false;
  #captureAnimationCompleted = false;
  #disposed = false;

  constructor(
    options: GuidedPresentationOptions<SessionError, DialogKind>,
    onUpdate: (update: GuidedPresentationUpdate<Result, SessionError, DialogKind>) => void,
  ) {
    validateHelpNudgeDelay(options.helpNudgeDelayMs);
    this.#getState = options.getState;
    this.#resolveErrorDialogKind = options.resolveErrorDialogKind;
    this.#showDebugOverlay = options.showDebugOverlay;
    this.#helpNudgeDelayMs = options.helpNudgeDelayMs;
    this.#onUpdate = onUpdate;
  }

  sessionChanged(sessionState: BiometricsUxSessionState<Result, SessionError>): void {
    if (this.#disposed) {
      return;
    }

    const previousPhase = this.#previousPhase;
    this.#previousPhase = sessionState.phase;
    this.#sessionState = sessionState;
    this.#projectSession(sessionState, previousPhase);
  }

  openHelp(): void {
    if (this.#disposed || this.#currentState().key !== "capturing") {
      return;
    }

    this.#clearHelpNudge();
    this.#clearPresentationTimers();
    this.#setState({ key: "help", helpNudgeVisible: false });
  }

  closeHelp(): void {
    if (this.#disposed || this.#currentState().key !== "help") {
      return;
    }

    const shouldResume =
      this.#sessionState.phase === "capturing" &&
      CAPTURE_TIMEOUT_ACTIVE_STATES.has(this.#sessionState.capture.sessionState);

    if (!shouldResume && this.#pendingCompleteState === undefined) {
      this.#projectSession(this.#sessionState, "capturing");

      return;
    }

    this.#setState({ key: "capturing", helpNudgeVisible: false });

    if (this.#disposed) {
      return;
    }

    if (this.#resumePendingComplete()) {
      return;
    }

    this.#projectSession(this.#sessionState, "capturing");
  }

  animationCompleted(): boolean {
    if (this.#disposed || !this.#captureAnimationPending || this.#captureAnimationCompleted) {
      return false;
    }

    this.#captureAnimationCompleted = true;
    this.#projectSession(this.#sessionState, this.#previousPhase);

    return true;
  }

  interrupt(): void {
    if (this.#disposed) {
      return;
    }

    this.#clearHelpNudge();
    this.#clearPresentationTimers();
    this.#pendingCompleteState = undefined;
    this.#visibleCorrectiveFeedback = undefined;
    this.#visibleCorrectiveStartedAtMs = undefined;
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }

    this.interrupt();
    this.#disposed = true;
  }

  #projectSession(
    sessionState: BiometricsUxSessionState<Result, SessionError>,
    previousPhase?: BiometricsUxSessionState<Result, SessionError>["phase"],
  ): void {
    switch (sessionState.phase) {
      case "idle":
        return;
      case "capturing":
        this.#projectCapturing(sessionState.capture, previousPhase);

        return;
      case "processing":
        if (this.#animationReady()) {
          this.#setState({ key: "processing" });
        }

        this.#publishActions({ type: "stopFrameCapture" });

        return;
      case "failed": {
        this.interrupt();
        this.#captureAnimationPending = false;
        this.#captureAnimationCompleted = false;
        const patch = presentFailure(
          this.#currentState(),
          sessionState.stage,
          sessionState.error,
          this.#resolveErrorDialogKind,
        );

        if (patch) {
          this.#setState(patch);
        }

        this.#publishActions({ type: "stopFrameCapture" });

        return;
      }
      case "succeeded":
        this.#publishActions(
          { type: "stopFrameCapture" },
          ...(this.#animationReady() ? [{ type: "resultReady", result: sessionState.result } as const] : []),
        );

        return;
      case "finished":
        this.interrupt();
        this.#setState({ key: "closed", helpNudgeVisible: false });
        this.#publishActions({ type: "stopFrameCapture" });
    }
  }

  #projectCapturing(
    capture: Extract<BiometricsUxSessionState<Result, SessionError>, { phase: "capturing" }>["capture"],
    previousPhase?: BiometricsUxSessionState<Result, SessionError>["phase"],
  ): void {
    const state = this.#currentState();
    const data = capture.technicalData;
    const complete = capture.sessionState === "COMPLETE";
    const nextState = {
      ...state,
      ...(state.key === "help" ? {} : { key: complete ? ("complete" as const) : ("capturing" as const) }),
      sessionState: capture.sessionState,
      feedback: capture.feedback,
      landmarks: this.#showDebugOverlay ? data?.landmarks : undefined,
      boundingBox: this.#showDebugOverlay ? data?.normalizedFaceBounds : undefined,
      faceBounds: latchFaceBounds(state.faceBounds, data?.normalizedFaceBounds, capture.sessionState),
      frameSize: data?.inputImageSize ?? state.frameSize,
      ...(complete ? { key: "complete" as const, sessionState: "COMPLETE" as const, helpNudgeVisible: false } : {}),
    };
    const gatedState = this.#gateCapturingState(nextState);

    if (gatedState) {
      this.#replaceState(gatedState);
    }

    if (this.#disposed) {
      return;
    }

    const entering = previousPhase !== "capturing";

    if (entering) {
      this.#scheduleHelpNudge();
      this.#publishActions({ type: "startFrameCapture" });
    }

    if (complete) {
      this.#captureAnimationPending = true;
      this.#clearHelpNudge();
      this.#publishActions({ type: "stopFrameCapture" });
    }
  }

  #gateCapturingState(
    nextState: BiometricsUxState<SessionError, DialogKind>,
  ): BiometricsUxState<SessionError, DialogKind> | undefined {
    const now = performance.now();

    if (this.#initialGuidanceStartedAtMs === undefined) {
      this.#initialGuidanceStartedAtMs = now;

      if (this.#currentState().key !== "help") {
        this.#scheduleInitialGuidanceEnd(INITIAL_GUIDANCE_DURATION_MS);
      }
    }

    if (!this.#initialGuidanceCompleted) {
      const elapsed = now - this.#initialGuidanceStartedAtMs;

      if (elapsed < INITIAL_GUIDANCE_DURATION_MS) {
        if (nextState.key === "complete") {
          this.#pendingCompleteState = nextState;
        }

        if (this.#currentState().key !== "help") {
          this.#scheduleInitialGuidanceEnd(INITIAL_GUIDANCE_DURATION_MS - elapsed);
        }

        return {
          ...nextState,
          key: this.#currentState().key === "help" ? "help" : "capturing",
          sessionState: "ANALYZING",
          feedback: "FACE_NOT_FOUND",
          helpNudgeVisible: false,
        };
      }

      this.#initialGuidanceCompleted = true;
      this.#clearInitialGuidanceTimer();
    }

    if (nextState.key !== "complete") {
      return nextState;
    }

    if (this.#currentState().key === "help") {
      this.#pendingCompleteState = nextState;

      return undefined;
    }

    const visibleDuration =
      this.#visibleCorrectiveStartedAtMs === undefined
        ? GUIDANCE_SUCCESS_MIN_DURATION_MS
        : now - this.#visibleCorrectiveStartedAtMs;

    if (visibleDuration >= GUIDANCE_SUCCESS_MIN_DURATION_MS) {
      return nextState;
    }

    this.#pendingCompleteState = nextState;
    this.#schedulePendingComplete(GUIDANCE_SUCCESS_MIN_DURATION_MS - visibleDuration);

    return undefined;
  }

  #scheduleHelpNudge(): void {
    this.#clearHelpNudge();

    if (this.#helpNudgeDelayMs === null) {
      return;
    }

    if (this.#helpNudgeDelayMs === 0) {
      this.#showHelpNudge();

      return;
    }

    this.#helpNudgeTimer = setTimeout(() => {
      this.#helpNudgeTimer = undefined;
      this.#showHelpNudge();
    }, this.#helpNudgeDelayMs);
  }

  #showHelpNudge(): void {
    if (!this.#disposed && this.#currentState().key === "capturing") {
      this.#setState({ helpNudgeVisible: true });
    }
  }

  #scheduleInitialGuidanceEnd(delayMs: number): void {
    if (this.#initialGuidanceTimer !== undefined) {
      return;
    }

    this.#initialGuidanceTimer = setTimeout(
      () => {
        this.#initialGuidanceTimer = undefined;

        if (this.#disposed) {
          return;
        }

        this.#finishInitialGuidance();
      },
      Math.max(0, delayMs),
    );
  }

  #finishInitialGuidance(): void {
    if (this.#initialGuidanceCompleted) {
      return;
    }

    this.#initialGuidanceCompleted = true;
    this.#clearInitialGuidanceTimer();

    if (this.#pendingCompleteState) {
      this.#presentPendingComplete();

      return;
    }

    this.#projectSession(this.#sessionState, "capturing");
  }

  #schedulePendingComplete(delayMs: number): void {
    if (this.#pendingCompleteTimer !== undefined) {
      clearTimeout(this.#pendingCompleteTimer);
    }

    this.#pendingCompleteTimer = setTimeout(
      () => {
        this.#pendingCompleteTimer = undefined;

        if (!this.#disposed) {
          this.#presentPendingComplete();
        }
      },
      Math.max(0, delayMs),
    );
  }

  #presentPendingComplete(): void {
    const state = this.#pendingCompleteState;

    if (!state) {
      return;
    }

    this.#pendingCompleteState = undefined;
    this.#clearPendingCompleteTimer();
    this.#replaceState(state);
  }

  #resumePendingComplete(): boolean {
    if (!this.#pendingCompleteState) {
      return false;
    }

    const now = performance.now();

    if (!this.#initialGuidanceCompleted && this.#initialGuidanceStartedAtMs !== undefined) {
      const remaining = INITIAL_GUIDANCE_DURATION_MS - (now - this.#initialGuidanceStartedAtMs);

      if (remaining > 0) {
        this.#scheduleInitialGuidanceEnd(remaining);

        return true;
      }

      this.#initialGuidanceCompleted = true;
    }

    const remaining =
      this.#visibleCorrectiveStartedAtMs === undefined
        ? 0
        : GUIDANCE_SUCCESS_MIN_DURATION_MS - (now - this.#visibleCorrectiveStartedAtMs);

    if (remaining > 0) {
      this.#schedulePendingComplete(remaining);
    } else {
      this.#presentPendingComplete();
    }

    return true;
  }

  #animationReady(): boolean {
    return !this.#captureAnimationPending || this.#captureAnimationCompleted;
  }

  #setState(patch: Partial<BiometricsUxState<SessionError, DialogKind>>): void {
    this.#replaceState({ ...this.#currentState(), ...patch });
  }

  #replaceState(state: BiometricsUxState<SessionError, DialogKind>): void {
    if (state.key === "capturing" && CORRECTIVE_GUIDANCE.has(state.feedback)) {
      if (this.#visibleCorrectiveFeedback !== state.feedback) {
        this.#visibleCorrectiveFeedback = state.feedback;
        this.#visibleCorrectiveStartedAtMs = performance.now();
      }
    } else if (state.key !== "help") {
      this.#visibleCorrectiveFeedback = undefined;
      this.#visibleCorrectiveStartedAtMs = undefined;
    }

    this.#onUpdate({ state, actions: [] });
  }

  #currentState(): BiometricsUxState<SessionError, DialogKind> {
    return this.#getState();
  }

  #publishActions(...actions: GuidedPresentationAction<Result>[]): void {
    if (!this.#disposed && actions.length > 0) {
      this.#onUpdate({ actions });
    }
  }

  #clearHelpNudge(): void {
    if (this.#helpNudgeTimer !== undefined) {
      clearTimeout(this.#helpNudgeTimer);
      this.#helpNudgeTimer = undefined;
    }
  }

  #clearInitialGuidanceTimer(): void {
    if (this.#initialGuidanceTimer !== undefined) {
      clearTimeout(this.#initialGuidanceTimer);
      this.#initialGuidanceTimer = undefined;
    }
  }

  #clearPendingCompleteTimer(): void {
    if (this.#pendingCompleteTimer !== undefined) {
      clearTimeout(this.#pendingCompleteTimer);
      this.#pendingCompleteTimer = undefined;
    }
  }

  #clearPresentationTimers(): void {
    this.#clearInitialGuidanceTimer();
    this.#clearPendingCompleteTimer();
  }
}

export function createGuidedPresentation<Result, SessionError = BiometricsError, DialogKind extends string = never>(
  options: GuidedPresentationOptions<SessionError, DialogKind>,
  onUpdate: (update: GuidedPresentationUpdate<Result, SessionError, DialogKind>) => void,
): GuidedPresentation<Result, SessionError, DialogKind> {
  return new GuidedPresentationController<Result, SessionError, DialogKind>(options, onUpdate);
}
