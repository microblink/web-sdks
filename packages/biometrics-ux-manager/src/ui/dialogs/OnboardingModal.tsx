/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { Modal } from "@microblink/shared-components/Modal";
import { type Component, createUniqueId } from "solid-js";

import OnboardingIllustration from "../assets/dialogs/onboarding.svg?component-solid";
import { useLocalization } from "../LocalizationContext";

export type OnboardingModalProps = {
  mountTarget: HTMLElement;
  open: boolean;
  isDesktop: boolean;
  onStart: () => void;
  onCancel: () => void;
};

export const OnboardingModal: Component<OnboardingModalProps> = (props) => {
  const { t } = useLocalization();

  const descriptionId = createUniqueId();

  let titleEl: HTMLHeadingElement | null = null;

  return (
    <Modal
      mountTarget={props.mountTarget}
      open={props.open}
      aria-label={t.onboarding_modal.aria}
      modalStyle="default"
      contentClass={`mb-bio-dialog mb-bio-onboarding-dialog ${
        props.isDesktop ? "mb-bio-dialog-desktop" : "mb-bio-dialog-mobile"
      }`}
      fluidScaleMode="width"
      initialFocusEl={() => titleEl}
      showCloseButton={false}
      onEscapeKeyDown={props.onCancel}
      actions={{
        primary: {
          label: t.onboarding_modal.start_btn,
          onClick: props.onStart,
          class: "mb-bio-dialog-action",
        },
      }}
    >
      <div class="mb-bio-dialog-layout grid h-full min-h-0 gap-4 text-center">
        <div
          aria-hidden="true"
          class="mb-bio-dialog-visual mx-auto grid h-full min-h-0 w-full
            max-w-[17.5rem] place-items-center overflow-hidden"
        >
          <OnboardingIllustration
            viewBox="0 0 270 197"
            class="mb-bio-dialog-illustration block h-auto max-h-full w-auto
              max-w-full"
          />
        </div>
        <div>
          <h2
            ref={(el) => (titleEl = el)}
            tabIndex={-1}
            aria-describedby={descriptionId}
            class="mb-bio-dialog-title outline-none"
          >
            {t.onboarding_modal.title}
          </h2>
          <p id={descriptionId} class="mb-bio-dialog-description">
            {t.onboarding_modal.details}
          </p>
        </div>
      </div>
    </Modal>
  );
};
