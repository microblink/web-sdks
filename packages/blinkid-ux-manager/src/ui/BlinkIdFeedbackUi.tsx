/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { cameraManagerStore } from "@microblink/camera-manager";
import { SmartEnvironmentProvider } from "@microblink/shared-components/SmartEnvironmentProvider";
import type { Component } from "solid-js";
import {
  createEffect,
  createSignal,
  Match,
  onCleanup,
  onMount,
  Show,
  Switch,
} from "solid-js";
import { createWithSignal } from "solid-zustand";
import {
  blinkIdPageTransitionKeys,
  blinkIdUiIntroStateKeys,
  BlinkIdUiState,
  BlinkIdUiStateKey,
  blinkIdUiStepSuccessKeys,
} from "../core/blinkid-ui-state";
import {
  LocalizationProvider,
  LocalizationStrings,
  useLocalization,
} from "./LocalizationContext";
import { UiFeedbackOverlay } from "./UiFeedbackOverlay";

// this triggers extraction of CSS from the UnoCSS plugin
import "virtual:uno.css";

import DemoOverlay from "./assets/demo-overlay.svg?component-solid";
import MicroblinkOverlay from "./assets/microblink.svg?component-solid";
import { useBlinkIdUiStore } from "./BlinkIdUiStoreContext";
import { ErrorModal } from "./dialogs/ErrorModal";
import { HelpButton, HelpModal } from "./dialogs/HelpModal";
import { OnboardingGuideModal } from "./dialogs/OnboardingGuideModal";

/**
 * The BlinkIdFeedbackUi component. This is the main component that renders the
 * feedback UI for the BlinkID SDK. It is responsible for rendering the feedback
 * UI, the overlays, and the help button.
 *
 * @param props - The props for the BlinkIdFeedbackUi component.
 * @returns The BlinkIdFeedbackUi component.
 */
