/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/* @refresh reload */

import {
  type BlinkCardScanningResult,
  loadBlinkCardCore,
} from "@microblink/blinkcard-core";
import {
  createBlinkCardFeedbackUi,
  createBlinkCardUxManager,
  type BlinkCardUxManager,
} from "@microblink/blinkcard-ux-manager";
import {
  CameraManager,
  createCameraManagerUi,
} from "@microblink/camera-manager";
import { Component, createSignal, onMount, Show } from "solid-js";

/**
 * If you are using a portal, you can set this to true. Portal is a way to render the UI outside of the root element.
 * This is useful if you want to use the SDK in a modal or a popup.
 */
const USE_PORTAL = true;

/**
 * If the onboarding guide should be shown.
 */
const SHOW_ONBOARDING = true;

/**
 * This is the target node for the UI.
 */
const targetNode = !USE_PORTAL ? document.getElementById("root")! : undefined;

/**
 * This is the main component of the application.
 */
export const App: Component = () => {
  const [result, setResult] = createSignal<BlinkCardScanningResult>();
  const [blinkCardUxManager, setBlinkCardUxManager] =
    createSignal<BlinkCardUxManager>();
  const [loadState, setLoadState] = createSignal<
    "not-loaded" | "loading" | "ready"
  >("not-loaded");

  /**
   * Remove image payloads from results so JSON output is readable, and to prevent memory issues.
   */
  const resultWithoutImages = () => {
    const resultCopy = structuredClone(result());

    if (resultCopy?.firstSideResult?.cardImage) {
      delete resultCopy.firstSideResult.cardImage.image;
    }
    if (resultCopy?.secondSideResult?.cardImage) {
      delete resultCopy.secondSideResult.cardImage.image;
    }

    return resultCopy;
  };

  async function init() {
    setLoadState("loading");
    setResult(undefined);

    const blinkCardCore = await loadBlinkCardCore({
      licenseKey: import.meta.env.VITE_LICENCE_KEY,
    });

    const session = await blinkCardCore.createScanningSession({
      scanningSettings: {
        // skipImagesWithBlur: true,
      },
    });

    const cameraManager = new CameraManager();
    const uxManager = await createBlinkCardUxManager(cameraManager, session);
    uxManager.setTimeoutDuration(null);
    setBlinkCardUxManager(uxManager);

    const cameraUi = await createCameraManagerUi(cameraManager, targetNode, {
      showMirrorCameraButton: true,
    });

    cameraUi.addOnDismountCallback(() => {
      void blinkCardCore.terminate();
      setBlinkCardUxManager(undefined);
      setLoadState("not-loaded");
    });

    uxManager.addOnResultCallback((nextResult) => {
      setResult(nextResult);
      cameraUi.dismount();
    });

    const unsub = cameraManager.subscribe(
      (s) => s.playbackState,
      (state) => {
        if (state === "playback") {
          createBlinkCardFeedbackUi(uxManager, cameraUi, {
            showOnboardingGuide: SHOW_ONBOARDING,
            // localizationStrings: {
            //   scan_the_card_front: "Scan the front side of the card",
            // },
          });

          if (!SHOW_ONBOARDING) {
            void cameraManager.startFrameCapture();
          }

          setLoadState("ready");
          unsub();
        }
      },
    );

    await cameraManager.startCameraStream({
      // use this to force the camera to use a specific facing mode
      //   preferredFacing: "front",
      // use this to force the camera to use a specific camera
      //   preferredCamera: (cameras) => {
      //     return cameras.find((camera) =>
      //       // example how to find a camera by name
      //       camera.name.toLowerCase().includes("logitech"),
      //     );
      //   },
    });
  }

  onMount(() => {
    void init();
  });

  return (
    <div>
      <Show when={loadState() !== "ready"}>
        <button
          disabled={loadState() === "loading"}
          onClick={() => void init()}
        >
          Load
        </button>
      </Show>

      <Show when={resultWithoutImages()}>
        {(trimmedResult) => (
          <pre>{JSON.stringify(trimmedResult(), null, 2)}</pre>
        )}
      </Show>
    </div>
  );
};
