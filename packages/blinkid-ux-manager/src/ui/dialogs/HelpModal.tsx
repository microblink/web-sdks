/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { Modal } from "@microblink/shared-components/Modal";
import {
  type Component,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  Index,
  on,
  onCleanup,
  ParentComponent,
} from "solid-js";
import { useBlinkIdUiStore } from "../BlinkIdUiStoreContext";

import { Tooltip } from "@ark-ui/solid";
import HelpOcclusion from "../assets/help/help_occlusion.svg";
import HelpCameraLens from "../assets/help/help_camera_lens.svg?component-solid";
import HelpLighting from "../assets/help/help_lighting.svg?component-solid";
import HelpBlur from "../assets/help/help_blur.svg?component-solid";
import QuestionIcon from "../assets/icons/icon-question.svg?component-solid";

import { Dynamic } from "solid-js/web";

import { useLocalization } from "../LocalizationContext";

/**
 * The HelpModal component.
 *
 * @returns The HelpModal component.
 */
export const HelpModal: Component<{ isDesktop: boolean }> = (props) => {
  const { t } = useLocalization();

  const { store, updateStore } = useBlinkIdUiStore();

  const [step, setStep] = createSignal(0);

  const isModalOpen = () => store.showHelpModal;
  const isLastStep = () => step() === steps().length - 1;
  const closeModal = () => updateStore({ showHelpModal: false });

  /**
   * Fix for timing issue, array is created before `t` is updated.
   */
  const steps = createMemo(() => [
    ...(props.isDesktop
      ? [
          {
            title: t.help_modal_camera_lens_title,
            img: HelpCameraLens,
            description: t.help_modal_camera_lens_details,
          },
        ]
      : []),
    {
      title: t.help_modal_title_1,
      img: HelpOcclusion,
      description: t.help_modal_details_1,
    },
    {
      title: t.help_modal_title_2,
      img: HelpLighting,
      description: t.help_modal_details_2,
    },
    {
      title: t.help_modal_title_3,
      img: HelpBlur,
      description: props.isDesktop
        ? t.help_modal_blur_details_desktop
        : t.help_modal_details_3,
    },
  ]);

  const onClose = () => {
    void store.blinkIdUxManager.analytics.logHelpClosedEvent(isLastStep());
    setStep(0);
  };

  createEffect(
    on(
      () => isModalOpen(),
      (open) => {
        if (open) {
          void store.blinkIdUxManager.analytics.logHelpOpenedEvent();
        } else {
          onClose();
        }
      },
      { defer: true },
    ),
  );

  onCleanup(() => {
    onClose();
  });

  const firstHeadingId = createUniqueId();
  const [nextButtonRef, setNextButtonRef] =
    createSignal<HTMLButtonElement | null>(null);

  return (
    <Modal
      mountTarget={store.cameraManagerComponent.overlayLayerNode}
      open={isModalOpen()}
      showCloseButton
      onEscapeKeyDown={() => closeModal()}
      onCloseClicked={() => closeModal()}
      initialFocusEl={() => nextButtonRef()}
      aria-label={t.scanning_help}
      scrollable={false}
      actions={{
        primary: {
          "aria-label": isLastStep()
            ? t.resume_scanning
            : t.help_modal_next_btn,
          label: isLastStep() ? t.help_modal_done_btn : t.help_modal_next_btn,
          onClick: () => (isLastStep() ? closeModal() : setStep(step() + 1)),
          ref: setNextButtonRef,
        },
        secondary: {
          label: t.help_modal_back_btn,
          onClick: () => setStep(step() - 1),
          disabled: step() === 0,
        },
      }}
    >
      <div
        role="region"
        class="h-full min-h-0 overflow-hidden grid
          grid-rows-[minmax(0,1fr)_auto]"
      >
        {/* Content Area */}
        <div class="min-h-0 overflow-y-auto compact:overflow-hidden">
          <div
            aria-live="polite"
            aria-atomic="true"
            class="grid h-full min-h-0"
          >
            <Index each={steps()}>
              {(stepItem, index) => (
                <div
                  class="grid-area-[1/1] min-h-0 compact:h-full"
                  classList={{ invisible: step() !== index }}
                >
                  <article
                    class="grid grid-cols-1 gap-2 min-h-0 compact:h-full
                      compact:grid-cols-[minmax(7rem,11.25rem)_minmax(0,1fr)]
                      compact:grid-rows-[minmax(0,1fr)]"
                  >
                    <div
                      aria-hidden="true"
                      class="compact:col-start-1 compact:self-start"
                    >
                      <Dynamic
                        component={stepItem().img}
                        class="w-full max-w-[17.5rem] m-x-auto
                          compact:max-w-[11.25rem]"
                      />
                    </div>
                    <div
                      class="compact:col-start-2 compact:min-h-0 compact:h-full
                        compact:overflow-y-auto"
                    >
                      <h2
                        class="dialog-title compact:!text-left"
                        id={index === 0 ? firstHeadingId : undefined}
                        tabIndex={index === 0 ? -1 : undefined}
                        // punctuation causes pause on screen reader
                        aria-label={`${stepItem().title}.`}
                      >
                        {stepItem().title}
                      </h2>
                      <p class="dialog-description compact:!text-left">
                        {stepItem().description}
                      </p>
                    </div>
                  </article>
                </div>
              )}
            </Index>
          </div>
        </div>

        {/* Progress Dots - purely visual */}
        <div
          class="relative z-10 bg-white flex items-center justify-center gap-3
            py-3"
          aria-hidden="true"
        >
          <Index each={steps()}>
            {(_, index) => (
              <div
                class="size-[9px] rounded-full transition-colors"
                classList={{
                  "bg-primary": step() === index,
                  "bg-gray-300": step() !== index,
                }}
              />
            )}
          </Index>
        </div>
      </div>
    </Modal>
  );
};

