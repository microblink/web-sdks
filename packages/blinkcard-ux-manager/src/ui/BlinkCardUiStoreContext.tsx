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
import type { BlinkCardProcessingError } from "../core/BlinkCardProcessingError";
import type { BlinkCardUxManager } from "../core/BlinkCardUxManager";

/**
 * The BlinkCardUiStore type.
 */
export type BlinkCardUiStore = {
  /**
   * The BlinkCardUxManager instance.
   */
  blinkCardUxManager: BlinkCardUxManager;
  /**
   * The CameraManagerComponent instance.
   */
  cameraManagerComponent: CameraManagerComponent;
  /**
   * The error state.
   */
  errorState?: BlinkCardProcessingError;
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
   * Whether the timeout modal should be shown.
   */
  showTimeoutModal?: boolean;
  /**
   * The function to dismount the feedback UI.
   */
  dismountFeedbackUi: () => void;
};

/**
 * The BlinkCardUiStoreContextValue type.
 */
type BlinkCardUiStoreContextValue = {
  store: BlinkCardUiStore;
  updateStore: SetStoreFunction<BlinkCardUiStore>;
};

/**
 * The BlinkCardUiStoreContext.
 */
const BlinkCardUiStoreContext = createContext<BlinkCardUiStoreContextValue>();

/**
 * The BlinkCardUiStoreProvider component.
 *
 * @param props - The props for the BlinkCardUiStoreProvider component.
 * @returns The BlinkCardUiStoreProvider component.
 */
export const BlinkCardUiStoreProvider: ParentComponent<{
  blinkCardUxManager: BlinkCardUxManager;
  cameraManagerComponent: CameraManagerComponent;
  showOnboardingGuide: boolean;
  showHelpButton: boolean;
  helpTooltipShowDelay: number | null;
  helpTooltipHideDelay: number | null;
  showTimeoutModal: boolean;
  dismountFeedbackUi: () => void;
}> = (props) => {
  const [store, updateStore] = createStore<BlinkCardUiStore>(
    {} as BlinkCardUiStore,
  );

  // This needs to be created outside of `useEffect` since we
  // need it immediately on mount
  updateStore({
    /* eslint-disable solid/reactivity */
    blinkCardUxManager: props.blinkCardUxManager,
    cameraManagerComponent: props.cameraManagerComponent,
    showOnboardingGuide: props.showOnboardingGuide,
    helpTooltipShowDelay: props.helpTooltipShowDelay,
    helpTooltipHideDelay: props.helpTooltipHideDelay,
    showHelpButton: props.showHelpButton,
    showTimeoutModal: props.showTimeoutModal,
    dismountFeedbackUi: props.dismountFeedbackUi,
    /* eslint-enable solid/reactivity */
  });

  const contextValue = {
    store,
    updateStore,
  };

  onCleanup(() => {
    console.debug("BlinkCardUiStoreProvider cleanup");
  });

  return (
    <BlinkCardUiStoreContext.Provider value={contextValue}>
      {props.children}
    </BlinkCardUiStoreContext.Provider>
  );
};

/**
 * The useBlinkCardUiStore function.
 *
 * @returns The BlinkCardUiStore.
 */
export function useBlinkCardUiStore() {
  const ctx = useContext(BlinkCardUiStoreContext);
  if (!ctx) {
    throw new Error("BlinkCardUiStoreContext.Provider not in scope");
  }

  return ctx;
}
