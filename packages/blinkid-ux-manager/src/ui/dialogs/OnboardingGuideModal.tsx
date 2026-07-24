/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { Modal } from "@microblink/shared-components/Modal";
import { type Component, createEffect, on } from "solid-js";
import { useBlinkIdUiStore } from "../BlinkIdUiStoreContext";

import BarcodeOnly from "../assets/onboarding/barcode_only.svg?component-solid";
import BarcodeOnlyDesktop from "../assets/onboarding/barcode_only_desktop.svg?component-solid";
import CorrectFraming from "../assets/onboarding/correct_framing.svg?component-solid";
import CorrectFramingDesktop from "../assets/onboarding/correct_framing_desktop.svg?component-solid";
import DocumentWithBarcode from "../assets/onboarding/document_with_barcode.svg?component-solid";
import DocumentWithBarcodeDesktop from "../assets/onboarding/document_with_barcode_desktop.svg?component-solid";
import DocumentWithMrz from "../assets/onboarding/document_with_mrz.svg?component-solid";
import DocumentWithMrzDesktop from "../assets/onboarding/document_with_mrz_desktop.svg?component-solid";

import { Dialog } from "@ark-ui/solid";
import { Dynamic } from "solid-js/web";
import { useLocalization } from "../LocalizationContext";
import {
  type BlinkIdModalExtractionMode,
  type BlinkIdModalLocaleGroup,
} from "./modalExtractionMode";

type OnboardingImageComponent = typeof CorrectFraming;
type OnboardingImagePair = {
  mobile: OnboardingImageComponent;
  desktop: OnboardingImageComponent;
};

type OnboardingModalContent = {
  localeGroup: BlinkIdModalLocaleGroup;
  images: OnboardingImagePair;
};

export const onboardingModalContentByExtractionMode = {
  "full-document": {
    localeGroup: "full_document",
    images: {
      mobile: CorrectFraming,
      desktop: CorrectFramingDesktop,
    },
  },
  "document-with-barcode": {
    localeGroup: "document_with_barcode",
    images: {
      mobile: DocumentWithBarcode,
      desktop: DocumentWithBarcodeDesktop,
    },
  },
  "barcode-only": {
    localeGroup: "barcode_only",
    images: {
      mobile: BarcodeOnly,
      desktop: BarcodeOnlyDesktop,
    },
  },
  "document-with-mrz": {
    localeGroup: "document_with_mrz",
    images: {
      mobile: DocumentWithMrz,
      desktop: DocumentWithMrzDesktop,
    },
  },
} as const satisfies Record<BlinkIdModalExtractionMode, OnboardingModalContent>;

/**
 * The OnboardingGuideModal component.
 *
 * @returns The OnboardingGuideModal component.
 */
export const OnboardingGuideModal: Component<{
  isDesktop: boolean;
  extractionMode: BlinkIdModalExtractionMode;
}> = (props) => {
  const { t } = useLocalization();

  const { store, updateStore } = useBlinkIdUiStore();

  const modalVisible = () => store.showOnboardingGuide;
  const hideModal = () => {
    updateStore({ showOnboardingGuide: false });
  };
  const modalContent = () =>
    onboardingModalContentByExtractionMode[props.extractionMode];
  const content = () => t.onboarding_modal[modalContent().localeGroup];
  const image = () =>
    modalContent().images[props.isDesktop ? "desktop" : "mobile"];

  createEffect(
    on(
      () => modalVisible(),
      (open) => {
        if (open) {
          void store.blinkIdUxManager.analytics.logOnboardingDisplayedEvent();
        }
      },
    ),
  );

  return (
    <Modal
      mountTarget={store.cameraManagerComponent.overlayLayerNode}
      open={modalVisible()}
      modalStyle="large"
      role="alertdialog"
      aria-label={t.onboarding_modal.aria}
      actions={{
        primary: {
          label: t.onboarding_modal.btn,
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
              component={image()}
              aria-hidden="true"
              class="w-full max-w-[17.5rem] m-x-auto compact:col-start-1
                compact:self-start compact:max-w-[11.25rem]"
            />
            <div
              class="compact:col-start-2 compact:min-h-0 compact:h-full
                compact:overflow-y-auto"
            >
              <Dialog.Title class="dialog-title compact:!text-left">
                {props.isDesktop ? content().title_desktop : content().title}
              </Dialog.Title>
              <Dialog.Description class="dialog-description compact:!text-left">
                <p>
                  {props.isDesktop
                    ? content().details_desktop
                    : content().details}
                </p>
              </Dialog.Description>
            </div>
          </article>
        </div>
      </div>
    </Modal>
  );
};
