/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { Dialog } from "@ark-ui/solid";
import { AlertModal } from "@microblink/shared-components/Modal";
import { type Component } from "solid-js";
import { useBlinkCardUiStore } from "../BlinkCardUiStoreContext";
import { useLocalization } from "../LocalizationContext";

/**
 * The props for the ErrorModal component.
 */
interface ErrorModalProps {
  header: string;
  text: string;
  shouldResetScanningSession?: boolean;
}

/**
 * The ErrorModal component.
 *
 * @param props - The props for the ErrorModal component.
 * @returns The ErrorModal component.
 */
export const ErrorModal: Component<ErrorModalProps> = (props) => {
  const { t } = useLocalization();

  const { store, updateStore } = useBlinkCardUiStore();

  const hideModal = () => {
    updateStore({ errorState: undefined });
  };

  const dismountCameraManagerUi = () => {
    store.cameraManagerComponent.dismount();
  };

  const handlePrimaryClick = async () => {
    hideModal();

    if (props.shouldResetScanningSession) {
      await store.blinkCardUxManager.resetScanningSession(true);
    }
  };

  return (
    <AlertModal
      mountTarget={store.cameraManagerComponent.overlayLayerNode}
      open={true}
      actions={{
        primary: {
          label: t.timeout_modal.retry_btn,
          onClick: () => void handlePrimaryClick(),
        },
        secondary: {
          label: t.timeout_modal.cancel_btn,
          onClick: () => dismountCameraManagerUi(),
        },
      }}
    >
      <Dialog.Title class="dialog-title">{props.header}</Dialog.Title>
      <Dialog.Description class="dialog-description">
        <p>{props.text}</p>
      </Dialog.Description>
    </AlertModal>
  );
};
