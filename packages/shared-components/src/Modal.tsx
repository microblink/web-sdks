/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { Dialog } from "@ark-ui/solid/dialog";
import { createResizeObserver } from "@solid-primitives/resize-observer";
import type { JSX } from "solid-js";
import { createSignal, ParentComponent, Show, splitProps } from "solid-js";
import { Portal } from "solid-js/web";
import { SmartEnvironmentProvider } from "./SmartEnvironmentProvider";
import IconClose from "./assets/icons/icon-close.svg?component-solid";

import { RootNode } from "@ark-ui/solid/environment";
import { Key } from "@solid-primitives/keyed";
import type { SetRequired } from "type-fest";

export type ModalAction = {
  label: JSX.Element;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export type ModalActionType = "primary" | "secondary";

export type ModalActions = {
  primary: ModalAction;
  secondary?: ModalAction;
};

/**
 * Props for the Modal component.
 */
export type ModalProps = {
  /** The HTML element where the modal will be mounted. */
  mountTarget: HTMLElement;
  /** Optional actions element to display in the modal footer. */
  actions?: ModalActions;
  /** Whether to show the close button in the modal header. */
  showCloseButton?: boolean;
  /** Callback function invoked when the close button is clicked. */
  onCloseClicked?: () => void;
  /**
   * Whether modal body content should be scrollable.
   * If disabled, consumers can implement their own internal scroll areas.
   */
  scrollable?: boolean;
  /** The style variant of the modal determining its size. */
  modalStyle?: "default" | "large";
  /**
   * Function that returns the element to receive initial focus when the modal opens.
   * @param root The root node where the document is mounted (Document or ShadowRoot)
   */
  initialFocusEl?: (root: RootNode) => HTMLElement | null;
} & Omit<Dialog.RootProps, "initialFocusEl">;

export const Modal: ParentComponent<ModalProps> = (props) => {
  // remove `initialFocusEl` to override it
  // role="alertdialog" breaks focus trap
  // TODO: report bug to Ark UI
  // https://github.com/chakra-ui/zag/blob/a3ea8a50672aac3f25e5644d4708b9d8286a4302/CHANGELOG.md?plain=1#L1030C56-L1030C67
  const [split, rest] = splitProps(props, ["initialFocusEl", "role"]);
  const [contentEl, setContentEl] = createSignal<HTMLDivElement>();

  createResizeObserver(contentEl, (_, element) => {
    const minDim = Math.min(element.clientWidth, element.clientHeight);
    const t = Math.min(1, Math.max(0, (minDim - 300) / 240));
    element.style.setProperty("--modal-t", t.toFixed(4));
  });

  const actionButtons = () => {
    const buttons: { type: ModalActionType; action: ModalAction }[] = [];

    if (props.actions?.secondary) {
      buttons.push({ type: "secondary", action: props.actions.secondary });
    }

    if (props.actions?.primary) {
      buttons.push({ type: "primary", action: props.actions.primary });
    }

    return buttons;
  };

  return (
    <SmartEnvironmentProvider>
      {(root) => {
        // Decorate initialFocusEl to provide root from SmartEnvironmentProvider
        const initialFocusElProp = props.initialFocusEl
          ? { initialFocusEl: () => props.initialFocusEl!(root) }
          : {};

        return (
          <Dialog.Root
            // prevent closing by clicking outside
            onFocusOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
            {...initialFocusElProp}
            {...rest}
          >
            {/* Ark UI renders an empty portal even if it's not open, which is why
            we need to wrap it in a <Show>
            https://github.com/chakra-ui/ark/discussions/3252
            */}
            <Show when={props.open}>
              <Portal mount={props.mountTarget}>
                <Dialog.Positioner
                  class="h-100dvh w-100dvw top-0 left-0 fixed grid
                    place-items-center p-[clamp(1.5rem,6dvmin,3rem)]"
                >
                  <Dialog.Backdrop
                    class="absolute top-0 left-0 w-full h-full bg-black
                      bg-opacity-50 backdrop-blur-sm"
                  />

                  {/* The modal dialog itself */}
                  <Dialog.Content
                    ref={setContentEl}
                    role={split.role}
                    class="bg-white color-dark-900 rounded-2 shadow-lg relative
                      flex flex-col min-h-0 [--modal-t:0]
                      text-[calc(0.875rem+0.125rem*var(--modal-t))] max-h-full
                      w-[min(540px,100%)] p-[clamp(1.5rem,6dvmin,3rem)] gap-6
                      lt-h-sm:gap-4"
                    // `--modal-t` is a 0→1 progress variable computed by
                    // ResizeObserver from min(width, height) of the modal.
                    // t=0 at 300px, t=1 at 540px.
                    // All fluid properties use: calc(min + range * var(--modal-t))
                  >
                    {/* Close button */}
                    <Show when={props.showCloseButton}>
                      <Dialog.CloseTrigger
                        // TODO: Localize
                        aria-label="Close"
                        class="absolute top-2.5 right-2.5 w-8 h-8 flex
                          items-center justify-center bg-transparent border-none
                          transition-colors transition-duration-100
                          hover:bg-gray-100 active:bg-gray-200"
                        onClick={props.onCloseClicked}
                      >
                        <IconClose class="w-3.5 h-3.5" />
                      </Dialog.CloseTrigger>
                    </Show>

                    {/* Main content */}
                    <div
                      class="grid min-h-0"
                      classList={{
                        "overflow-y-auto": props.scrollable !== false,
                        "overflow-hidden": props.scrollable === false,
                      }}
                    >
                      {props.children}
                    </div>

                    {/* Action buttons */}
                    <Show when={props.actions}>
                      <div class="flex justify-center gap-2 w-full shrink-0">
                        <Key each={actionButtons()} by="type">
                          {(item) => {
                            // a derived accessor is required for reactivity
                            const buttonProps = () => {
                              const { label, ...others } = item().action;
                              return others;
                            };

                            // full class name needs to be evaluated for UnoCSS extraction
                            const btnClass =
                              item().type === "primary"
                                ? "btn-primary"
                                : "btn-secondary";

                            return (
                              <Dialog.CloseTrigger
                                class={`btn ${btnClass} max-w-[30ch] flex-1
                                min-w-0`}
                                {...buttonProps()}
                              >
                                {item().action.label}
                              </Dialog.CloseTrigger>
                            );
                          }}
                        </Key>
                      </div>
                    </Show>
                  </Dialog.Content>
                </Dialog.Positioner>
              </Portal>
            </Show>
          </Dialog.Root>
        );
      }}
    </SmartEnvironmentProvider>
  );
};

export type AlertModalProps = SetRequired<ModalProps, "actions">;

/**
 *  Like `Modal`, only `alertdialog` by default and requires actions
 */
export const AlertModal: ParentComponent<AlertModalProps> = (props) => {
  return <Modal role="alertdialog" {...props} />;
};
