/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import {
  loadBlinkCardCore,
  type BlinkCardScanningResult,
  type RemoteScanningSession,
} from "@microblink/blinkcard-core";
import {
  createBlinkCardUxManager,
  type BlinkCardUiStateKey,
  type BlinkCardUxManager,
} from "@microblink/blinkcard-ux-manager/core";
import { CameraManager } from "@microblink/camera-manager/core";

import "./index.css";

type BlinkCardCore = Awaited<ReturnType<typeof loadBlinkCardCore>>;
type ElementConstructor<T extends HTMLElement> = new () => T;
type RemoveCallback = () => void;
type SdkState = "idle" | "loading" | "ready" | "destroying";
type SessionState = "idle" | "starting" | "active" | "stopping";

const UI_STATE_MESSAGES: Partial<Record<BlinkCardUiStateKey, string>> = {
  INTRO_FRONT: "Show the front of your card.",
  FIRST_SIDE_CAPTURED: "Front captured.",
  FLIP_CARD: "Flip the card.",
  INTRO_BACK: "Show the back of your card.",
  CARD_CAPTURED: "Card captured.",
};

function getElement<T extends HTMLElement>(id: string, elementType: ElementConstructor<T>): T {
  const element = document.getElementById(id);

  if (!(element instanceof elementType)) {
    throw new Error(`Expected #${id} to be a ${elementType.name}`);
  }

  return element;
}

const startButton = getElement("start", HTMLButtonElement);
const loadSdkButton = getElement("load-sdk", HTMLButtonElement);
const destroySdkButton = getElement("destroy-sdk", HTMLButtonElement);
const retryButton = getElement("retry", HTMLButtonElement);
const stopButton = getElement("stop", HTMLButtonElement);
const statusElement = getElement("status", HTMLParagraphElement);
const errorElement = getElement("error", HTMLParagraphElement);
const videoElement = getElement("video", HTMLVideoElement);
const reticleElement = getElement("reticle", HTMLDivElement);
const resultElement = getElement("result", HTMLPreElement);

function formatUiState(key: BlinkCardUiStateKey): string {
  return UI_STATE_MESSAGES[key] ?? key.toLowerCase().replaceAll("_", " ");
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error, null, 2) ?? String(error);
}

function showError(error: unknown): void {
  errorElement.textContent = formatError(error);
  errorElement.hidden = false;
  retryButton.hidden = false;
}

function formatResult(result: BlinkCardScanningResult): string {
  const resultWithoutImages = structuredClone(result);

  if (resultWithoutImages.firstSideResult?.cardImage) {
    delete resultWithoutImages.firstSideResult.cardImage.image;
  }

  if (resultWithoutImages.secondSideResult?.cardImage) {
    delete resultWithoutImages.secondSideResult.cardImage.image;
  }

  return JSON.stringify(resultWithoutImages, null, 2);
}

class BlinkCardCustomUiExample {
  #core?: BlinkCardCore;
  #coreLoad?: Promise<BlinkCardCore>;
  #session?: RemoteScanningSession;
  #cameraManager = new CameraManager();
  #uxManager?: BlinkCardUxManager;
  #removeCallbacks: RemoveCallback[] = [];
  #sessionStop?: Promise<void>;
  #runId = 0;
  #sdkRunId = 0;
  #sdkState: SdkState = "idle";
  #sessionState: SessionState = "idle";
  #cameraInitialized = true;
  #isDisposed = false;

  constructor() {
    this.#cameraManager.initVideoElement(videoElement);
  }

  async initialize(): Promise<void> {
    if (this.#isDisposed || this.#sdkState === "loading" || this.#sdkState === "ready") {
      return;
    }

    const sdkRunId = ++this.#sdkRunId;
    this.#sdkState = "loading";
    retryButton.hidden = true;
    errorElement.hidden = true;
    statusElement.textContent = "Loading BlinkCard SDK resources…";
    this.#updateControls();

    try {
      await this.#getCore(sdkRunId);
      if (!this.#isSdkCurrent(sdkRunId)) {
        return;
      }

      this.#sdkState = "ready";
      statusElement.textContent = "BlinkCard SDK is ready. Start a scanning session.";
    } catch (error) {
      if (!this.#isSdkCurrent(sdkRunId)) {
        return;
      }

      this.#sdkState = "idle";
      showError(error);
      statusElement.textContent = "Unable to load BlinkCard SDK resources.";
    }

    this.#updateControls();
  }

