/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { BiometricsCaptureSession } from "@microblink/biometrics-core";
import {
  BiometricsError,
  normalizeBiometricsError,
  SessionError,
  type BiometricsDiagnosticCallback,
  type FaceCaptureResult,
} from "@microblink/biometrics-core";

import type { BiometricsAnalytics } from "./BiometricsAnalytics";
import type {
  BiometricsAnalyticsEvent,
  BiometricsSession,
  BiometricsSessionContext,
  BiometricsSessionConfig,
  BiometricsSessionEvent,
  BiometricsSessionState,
  CaptureTechnicalData,
} from "./types";

type OperationToken = { epoch: number };
type CaptureSessionFactory = () => Promise<BiometricsCaptureSession>;

function normalizeCaptureError(error: unknown): BiometricsError {
  if (error instanceof BiometricsError && error.stage === "capture") {
    return error;
  }

  return normalizeBiometricsError(error, { stage: "capture", component: "sdk" });
}

function closedError(): SessionError {
  return new SessionError("Session is finished", "SESSION_CLOSED");
}

/** Coordinates one face capture lifecycle. */
export class BiometricsSessionImpl implements BiometricsSession {
  readonly #stateListeners = new Set<(state: BiometricsSessionState) => void>();
  readonly #eventListeners = new Set<(event: BiometricsSessionEvent) => void>();
  readonly #errorListeners = new Set<(error: BiometricsError) => void>();
  readonly #diagnosticUnsubscribers = new Set<() => void>();
  readonly #analyticsTasks = new Set<Promise<void>>();

  #state: BiometricsSessionState = { phase: "idle" };
  #activeOperation?: OperationToken;
  #epoch = 0;
  #captureAttempt = 0;
  #captureSessionPromise?: Promise<BiometricsCaptureSession>;
  #captureSession?: BiometricsCaptureSession;
  #cameraSource?: { videoElement: HTMLVideoElement; track: MediaStreamTrack };
  #sessionAnalytics?: BiometricsAnalytics;
  #sessionContextPromise?: Promise<BiometricsSessionContext>;
  #captureSessionClosePromise?: Promise<void>;

  constructor(
    private readonly createCaptureSession: CaptureSessionFactory,
    private readonly config: BiometricsSessionConfig = {},
    private readonly analytics?: BiometricsAnalytics,
    private readonly subscribeDiagnostic: (listener: BiometricsDiagnosticCallback) => () => void = () => () =>
      undefined,
  ) {
    void this.#beginCaptureSession();
  }

  getState(): BiometricsSessionState {
    return this.#state;
  }

  subscribe(listener: (state: BiometricsSessionState) => void): () => void {
    this.#stateListeners.add(listener);
    this.#invoke(listener, this.#state);

    return () => this.#stateListeners.delete(listener);
  }

