/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { cameraManagerStore } from "@microblink/camera-manager/core";
import { FlashlightWarning } from "@microblink/shared-components/FlashlightWarning";
import { SmartEnvironmentProvider } from "@microblink/shared-components/SmartEnvironmentProvider";
import type { Component } from "solid-js";
import { createEffect, createSignal, Match, onCleanup, onMount, Show, Switch } from "solid-js";
import { create } from "solid-zustand";

import { BlinkIdVerifyUiState } from "../core/blinkid-verify-ui-state";
import DemoOverlay from "./assets/demo-overlay.svg?component-solid";
import MicroblinkOverlay from "./assets/microblink.svg?component-solid";

// this triggers extraction of CSS from the UnoCSS plugin
import "virtual:uno.css";

import { useBlinkIdVerifyUiStore } from "./BlinkIdVerifyUiStoreContext";
import { ErrorModal } from "./dialogs/ErrorModal";
import { HelpButton, HelpModal } from "./dialogs/HelpModal";
import { OnboardingGuideModal } from "./dialogs/OnboardingGuideModal";
import { LocalizationProvider, PartialLocalizationStrings, useLocalization } from "./LocalizationContext";
import { UiFeedbackOverlay } from "./UiFeedbackOverlay";

/**
 * The BlinkIdVerifyFeedbackUi component. This is the main component that renders the feedback UI for the BlinkID Verify
 * SDK. It is responsible for rendering the feedback UI, the overlays, and the help button.
 *
 * @param props - The props for the BlinkIdVerifyFeedbackUi component.
 * @returns The BlinkIdVerifyFeedbackUi component.
 */
