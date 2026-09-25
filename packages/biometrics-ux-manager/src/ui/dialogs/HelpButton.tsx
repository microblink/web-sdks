/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { Component } from "solid-js";
import { Show } from "solid-js";

import HelpIcon from "../assets/dialogs/help.svg?component-solid";
import { useLocalization } from "../LocalizationContext";

export type HelpButtonProps = {
  showNudge: boolean;
  onClick: () => void;
};

export const HelpButton: Component<HelpButtonProps> = (props) => {
  const { t } = useLocalization();

  return (
    <div
      class="mb-bio-help-button-container pointer-events-auto absolute flex
        items-center gap-2"
    >
      <Show when={props.showNudge}>
        <div
          part="help-button-tooltip-part"
          class="mb-bio-dialog-action flex items-center rounded-md bg-primary
            px-3 py-2 text-center text-white shadow-md"
          aria-hidden="true"
        >
          {t.help_button.tooltip}
        </div>
      </Show>
      <button
        type="button"
        part="help-button-part"
        aria-label={t.help_button.aria_label}
        class="mb-bio-help-button control-focus relative grid size-11 cursor-pointer
          place-items-center rounded-full border-none bg-white text-primary
          appearance-none transition-colors transition-duration-100
          hover:bg-gray-100 active:bg-gray-200 [&_svg]:size-9"
        onClick={() => props.onClick()}
      >
        <HelpIcon aria-hidden="true" />
      </button>
    </div>
  );
};
