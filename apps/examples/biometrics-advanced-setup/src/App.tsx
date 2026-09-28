/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

/* @refresh reload */

import {
  createBiometrics,
  type BiometricsError,
  type BiometricsSdk,
  type BiometricsSession,
  type BiometricsSessionEvent,
  type FaceCaptureResult,
} from "@microblink/biometrics";
import {
  createBiometricsUxManager,
  type BiometricsUxEvent,
  type BiometricsUxState,
  type CloseReason,
} from "@microblink/biometrics-ux-manager/core";
import { createBiometricsFeedbackUi, type BiometricsFeedbackUiHandle } from "@microblink/biometrics-ux-manager/ui";
import { CameraError, CameraManager } from "@microblink/camera-manager/core";
import { createCameraManagerUi } from "@microblink/camera-manager/ui";
import { type Component, createSignal, For, Show } from "solid-js";

/**
 * Renders the capture UI outside the root element when `true`. This is useful when the SDK is shown in a modal or a
 * popup.
 */
const USE_PORTAL = true;

/** If the onboarding guide should be shown before capture starts. */
const SHOW_ONBOARDING = true;

/** Draws the detected face bounds and landmarks over the camera stream. */
const SHOW_DEBUG_OVERLAY = false;

const MAX_LOGGED_EVENTS = 20;

const targetNode = USE_PORTAL ? undefined : document.getElementById("root")!;

type LoadState = "idle" | "loading" | "ready" | "capturing";

type CaptureView = {
  bestImageUrl: string;
  captureFrameUrl?: string;
  summary: Record<string, unknown>;
};

function imageDataToUrl(image: ImageData): string {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  canvas.getContext("2d")?.putImageData(image, 0, 0);

  return canvas.toDataURL("image/jpeg");
}

function describeEvent(event: BiometricsUxEvent<BiometricsSessionEvent>): string | undefined {
  switch (event.kind) {
    case "ux":
      return event.name;
    case "captureTimeout":
      return "captureTimeout";
    case "captureFinished":
      return `captureFinished (${event.result.livenessFrames.length} liveness frames)`;
    default:
      return undefined;
  }
}

