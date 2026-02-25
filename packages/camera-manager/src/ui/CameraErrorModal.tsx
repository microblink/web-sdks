/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { AlertModal } from "@microblink/shared-components/AlertModal";
import { Component } from "solid-js";
import { CameraError } from "../core/cameraError";
import { useCameraUiStore } from "./CameraUiStoreContext";
import { useLocalization } from "./LocalizationContext";
import { cameraUiRefSignalStore } from "./zustandRefStore";
import { Dialog } from "@ark-ui/solid";

/**
 * The CameraErrorModal component.
 */
const CameraErrorModal: Component = () => {
  const { t } = useLocalization();

  const { cameraManagerSolidStore, cameraManager, dismountCameraUi } =
    useCameraUiStore();
  const errorState = cameraManagerSolidStore((x) => x.errorState);
  const overlayLayer = cameraUiRefSignalStore((x) => x.overlayLayer);

  const isPermissionError = () => {
    const err = errorState();
    if (err instanceof CameraError && err.code === "PERMISSION_DENIED") {
      return true;
    } else {
      return false;
    }
  };

  const headerText = () => {
    if (isPermissionError()) {
      return t.camera_error_title;
    } else if (errorState()) {
      return errorState()!.name;
    } else {
      return "";
    }
  };

  const bodyText = () => {
    if (isPermissionError()) {
      return t.camera_error_details;
    } else if (errorState()) {
      return errorState()!.name;
    } else {
      return "";
    }
  };

  return (
    <>
      <AlertModal
        mountTarget={overlayLayer()}
        open={isPermissionError()}
        actions={{
          primary: {
            label: t.camera_error_primary_btn,
            onclick: () => void cameraManager.startCameraStream(),
          },
          secondary: {
            label: t.camera_error_cancel_btn,
            onclick: () => dismountCameraUi(),
          },
        }}
      >
        <Dialog.Title class="dialog-title">{headerText()}</Dialog.Title>
        <Dialog.Description class="dialog-description">
          <p>{bodyText()}</p>
        </Dialog.Description>
      </AlertModal>
    </>
  );
};

export { CameraErrorModal };