  processFrame(imageData: ImageData): Promise<ArrayBuffer> {
    if (this.#captureSession) {
      return this.#captureSession.processFrame(imageData);
    }

    return (
      this.#captureSessionPromise?.then(
        (session) => session.processFrame(imageData),
        () => imageData.data.buffer,
      ) ?? Promise.resolve(imageData.data.buffer)
    );
  }

  setCameraSource(videoElement: HTMLVideoElement | undefined, track: MediaStreamTrack | undefined): void {
    this.#cameraSource = videoElement && track ? { videoElement, track } : undefined;
    this.#captureSession?.setCameraSource(videoElement, track);
  }

  setCaptureTimeoutPaused(paused: boolean): void {
    if (this.#state.phase === "capturing") {
      this.#captureSession?.setCaptureTimeoutPaused(paused);
    }
  }

  run(): Promise<FaceCaptureResult> {
    this.#assertAvailable();

    if (this.#state.phase !== "idle") {
      throw new SessionError("This session has already been started", "SESSION_NOT_IDLE");
    }

    return this.#startCapture();
  }

  retry(): Promise<FaceCaptureResult> {
    this.#assertAvailable();

    if (this.#state.phase !== "failed" || !this.#state.error.isRetryable) {
      throw new SessionError("The current session state cannot be retried", "SESSION_NOT_RETRYABLE");
    }

    return this.#startCapture();
  }

  onEvent(listener: (event: BiometricsSessionEvent) => void): () => void {
    this.#eventListeners.add(listener);

    return () => this.#eventListeners.delete(listener);
  }

  onError(listener: (error: BiometricsError) => void): () => void {
    this.#errorListeners.add(listener);

    return () => this.#errorListeners.delete(listener);
  }

  onDiagnostic(listener: BiometricsDiagnosticCallback): () => void {
    const unsubscribe = this.subscribeDiagnostic(listener);
    this.#diagnosticUnsubscribers.add(unsubscribe);

    return () => {
      this.#diagnosticUnsubscribers.delete(unsubscribe);
      unsubscribe();
    };
  }

  async getSessionContext(): Promise<BiometricsSessionContext> {
    this.#sessionContextPromise ??= this.#beginCaptureSession()
      .then((session) => {
        this.#sessionAnalytics ??= this.analytics?.forSession(session.context);
        return Object.freeze({
          sessionId: session.context.sessionId,
          traceId: session.context.traceId,
          sessionNumber: session.context.sessionNumber,
          report: (event: BiometricsAnalyticsEvent) => this.#sessionAnalytics?.report(event) ?? Promise.resolve(),
          flush: () => this.#sessionAnalytics?.sendPinglets() ?? Promise.resolve(),
        });
      })
      .catch((error: unknown) => {
        this.#sessionContextPromise = undefined;

        throw error;
      });

    return this.#sessionContextPromise;
  }

  finish(): void {
    if (this.#state.phase === "finished") {
      return;
    }

    this.#epoch += 1;
    this.#activeOperation = undefined;
    this.#setState({ phase: "finished" });
    this.#ignore(this.#closeCaptureSession());
    this.#eventListeners.clear();
    this.#errorListeners.clear();

    for (const unsubscribe of this.#diagnosticUnsubscribers) {
      unsubscribe();
    }

    this.#diagnosticUnsubscribers.clear();
  }

  async #startCapture(): Promise<FaceCaptureResult> {
    const token = this.#activate();
    const attempt = ++this.#captureAttempt;
    this.#setState({
      phase: "capturing",
      capture: { sessionState: "IDLE", feedback: "FACE_NOT_FOUND" },
    });

    let captureSession: BiometricsCaptureSession;

    try {
      captureSession = await this.#beginCaptureSession();

      if (!this.#isCaptureActive(token, attempt)) {
        throw closedError();
      }

      this.#sessionAnalytics ??= this.analytics?.forSession(captureSession.context);
      const captureStartedTask = this.#sessionAnalytics?.logCaptureStarted();
      this.#trackAnalytics(captureStartedTask);
      await captureStartedTask?.catch(() => undefined);

      if (!this.#isCaptureActive(token, attempt)) {
        throw closedError();
      }
    } catch (error) {
      return this.#handleCaptureError(error, token);
    }

    const { thresholds: _thresholds, ...captureFace } = this.config.captureFace ?? {};
    void _thresholds;

    let result: FaceCaptureResult;

    try {
      result = await captureSession.capture({
        ...captureFace,
        timeoutMs: this.config.captureTimeoutMs,
        onStateChange: (sessionState) => {
          if (sessionState !== "COMPLETE" && this.#isCaptureActive(token, attempt)) {
            this.#updateCapture({ sessionState });
          }
        },
        onFeedbackChange: (feedback) => {
          if (this.#isCaptureActive(token, attempt)) {
            this.#updateCapture({ feedback });
            this.#emit({ kind: "faceGuidance", feedback });
          }
        },
        onTimeout: () => {
          if (this.#isCaptureActive(token, attempt)) {
            this.#emit({ kind: "captureTimeout" });
          }
        },
        onAnalysisResult: (analysis) => {
          if (!this.#isCaptureActive(token, attempt)) {
            return;
          }

          const data: CaptureTechnicalData = {
            normalizedFaceBounds: analysis.boundingBox,
            landmarks: analysis.landmarks,
            inputImageSize: analysis.inputImageSize,
          };
          this.#updateCapture({ technicalData: data });
          this.#emit({ kind: "captureTechnicalData", data });
        },
        onCapture: (result) => {
          if (this.#isCaptureActive(token, attempt)) {
            this.#publishCapture(result);
          }
        },
      });
    } catch (error) {
      return this.#handleCaptureError(error, token);
    }

    if (!this.#isCaptureActive(token, attempt)) {
      throw closedError();
    }

    if (this.#state.phase === "capturing" && this.#state.capture.sessionState !== "COMPLETE") {
      this.#publishCapture(result);
    }

    this.#release(token);
    this.#setState({ phase: "succeeded", result });
    await this.#closeCaptureSession();

    return result;
  }

  async #handleCaptureError(error: unknown, token: OperationToken): Promise<never> {
    if (!this.#isActive(token)) {
      throw closedError();
    }

    if (!this.#captureSession) {
      this.#captureSessionPromise = undefined;
    }

    const captureError = normalizeCaptureError(error);
    this.#trackAnalytics((this.#sessionAnalytics ?? this.analytics)?.logNonFatal("sdk.capture", captureError));
    this.#release(token);
    this.#setState({ phase: "failed", stage: "capture", error: captureError });
    this.#notify(this.#errorListeners, captureError);

    if (!captureError.isRetryable) {
      await this.#closeCaptureSession();
    }

    throw captureError;
  }

  #publishCapture(result: FaceCaptureResult): void {
    this.#updateCapture({ sessionState: "COMPLETE" });
    this.#emit({ kind: "captureFinished", result });
  }

  #updateCapture(patch: Partial<Extract<BiometricsSessionState, { phase: "capturing" }>["capture"]>): void {
    if (this.#state.phase === "capturing") {
      this.#setState({ phase: "capturing", capture: { ...this.#state.capture, ...patch } });
    }
  }

  #beginCaptureSession(): Promise<BiometricsCaptureSession> {
    if (this.#captureSession) {
      return Promise.resolve(this.#captureSession);
    }

    if (this.#captureSessionPromise) {
      return this.#captureSessionPromise;
    }

    let pendingSession: Promise<BiometricsCaptureSession>;

    try {
      pendingSession = this.createCaptureSession();
    } catch (error) {
      pendingSession = Promise.reject(error);
    }

    this.#captureSessionPromise = pendingSession;
    void pendingSession.then(
      (session) => {
        if (this.#captureSessionPromise === pendingSession) {
          this.#captureSession = session;
          session.setCameraSource(this.#cameraSource?.videoElement, this.#cameraSource?.track);
        }
      },
      () => {
        if (this.#captureSessionPromise === pendingSession) {
          this.#captureSessionPromise = undefined;
        }
      },
    );

    return pendingSession;
  }

  #closeCaptureSession(): Promise<void> {
    this.#captureSessionClosePromise ??= (async () => {
      const session = this.#captureSession ?? (await this.#captureSessionPromise?.catch(() => undefined));

      while (this.#analyticsTasks.size > 0) {
        await Promise.all(this.#analyticsTasks);
      }

      await session?.close();
    })();

    return this.#captureSessionClosePromise;
  }

  #activate(): OperationToken {
    const token = { epoch: this.#epoch };
    this.#activeOperation = token;
    return token;
  }

  #release(token: OperationToken): void {
    if (this.#activeOperation === token) {
      this.#activeOperation = undefined;
    }
  }

  #assertAvailable(): void {
    if (this.#state.phase === "finished") {
      throw closedError();
    }

    if (this.#activeOperation) {
      throw new SessionError("A session operation is already active", "SESSION_ALREADY_ACTIVE");
    }
  }

  #isActive(token: OperationToken): boolean {
    return this.#activeOperation === token && token.epoch === this.#epoch && this.#state.phase !== "finished";
  }

  #isCaptureActive(token: OperationToken, attempt: number): boolean {
    return this.#isActive(token) && attempt === this.#captureAttempt && this.#state.phase === "capturing";
  }

  #setState(state: BiometricsSessionState): void {
    this.#state = state;
    this.#notify(this.#stateListeners, state);
  }

  #emit(event: BiometricsSessionEvent): void {
    this.#trackAnalytics(this.#sessionAnalytics?.logSessionEvent(event));
    this.#notify(this.#eventListeners, event);
  }

  #trackAnalytics(promise: Promise<void> | undefined): void {
    if (!promise) {
      return;
    }

    const task = promise.catch(() => undefined).finally(() => this.#analyticsTasks.delete(task));
    this.#analyticsTasks.add(task);
  }

  #notify<T>(listeners: Set<(value: T) => void>, value: T): void {
    for (const listener of listeners) {
      this.#invoke(listener, value);
    }
  }

  #invoke<T>(listener: ((value: T) => void) | undefined, value: T): void {
    try {
      listener?.(value);
    } catch {
      return;
    }
  }

  #ignore(promise: Promise<void> | undefined): void {
    void promise?.catch(() => undefined);
  }
}
