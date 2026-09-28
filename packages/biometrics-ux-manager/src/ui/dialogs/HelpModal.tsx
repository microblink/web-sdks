/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { Modal } from "@microblink/shared-components/Modal";
import { type Component, createEffect, createMemo, createSignal, createUniqueId, For, Index, on } from "solid-js";
import { Dynamic } from "solid-js/web";

import CameraLensIllustration from "../assets/dialogs/camera-lens.svg?component-solid";
import CenteredFaceIllustration from "../assets/dialogs/centered-face.svg?component-solid";
import LightingIllustration from "../assets/dialogs/lighting.svg?component-solid";
import ObstructionsIllustration from "../assets/dialogs/obstructions.svg?component-solid";
import { useLocalization } from "../LocalizationContext";

export type HelpModalProps = {
  mountTarget: HTMLElement;
  open: boolean;
  isDesktop: boolean;
  onClose: () => void;
};

export const HelpModal: Component<HelpModalProps> = (props) => {
  const { t } = useLocalization();

  const [stepIndex, setStepIndex] = createSignal(0);
  const [hasNavigated, setHasNavigated] = createSignal(false);
  const firstDescriptionId = createUniqueId();

  let firstHeadingEl: HTMLHeadingElement | null = null;

  const steps = createMemo(() => [
    ...(props.isDesktop
      ? [
          {
            title: t.help_modal.steps.camera_lens.title,
            details: t.help_modal.steps.camera_lens.details,
            illustration: CameraLensIllustration,
          },
        ]
      : []),
    {
      title: t.help_modal.steps.centered_face.title,
      details: t.help_modal.steps.centered_face.details,
      illustration: CenteredFaceIllustration,
    },
    {
      title: t.help_modal.steps.lighting.title,
      details: t.help_modal.steps.lighting.details,
      illustration: LightingIllustration,
    },
    {
      title: t.help_modal.steps.obstructions.title,
      details: t.help_modal.steps.obstructions.details,
      illustration: ObstructionsIllustration,
    },
  ]);

  const currentStep = createMemo(() => steps()[stepIndex()] ?? steps()[0]);
  const isLastStep = createMemo(() => stepIndex() === steps().length - 1);

  const close = () => {
    setStepIndex(0);
    setHasNavigated(false);
    props.onClose();
  };

  const navigateTo = (index: number) => {
    setStepIndex(index);
    setHasNavigated(true);
  };

  createEffect(
    on(
      () => props.isDesktop,
      () => {
        setStepIndex(0);
        setHasNavigated(false);

        if (props.open) {
          queueMicrotask(() => {
            firstHeadingEl?.focus();
          });
        }
      },
      { defer: true },
    ),
  );

  createEffect(
    on(
      () => props.open,
      () => {
        setStepIndex(0);
        setHasNavigated(false);
      },
      { defer: true },
    ),
  );

  return (
    <Modal
      mountTarget={props.mountTarget}
      open={props.open}
      aria-label={t.help_modal.aria}
      contentClass={`mb-bio-dialog ${props.isDesktop ? "mb-bio-dialog-desktop" : "mb-bio-dialog-mobile"}`}
      fluidScaleMode="width"
      showCloseButton
      closeButtonAriaLabel={t.close}
      onEscapeKeyDown={close}
      onCloseClicked={close}
      initialFocusEl={() => firstHeadingEl}
      scrollable={false}
      actions={{
        primary: {
          label: isLastStep() ? t.help_modal.done_btn : t.help_modal.next_btn,
          "aria-label": isLastStep() ? t.help_modal.done_btn_aria : t.help_modal.next_btn,
          onClick: () => (isLastStep() ? close() : navigateTo(stepIndex() + 1)),
          class: "mb-bio-dialog-action",
        },
        secondary: {
          label: t.help_modal.back_btn,
          onClick: () => navigateTo(Math.max(0, stepIndex() - 1)),
          disabled: stepIndex() === 0,
          class: "mb-bio-dialog-action",
        },
      }}
    >
      <div
        class="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto]
          overflow-hidden"
      >
        <div class="sr-only" aria-live="polite" aria-atomic="true">
          {hasNavigated() ? `${currentStep().title}. ${currentStep().details}` : ""}
        </div>

        <div class="grid min-h-0 overflow-y-auto compact:overflow-hidden">
          <For each={steps()}>
            {(step, index) => {
              const isActive = () => stepIndex() === index();

              return (
                <div
                  aria-hidden={hasNavigated() || !isActive() ? "true" : undefined}
                  data-active-step={isActive() ? "true" : "false"}
                  class="mb-bio-dialog-layout mb-bio-help-dialog-layout
                    col-start-1 row-start-1 grid h-full min-h-0 grid-cols-1
                    gap-2
                    compact:grid-cols-[minmax(7rem,11.25rem)_minmax(0,1fr)]
                    compact:grid-rows-[minmax(0,1fr)]"
                  classList={{ invisible: !isActive() }}
                >
                  <div
                    aria-hidden="true"
                    class="mb-bio-dialog-visual mx-auto grid h-full min-h-0
                      w-full max-w-[17.5rem] place-items-center overflow-hidden
                      compact:max-w-[11.25rem]"
                  >
                    <Dynamic
                      component={step.illustration}
                      viewBox="0 0 280 197"
                      class="mb-bio-dialog-illustration block h-auto max-h-full
                        w-auto max-w-full"
                    />
                  </div>
                  <div class="compact:min-h-0 compact:overflow-y-auto">
                    <h2
                      ref={index() === 0 ? (el) => (firstHeadingEl = el) : undefined}
                      tabIndex={index() === 0 ? -1 : undefined}
                      aria-describedby={index() === 0 ? firstDescriptionId : undefined}
                      class="mb-bio-dialog-title outline-none
                        compact:!text-start"
                    >
                      {step.title}
                    </h2>
                    <p
                      id={index() === 0 ? firstDescriptionId : undefined}
                      class="mb-bio-dialog-description compact:!text-start"
                    >
                      {step.details}
                    </p>
                  </div>
                </div>
              );
            }}
          </For>
        </div>

        <div
          class="relative z-10 flex items-center justify-center gap-3 bg-white
            py-3"
          aria-hidden="true"
          data-testid="help-progress"
        >
          <Index each={steps()}>
            {(_, index) => (
              <span
                class="size-[9px] rounded-full transition-colors"
                classList={{
                  "bg-primary": stepIndex() === index,
                  "bg-gray-300": stepIndex() !== index,
                }}
                data-active={stepIndex() === index ? "true" : "false"}
              />
            )}
          </Index>
        </div>
      </div>
    </Modal>
  );
};
