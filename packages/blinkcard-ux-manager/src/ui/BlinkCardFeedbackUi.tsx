/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { cameraManagerStore } from "@microblink/camera-manager";
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
  BlinkCardUiState,
  firstSideCapturedUiStateKeys,
} from "../core/blinkcard-ui-state";
import {
  LocalizationProvider,
  PartialLocalizationStrings,
  useLocalization,
} from "./LocalizationContext";
import { UiFeedbackOverlay } from "./UiFeedbackOverlay";

// this triggers extraction of CSS from the UnoCSS plugin
import "virtual:uno.css";

import { SmartEnvironmentProvider } from "@microblink/shared-components/SmartEnvironmentProvider";
import DemoOverlay from "./assets/demo-overlay.svg?component-solid";
import MicroblinkOverlay from "./assets/microblink.svg?component-solid";
import { useBlinkCardUiStore } from "./BlinkCardUiStoreContext";
import { ErrorModal } from "./dialogs/ErrorModal";
import { HelpButton, HelpModal } from "./dialogs/HelpModal";
import { OnboardingGuideModal } from "./dialogs/OnboardingGuideModal";

import styles from "./styles.module.scss";

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
  createEffect(() => {
    const errorCallbackCleanup = store.blinkCardUxManager.addOnErrorCallback(
      (errorState) => {
        updateStore({ errorState });
      },
    );
    onCleanup(() => errorCallbackCleanup());
  });

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

  const isProcessing = () => playbackState() === "capturing";

  // Processing is stopped, but we still want to show the feedback
  const shouldShowFeedback = () => {
    return (
      isProcessing() ||
      firstSideCapturedUiStateKeys.includes(uiState().key) ||
      uiState().key === "CARD_CAPTURED"
    );
  };

  const displayTimeoutModal = () =>
    store.showTimeoutModal && store.errorState === "timeout";

  const shouldShowDemoOverlay = () => {
    return store.blinkCardUxManager.getShowDemoOverlay();
  };

  const shouldShowProductionOverlay = () => {
    return store.blinkCardUxManager.getShowProductionOverlay();
  };

  const handleUiStateChange = (newUiState: BlinkCardUiState) => {
    setUiState(newUiState);
  };

  createEffect(() => {
    const removeUiStateChangeCallback =
      store.blinkCardUxManager.addOnUiStateChangedCallback(handleUiStateChange);

    onCleanup(() => removeUiStateChangeCallback());
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

            return (
              <>
                <Switch>
                  <Match when={displayTimeoutModal()}>
                    <ErrorModal
                      header={t.timeout_modal.title}
                      text={t.timeout_modal.details}
                      primaryButtonText={t.timeout_modal.retry_btn}
                      secondaryButtonText={t.timeout_modal.cancel_btn}
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
                  <div class={styles.demoOverlay}>
                    <DemoOverlay width="250" aria-hidden />
                  </div>
                </Show>

                <Show when={shouldShowProductionOverlay()}>
                  <div class={styles.microblinkOverlay}>
                    <MicroblinkOverlay width="100" aria-hidden />
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
