/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { Consent } from "@microblink/blinkid-verify-core";
import type { CameraManagerComponent } from "@microblink/camera-manager/ui";
import { renderWithOwner } from "@microblink/shared-components/renderWithOwner";

import type { ConsentUiInput } from "../core/createBlinkIdVerifyUxManager";
import { ConsentModal } from "./dialogs/ConsentModal";
import { LocalizationProvider, type PartialLocalizationStrings } from "./LocalizationContext";

/**
 * Shows a consent modal on the camera UI overlay and resolves with a generated consent object when Consent is clicked.
 *
 * Internal helper used by BlinkIdVerifyConsentGate.consentUiResponse. Decline, close, and Escape reject the promise.
 *
 * @param cameraManagerComponent - Mounted camera UI that provides the overlay node and Solid owner.
 * @param consentFields - Integrator-provided `userId`, `durationDays`, and optional `customerContext`.
 * @param localizationStrings - Optional overrides for the consent dialog copy. Unset keys keep the English defaults.
 * @returns Consent payload recorded when the user accepts, including a `note` with the SDK consent copy.
 */
export function showConsentUi(
  cameraManagerComponent: CameraManagerComponent,
  consentFields: ConsentUiInput,
  localizationStrings?: PartialLocalizationStrings,
): Promise<Consent> {
  return new Promise((resolve, reject) => {
    const overlay = cameraManagerComponent.overlayLayerNode;
    const container = document.createElement("div");
    container.style.display = "contents";
    overlay.append(container);

    const disposeRef = {
      current: () => {
        void 0;
      },
    };

    const dismount = () => {
      disposeRef.current();
      container.remove();
    };

    disposeRef.current = renderWithOwner(
      () => (
        <LocalizationProvider userStrings={localizationStrings}>
          <ConsentModal
            mountTarget={container}
            userId={consentFields.userId}
            durationDays={consentFields.durationDays}
            customerContext={consentFields.customerContext}
            onConsent={(consent) => {
              dismount();
              resolve(consent);
            }}
            onDecline={() => {
              dismount();
              reject();
            }}
          />
        </LocalizationProvider>
      ),
      container,
      cameraManagerComponent.owner,
    );
  });
}
