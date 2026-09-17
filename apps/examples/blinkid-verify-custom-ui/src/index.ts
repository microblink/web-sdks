/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import {
  loadBlinkIdVerifyCore,
  type BlinkIdVerifyScanningResult,
  type CapturedFrame,
  type RemoteScanningSession,
} from "@microblink/blinkid-verify-core";
import {
  createBlinkIdVerifyUxManager,
  type BlinkIdVerifyUiStateKey,
  type BlinkIdVerifyUxManager,
} from "@microblink/blinkid-verify-ux-manager/core";
import { CameraManager } from "@microblink/camera-manager/core";

import "./index.css";

type BlinkIdVerifyCore = Awaited<ReturnType<typeof loadBlinkIdVerifyCore>>;
type ElementConstructor<T extends HTMLElement> = new () => T;
type RemoveCallback = () => void;
type SdkState = "idle" | "loading" | "ready" | "destroying";
type SessionState = "idle" | "starting" | "active" | "stopping";

const UI_STATE_MESSAGES: Partial<Record<BlinkIdVerifyUiStateKey, string>> = {
  INTRO_FRONT_PAGE: "Show the front of your document.",
  INTRO_BACK_PAGE: "Show the back of your document.",
  INTRO_DATA_PAGE: "Show the passport data page.",
  FLIP_CARD: "Flip the document.",
  PAGE_CAPTURED: "Page captured.",
  DOCUMENT_CAPTURED: "Document captured.",
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
const imagesElement = getElement("images", HTMLElement);

let imageUrls: string[] = [];

function formatUiState(key: BlinkIdVerifyUiStateKey): string {
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

function clearImages(): void {
  for (const imageUrl of imageUrls) {
    URL.revokeObjectURL(imageUrl);
  }

  imageUrls = [];
  imagesElement.replaceChildren();
}

function renderFrame(label: string, frame: CapturedFrame | undefined): void {
  if (!frame) {
    return;
  }

  const jpegBytes = frame.jpegBytes.slice();
  const imageUrl = URL.createObjectURL(new Blob([jpegBytes.buffer], { type: "image/jpeg" }));
  imageUrls.push(imageUrl);

  const figure = document.createElement("figure");
  const image = document.createElement("img");
  const caption = document.createElement("figcaption");

  image.src = imageUrl;
  image.alt = label;
  caption.textContent = label;
  figure.append(image, caption);
  imagesElement.append(figure);
}

function renderResult(result: BlinkIdVerifyScanningResult): void {
  clearImages();
  renderFrame("Front frame", result.frontFrame);
  renderFrame("Back frame", result.backFrame);
  renderFrame("Barcode frame", result.barcodeFrame);

  resultElement.textContent = JSON.stringify(
    {
      frontFrame: result.frontFrame?.orientation,
      backFrame: result.backFrame?.orientation,
      barcodeFrame: result.barcodeFrame?.orientation,
    },
    null,
    2,
  );
}

class BlinkIdVerifyCustomUiExample {
  #core?: BlinkIdVerifyCore;
  #coreLoad?: Promise<BlinkIdVerifyCore>;
  #session?: RemoteScanningSession;
  #cameraManager = new CameraManager();
  #uxManager?: BlinkIdVerifyUxManager;
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
    statusElement.textContent = "Loading BlinkID Verify SDK resources…";
    this.#updateControls();

    try {
      await this.#getCore(sdkRunId);
      if (!this.#isSdkCurrent(sdkRunId)) {
        return;
      }

      this.#sdkState = "ready";
      statusElement.textContent = "BlinkID Verify SDK is ready. Start a capture session.";
    } catch (error) {
      if (!this.#isSdkCurrent(sdkRunId)) {
        return;
      }

      this.#sdkState = "idle";
      showError(error);
      statusElement.textContent = "Unable to load BlinkID Verify SDK resources.";
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
    statusElement.textContent = "Creating BlinkID Verify capture session…";
    this.#updateControls();

    await this.#stopSession({ clearCapturedImages: true });
    if (!this.#isCurrent(runId) || this.#sdkState !== "ready" || this.#core !== core) {
      return;
    }
    this.#ensureCameraInitialized();
    this.#cameraManager.userInitiatedAbort = false;

    try {
      const session = await core.createScanningSession({});
      if (!this.#isCurrent(runId)) {
        await session.delete();
        return;
      }
      this.#session = session;

      const cameraManager = this.#cameraManager;

      const uxManager = await createBlinkIdVerifyUxManager(cameraManager, session);
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

          renderResult(result);
          statusElement.textContent = "Capture complete.";
          void this.#finish(runId, { clearCapturedImages: false });
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
    await this.#stopSession({ clearCapturedImages: true });

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
    statusElement.textContent = "Destroying BlinkID Verify SDK…";
    this.#updateControls();

    await this.#stopSession({ clearCapturedImages: true });
    this.#releaseCamera();
    await this.#terminateCore();

    if (this.#isSdkCurrent(sdkRunId)) {
      this.#sdkState = "idle";
      this.#sessionState = "idle";
      statusElement.textContent = "BlinkID Verify SDK destroyed. Load it again to continue.";
      this.#updateControls();
    }
  }

  async dispose(): Promise<void> {
    this.#isDisposed = true;
    ++this.#sdkRunId;
    ++this.#runId;
    await this.#stopSession({ clearCapturedImages: true });
    this.#releaseCamera();
    await this.#terminateCore();
  }

  #isCurrent(runId: number): boolean {
    return !this.#isDisposed && this.#runId === runId;
  }

  #isSdkCurrent(sdkRunId: number): boolean {
    return !this.#isDisposed && this.#sdkRunId === sdkRunId;
  }

  async #finish(runId: number, { clearCapturedImages = true }: { clearCapturedImages?: boolean } = {}): Promise<void> {
    if (!this.#isCurrent(runId)) {
      return;
    }

    const cleanupRunId = ++this.#runId;
    this.#sessionState = "stopping";
    this.#updateControls();
    await this.#stopSession({ clearCapturedImages });

    if (this.#isCurrent(cleanupRunId)) {
      this.#sessionState = "idle";
      this.#updateControls();
    }
  }

  #getCore(sdkRunId: number): Promise<BlinkIdVerifyCore> {
    if (this.#core) {
      return Promise.resolve(this.#core);
    }

    this.#coreLoad ??= loadBlinkIdVerifyCore(
      {
        licenseKey: import.meta.env.VITE_LICENCE_KEY,
      },
      (progress) => {
        if (this.#isSdkCurrent(sdkRunId)) {
          statusElement.textContent = `Loading BlinkID Verify SDK resources… ${progress.progress}%`;
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

  async #stopSession({ clearCapturedImages }: { clearCapturedImages: boolean }): Promise<void> {
    if (this.#sessionStop) {
      await this.#sessionStop;
      if (clearCapturedImages) {
        clearImages();
      }
      return;
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

    if (clearCapturedImages) {
      clearImages();
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
        console.warn("Failed to delete the BlinkID Verify scanning session.", error);
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
        console.warn("Failed to terminate BlinkID Verify Core.", error);
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

const example = new BlinkIdVerifyCustomUiExample();

loadSdkButton.addEventListener("click", () => void example.initialize());
startButton.addEventListener("click", () => void example.start());
retryButton.addEventListener("click", () => void example.retry());
stopButton.addEventListener("click", () => void example.stop());
destroySdkButton.addEventListener("click", () => void example.destroySdk());
window.addEventListener("pagehide", () => void example.dispose());

void example.initialize();
