/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { CameraManager, type Camera } from "@microblink/camera-manager/core";

import "./index.css";

type ElementConstructor<T extends HTMLElement> = new () => T;
type RemoveCallback = () => void;

function getElement<T extends HTMLElement>(id: string, elementType: ElementConstructor<T>): T {
  const element = document.getElementById(id);

  if (!(element instanceof elementType)) {
    throw new Error(`Expected #${id} to be a ${elementType.name}`);
  }

  return element;
}

function getCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not supported");
  }

  return context;
}

const startButton = getElement("start", HTMLButtonElement);
const captureButton = getElement("capture", HTMLButtonElement);
const stopCaptureButton = getElement("stop-capture", HTMLButtonElement);
const stopButton = getElement("stop", HTMLButtonElement);
const cameraSelect = getElement("camera", HTMLSelectElement);
const videoElement = getElement("video", HTMLVideoElement);
const canvasElement = getElement("canvas", HTMLCanvasElement);
const statusElement = getElement("status", HTMLParagraphElement);
const errorElement = getElement("error", HTMLParagraphElement);
const frameCountElement = getElement("frame-count", HTMLOutputElement);

const canvasContext = getCanvasContext(canvasElement);

function showError(error: unknown): void {
  errorElement.textContent = error instanceof Error ? error.message : String(error);
  errorElement.hidden = false;
}

function updateCameraOptions(cameras: Camera[], selectedCamera: Camera | undefined): void {
  cameraSelect.replaceChildren();

  for (const camera of cameras) {
    const option = document.createElement("option");
    option.value = camera.deviceInfo.deviceId;
    option.textContent = camera.name;
    option.selected = camera === selectedCamera;
    cameraSelect.append(option);
  }

  cameraSelect.disabled = cameras.length < 2;
}

class CameraManagerCustomUiExample {
  #cameraManager = new CameraManager();
  #removeCallbacks: RemoveCallback[] = [];
  #runId = 0;
  #capturedFrameCount = 0;
  #isDisposed = false;

  constructor() {
    this.#cameraManager.initVideoElement(videoElement);
    this.#removeCallbacks.push(
      this.#cameraManager.addFrameCaptureCallback((imageData) => {
        if (this.#isDisposed) {
          return;
        }

        canvasElement.width = imageData.width;
        canvasElement.height = imageData.height;
        canvasContext.putImageData(imageData, 0, 0);

        this.#capturedFrameCount += 1;
        frameCountElement.value = String(this.#capturedFrameCount);
      }),
      this.#cameraManager.addErrorCallback((error) => {
        if (!this.#isDisposed) {
          showError(error);
        }
      }),
      this.#cameraManager.subscribe(
        (state) => state.playbackState,
        (playbackState) => {
          if (this.#isDisposed) {
            return;
          }

          statusElement.textContent = `Camera state: ${playbackState}`;
          captureButton.disabled = playbackState !== "playback";
          stopCaptureButton.disabled = playbackState !== "capturing";
        },
      ),
    );
  }

  async start(): Promise<void> {
    const runId = ++this.#runId;

    errorElement.hidden = true;
    startButton.disabled = true;
    stopButton.disabled = false;
    statusElement.textContent = "Requesting camera access…";
    this.#capturedFrameCount = 0;
    frameCountElement.value = "0";

    try {
      this.#stopCameraStream();
      this.#cameraManager.userInitiatedAbort = false;
      await this.#cameraManager.startCameraStream();
      const cameras = await this.#cameraManager.getCameraDevices();

      if (!this.#isCurrent(runId)) {
        return;
      }

      updateCameraOptions(cameras, this.#cameraManager.selectedCamera);
    } catch (error) {
      if (!this.#isCurrent(runId)) {
        return;
      }

      showError(error);
      this.#stopCameraStream();
      statusElement.textContent = "Unable to start the camera.";
      startButton.disabled = false;
      stopButton.disabled = true;
    }
  }

  stop(): void {
    ++this.#runId;
    this.#stopCameraStream();
    captureButton.disabled = true;
    stopCaptureButton.disabled = true;
    stopButton.disabled = true;
    startButton.disabled = false;
    errorElement.hidden = true;
    statusElement.textContent = "Camera is stopped.";
  }

  dispose(): void {
    this.#isDisposed = true;
    ++this.#runId;
    this.#cameraManager.userInitiatedAbort = true;

    for (const removeCallback of this.#removeCallbacks.splice(0)) {
      removeCallback();
    }
    this.#cameraManager.releaseVideoElement();
    this.#cameraManager.reset();
  }

  selectCamera(): void {
    const runId = this.#runId;
    const selectedCamera = this.#cameraManager
      .getState()
      .cameras.find((camera) => camera.deviceInfo.deviceId === cameraSelect.value);

    if (selectedCamera) {
      void this.#cameraManager.selectCamera(selectedCamera).catch((error: unknown) => {
        if (this.#isCurrent(runId)) {
          showError(error);
        }
      });
    }
  }

  startCapture(): void {
    const runId = this.#runId;
    void this.#cameraManager.startFrameCapture().catch((error: unknown) => {
      if (this.#isCurrent(runId)) {
        showError(error);
      }
    });
  }

  stopCapture(): void {
    this.#cameraManager.stopFrameCapture();
  }

  #isCurrent(runId: number): boolean {
    return !this.#isDisposed && this.#runId === runId;
  }

  #stopCameraStream(): void {
    this.#cameraManager.userInitiatedAbort = true;
    if (this.#cameraManager.getState().playbackState === "capturing") {
      this.#cameraManager.stopFrameCapture();
    }
    this.#cameraManager.stopStream();
  }
}

const example = new CameraManagerCustomUiExample();

startButton.addEventListener("click", () => void example.start());
captureButton.addEventListener("click", () => example.startCapture());
stopCaptureButton.addEventListener("click", () => example.stopCapture());
stopButton.addEventListener("click", () => example.stop());
cameraSelect.addEventListener("change", () => example.selectCamera());
window.addEventListener("pagehide", () => example.dispose());
