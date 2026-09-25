/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import {
  BiometricsError,
  createBiometrics,
  type BiometricsSdk,
  type BiometricsSession,
  type FaceCaptureResult,
  type UnifiedFeedback,
} from "@microblink/biometrics";
import { CameraManager } from "@microblink/camera-manager/core";

import "./index.css";

type ElementConstructor<T extends HTMLElement> = new () => T;
type RemoveCallback = () => void;

const FEEDBACK_MESSAGES: Record<UnifiedFeedback, string> = {
  OK: "Hold still…",
  FACE_NOT_FOUND: "Place your face inside the frame.",
  MULTIPLE_FACES: "Make sure only one face is visible.",
  TOO_CLOSE: "Move farther away.",
  TOO_FAR: "Move closer.",
  TOO_CLOSE_TO_BORDER: "Center your face.",
  ANGLED_ROLL: "Keep your head straight.",
  ANGLED_PITCH: "Look straight at the camera.",
  ANGLED_YAW: "Face the camera directly.",
  NOT_STILL: "Hold still.",
  TOO_DARK: "Move to a brighter place.",
  TOO_BRIGHT: "Avoid direct light.",
  TOO_BLURRY: "Hold the camera steady.",
};

function getElement<T extends HTMLElement>(id: string, elementType: ElementConstructor<T>): T {
  const element = document.getElementById(id);

  if (!(element instanceof elementType)) {
    throw new Error(`Missing #${id} element.`);
  }

  return element;
}

const startButton = getElement("start", HTMLButtonElement);
const retryButton = getElement("retry", HTMLButtonElement);
const stopButton = getElement("stop", HTMLButtonElement);
const statusElement = getElement("status", HTMLParagraphElement);
const errorElement = getElement("error", HTMLParagraphElement);
const frameElement = getElement("frame", HTMLDivElement);
const videoElement = getElement("video", HTMLVideoElement);
const resultElement = getElement("result", HTMLElement);
const bestImageCanvas = getElement("best-image", HTMLCanvasElement);
const resultDetailsElement = getElement("result-details", HTMLPreElement);

function showError(error: unknown): void {
  errorElement.hidden = false;
  errorElement.textContent =
    error instanceof BiometricsError
      ? `${error.code}: ${error.message}`
      : error instanceof Error
        ? error.message
        : String(error);
}

function showResult(result: FaceCaptureResult, traceId: string, sessionNumber: number): void {
  const { image } = result.bestImage;
  bestImageCanvas.width = image.width;
  bestImageCanvas.height = image.height;
  bestImageCanvas.getContext("2d")?.putImageData(image, 0, 0);

  resultDetailsElement.textContent = JSON.stringify(
    {
      bestImage: `${image.width}x${image.height}`,
      supportingImages: result.supportingImages.length,
      livenessFrames: result.livenessFrames.length,
      hasCaptureFrame: result.captureFrame !== undefined,
      hasBatchSignature: result.livenessBatchSignature !== undefined,
      traceId,
      sessionNumber,
    },
    null,
    2,
  );
  resultElement.hidden = false;
}

/**
 * Keeps one SDK instance and Camera Manager for the page lifetime. Each capture owns a new session and its callbacks,
 * so starting another capture does not download or initialize the SDK again.
 */
class BiometricsCustomUiExample {
  readonly #cameraManager = new CameraManager({ preferredResolution: "1080p" });
  readonly #removeCallbacks: RemoveCallback[] = [];
  #sdk?: BiometricsSdk;
  #session?: BiometricsSession;
  #runId = 0;
  #disposed = false;

  async initialize(): Promise<void> {
    try {
      const sdk = await createBiometrics({
        licenseKey: import.meta.env.VITE_LICENCE_KEY,
        onDownloadProgress(progress) {
          statusElement.textContent = `Loading SDK resources… ${progress.progress}%`;
        },
      });

      if (this.#disposed) {
        await sdk.close();
        return;
      }

      this.#sdk = sdk;
      this.#cameraManager.initVideoElement(videoElement);
      statusElement.textContent = "Ready.";
    } catch (error) {
      showError(error);
      statusElement.textContent = "Unable to load the SDK.";
    }

    this.#updateControls();
  }