export const BlinkIdVerifyFeedbackUi: Component<{
  localization?: PartialLocalizationStrings;
}> = (props) => {
  const { store, updateStore } = useBlinkIdVerifyUiStore();

  // `blinkIdVerifyUxManager` is not reactive, so we need to create a new signal for
  // the UI state. This is a hacky way to make the UI state reactive.
  const [uiState, setUiState] = createSignal<BlinkIdVerifyUiState>(store.blinkIdVerifyUxManager.uiState);

  // Handle errors during scanning
  const errorCallbackCleanup = store.blinkIdVerifyUxManager.addOnErrorCallback((errorState) => {
    updateStore({ errorState });
  });

  onMount(() => {
    const cleanupDismountCallback = store.cameraManagerComponent.addOnDismountCallback(() => {
      cleanupDismountCallback();

      // if not user-initiated, it's a regular dismount, not a button-click,
      // so we early exit.

      // TODO: test if this store proxies capture values in a closure on declaration
      if (!store.cameraManagerComponent.cameraManager.userInitiatedAbort) {
        return;
      }

      void store.blinkIdVerifyUxManager.analytics.logCloseButtonClickedEvent();
    });
  });

  const playbackState = create(cameraManagerStore)((s) => s.playbackState);
  const torchEnabled = create(cameraManagerStore)((s) => s.selectedCamera?.torchEnabled ?? false);

  // assume modal is displayed on camera error
  const cameraErrorState = create(cameraManagerStore)((s) => s.errorState);

  const isProcessing = () => playbackState() === "capturing";

  // Processing is stopped, but we still want to show the feedback
  const shouldShowFeedback = () => !isModalOpen();

  const displayTimeoutModal = () => Boolean(store.showTimeoutModal) && store.errorState === "timeout";

  const displayUnsupportedDocumentModal = () =>
    Boolean(store.showUnsupportedDocumentModal) && store.errorState === "unsupported_document";

  const displayDocumentFilteredModal = () => Boolean(store.showDocumentFilteredModal) && store.documentFiltered;

  const isModalOpen = () => {
    return (
      displayTimeoutModal() ||
      displayDocumentFilteredModal() ||
      displayUnsupportedDocumentModal() ||
      // TODO: Unify modal dialogs in blinkid-verify UX manager
      Boolean(store.showOnboardingGuide) ||
      Boolean(store.showHelpModal) ||
      // camera manager
      Boolean(cameraErrorState())
    );
  };

  createEffect((previous: boolean) => {
    if (isModalOpen() === previous) return previous;

    if (!isModalOpen()) {
      void store.blinkIdVerifyUxManager.cameraManager.startFrameCapture();
      store.blinkIdVerifyUxManager.startUiUpdateLoop();
    } else {
      void store.blinkIdVerifyUxManager.cameraManager.stopFrameCapture();
      store.blinkIdVerifyUxManager.stopUiUpdateLoop();
    }

    return isModalOpen();
  }, isModalOpen());

  const shouldShowDemoOverlay = () => {
    return store.blinkIdVerifyUxManager.showDemoOverlay;
  };

  const shouldShowProductionOverlay = () => {
    return store.blinkIdVerifyUxManager.showProductionOverlay;
  };

  const removeUiStateChangeCallback = store.blinkIdVerifyUxManager.addOnUiStateChangedCallback(setUiState);

  onCleanup(() => {
    removeUiStateChangeCallback();
    errorCallbackCleanup();
    //documentFilteredCallbackCleanup();
  });

  const isDesktop = () => {
    return store.blinkIdVerifyUxManager.deviceInfo?.derivedDeviceInfo.formFactors.includes("Desktop");
  };

  createEffect(() => {
    if (displayTimeoutModal()) {
      void store.blinkIdVerifyUxManager.analytics.logAlertDisplayedEvent("StepTimeout");
    }
  });

  createEffect(() => {
    if (displayUnsupportedDocumentModal()) {
      void store.blinkIdVerifyUxManager.analytics.logAlertDisplayedEvent("DocumentNotSupported");
    }
  });

  return (
    <div>
      <style
        id="blinkid-verify-ux-manager-style"
        ref={(ref) => {
          if (window.__blinkidVerifyUxManagerCssCode) {
            ref.innerHTML = window.__blinkidVerifyUxManagerCssCode;
          }
        }}
      />
      <LocalizationProvider userStrings={props.localization}>
        <SmartEnvironmentProvider>
          {() => {
            const { t } = useLocalization();

            // update camera manager dialog title localization
            store.cameraManagerComponent.updateLocalization({
              dialog_title: t.sdk_aria,
            });

            return (
              <>
                <Switch>
                  <Match when={displayTimeoutModal()}>
                    <ErrorModal
                      header={t.timeout_modal.title}
                      text={t.timeout_modal.details}
                      shouldResetScanningSession={true}
                    />
                  </Match>
                  <Match when={displayUnsupportedDocumentModal()}>
                    <ErrorModal
                      header={t.document_not_recognized_modal.title}
                      text={t.document_not_recognized_modal.details}
                      shouldResetScanningSession={true}
                    />
                  </Match>
                  <Match when={displayDocumentFilteredModal()}>
                    <ErrorModal
                      header={t.document_filtered_modal.title}
                      text={t.document_filtered_modal.details}
                      shouldResetScanningSession={true}
                    />
                  </Match>
                </Switch>

                <Show when={shouldShowFeedback()}>
                  <UiFeedbackOverlay uiState={uiState()} isDesktop={isDesktop()} />
                </Show>

                <Show when={shouldShowDemoOverlay()}>
                  <div
                    class="absolute top-[15%] flex justify-center items-center
                      w-full"
                  >
                    <DemoOverlay width="250" aria-hidden="true" />
                  </div>
                </Show>

                <Show when={shouldShowProductionOverlay()}>
                  <div
                    class="absolute bottom-4 flex justify-center items-center
                      w-full"
                  >
                    <MicroblinkOverlay width="100" aria-hidden="true" />
                  </div>
                </Show>

                <Show when={store.showHelpButton}>
                  <HelpButton isProcessing={isProcessing()} />
                </Show>

                <FlashlightWarning
                  enabled={torchEnabled()}
                  visible={shouldShowFeedback()}
                  message={t.flashlight_warning_message}
                />
              </>
            );
          }}
        </SmartEnvironmentProvider>

        <OnboardingGuideModal isDesktop={isDesktop()} />
        <HelpModal isDesktop={isDesktop()} />
      </LocalizationProvider>
    </div>
  );
};
