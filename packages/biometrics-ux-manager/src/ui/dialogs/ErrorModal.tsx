/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { Dialog } from "@ark-ui/solid";
import { Modal } from "@microblink/shared-components/Modal";
import { type Component, createSignal } from "solid-js";

import type { BiometricsErrorDialogCopy } from "../errorDialogs";
import { useLocalization } from "../LocalizationContext";

export type ErrorModalProps = {
  mountTarget: HTMLElement;
  open: boolean;
  isDesktop: boolean;
  copy: BiometricsErrorDialogCopy;
  onRetry: () => void;
  onExit: () => void;
};

export const ErrorModal: Component<ErrorModalProps> = (props) => {
  const { t } = useLocalization();

  const [primaryButton, setPrimaryButton] = createSignal<HTMLButtonElement | null>(null);

  return (
    <Modal
      mountTarget={props.mountTarget}
      open={props.open}
      modalStyle="default"
      contentClass={`mb-bio-dialog mb-bio-error-dialog ${
        props.isDesktop ? "mb-bio-dialog-desktop" : "mb-bio-dialog-mobile"
      }`}
      fluidScaleMode="width"
      showCloseButton={false}
      actionsLayout={props.isDesktop ? "inline" : "stacked"}
      initialFocusEl={() => primaryButton()}
      onEscapeKeyDown={props.onExit}
      actions={{
        primary: {
          label: props.copy.retryable ? t.error_dialogs.retry_btn : t.close,
          onClick: props.copy.retryable ? props.onRetry : props.onExit,
          ref: setPrimaryButton,
          class: "mb-bio-dialog-action",
        },
        ...(props.copy.retryable
          ? {
              secondary: {
                label: t.error_dialogs.cancel_btn,
                onClick: props.onExit,
                class: "mb-bio-dialog-action",
              },
            }
          : {}),
      }}
    >
      <div>
        <Dialog.Title class="mb-bio-dialog-title">{props.copy.title}</Dialog.Title>
        <Dialog.Description class={props.copy.showDescription ? "mb-bio-dialog-description" : "sr-only"}>
          {props.copy.description}
        </Dialog.Description>
      </div>
    </Modal>
  );
};