/**
 * The HelpButton component.
 *
 * @param props - The props for the HelpButton component.
 * @returns The HelpButton component.
 */
export const HelpButton: ParentComponent<{ isProcessing: boolean }> = (
  props,
) => {
  const { t } = useLocalization();
  const { store, updateStore } = useBlinkIdUiStore();

  const [tooltipOpen, setTooltipOpen] = createSignal(false);
  const [wasAutoShown, setWasAutoShown] = createSignal(false);

  let showTooltipTimeoutId: number | undefined;
  let hideTooltipTimeoutId: number | undefined;

  const clearTimeouts = () => {
    if (showTooltipTimeoutId !== undefined) {
      window.clearTimeout(showTooltipTimeoutId);
      showTooltipTimeoutId = undefined;
    }
    if (hideTooltipTimeoutId !== undefined) {
      window.clearTimeout(hideTooltipTimeoutId);
      hideTooltipTimeoutId = undefined;
    }
  };

  const scheduleAutoHide = () => {
    const displayDuration = store.helpTooltipHideDelay;
    if (displayDuration && displayDuration > 0) {
      hideTooltipTimeoutId = window.setTimeout(() => {
        setTooltipOpen(false);
      }, displayDuration);
    }
  };

  const showTooltipAutomatically = () => {
    const timeout = store.helpTooltipShowDelay;
    if (timeout && timeout > 0) {
      showTooltipTimeoutId = window.setTimeout(() => {
        setTooltipOpen(true);
        setWasAutoShown(true);
        scheduleAutoHide();
      }, timeout);
    }
  };

  // Cleanup on component unmount
  onCleanup(clearTimeouts);

  // Handle processing state changes
  createEffect(() => {
    if (!props.isProcessing) {
      setTooltipOpen(false);
      setWasAutoShown(false);
      clearTimeouts();
      return;
    }

    // Show tooltip only if it hasn't been shown before
    if (!tooltipOpen() && !wasAutoShown()) {
      showTooltipAutomatically();
    }
  });

  // handle analytics
  createEffect(() => {
    if (tooltipOpen()) {
      void store.blinkIdUxManager.analytics.logHelpTooltipDisplayedEvent();
    }
  });

  return (
    <Tooltip.Root
      positioning={{ placement: "top-end" }}
      open={tooltipOpen()}
      openDelay={300}
      closeDelay={300}
      onOpenChange={(details) => setTooltipOpen(details.open)}
    >
      <Tooltip.Trigger
        part="help-button-part"
        aria-label={t.help_aria_label}
        class="btn-focus rounded-full bg-white grid place-items-center size-9
          appearance-none border-none hover:bg-gray-100 active:bg-gray-200
          pos-absolute bottom-4 right-4 [&_svg]:size-7"
        onClick={() => updateStore({ showHelpModal: true })}
      >
        <QuestionIcon aria-hidden="true" />
      </Tooltip.Trigger>

      <Tooltip.Positioner>
        <Tooltip.Content
          part="help-button-tooltip-part"
          class="bg-primary color-white text-align-center p-2 rounded-md text-sm
            drop-shadow-md"
          // Prevent duplicate announcement
          aria-hidden="true"
        >
          <Tooltip.Arrow
            class="[--arrow-size:0.5rem]
              [--arrow-background:rgb(var(--color-primary))]"
          >
            <Tooltip.ArrowTip />
          </Tooltip.Arrow>
          {t.help_tooltip}
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  );
};