export const BlinkIdFeedbackUi: Component<{
  localization?: Partial<LocalizationStrings>;
}> = (props) => {
  const { store, updateStore } = useBlinkIdUiStore();

  // `blinkIdUxManager` is not reactive, so we need to create a new signal for
  // the UI state. This is a hacky way to make the UI state reactive.
  const [uiState, setUiState] = createSignal<BlinkIdUiState>(
    store.blinkIdUxManager.uiState,
  );

  // Handle errors during scanning
  const errorCallbackCleanup = store.blinkIdUxManager.addOnErrorCallback(
    (errorState) => {
      updateStore({ errorState });
    },
  );

  onMount(() => {
    const cleanupDismountCallback =
      store.cameraManagerComponent.addOnDismountCallback(() => {
        cleanupDismountCallback();

        // if not user-initiated, it's a regular dismount, not a button-click,
        // so we early exit.

        // TODO: test if this store proxies capture values in a closure on declaration
        if (!store.cameraManagerComponent.cameraManager.userInitiatedAbort) {
          return;
        }

        void store.blinkIdUxManager.analytics.logCloseButtonClickedEvent();
      });
  });

  // Handle document filtered during scanning
  const documentFilteredCallbackCleanup =
    store.blinkIdUxManager.addOnDocumentFilteredCallback(() => {
      updateStore({ documentFiltered: true });
      void store.blinkIdUxManager.analytics.logAlertDisplayedEvent(
        "DocumentClassNotAllowed",
      );
    });

  const playbackState = createWithSignal(cameraManagerStore)(
    (s) => s.playbackState,
  );

  // assume modal is displayed on camera error
  const cameraErrorState = createWithSignal(cameraManagerStore)(
    (s) => s.errorState,
  );

  const isProcessing = () => playbackState() === "capturing";

  /**
   * These UI states pause frame processing, however we treat them as if we are
   * still in processing state from a UX perspective
   */
  const pseudoProcessingKeys: BlinkIdUiStateKey[] = [
    ...blinkIdUiIntroStateKeys,
    ...blinkIdPageTransitionKeys,
    ...blinkIdUiStepSuccessKeys,
  ];

  // Processing is stopped, but we still want to show the feedback
  const shouldShowFeedback = () => {
    return (
      // processing + pseudo-processing
      (isProcessing() || pseudoProcessingKeys.includes(uiState().key)) &&
      // never show while modal is open
      !isModalOpen()
    );
  };

  const displayTimeoutModal = () =>
    Boolean(store.showTimeoutModal) && store.errorState === "timeout";

  const displayUnsupportedDocumentModal = () =>
    Boolean(store.showUnsupportedDocumentModal) &&
    store.errorState === "unsupported_document";

  const displayDocumentFilteredModal = () =>
    Boolean(store.showDocumentFilteredModal) && store.documentFiltered;

  const isModalOpen = () => {
    return (
      displayTimeoutModal() ||
      displayDocumentFilteredModal() ||
      displayUnsupportedDocumentModal() ||
      // TODO: Unify modal dialogs in blinkid UX manager
      Boolean(store.showOnboardingGuide) ||
      Boolean(store.showHelpModal) ||
      // camera manager
      Boolean(cameraErrorState())
    );
  };

  createEffect(() => {
    if (!isModalOpen()) {
      void store.blinkIdUxManager.cameraManager.startFrameCapture();
      store.blinkIdUxManager.startUiUpdateLoop();
    } else {
      void store.blinkIdUxManager.cameraManager.stopFrameCapture();
      store.blinkIdUxManager.stopUiUpdateLoop();
    }
  });

  const shouldShowDemoOverlay = () => {
    return store.blinkIdUxManager.showDemoOverlay;
  };

  const shouldShowProductionOverlay = () => {
    return store.blinkIdUxManager.showProductionOverlay;
  };

  const removeUiStateChangeCallback =
    store.blinkIdUxManager.addOnUiStateChangedCallback(setUiState);

  onCleanup(() => {
    removeUiStateChangeCallback();
    errorCallbackCleanup();
    documentFilteredCallbackCleanup();
  });

  const isDesktop = () => {
    return store.blinkIdUxManager.deviceInfo?.derivedDeviceInfo.formFactors.includes(
      "Desktop",
    );
  };

  createEffect(() => {
    if (displayTimeoutModal()) {
      void store.blinkIdUxManager.analytics.logAlertDisplayedEvent(
        "StepTimeout",
      );
    }
  });

  return (
    <div>
      <style
        id="blinkid-ux-manager-style"
        ref={(ref) => {
          if (window.__blinkidUxManagerCssCode) {
            ref.innerHTML = window.__blinkidUxManagerCssCode;
          }
        }}
      />
      <LocalizationProvider userStrings={props.localization}>
        <SmartEnvironmentProvider>
          {() => {
            const { t } = useLocalization();

            // update camera manager dialog title localization
            store.cameraManagerComponent.updateLocalization({
              dialog_title: t.scanning_screen,
            });

            return (
              <>
                <Switch>
                  <Match when={displayTimeoutModal()}>
                    <ErrorModal
                      header={t.scan_unsuccessful}
                      text={t.scan_unsuccessful_details}
                      shouldResetScanningSession={true}
                    />
                  </Match>
                  <Match when={displayUnsupportedDocumentModal()}>
                    <ErrorModal
                      header={t.document_not_recognized}
                      text={t.document_not_recognized_details}
                      shouldResetScanningSession={true}
                    />
                  </Match>
                  <Match when={displayDocumentFilteredModal()}>
                    <ErrorModal
                      header={t.document_filtered}
                      text={t.document_filtered_details}
                      shouldResetScanningSession={true}
                    />
                  </Match>
                </Switch>

                <Show when={shouldShowFeedback()}>
                  <UiFeedbackOverlay
                    uiState={uiState()}
                    isDesktop={isDesktop()}
                  />
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
