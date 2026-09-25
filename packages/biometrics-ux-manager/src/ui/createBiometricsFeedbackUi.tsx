/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { BiometricsUxManager } from "@microblink/biometrics-ux-manager/core";
import type { CameraManagerComponent } from "@microblink/camera-manager/ui";
import { renderWithOwner } from "@microblink/shared-components/renderWithOwner";
import { createEffect } from "solid-js";

import { BiometricsFeedbackUi, type BiometricsFeedbackUiManager } from "./BiometricsFeedbackUi";
import type { BiometricsErrorDialogs } from "./errorDialogs";
import { LocalizationProvider, type PartialLocalizationStrings, useLocalization } from "./LocalizationContext";

import "virtual:uno.css";
import "./styles.css";

export type { BiometricsFeedbackUiManager } from "./BiometricsFeedbackUi";
export type { BiometricsErrorDialogCopy, BiometricsErrorDialogs } from "./errorDialogs";

export type FeedbackUiOptions = {
  localizationStrings?: PartialLocalizationStrings;
  /**
   * Controls whether the help button and its tooltip nudge are shown.
   *
   * @defaultValue `true`
   */
  showHelpButton?: boolean;
};

export type BiometricsFeedbackUiOptions<DialogKind extends string = never> = FeedbackUiOptions & {
  onClose?: () => void;
  /** Dialog copy for error dialog kinds added through the manager's `resolveErrorDialogKind` option. */
  errorDialogs?: BiometricsErrorDialogs<DialogKind>;
};

export type BiometricsFeedbackUiHandle = {
  dismiss(): void;
  close(): void;
};

export type BiometricsFeedbackUiController<DialogKind extends string = never> =
  BiometricsFeedbackUiManager<DialogKind> & Pick<BiometricsUxManager, "close">;

function LocalizedFeedbackUi<DialogKind extends string>(props: {
  manager: BiometricsFeedbackUiController<DialogKind>;
  cameraManagerComponent: CameraManagerComponent;
  onClose: () => void;
  showHelpButton: boolean;
  errorDialogs?: BiometricsErrorDialogs<DialogKind>;
}) {
  const { t } = useLocalization();

  createEffect(() => {
    props.cameraManagerComponent.updateLocalization({
      dialog_title: t.sdk_aria,
    });
  });

  return (
    <BiometricsFeedbackUi
      manager={props.manager}
      overlayLayerNode={props.cameraManagerComponent.overlayLayerNode}
      onClose={props.onClose}
      showHelpButton={props.showHelpButton}
      errorDialogs={props.errorDialogs}
    />
  );
}

export function createBiometricsFeedbackUi<DialogKind extends string = never>(
  manager: BiometricsFeedbackUiController<DialogKind>,
  cameraManagerComponent: CameraManagerComponent,
  options: BiometricsFeedbackUiOptions<DialogKind> = {},
): BiometricsFeedbackUiHandle {
  let closed = false;
  let dismissed = false;
  let dispose: (() => void) | undefined;
  let removeOnDismountCallback: (() => void) | undefined;

  const dismiss = (): void => {
    if (dismissed) {
      return;
    }

    dismissed = true;
    removeOnDismountCallback?.();
    removeOnDismountCallback = undefined;
    dispose?.();
    dispose = undefined;
  };

  const close = (): void => {
    if (closed) {
      return;
    }

    closed = true;
    dismiss();
    manager.close("User");
    options.onClose?.();
  };

  dispose = renderWithOwner(
    () => (
      <LocalizationProvider userStrings={options.localizationStrings}>
        <LocalizedFeedbackUi
          manager={manager}
          cameraManagerComponent={cameraManagerComponent}
          onClose={close}
          showHelpButton={options.showHelpButton ?? true}
          errorDialogs={options.errorDialogs}
        />
      </LocalizationProvider>
    ),
    cameraManagerComponent.feedbackLayerNode,
    cameraManagerComponent.owner,
  );

  removeOnDismountCallback = cameraManagerComponent.addOnDismountCallback(close);

  return {
    dismiss,
    close,
  };
}
