/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { BlinkIdUxManager } from "../core/BlinkIdUxManager";

import { CameraManagerComponent } from "@microblink/camera-manager";
import { renderWithOwner } from "@microblink/shared-components/renderWithOwner";
import { merge } from "merge-anything";
import { BlinkIdFeedbackUi } from "./BlinkIdFeedbackUi";
import { BlinkIdUiStoreProvider } from "./BlinkIdUiStoreContext";
import { PartialLocalizationStrings } from "./LocalizationContext";

/**
 * The options for the createBlinkIdFeedbackUi function.
 */
export type FeedbackUiOptions = {
  /**
   * The localization strings.
   */
  localizationStrings?: PartialLocalizationStrings;
  /**
   * If set to `true`, the BlinkID instance will not be terminated when the
   * feedback UI is unmounted.
   *
   * @defaultValue false
   */
  preserveSdkInstance?: boolean;
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
  /** Time in ms before the help tooltip is shown. If null, tooltip won't be auto shown. */
  helpTooltipShowDelay?: number | null;
  /**
   * Time in ms before the help tooltip is hidden. If null, tooltip won't be auto hidden.
   *
   * @defaultValue 5000
   */
  helpTooltipHideDelay?: number | null;
  /**
   * If set to `true`, the document filtered modal will be shown.
   *
   * @defaultValue true
   */
  showDocumentFilteredModal?: boolean;
  /**
   * If set to `true`, the timeout modal will be shown.
   *
   * @defaultValue true
   */
  showTimeoutModal?: boolean;
  /**
   * If set to `true`, the document unsupported modal will be shown.
   *
   * @defaultValue true
   */
  showUnsupportedDocumentModal?: boolean;
};

type DefaultFeedbackUiOptions = Required<FeedbackUiOptions>;

const defaultFeedbackUiOptions: DefaultFeedbackUiOptions = {
  localizationStrings: {},
  preserveSdkInstance: false,
  showOnboardingGuide: true,
  showHelpButton: true,
  helpTooltipShowDelay: 5000,
  helpTooltipHideDelay: 5000,
  showDocumentFilteredModal: true,
  showTimeoutModal: true,
  showUnsupportedDocumentModal: true,
};

/**
 * Creates the BlinkID feedback UI.
 *
 * @param blinkIdUxManager - The BlinkID Ux Manager.
 * @param cameraManagerComponent - The Camera Manager Component.
 * @param options - The feedback UI options for the createBlinkIdFeedbackUi function
 *
 * @returns The function to unmount the feedback UI.
 */
export function createBlinkIdFeedbackUi(
  blinkIdUxManager: BlinkIdUxManager,
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
      <BlinkIdUiStoreProvider
        blinkIdUxManager={blinkIdUxManager}
        cameraManagerComponent={cameraManagerComponent}
        showOnboardingGuide={mergedUiOptions.showOnboardingGuide}
        showHelpButton={mergedUiOptions.showHelpButton}
        helpTooltipShowDelay={mergedUiOptions.helpTooltipShowDelay}
        helpTooltipHideDelay={mergedUiOptions.helpTooltipHideDelay}
        showDocumentFilteredModal={mergedUiOptions.showDocumentFilteredModal}
        showTimeoutModal={mergedUiOptions.showTimeoutModal}
        showUnsupportedDocumentModal={
          mergedUiOptions.showUnsupportedDocumentModal
        }
        dismountFeedbackUi={() => dismountFeedbackUiRef.current()}
      >
        <BlinkIdFeedbackUi localization={mergedUiOptions.localizationStrings} />
      </BlinkIdUiStoreProvider>
    ),
    cameraManagerComponent.feedbackLayerNode,
    cameraManagerComponent.owner,
  );

  dismountFeedbackUiRef.current = unmountFunction;
  return unmountFunction;
}