/** This is the main component of the application. */
export const App: Component = () => {
  const [loadState, setLoadState] = createSignal<LoadState>("idle");
  const [downloadProgress, setDownloadProgress] = createSignal(0);
  const [uxState, setUxState] = createSignal<BiometricsUxState>();
  const [events, setEvents] = createSignal<string[]>([]);
  const [capture, setCapture] = createSignal<CaptureView>();
  const [error, setError] = createSignal<string>();

  let sdkPromise: Promise<BiometricsSdk> | undefined;
  let captureFrameUrl: string | undefined;
  let teardownCapture: ((closeReason?: CloseReason) => void) | undefined;

  const logEvent = (message: string) => {
    setEvents((previous) => [`${new Date().toLocaleTimeString()} ${message}`, ...previous].slice(0, MAX_LOGGED_EVENTS));
  };

  const showError = (reason: unknown) => {
    setError(reason instanceof Error ? `${reason.name}: ${reason.message}` : String(reason));
  };

  const showCapture = (result: FaceCaptureResult, traceId: string, sessionNumber: number) => {
    if (captureFrameUrl) {
      URL.revokeObjectURL(captureFrameUrl);
    }

    const { captureFrame } = result;
    captureFrameUrl = captureFrame
      ? URL.createObjectURL(new Blob([captureFrame.data], { type: captureFrame.mimeType }))
      : undefined;

    setCapture({
      bestImageUrl: imageDataToUrl(result.bestImage.image),
      captureFrameUrl,
      summary: {
        traceId,
        sessionNumber,
        bestImage: `${result.bestImage.image.width}x${result.bestImage.image.height}`,
        supportingImages: result.supportingImages.length,
        livenessFrames: result.livenessFrames.length,
        captureFrameBytes: captureFrame?.data.byteLength,
        hasBatchSignature: result.livenessBatchSignature !== undefined,
      },
    });
  };

  /** Loads the SDK once and reuses it for every capture. */
  const getSdk = (): Promise<BiometricsSdk> => {
    sdkPromise ??= createBiometrics({
      licenseKey: import.meta.env.VITE_LICENCE_KEY,
      onDownloadProgress: (progress) => setDownloadProgress(progress.progress),
      // analytics: { enabled: false },
      // wasmVariant: "simd",
    }).catch((reason: unknown) => {
      sdkPromise = undefined;
      throw reason;
    });

    return sdkPromise;
  };

  async function startCapture() {
    setLoadState("loading");
    setError(undefined);
    setEvents([]);

    let session: BiometricsSession | undefined;

    try {
      const sdk = await getSdk();
      const activeSession = sdk.startSession({ captureTimeoutMs: 60_000 });
      session = activeSession;
      const sessionContext = activeSession.getSessionContext();
      const cameraManager = new CameraManager({ preferredResolution: "1080p" });

      const uxManager = await createBiometricsUxManager(cameraManager, activeSession, {
        showOnboarding: SHOW_ONBOARDING,
        showDebugOverlay: SHOW_DEBUG_OVERLAY,
        onEvent: (event) => {
          const message = describeEvent(event);

          if (message) {
            logEvent(message);
          }
        },
        onError: (captureError: BiometricsError) => {
          logEvent(`error ${captureError.code}`);
        },
        onResult: (result) => {
          void sessionContext.then(({ traceId, sessionNumber }) => {
            showCapture(result, traceId, sessionNumber);
            teardownCapture?.("Sdk");
          });
        },
      });

      const cameraUi = await createCameraManagerUi(cameraManager, targetNode, {
        showMirrorCameraButton: true,
      });

      let feedbackUi: BiometricsFeedbackUiHandle | undefined;
      const removeCallbacks: (() => void)[] = [];

      teardownCapture = (closeReason: CloseReason = "Sdk") => {
        teardownCapture = undefined;

        for (const removeCallback of removeCallbacks.splice(0)) {
          removeCallback();
        }

        activeSession.finish();
        uxManager.close(closeReason);
        feedbackUi?.dismiss();
        cameraUi.dismount();
        cameraManager.reset();
        setUxState(undefined);
        setLoadState("ready");
      };

      removeCallbacks.push(
        cameraUi.addOnDismountCallback(() => teardownCapture?.()),
        uxManager.subscribe(setUxState),
        cameraManager.subscribe(
          (state) => state.playbackState,
          (playbackState) => {
            if (playbackState !== "playback" || feedbackUi) {
              return;
            }

            feedbackUi = createBiometricsFeedbackUi(uxManager, cameraUi, {
              showHelpButton: true,
              localizationStrings: {
                onboarding_modal: {
                  title: "Get ready for your selfie",
                },
              },
              onClose: () => teardownCapture?.("User"),
            });
          },
        ),
      );

      setLoadState("capturing");

      await cameraManager.startCameraStream({
        preferredFacing: "front",
        // Use this to open a specific camera instead.
        // preferredCamera: (cameras) => cameras.find((camera) => camera.name.toLowerCase().includes("logitech")),
      });
    } catch (reason) {
      // The camera UI shows its own dialog when camera permission is denied.
      if (reason instanceof CameraError && reason.code === "PERMISSION_DENIED") {
        return;
      }

      showError(reason);
      teardownCapture?.();
      session?.finish();
      setLoadState(sdkPromise ? "ready" : "idle");
    }
  }

  async function unloadSdk() {
    const pendingSdk = sdkPromise;
    sdkPromise = undefined;
    teardownCapture?.();
    setLoadState("idle");
    await (await pendingSdk?.catch(() => undefined))?.close();
  }

  return (
    <main>
      <h1>Biometrics advanced setup</h1>

      <div class="controls">
        <button disabled={loadState() === "loading" || loadState() === "capturing"} onClick={() => void startCapture()}>
          {capture() ? "Capture again" : "Start capture"}
        </button>
        <button disabled={loadState() !== "ready"} onClick={() => void unloadSdk()}>
          Unload SDK
        </button>
      </div>

      <Show when={loadState() === "loading"}>
        <p role="status">Loading SDK resources… {downloadProgress()}%</p>
      </Show>

      <Show when={error()}>{(message) => <p class="error">{message()}</p>}</Show>

      <Show when={uxState()}>
        {(state) => (
          <dl class="state">
            <dt>UX state</dt>
            <dd>{state().key}</dd>
            <dt>Capture state</dt>
            <dd>{state().sessionState}</dd>
            <dt>Feedback</dt>
            <dd>{state().feedback}</dd>
          </dl>
        )}
      </Show>

      <Show when={capture()}>
        {(view) => (
          <section>
            <h2>Result</h2>
            <div class="images">
              <figure>
                <img src={view().bestImageUrl} alt="Best captured image" />
                <figcaption>bestImage</figcaption>
              </figure>
              <Show when={view().captureFrameUrl}>
                {(url) => (
                  <figure>
                    <img src={url()} alt="Matching frame" />
                    <figcaption>captureFrame</figcaption>
                  </figure>
                )}
              </Show>
            </div>
            <pre>{JSON.stringify(view().summary, null, 2)}</pre>
          </section>
        )}
      </Show>

      <Show when={events().length > 0}>
        <section>
          <h2>Events</h2>
          <ol class="events">
            <For each={events()}>{(event) => <li>{event}</li>}</For>
          </ol>
        </section>
      </Show>
    </main>
  );
};
