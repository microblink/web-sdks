/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { CameraManager } from "@microblink/camera-manager/core";
import { createContext, onCleanup, ParentComponent, useContext } from "solid-js";
import { MountableElement } from "solid-js/web";
import { create } from "solid-zustand";

import { cameraManagerStore } from "../core";
import type { DismountCallback } from "./createCameraManagerUi";

/** The CameraUiStoreContext. */
const CameraUiStoreContext = createContext<CameraUiStore>();

/** Creates a camera manager solid store. */
function createCameraManagerSolidStore() {
  return create(cameraManagerStore);
}

/**
 * !IMPORTANT: this is not a reactive store. It's just a plain javascript object exposed as a context. The store is
 * `cameraManagerSolidStore`, and it doesn't have anything related to the Camera Manager UI component
 */
type CameraUiStore = {
  /** Function which will dismount the component */
  dismountCameraUi: () => void;

  /** The camera manager. */
  cameraManager: CameraManager;

  /** This is the camera manager zustand store converted to SolidJS' signal store via `solid-zustand` */
  cameraManagerSolidStore: ReturnType<typeof createCameraManagerSolidStore>;

  /** The mountable HTML element. */
  mountTarget: MountableElement;

  /** Whether to show the mirror camera button */
  showMirrorCameraButton: boolean;
  /** Whether to show the camera selector */
  showCameraSelector: boolean;
  /** Whether to show the torch button */
  showTorchButton: boolean;
  /** Whether to show the close button */
  showCloseButton: boolean;
  /** Whether to show the camera error modal */
  showCameraErrorModal: boolean;
  /** The z-index of the camera UI */
  zIndex?: number;
  /**
   * Sets a callback to be called when the component is unmounted. Returns a cleanup function that removes the callback
   * when called.
   */
  addOnDismountCallback: (fn: DismountCallback) => () => void;
};

/** The CameraUiStoreProvider component. */
export const CameraUiStoreProvider: ParentComponent<{
  dismountCameraUi: () => void;
  cameraManager: CameraManager;
  mountTarget: MountableElement;
  showMirrorCameraButton: boolean;
  showCameraSelector: boolean;
  showTorchButton: boolean;
  showCloseButton: boolean;
  showCameraErrorModal: boolean;
  zIndex?: number;
  addOnDismountCallback: (fn: DismountCallback) => () => void;
}> = (props) => {
  // initial context value
  const contextValue: CameraUiStore = {
    cameraManagerSolidStore: createCameraManagerSolidStore(),
    // oxlint-disable-next-line solid/reactivity
    cameraManager: props.cameraManager,
    // oxlint-disable-next-line solid/reactivity
    dismountCameraUi: () => {
      props.cameraManager.userInitiatedAbort = true;
      props.dismountCameraUi();
    },
    // oxlint-disable-next-line solid/reactivity
    addOnDismountCallback: props.addOnDismountCallback,
    // oxlint-disable-next-line solid/reactivity
    mountTarget: props.mountTarget,
    // oxlint-disable-next-line solid/reactivity
    showMirrorCameraButton: props.showMirrorCameraButton,
    // oxlint-disable-next-line solid/reactivity
    showCameraSelector: props.showCameraSelector,
    // oxlint-disable-next-line solid/reactivity
    showTorchButton: props.showTorchButton,
    // oxlint-disable-next-line solid/reactivity
    showCloseButton: props.showCloseButton,
    // oxlint-disable-next-line solid/reactivity
    showCameraErrorModal: props.showCameraErrorModal,
    // oxlint-disable-next-line solid/reactivity
    zIndex: props.zIndex,
  };

  onCleanup(() => {
    console.debug("CameraUiStoreProvider cleanup");
    // props.dismount();  // this is recursive!!!
  });

  return <CameraUiStoreContext.Provider value={contextValue}>{props.children}</CameraUiStoreContext.Provider>;
};

/** The useCameraUiStore hook. */
export function useCameraUiStore() {
  const ctx = useContext(CameraUiStoreContext);
  if (!ctx) {
    throw new Error("StoreContext.Provider not in scope");
  }

  return ctx;
}
