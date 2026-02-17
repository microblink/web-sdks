/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { BlinkCardUxManager } from "../core/BlinkCardUxManager";

import { CameraManagerComponent } from "@microblink/camera-manager";
import { renderWithOwner } from "@microblink/shared-components/renderWithOwner";
import { BlinkCardFeedbackUi } from "./BlinkCardFeedbackUi";
import { BlinkCardUiStoreProvider } from "./BlinkCardUiStoreContext";
import { PartialLocalizationStrings } from "./LocalizationContext";
import { merge } from "merge-anything";

/**
 * The options for the createBlinkCardFeedbackUi function.
 */
export type FeedbackUiOptions = {
  /**
   * The localization strings.
   */
  localizationStrings?: PartialLocalizationStrings;
  /**
   * If set to `true`, the onboarding guide will be shown.
   *
   * @defaultValue true
   */
  showOnboardingGuide?: boolean;
  /**
   * If set to `true`, the help button will be shown.
   *
   * @defaultValue true
   */
  showHelpButton?: boolean;
  /**
   * Time in ms before the help tooltip is shown. If null, tooltip won't be auto shown.
   *
   * @defaultValue 5000
   */
  helpTooltipShowDelay?: number | null;
  /**
   * Time in ms before the help tooltip is hidden. If null, tooltip won't be auto hidden.
   *
   * @defaultValue 5000
   */
  helpTooltipHideDelay?: number | null;
  /**
   * If set to `true`, the timeout modal will be shown.
   *
   * @defaultValue true
   */
  showTimeoutModal?: boolean;
};

const defaultFeedbackUiOptions: Required<FeedbackUiOptions> = {
  localizationStrings: {},
  showOnboardingGuide: true,
  showHelpButton: true,
  helpTooltipShowDelay: 5000,
  helpTooltipHideDelay: 5000,
  showTimeoutModal: true,
};

/**
 * Creates the BlinkCard feedback UI.
 *
 * @param blinkCardUxManager - The BlinkCard Ux Manager.
 * @param cameraManagerComponent - The Camera Manager Component.
 * @param feedbackUiOptions - The options for the createBlinkCardFeedbackUi function.
 *
 * @returns The function to unmount the feedback UI.
 */
export function createBlinkCardFeedbackUi(
  blinkCardUxManager: BlinkCardUxManager,
  cameraManagerComponent: CameraManagerComponent,
  feedbackUiOptions: Partial<FeedbackUiOptions>,
) {
  // Use a ref or closure to handle the circular reference
  const dismountFeedbackUiRef = {
    current: () => {
      void 0;
    },
  };

  const mergedUiOptions = merge(defaultFeedbackUiOptions, feedbackUiOptions);

  cameraManagerComponent.addOnDismountCallback(() => {
    // if the camera manager is unmounted, we need to unmount the feedback UI
    dismountFeedbackUiRef.current();
  });

  const unmountFunction = renderWithOwner(
    () => (
      <BlinkCardUiStoreProvider
        blinkCardUxManager={blinkCardUxManager}
        cameraManagerComponent={cameraManagerComponent}
        showOnboardingGuide={mergedUiOptions.showOnboardingGuide}
        showHelpButton={mergedUiOptions.showHelpButton}
        helpTooltipShowDelay={mergedUiOptions.helpTooltipShowDelay}
        helpTooltipHideDelay={mergedUiOptions.helpTooltipHideDelay}
        showTimeoutModal={mergedUiOptions.showTimeoutModal}
        dismountFeedbackUi={() => dismountFeedbackUiRef.current()}
      >
        <BlinkCardFeedbackUi
          localization={mergedUiOptions.localizationStrings}
        />
      </BlinkCardUiStoreProvider>
    ),
    cameraManagerComponent.feedbackLayerNode,
    cameraManagerComponent.owner,
  );

  dismountFeedbackUiRef.current = unmountFunction;
  return unmountFunction;
}
