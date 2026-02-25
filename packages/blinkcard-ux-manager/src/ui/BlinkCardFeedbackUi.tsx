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
  blinkCardPageTransitionKeys,
  blinkCardUiIntroStateKeys,
  BlinkCardUiState,
  BlinkCardUiStateKey,
  blinkCardUiSuccessKeys,
} from "../core/blinkcard-ui-state";
import {
  LocalizationProvider,
  PartialLocalizationStrings,
  useLocalization,
} from "./LocalizationContext";
import { UiFeedbackOverlay } from "./UiFeedbackOverlay";

// this triggers extraction of CSS from the UnoCSS plugin
import "virtual:uno.css";

import DemoOverlay from "./assets/demo-overlay.svg?component-solid";
import MicroblinkOverlay from "./assets/microblink.svg?component-solid";
import { useBlinkCardUiStore } from "./BlinkCardUiStoreContext";
import { ErrorModal } from "./dialogs/ErrorModal";
import { HelpButton, HelpModal } from "./dialogs/HelpModal";
import { OnboardingGuideModal } from "./dialogs/OnboardingGuideModal";

/**
 * The BlinkCardFeedbackUi component. This is the main component that renders the
 * feedback UI for the BlinkCard SDK. It is responsible for rendering the feedback
 * UI, the overlays, and the help button.
 *
 * @param props - The props for the BlinkCardFeedbackUi component.
 * @returns The BlinkCardFeedbackUi component.
 */
export const BlinkCardFeedbackUi: Component<{
  localization?: PartialLocalizationStrings;
}> = (props) => {
  const { store, updateStore } = useBlinkCardUiStore();

  // `blinkCardUxManager` is not reactive, so we need to create a new signal for
  // the UI state. This is a hacky way to make the UI state reactive.
  const [uiState, setUiState] = createSignal<BlinkCardUiState>(
    store.blinkCardUxManager.uiState,
  );

  // Handle errors during scanning
  const errorCallbackCleanup = store.blinkCardUxManager.addOnErrorCallback(
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
        if (!store.cameraManagerComponent.cameraManager.userInitiatedAbort) {
          return;
        }

        void store.blinkCardUxManager.logCloseButtonClicked();
      });
  });

  const playbackState = createWithSignal(cameraManagerStore)(
    (s) => s.playbackState,
  );

  const cameraErrorState = createWithSignal(cameraManagerStore)(
    (s) => s.errorState,
  );

  const isProcessing = () => playbackState() === "capturing";

  /**
   * These UI states pause frame processing, however we treat them as if we are
   * still in processing state from a UX perspective
   */
  const pseudoProcessingKeys: BlinkCardUiStateKey[] = [
    ...blinkCardUiIntroStateKeys,
    ...blinkCardPageTransitionKeys,
    ...blinkCardUiSuccessKeys,
  ];

  // Processing is stopped, but we still want to show the feedback
  const shouldShowFeedback = () => {
    return isProcessing() || pseudoProcessingKeys.includes(uiState().key);
  };

  const displayTimeoutModal = () =>
    Boolean(store.showTimeoutModal) && store.errorState === "timeout";

  const isModalOpen = () => {
    return (
      displayTimeoutModal() ||
      Boolean(store.showOnboardingGuide) ||
      Boolean(store.showHelpModal) ||
      // camera manager
      Boolean(cameraErrorState())
    );
  };

  createEffect(() => {
    if (!isModalOpen()) {
      void store.blinkCardUxManager.cameraManager.startFrameCapture();
      store.blinkCardUxManager.startUiUpdateLoop();
    } else {
      void store.blinkCardUxManager.cameraManager.stopFrameCapture();
      store.blinkCardUxManager.stopUiUpdateLoop();
    }
  });

  const shouldShowDemoOverlay = () => {
    return store.blinkCardUxManager.getShowDemoOverlay();
  };

  const shouldShowProductionOverlay = () => {
    return store.blinkCardUxManager.getShowProductionOverlay();
  };

  const removeUiStateChangeCallback =
    store.blinkCardUxManager.addOnUiStateChangedCallback(setUiState);

  onCleanup(() => {
    removeUiStateChangeCallback();
    errorCallbackCleanup();
  });

  const isDesktop = () => {
    return store.blinkCardUxManager.deviceInfo.derivedDeviceInfo.formFactors.includes(
      "Desktop",
    );
  };

  createEffect(() => {
    if (displayTimeoutModal()) {
      void store.blinkCardUxManager.logAlertDisplayed("StepTimeout");
    }
  });

  return (
    <div>
      <style
        id="blinkcard-ux-manager-style"
        ref={(ref) => {
          if (window.__blinkcardUxManagerCssCode) {
            ref.innerHTML = window.__blinkcardUxManagerCssCode;
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
