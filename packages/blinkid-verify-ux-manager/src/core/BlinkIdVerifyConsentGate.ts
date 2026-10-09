/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { Consent } from "@microblink/blinkid-verify-core";
import type { CameraManagerComponent } from "@microblink/camera-manager/ui";

import type { PartialLocalizationStrings } from "../ui/localization-strings";
import { showConsentUi } from "../ui/showConsentUi";
import { acceptRequireConsent, BlinkIdVerifyUxManager } from "./BlinkIdVerifyUxManager";
import type { ConsentUiInput } from "./createBlinkIdVerifyUxManager";

/**
 * Holds a `BlinkIdVerifyUxManager` until the user accepts `RequireConsent`.
 *
 * The factory returns this gate instead of the manager. Acceptance hands the manager to the caller. Decline dismounts
 * the camera UI and destroys the manager.
 */
export class BlinkIdVerifyConsentGate {
  #manager: BlinkIdVerifyUxManager;
  #consentFields: ConsentUiInput;
  #handedOffManager?: BlinkIdVerifyUxManager;
  #closed = false;
  #rejectConsent?: () => void;

  /**
   * @param manager - Manager constructed by the factory. Frame processing stays blocked until consent is accepted.
   * @param consentFields - Values used to render the consent UI and generate the accepted consent object.
   */
  constructor(manager: BlinkIdVerifyUxManager, consentFields: ConsentUiInput) {
    this.#manager = manager;
    this.#consentFields = consentFields;
  }

  /**
   * Shows the consent modal on the camera UI.
   *
   * Acceptance returns the manager, which the caller then owns. Decline dismounts the camera UI, destroys the manager,
   * and returns `undefined`. A second call after acceptance returns the same manager without showing the modal again.
   *
   * @param cameraManagerComponent - Mounted camera UI used to show the consent modal.
   * @param localizationStrings - Optional overrides for the consent dialog copy. The same object used for the feedback
   *   UI applies here.
   * @returns The UX manager when consent is accepted, otherwise `undefined`.
   */
  async consentUiResponse(
    cameraManagerComponent: CameraManagerComponent,
    localizationStrings?: PartialLocalizationStrings,
  ): Promise<BlinkIdVerifyUxManager | undefined> {
    if (this.#handedOffManager) {
      return this.#handedOffManager;
    }

    if (this.#closed) {
      return undefined;
    }

    try {
      const consent = await new Promise<Consent>((resolve, reject) => {
        this.#rejectConsent = () => {
          reject();
        };
        void showConsentUi(cameraManagerComponent, this.#consentFields, localizationStrings).then(resolve, reject);
      });
      this.#rejectConsent = undefined;

      if (this.#closed) {
        return undefined;
      }

      acceptRequireConsent(this.#manager, consent);
      this.#handedOffManager = this.#manager;
      this.#closed = true;
      return this.#manager;
    } catch {
      this.#rejectConsent = undefined;
      if (!this.#closed) {
        this.#closed = true;
        this.#manager.destroy();
        cameraManagerComponent.dismount();
      }
      return undefined;
    }
  }

  /**
   * Destroys the manager when the caller abandons the flow before acceptance.
   *
   * After a successful `consentUiResponse`, the caller owns the manager and must call `manager.destroy()` instead.
   */
  destroy(): void {
    if (this.#closed) {
      return;
    }

    this.#closed = true;
    this.#manager.destroy();
    this.#rejectConsent?.();
  }
}
