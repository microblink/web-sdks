/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { BlinkIdVerifyUxManager } from "../core/BlinkIdVerifyUxManager";

import { CameraManagerComponent } from "@microblink/camera-manager";
import { renderWithOwner } from "@microblink/shared-components/renderWithOwner";
import { merge } from "merge-anything";
import { BlinkIdVerifyFeedbackUi } from "./BlinkIdVerifyFeedbackUi";
import { BlinkIdVerifyUiStoreProvider } from "./BlinkIdVerifyUiStoreContext";
import { PartialLocalizationStrings } from "./LocalizationContext";

/**
 * The options for the createBlinkIdVerifyFeedbackUi function.
 */
export type FeedbackUiOptions = {
  /**
   * The localization strings.
   */
  localizationStrings?: PartialLocalizationStrings;
  /**
   * If set to `true`, the BlinkID Verify instance will not be terminated when the
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
 * Creates the BlinkID Verify feedback UI.
 *
 * @param blinkIdVerifyUxManager - The BlinkID Verify Ux Manager.
 * @param cameraManagerComponent - The Camera Manager Component.
 * @param options - The feedback UI options for the createBlinkIdVerifyFeedbackUi function
 *
 * @returns The function to unmount the feedback UI.
 */
export function createBlinkIdVerifyFeedbackUi(
  blinkIdVerifyUxManager: BlinkIdVerifyUxManager,
  cameraManagerComponent: CameraManagerComponent,
  feedbackUiOptions: FeedbackUiOptions = {},
) {
  const {
    localizationStrings,
    preserveSdkInstance,
    showOnboardingGuide = true,
    showHelpButton = true,
    helpTooltipShowDelay = 5000,
    helpTooltipHideDelay = 5000,
    showDocumentFilteredModal = true,
    showTimeoutModal = true,
    showUnsupportedDocumentModal = true,
  } = feedbackUiOptions;
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
      <BlinkIdVerifyUiStoreProvider
        blinkIdVerifyUxManager={blinkIdVerifyUxManager}
        cameraManagerComponent={cameraManagerComponent}
        showOnboardingGuide={showOnboardingGuide}
        showHelpButton={showHelpButton}
        helpTooltipShowDelay={helpTooltipShowDelay}
        helpTooltipHideDelay={helpTooltipHideDelay}
        showDocumentFilteredModal={showDocumentFilteredModal}
        showTimeoutModal={showTimeoutModal}
        showUnsupportedDocumentModal={showUnsupportedDocumentModal}
        dismountFeedbackUi={() => dismountFeedbackUiRef.current()}
      >
        <BlinkIdVerifyFeedbackUi
          localization={mergedUiOptions.localizationStrings}
        />
      </BlinkIdVerifyUiStoreProvider>
    ),
    cameraManagerComponent.feedbackLayerNode,
    cameraManagerComponent.owner,
  );

  dismountFeedbackUiRef.current = unmountFunction;
  return unmountFunction;
}
