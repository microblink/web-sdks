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
import type { BlinkIdProcessingError } from "../core/BlinkIdProcessingError";
import type { BlinkIdUxManager } from "../core/BlinkIdUxManager";

/**
 * The BlinkIdUiStore type.
 */
type BlinkIdUiStore = {
  /**
   * The BlinkIdUxManager instance.
   */
  blinkIdUxManager: BlinkIdUxManager;
  /**
   * The CameraManagerComponent instance.
   */
  cameraManagerComponent: CameraManagerComponent;
  /**
   * The error state.
   */
  errorState?: BlinkIdProcessingError; // TODO: should this be part of `BlinkIdUxManager`?
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
 * The BlinkIdUiStoreContextValue type.
 */
type BlinkIdUiStoreContextValue = {
  store: BlinkIdUiStore;
  updateStore: SetStoreFunction<BlinkIdUiStore>;
};

/**
 * The BlinkIdUiStoreContext.
 */
const BlinkIdUiStoreContext = createContext<BlinkIdUiStoreContextValue>();

/**
 * The BlinkIdUiStoreProvider component.
 *
 * @param props - The props for the BlinkIdUiStoreProvider component.
 * @returns The BlinkIdUiStoreProvider component.
 */
export const BlinkIdUiStoreProvider: ParentComponent<{
  blinkIdUxManager: BlinkIdUxManager;
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
  const [store, updateStore] = createStore<BlinkIdUiStore>(
    {} as BlinkIdUiStore,
  );

  // This needs to be created outside of `useEffect` since we
  // need it immediately on mount
  updateStore({
    /* eslint-disable solid/reactivity */
    blinkIdUxManager: props.blinkIdUxManager,
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
    console.debug("BlinkIdUiStoreProvider cleanup");
  });

  return (
    <BlinkIdUiStoreContext.Provider value={contextValue}>
      {props.children}
    </BlinkIdUiStoreContext.Provider>
  );
};

/**
 * The useBlinkIdUiStore function.
 *
 * @returns The BlinkIdUiStore.
 */
export function useBlinkIdUiStore() {
  const ctx = useContext(BlinkIdUiStoreContext);
  if (!ctx) {
    throw new Error("BlinkIdUiStoreContext.Provider not in scope");
  }

  return ctx;
}
