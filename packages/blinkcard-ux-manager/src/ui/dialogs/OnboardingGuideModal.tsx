/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { Modal } from "@microblink/shared-components/Modal";
import { createEffect, type Component } from "solid-js";
import { useBlinkCardUiStore } from "../BlinkCardUiStoreContext";

import CardNumberDesktop from "../assets/onboarding/card_number_desktop.svg?component-solid";
import CardNumber from "../assets/onboarding/card_number.svg?component-solid";

import styles from "./styles.module.scss";
import { DialogTitle } from "@ark-ui/solid";
import { useLocalization } from "../LocalizationContext";
import { Dynamic } from "solid-js/web";

/**
 * The OnboardingGuideModal component.
 *
 * @returns The OnboardingGuideModal component.
 */
export const OnboardingGuideModal: Component<{ isDesktop: boolean }> = (
  props,
) => {
  const { t } = useLocalization();

  const { store, updateStore } = useBlinkCardUiStore();

  const modalVisible = () => store.showOnboardingGuide;
  const hideModal = () => {
    updateStore({ showOnboardingGuide: false });
    void store.blinkCardUxManager.cameraManager.startFrameCapture();
  };

  createEffect(() => {
    if (modalVisible()) {
      void store.blinkCardUxManager.logOnboardingDisplayed();
    }
  });

  let startScanningBtnRef!: HTMLButtonElement;

  return (
    <Modal
      mountTarget={store.cameraManagerComponent.overlayLayerNode}
      open={modalVisible()}
      modalStyle="large"
    >
      <div class={styles.onboardingGuide}>
        <div class={styles.content}>
          <div class={styles.header}>
            <Dynamic
              component={props.isDesktop ? CardNumberDesktop : CardNumber}
              aria-hidden
            />
            <div class={styles.textContent}>
              <DialogTitle>{t.onboarding_modal.title}</DialogTitle>
              <p>
                {props.isDesktop
                  ? t.onboarding_modal.details_desktop
                  : t.onboarding_modal.details}
              </p>
            </div>
          </div>
        </div>
        <div class={styles.actions}>
          <button
            ref={startScanningBtnRef}
            class={styles.buttonPrimary}
            onClick={() => hideModal()}
          >
            {t.onboarding_modal.btn}
          </button>
        </div>
      </div>
    </Modal>
  );
};
