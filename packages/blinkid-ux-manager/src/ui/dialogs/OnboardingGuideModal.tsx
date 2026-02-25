/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { Modal } from "@microblink/shared-components/Modal";
import { type Component, createEffect, on } from "solid-js";
import { useBlinkIdUiStore } from "../BlinkIdUiStoreContext";

import CorrectFraming from "../assets/onboarding/correct_framing.svg?component-solid";
import CorrectFramingDesktop from "../assets/onboarding/correct_framing_desktop.svg?component-solid";

import { Dialog } from "@ark-ui/solid";
import { Dynamic } from "solid-js/web";
import { useLocalization } from "../LocalizationContext";

/**
 * The OnboardingGuideModal component.
 *
 * @returns The OnboardingGuideModal component.
 */
export const OnboardingGuideModal: Component<{ isDesktop: boolean }> = (
  props,
) => {
  const { t } = useLocalization();

  const { store, updateStore } = useBlinkIdUiStore();

  const modalVisible = () => store.showOnboardingGuide;
  const hideModal = () => {
    updateStore({ showOnboardingGuide: false });
  };

  createEffect(
    on(
      () => modalVisible(),
      (open) => {
        if (open) {
          void store.blinkIdUxManager.analytics.logOnboardingDisplayedEvent();
        }
      },
      { defer: true },
    ),
  );

  return (
    <Modal
      mountTarget={store.cameraManagerComponent.overlayLayerNode}
      open={modalVisible()}
      modalStyle="large"
      role="alertdialog"
      aria-label={t.scanning_instructions}
      actions={{
        primary: {
          label: t.onboarding_modal_btn,
          onClick: () => hideModal(),
        },
      }}
    >
      <div role="region" class="h-full min-h-0">
        <div class="h-full min-h-0 overflow-y-auto compact:overflow-hidden">
          <article
            class="grid grid-cols-1 gap-2 min-h-0 compact:h-full
              compact:grid-cols-[minmax(7rem,11.25rem)_minmax(0,1fr)]
              compact:grid-rows-[minmax(0,1fr)]"
          >
            <Dynamic
              component={
                props.isDesktop ? CorrectFramingDesktop : CorrectFraming
              }
              aria-hidden="true"
              class="w-full max-w-[17.5rem] m-x-auto compact:col-start-1
                compact:self-start compact:max-w-[11.25rem]"
            />
            <div
              class="compact:col-start-2 compact:min-h-0 compact:h-full
                compact:overflow-y-auto"
            >
              <Dialog.Title class="dialog-title compact:!text-left">
                {props.isDesktop
                  ? t.onboarding_modal_title_desktop
                  : t.onboarding_modal_title}
              </Dialog.Title>
              <Dialog.Description class="dialog-description compact:!text-left">
                <p>
                  {props.isDesktop
                    ? t.onboarding_modal_details_desktop
                    : t.onboarding_modal_details}
                </p>
              </Dialog.Description>
            </div>
          </article>
        </div>
      </div>
    </Modal>
  );
};
