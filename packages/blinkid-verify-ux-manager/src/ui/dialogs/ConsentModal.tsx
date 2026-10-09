/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { Dialog, Switch } from "@ark-ui/solid";
import type { Consent, ConsentCustomerContext } from "@microblink/blinkid-verify-core";
import { Modal } from "@microblink/shared-components/Modal";
import { type Component, createMemo, createSignal } from "solid-js";

import { useLocalization } from "../LocalizationContext";

import "virtual:uno.css";

const privacyNoticeUrl = "https://microblink.com/legal/privacy-notice-for-microblink-blinkid-verify/";
const privacyLinkPlaceholder = "{{consent_modal::privacy_link}}";

/** Props for the ConsentModal component. */
export type ConsentModalProps = {
  /** The HTML element where the modal will be mounted. */
  mountTarget: HTMLElement;
  /** End-user id recorded on the generated consent object. */
  userId: string;
  /** Consent retention period in days. */
  durationDays: number;
  /** Integrator-specific identifiers attached to the generated consent object. */
  customerContext?: ConsentCustomerContext;
  /** Called with the generated consent object when the user accepts. */
  onConsent: (consent: Consent) => void;
  /** Called when the user declines consent. */
  onDecline: () => void;
};

/**
 * The ConsentModal component.
 *
 * @param props - The props for the ConsentModal component.
 * @returns The ConsentModal component.
 */
export const ConsentModal: Component<ConsentModalProps> = (props) => {
  const { t } = useLocalization();
  const privacyNoticeParts = createMemo(() => {
    const [before = "", after = ""] = t.consent_modal.privacy_notice.split(privacyLinkPlaceholder);
    return { before, after };
  });
  const [consentButtonRef, setConsentButtonRef] = createSignal<HTMLButtonElement | null>(null);
  const [optionalConsentGranted, setOptionalConsentGranted] = createSignal(false);

  const createConsentFromUi = (
    consentFields: Pick<ConsentModalProps, "userId" | "durationDays" | "customerContext">,
  ): Consent => {
    return {
      durationDays: consentFields.durationDays,
      userId: consentFields.userId,
      note: `${t.consent_modal.details}\n${t.consent_modal.consent_switch}`,
      givenOn: new Date().toISOString(),
      ...(consentFields.customerContext !== undefined ? { customerContext: consentFields.customerContext } : {}),
    };
  };

  return (
    <Modal
      mountTarget={props.mountTarget}
      contentClass="max-w-[400px] !min-h-[564px] !p-[24px]"
      mainContentClass="flex-grow-2"
      open={true}
      role="alertdialog"
      aria-label={t.consent_modal.consent_btn}
      closeButtonAriaLabel="Close"
      onEscapeKeyDown={() => props.onDecline()}
      onCloseClicked={() => props.onDecline()}
      initialFocusEl={() => consentButtonRef()}
      actions={{
        primary: {
          label: t.consent_modal.consent_btn,
          variant: "secondary",
          class: "font-bold !text-base tracking-normal text-center align-middle h-[52px]",
          onClick: () => props.onConsent(createConsentFromUi(props)),
          ref: setConsentButtonRef,
        },
        secondary: {
          label: t.consent_modal.decline_btn,
          class: "font-bold !text-base tracking-normal text-center align-middle h-[52px] mt-[10px]",
          onClick: props.onDecline,
        },
      }}
      actionsLayout="stacked"
      showCloseButton={true}
      scrollable={false}
    >
      <style
        ref={(ref) => {
          if (window.__blinkidVerifyUxManagerCssCode) {
            ref.innerHTML = window.__blinkidVerifyUxManagerCssCode;
          }
        }}
      />
      <div role="region" class="min-h-0">
        <article class="min-h-0 compact:h-full h-full grid">
          <Dialog.Title class="dialog-title !text-2xl tracking-normal align-middle place-self-center !text-[rgba(17,24,39,1)]">
            {t.consent_modal.title}
          </Dialog.Title>
          <Dialog.Description class="dialog-description !text-left grid h-full mt-[unset]">
            <p class="font-bold text-[rgba(17,24,39,1)] text-sm tracking-normal">{t.consent_modal.details}</p>
            <p class="rounded-2 bg-gray-50 p-[1em] font-normal text-sm tracking-normal h-[fit-content]">
              {privacyNoticeParts().before}
              <a
                href={privacyNoticeUrl}
                target="_blank"
                rel="noopener noreferrer"
                // Safari omits links from sequential focus navigation unless the tab index is explicit.
                tabIndex={0}
                class="text-primary
                focus-visible:outline focus-visible:outline-2px
                focus-visible:outline-primary focus-visible:outline-offset-2px"
              >
                {t.consent_modal.privacy_link}
                <span class="sr-only"> (opens in a new tab)</span>
              </a>
              {privacyNoticeParts().after}
            </p>
            <Switch.Root
              class="flex items-center gap-3 text-left cursor-pointer min-h-11"
              checked={optionalConsentGranted()}
              onCheckedChange={(details) => setOptionalConsentGranted(details.checked)}
            >
              {/* Safari omits checkboxes from sequential focus navigation unless the tab index is explicit. */}
              <Switch.HiddenInput tabIndex={0} />
              <Switch.Control
                class="shrink-0 flex items-center w-11 h-6 p-0.5 rounded-full
              bg-gray-400 transition-colors transition-duration-100
              motion-reduce:transition-none
              data-[state=checked]:bg-primary
              [&[data-focus-visible]]:outline
              [&[data-focus-visible]]:outline-2px
              [&[data-focus-visible]]:outline-primary
              [&[data-focus-visible]]:outline-offset-2px"
              >
                <Switch.Thumb
                  class="size-5 rounded-full bg-white shadow-sm
                transition-transform transition-duration-100
                motion-reduce:transition-none
                data-[state=checked]:translate-x-5"
                />
              </Switch.Control>
              <Switch.Label class="text-[rgba(17,24,39,1)] text-pretty font-normal text-xs tracking-normal">
                {t.consent_modal.consent_switch} <span class="italic">({t.consent_modal.optional})</span>
              </Switch.Label>
            </Switch.Root>
          </Dialog.Description>
        </article>
      </div>
    </Modal>
  );
};