  async start(): Promise<void> {
    const core = this.#core;
    if (!core || this.#sdkState !== "ready" || this.#sessionState !== "idle") {
      return;
    }

    const runId = ++this.#runId;
    this.#sessionState = "starting";

    retryButton.hidden = true;
    errorElement.hidden = true;
    resultElement.textContent = "";
    reticleElement.dataset.reticle = "searching";
    statusElement.textContent = "Creating BlinkCard scanning session…";
    this.#updateControls();

    await this.#stopSession();
    if (!this.#isCurrent(runId) || this.#sdkState !== "ready" || this.#core !== core) {
      return;
    }
    this.#ensureCameraInitialized();
    this.#cameraManager.userInitiatedAbort = false;

    try {
      const session = await core.createScanningSession({
        scanningSettings: {},
      });

      if (!this.#isCurrent(runId)) {
        await session.delete();
        return;
      }
      this.#session = session;

      const cameraManager = this.#cameraManager;

      const uxManager = await createBlinkCardUxManager(cameraManager, session);
      if (!this.#isCurrent(runId)) {
        uxManager.destroy();
        return;
      }
      this.#uxManager = uxManager;

      this.#removeCallbacks.push(
        uxManager.addOnUiStateChangedCallback((state) => {
          if (!this.#isCurrent(runId)) {
            return;
          }

          statusElement.textContent = formatUiState(state.key);
          reticleElement.dataset.reticle = state.reticleType;
        }),
        uxManager.addOnErrorCallback((error) => {
          if (this.#isCurrent(runId)) {
            showError(error);
          }
        }),
        uxManager.addOnResultCallback((result) => {
          if (!this.#isCurrent(runId)) {
            return;
          }

          resultElement.textContent = formatResult(result);
          statusElement.textContent = "Scan complete.";
          void this.#finish(runId);
        }),
        cameraManager.addErrorCallback((error) => {
          if (this.#isCurrent(runId)) {
            showError(error);
          }
        }),
      );

      const removePlaybackCallback = cameraManager.subscribe(
        (state) => state.playbackState,
        (playbackState) => {
          if (playbackState !== "playback" || !this.#isCurrent(runId)) {
            return;
          }

          removePlaybackCallback();
          void cameraManager.startFrameCapture().catch((error: unknown) => {
            if (this.#isCurrent(runId)) {
              showError(error);
            }
          });
        },
      );
      this.#removeCallbacks.push(removePlaybackCallback);

      await cameraManager.startCameraStream();
      if (this.#isCurrent(runId)) {
        this.#sessionState = "active";
        this.#updateControls();
      }
    } catch (error) {
      if (!this.#isCurrent(runId)) {
        return;
      }

      showError(error);
      statusElement.textContent = "Unable to start scanning.";
      await this.#finish(runId);
    }
  }

  async stop(): Promise<void> {
    if (this.#sessionState === "idle") {
      return;
    }

    const runId = ++this.#runId;
    this.#sessionState = "stopping";

    this.#updateControls();
    await this.#stopSession();

    if (this.#isCurrent(runId)) {
      this.#sessionState = "idle";
      retryButton.hidden = true;
      errorElement.hidden = true;
      reticleElement.dataset.reticle = "searching";
      statusElement.textContent = "Scanning stopped.";
      this.#updateControls();
    }
  }

  async retry(): Promise<void> {
    retryButton.hidden = true;
    if (this.#sdkState === "ready") {
      await this.stop();
      await this.start();
    } else {
      await this.initialize();
    }
  }

  async destroySdk(): Promise<void> {
    if (this.#sdkState === "idle" || this.#sdkState === "destroying") {
      return;
    }

    const sdkRunId = ++this.#sdkRunId;
    ++this.#runId;
    this.#sdkState = "destroying";
    this.#sessionState = "stopping";
    retryButton.hidden = true;
    statusElement.textContent = "Destroying BlinkCard SDK…";
    this.#updateControls();

    await this.#stopSession();
    this.#releaseCamera();
    await this.#terminateCore();

    if (this.#isSdkCurrent(sdkRunId)) {
      this.#sdkState = "idle";
      this.#sessionState = "idle";
      statusElement.textContent = "BlinkCard SDK destroyed. Load it again to continue.";
      this.#updateControls();
    }
  }

  async dispose(): Promise<void> {
    this.#isDisposed = true;
    ++this.#sdkRunId;
    ++this.#runId;
    await this.#stopSession();
    this.#releaseCamera();
    await this.#terminateCore();
  }

  #isCurrent(runId: number): boolean {
    return !this.#isDisposed && this.#runId === runId;
  }

  #isSdkCurrent(sdkRunId: number): boolean {
    return !this.#isDisposed && this.#sdkRunId === sdkRunId;
  }

  async #finish(runId: number): Promise<void> {
    if (!this.#isCurrent(runId)) {
      return;
    }

    const cleanupRunId = ++this.#runId;
    this.#sessionState = "stopping";
    this.#updateControls();
    await this.#stopSession();

    if (this.#isCurrent(cleanupRunId)) {
      this.#sessionState = "idle";
      this.#updateControls();
    }
  }

  #getCore(sdkRunId: number): Promise<BlinkCardCore> {
    if (this.#core) {
      return Promise.resolve(this.#core);
    }

    this.#coreLoad ??= loadBlinkCardCore(
      {
        licenseKey: import.meta.env.VITE_LICENCE_KEY,
      },
      (progress) => {
        if (this.#isSdkCurrent(sdkRunId)) {
          statusElement.textContent = `Loading BlinkCard SDK resources… ${progress.progress}%`;
        }
      },
    )
      .then((core) => {
        this.#core = core;
        return core;
      })
      .catch((error: unknown) => {
        this.#coreLoad = undefined;
        throw error;
      });

    return this.#coreLoad;
  }

  async #stopSession(): Promise<void> {
    if (this.#sessionStop) {
      return this.#sessionStop;
    }

    const stopPromise = this.#disposeSession();
    this.#sessionStop = stopPromise;

    try {
      await stopPromise;
    } finally {
      if (this.#sessionStop === stopPromise) {
        this.#sessionStop = undefined;
      }
    }
  }

  async #disposeSession(): Promise<void> {
    const session = this.#session;
    const uxManager = this.#uxManager;
    const removeCallbacks = this.#removeCallbacks.splice(0);

    this.#session = undefined;
    this.#uxManager = undefined;

    for (const removeCallback of removeCallbacks) {
      removeCallback();
    }
    this.#cameraManager.userInitiatedAbort = true;
    uxManager?.destroy();
    if (this.#cameraManager.getState().playbackState === "capturing") {
      this.#cameraManager.stopFrameCapture();
    }
    this.#cameraManager.stopStream();

    if (session) {
      await session.delete().catch((error: unknown) => {
        console.warn("Failed to delete the BlinkCard scanning session.", error);
      });
    }
  }

  async #terminateCore(): Promise<void> {
    const coreLoad = this.#coreLoad;
    const loadedCore = this.#core;
    this.#core = undefined;
    this.#coreLoad = undefined;

    const core = loadedCore ?? (await coreLoad?.catch(() => undefined));
    this.#core = undefined;

    if (core) {
      await core.terminate().catch((error: unknown) => {
        console.warn("Failed to terminate BlinkCard Core.", error);
      });
    }
  }

  #ensureCameraInitialized(): void {
    if (!this.#cameraInitialized) {
      this.#cameraManager.initVideoElement(videoElement);
      this.#cameraInitialized = true;
    }
  }

  #releaseCamera(): void {
    if (!this.#cameraInitialized) {
      return;
    }

    this.#cameraManager.userInitiatedAbort = true;
    this.#cameraManager.releaseVideoElement();
    this.#cameraManager.reset();
    this.#cameraInitialized = false;
  }

  #updateControls(): void {
    loadSdkButton.disabled = this.#sdkState !== "idle" || this.#sessionState !== "idle";
    startButton.disabled = this.#sdkState !== "ready" || this.#sessionState !== "idle";
    stopButton.disabled = this.#sessionState === "idle" || this.#sessionState === "stopping";
    destroySdkButton.disabled = this.#sdkState === "idle" || this.#sdkState === "destroying";
  }
}

const example = new BlinkCardCustomUiExample();

loadSdkButton.addEventListener("click", () => void example.initialize());
startButton.addEventListener("click", () => void example.start());
retryButton.addEventListener("click", () => void example.retry());
stopButton.addEventListener("click", () => void example.stop());
destroySdkButton.addEventListener("click", () => void example.destroySdk());
window.addEventListener("pagehide", () => void example.dispose());

void example.initialize();