  async start(): Promise<void> {
    const sdk = this.#sdk;

    if (!sdk || this.#session) {
      return;
    }

    const runId = ++this.#runId;
    const session = sdk.startSession({ captureTimeoutMs: 60_000 });
    this.#session = session;

    errorElement.hidden = true;
    resultElement.hidden = true;
    frameElement.dataset.feedback = "idle";
    statusElement.textContent = "Starting camera…";
    this.#updateControls();

    this.#removeCallbacks.push(
      session.onEvent((event) => {
        if (event.kind === "faceGuidance" && this.#isCurrent(runId)) {
          statusElement.textContent = FEEDBACK_MESSAGES[event.feedback];
          frameElement.dataset.feedback = event.feedback === "OK" ? "ok" : "adjust";
        }
      }),
      this.#cameraManager.addFrameCaptureCallback((frame) => session.processFrame(frame)),
      this.#cameraManager.addErrorCallback((error) => {
        if (this.#isCurrent(runId)) {
          showError(error);
        }
      }),
    );

    try {
      await this.#cameraManager.startCameraStream({ preferredFacing: "front" });

      if (!this.#isCurrent(runId)) {
        if (!this.#session) {
          this.#cameraManager.stopStream();
        }
        return;
      }

      const { selectedCamera } = this.#cameraManager.getState();
      session.setCameraSource(videoElement, selectedCamera?.getVideoTrack());

      await this.#capture(runId, session, () => session.run());
    } catch (error) {
      if (this.#isCurrent(runId)) {
        showError(error);
        statusElement.textContent = "Unable to start capture.";
        this.#stopSession();
      }
    }
  }

  async retry(): Promise<void> {
    const session = this.#session;

    if (session) {
      await this.#capture(this.#runId, session, () => session.retry());
    }
  }

  stop(): void {
    ++this.#runId;
    this.#stopSession();
    frameElement.dataset.feedback = "idle";
    statusElement.textContent = "Capture stopped.";
  }

  async dispose(): Promise<void> {
    this.#disposed = true;
    ++this.#runId;
    this.#stopSession();
    this.#cameraManager.userInitiatedAbort = true;
    this.#cameraManager.releaseVideoElement();
    this.#cameraManager.reset();
    await this.#sdk?.close();
    this.#sdk = undefined;
  }

  async #capture(runId: number, session: BiometricsSession, attempt: () => Promise<FaceCaptureResult>): Promise<void> {
    retryButton.hidden = true;
    errorElement.hidden = true;

    try {
      await this.#cameraManager.startFrameCapture();

      const result = await attempt();
      const { traceId, sessionNumber } = await session.getSessionContext();

      if (!this.#isCurrent(runId)) {
        return;
      }

      showResult(result, traceId, sessionNumber);
      frameElement.dataset.feedback = "done";
      statusElement.textContent = "Capture complete.";
      this.#stopSession();
    } catch (error) {
      if (!this.#isCurrent(runId)) {
        return;
      }

      this.#cameraManager.stopFrameCapture();
      showError(error);

      if (error instanceof BiometricsError && error.isRetryable) {
        statusElement.textContent = "Capture failed. You can try again.";
        retryButton.hidden = false;
      } else {
        statusElement.textContent = "Capture failed.";
        this.#stopSession();
      }
    }
  }

  #stopSession(): void {
    for (const removeCallback of this.#removeCallbacks.splice(0)) {
      removeCallback();
    }

    this.#cameraManager.stopFrameCapture();
    this.#cameraManager.stopStream();
    this.#session?.finish();
    this.#session = undefined;
    retryButton.hidden = true;
    this.#updateControls();
  }

  #isCurrent(runId: number): boolean {
    return !this.#disposed && this.#runId === runId;
  }

  #updateControls(): void {
    startButton.disabled = !this.#sdk || this.#session !== undefined;
    stopButton.disabled = this.#session === undefined;
  }
}

const example = new BiometricsCustomUiExample();

startButton.addEventListener("click", () => void example.start());
retryButton.addEventListener("click", () => void example.retry());
stopButton.addEventListener("click", () => example.stop());
window.addEventListener("pagehide", () => void example.dispose());

void example.initialize();
