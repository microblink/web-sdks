/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type { CameraManagerComponent } from "@microblink/camera-manager";
import {
  createContext,
  onCleanup,
  type ParentComponent,
  useContext,
} from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";
import type { BlinkIdVerifyProcessingError } from "../core/BlinkIdVerifyProcessingError";
import type { BlinkIdVerifyUxManager } from "../core/BlinkIdVerifyUxManager";

/**
 * The BlinkIdVerifyUiStore type.
 */
type BlinkIdVerifyUiStore = {
  /**
   * The BlinkIdVerifyUxManager instance.
   */
  blinkIdVerifyUxManager: BlinkIdVerifyUxManager;
  /**
   * The CameraManagerComponent instance.
   */
  cameraManagerComponent: CameraManagerComponent;
  /**
   * The error state.
   */
  errorState?: BlinkIdVerifyProcessingError; // TODO: should this be part of `BlinkIdVerifyUxManager`?
  /**
   * Whether the document has been filtered.
   */
  documentFiltered: boolean;
  /**
   * Whether the onboarding guide should be shown.
   */
  showOnboardingGuide?: boolean;
  /**
   * Time in ms before the help tooltip is shown. If null, tooltip won't be auto shown.
   */
  helpTooltipShowDelay?: number | null;
  /**
   * Time in ms before the help tooltip is hidden. If null, tooltip won't be auto hidden.
   */
  helpTooltipHideDelay?: number | null;
  /**
   * Whether the help modal should be shown.
   */
  showHelpModal?: boolean;
  /**
   * Whether the help button should be shown.
   */
  showHelpButton?: boolean;
  /**
   * Whether the document filtered modal should be shown.
   */
  showDocumentFilteredModal?: boolean;
  /**
   * Whether the timeout modal should be shown.
   */
  showTimeoutModal?: boolean;
  /**
   * Whether the document unsupported modal should be shown.
   */
  showUnsupportedDocumentModal?: boolean;
  /**
   * The function to dismount the feedback UI.
   */
  dismountFeedbackUi: () => void;
};

/**
 * The BlinkIdVerifyUiStoreContextValue type.
 */
type BlinkIdVerifyUiStoreContextValue = {
  store: BlinkIdVerifyUiStore;
  updateStore: SetStoreFunction<BlinkIdVerifyUiStore>;
};

/**
 * The BlinkIdVerifyUiStoreContext.
 */
const BlinkIdVerifyUiStoreContext =
  createContext<BlinkIdVerifyUiStoreContextValue>();

/**
 * The BlinkIdVerifyUiStoreProvider component.
 *
 * @param props - The props for the BlinkIdVerifyUiStoreProvider component.
 * @returns The BlinkIdVerifyUiStoreProvider component.
 */
export const BlinkIdVerifyUiStoreProvider: ParentComponent<{
  blinkIdVerifyUxManager: BlinkIdVerifyUxManager;
  cameraManagerComponent: CameraManagerComponent;
  showOnboardingGuide: boolean;
  showHelpButton: boolean;
  helpTooltipShowDelay: number | null;
  helpTooltipHideDelay: number | null;
  showDocumentFilteredModal: boolean;
  showTimeoutModal: boolean;
  showUnsupportedDocumentModal: boolean;
  dismountFeedbackUi: () => void;
}> = (props) => {
  const [store, updateStore] = createStore<BlinkIdVerifyUiStore>(
    {} as BlinkIdVerifyUiStore,
  );

  // This needs to be created outside of `useEffect` since we
  // need it immediately on mount
  updateStore({
    /* eslint-disable solid/reactivity */
    blinkIdVerifyUxManager: props.blinkIdVerifyUxManager,
    cameraManagerComponent: props.cameraManagerComponent,
    showOnboardingGuide: props.showOnboardingGuide,
    helpTooltipShowDelay: props.helpTooltipShowDelay,
    helpTooltipHideDelay: props.helpTooltipHideDelay,
    showHelpButton: props.showHelpButton,
    showDocumentFilteredModal: props.showDocumentFilteredModal,
    showTimeoutModal: props.showTimeoutModal,
    showUnsupportedDocumentModal: props.showUnsupportedDocumentModal,
    dismountFeedbackUi: props.dismountFeedbackUi,
    /* eslint-enable solid/reactivity */
  });

  const contextValue = {
    store,
    updateStore,
  };

  onCleanup(() => {
    console.debug("BlinkIdVerifyUiStoreProvider cleanup");
  });

  return (
    <BlinkIdVerifyUiStoreContext.Provider value={contextValue}>
      {props.children}
    </BlinkIdVerifyUiStoreContext.Provider>
  );
};

/**
 * The useBlinkIdVerifyUiStore function.
 *
 * @returns The BlinkIdVerifyUiStore.
 */
export function useBlinkIdVerifyUiStore() {
  const ctx = useContext(BlinkIdVerifyUiStoreContext);
  if (!ctx) {
    throw new Error("BlinkIdVerifyUiStoreContext.Provider not in scope");
  }

  return ctx;
}
