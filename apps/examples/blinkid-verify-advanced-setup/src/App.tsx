/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

/* @refresh reload */

import {
  BlinkIdVerifyProcessResult,
  loadBlinkIdVerifyCore,
  type BlinkIdVerifySessionResult,
  type VerifyApiError,
  type VerifyApiResult,
} from "@microblink/blinkid-verify-core";
import {
  BlinkIdVerifyUxManager,
  createBlinkIdVerifyFeedbackUi,
  createBlinkIdVerifyUxManager,
} from "@microblink/blinkid-verify-ux-manager";
import { CameraManager, createCameraManagerUi } from "@microblink/camera-manager";
import { Component, createEffect, createMemo, createSignal, Match, onMount, Show, Switch } from "solid-js";

/**
 * If you are using a portal, you can set this to true. Portal is a way to render the UI outside of the root element.
 * This is useful if you want to use the SDK in a modal or a popup.
 */
const USE_PORTAL = true;

/** If the onboarding guide should be shown. */
const SHOW_ONBOARDING = true;

/** This is the target node for the UI. */
const targetNode = !USE_PORTAL ? document.getElementById("root")! : undefined;

/** Result of the Verify API request started after capture, or pending while that request is in flight. */
type VerifyOutcome =
  | { status: "pending" }
  | { status: "success"; result: VerifyApiResult }
  | { status: "error"; error: VerifyApiError };

/** This is the main component of the application. */
export const App: Component = () => {
  const [result, setResult] = createSignal<BlinkIdVerifySessionResult>();
  const [verifyOutcome, setVerifyOutcome] = createSignal<VerifyOutcome>();
  const [blinkIdVerifyUxManager, setBlinkIdVerifyUxManager] = createSignal<BlinkIdVerifyUxManager>();
  const [loadState, setLoadState] = createSignal<"not-loaded" | "loading" | "ready">("not-loaded");
  let captureGeneration = 0;

  async function init() {
    const generation = ++captureGeneration;
    setLoadState("loading");
    setResult(undefined);
    setVerifyOutcome(undefined);

    /*
     * We first initialize the direct API. This loads the WASM module and initializes the engine.
     * For additional configuration look at the BlinkIdVerifyInitSettings type.
     *
     */
    const blinkIdVerifyCore = await loadBlinkIdVerifyCore({
      licenseKey: import.meta.env.VITE_LICENCE_KEY,
    });

    /*
     * Initialize the session with the default settings.
     * For additional configuration look at the BlinkIdVerifySessionSettings type.
     *
     */
    const session = await blinkIdVerifyCore.createScanningSession({});

    /*
     * Create the camera manager.
     */
    const cameraManager = new CameraManager();

    /*
     * Create the consent gate. RequireConsent does not return a manager until the user accepts.
     */
    const consentGate = await createBlinkIdVerifyUxManager(cameraManager, session, {
      consentUxConfig: {
        consentMode: "RequireConsent",
        consent: {
          userId: "example-user",
          durationDays: 365,
        },
      },
    });

    /*
     * This creates the UI and attaches it to the DOM.
     * For additional configuration look at the CameraManagerUiOptions type.
     *
     */
    const cameraUi = await createCameraManagerUi(cameraManager, targetNode, {
      showMirrorCameraButton: true,
    });

    /*
     * A finished capture closes the camera immediately, but the core has to stay alive until the Verify API request
     * settles. Terminating it here would cancel that request.
     */
    let preserveCoreForResult = false;
    cameraUi.addOnDismountCallback(() => {
      if (!preserveCoreForResult) {
        void blinkIdVerifyCore.terminate();
      }
      setBlinkIdVerifyUxManager(undefined);
      setLoadState("not-loaded");
    });

    const uxManager = await consentGate.consentUiResponse(cameraUi);
    if (!uxManager) {
      await blinkIdVerifyCore.terminate();
      setLoadState("not-loaded");
      return;
    }

    // set the timeout duration to null to disable the timeout.
    uxManager.setTimeoutDuration(null);

    setBlinkIdVerifyUxManager(uxManager);

    /*
     * Capture is already complete when this runs, after the success animation. Close the camera right away and let the
     * Verify API request finish in the background.
     */
    uxManager.addOnCaptureCompletedCallback(async (resolver) => {
      preserveCoreForResult = true;
      setVerifyOutcome({ status: "pending" });
      cameraUi.dismount();

      const captureResultPromise = resolver.getCaptureResult().then(
        (captureResult) => {
          if (generation === captureGeneration) {
            setResult(captureResult);
          }
        },
        (error: unknown) => {
          console.error("Failed to load capture result", error);
        },
      );

      try {
        const outcome = await resolver.verifyCaptureResult();
        if (generation !== captureGeneration) {
          return;
        }
        setVerifyOutcome(
          outcome.ok ? { status: "success", result: outcome.result } : { status: "error", error: outcome.error },
        );
      } finally {
        await captureResultPromise;
        void blinkIdVerifyCore.terminate();
      }
    });

    /*
     * This callback is called when the frame is processed.
     * This is useful if you want to perform some actions on certain results.
     */
    uxManager.addOnFrameProcessCallback((frameProcessResult: BlinkIdVerifyProcessResult) => {
      //console.log("frame processed", frameProcessResult);
    });

    /*
     * Subscribe to the playback state.
     */
    const unsub = cameraManager.subscribe(
      (s) => s.playbackState,
      (state) => {
        /*
         * We wait until the video starts playing before we create the feedback UI
         * and start the frame capture. This also allows for the user to retry granting
         * camera permissions if they are not granted on the first try.
         */
        if (state === "playback") {
          /*
           * this creates the feedback UI and attaches it to the camera UI
           */
          createBlinkIdVerifyFeedbackUi(uxManager, cameraUi, {
            showOnboardingGuide: SHOW_ONBOARDING,
            /*
             * example of localization update
             */
            // localizationStrings: {
            //   scan_the_front_side: "Scan the front side of the ID card",
            // },
          });

          /*
           * if we are not showing the onboarding guide, we start the frame
           * capture manually otherwise, the user will be prompted to start the
           * frame capture
           */
          if (!SHOW_ONBOARDING) {
            void cameraManager.startFrameCapture();
          }

          setLoadState("ready");
          unsub(); // unsubscribe from the playback state
        }
      },
    );

    /*
     * Start the camera stream. This will start the camera stream and ask the user for camera permissions.
     */
    await cameraManager.startCameraStream({
      /*
       * This is an example of how to set the preferred camera.
       * In this case, we are setting the preferred camera to the first camera that contains "obs" in the name.
       */
      preferredCamera: (cameras) => {
        return cameras.find((camera) => camera.name.toLowerCase().includes("obs"));
      },
    });
  }

  onMount(() => {
    void init();
  });

  return (
    <div>
      <Show when={loadState() !== "ready"}>
        <button disabled={loadState() === "loading"} onClick={() => void init()}>
          Load
        </button>
      </Show>

      {/* Results */}
      <Show when={result()}>{(trimmedResult) => <DisplayBlinkIdVerifyResult result={trimmedResult()} />}</Show>
      <Show when={verifyOutcome()}>{(outcome) => <DisplayVerifyApiResult outcome={outcome()} />}</Show>
    </div>
  );
};

function DisplayBlinkIdVerifyResult(props: { result: BlinkIdVerifySessionResult }) {
  createEffect(() => {
    console.log(props.result);
  });

  const CreateImageSection = (props: { title: string; bytes: Uint8Array }) => {
    // Clone into a guaranteed-ArrayBuffer-backed typed array
    const url = createMemo(() => {
      const cloned = props.bytes.slice(); // Uint8Array.slice() creates new ArrayBuffer
      const blob = new Blob([cloned.buffer], { type: "image/jpeg" });
      const url = URL.createObjectURL(blob);
      return url;
    });

    return (
      <div style={{ margin: "20px 0px" }}>
        <div style={{ "font-weight": "bold", "margin-bottom": "8px" }}>{props.title}</div>
        <img style={{ "max-width": "300px" }} src={url()} onLoad={() => URL.revokeObjectURL(url())} />
      </div>
    );
  };

  return (
    <div>
      <Show when={props.result.serializedPayload.imageFirstSide}>
        {(image) => <CreateImageSection title="First Side" bytes={image().jpegBytes} />}
      </Show>
      <Show when={props.result.serializedPayload.imageSecondSide}>
        {(image) => <CreateImageSection title="Second Side" bytes={image().jpegBytes} />}
      </Show>
      <Show when={props.result.serializedPayload.imageBarcode}>
        {(image) => <CreateImageSection title="Barcode" bytes={image().jpegBytes} />}
      </Show>
    </div>
  );
}

function DisplayVerifyApiResult(props: { outcome: VerifyOutcome }) {
  return (
    <Switch>
      <Match when={props.outcome.status === "pending"}>
        <p>Submitting to the Verify API…</p>
      </Match>
      <Match when={props.outcome.status === "success" ? props.outcome.result : undefined}>
        {(result) => (
          <div>
            <h2>{result().verification.verdict}</h2>
            <pre>{JSON.stringify(result(), null, 2)}</pre>
          </div>
        )}
      </Match>
      <Match when={props.outcome.status === "error" ? props.outcome.error : undefined}>
        {(error) => (
          <div>
            <p>{error().message}</p>
            <Show when={error().status !== undefined}>
              <p>Status: {error().status}</p>
            </Show>
            <Show when={error().body !== undefined}>
              <pre>{JSON.stringify(error().body, null, 2)}</pre>
            </Show>
          </div>
        )}
      </Match>
    </Switch>
  );
}
