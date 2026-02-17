/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { Modal } from "@microblink/shared-components/Modal";
import {
  type Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  ParentComponent,
} from "solid-js";
import { useBlinkCardUiStore } from "../BlinkCardUiStoreContext";

import { Carousel, DialogTitle, Tooltip } from "@ark-ui/solid";

import HelpBlur from "../assets/help/help_blur.svg?component-solid";
import HelpCameraLens from "../assets/help/help_camera_lens.svg?component-solid";
import HelpCardNumber from "../assets/help/help_card_number.svg?component-solid";
import HelpOcclusion from "../assets/help/help_occlusion.svg?component-solid";
import HelpLighting from "../assets/help/help_lighting.svg?component-solid";
import QuestionIcon from "../assets/icons/icon-question.svg?component-solid";

import { Dynamic } from "solid-js/web";

import { useLocalization } from "../LocalizationContext";
import styles from "./styles.module.scss";

/**
 * The HelpModal component.
 *
 * @returns The HelpModal component.
 */
export const HelpModal: Component<{ isDesktop: boolean }> = (props) => {
  const { t } = useLocalization();

  const { store, updateStore } = useBlinkCardUiStore();

  const [currentStep, setCurrentStep] = createSignal(0);

  const modalVisible = () => store.showHelpModal;

  const hideModal = () => {
    updateStore({ showHelpModal: false });
    setCurrentStep(0);
    void store.blinkCardUxManager.cameraManager.startFrameCapture();
    void store.blinkCardUxManager.logHelpClosed(isLastStep());
  };

  const steps = createMemo(() => {
    const stepsArray: {
      title: () => string;
      img: Component;
      text: () => string;
    }[] = [
      {
        title: () => t.help_modal.card_number.title,
        img: HelpCardNumber,
        text: () => t.help_modal.card_number.details,
      },
      ...(props.isDesktop
        ? [
            {
              title: () => t.help_modal.camera_lens.title,
              img: HelpCameraLens,
              text: () => t.help_modal.camera_lens.details,
            },
          ]
        : []),
      {
        title: () => t.help_modal.occlusion.title,
        img: HelpOcclusion,
        text: () => t.help_modal.occlusion.details,
      },
      {
        title: () => t.help_modal.lighting.title,
        img: HelpLighting,
        text: () => t.help_modal.lighting.details,
      },
      {
        title: () => t.help_modal.blur.title,
        img: HelpBlur,
        text: () =>
          props.isDesktop
            ? t.help_modal.blur.details_desktop
            : t.help_modal.blur.details,
      },
    ];
    return stepsArray;
  });

  const isLastStep = () => currentStep() === steps().length - 1;
  const isFirstStep = () => currentStep() === 0;

  let startScanningBtnRef!: HTMLButtonElement;

  createEffect(() => {
    if (modalVisible()) {
      void store.blinkCardUxManager.logHelpOpened();
    }
  });

  createEffect(() => {
    const showHelpModal = store.showHelpModal;

    if (showHelpModal === undefined) {
      return;
    }

    if (showHelpModal) {
      store.blinkCardUxManager.cameraManager.stopFrameCapture();
    } else {
      void store.blinkCardUxManager.cameraManager.startFrameCapture();
    }
  });

  return (
    <Modal
      mountTarget={store.cameraManagerComponent.overlayLayerNode}
      open={modalVisible()}
      showCloseButton
      onCloseClicked={() => hideModal()}
    >
      <Carousel.Root
        defaultPage={0}
        slideCount={steps().length}
        page={currentStep()}
        onPageChange={(details) => setCurrentStep(details.page)}
        class={styles.carousel}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
      >
        <Carousel.ItemGroup class={styles.itemGroup}>
          <For each={steps()}>
            {(step, index) => (
              <Carousel.Item class={styles.item} index={index()}>
                <Dynamic component={step.img} aria-hidden />
                <div class={styles.textContent}>
                  <DialogTitle>{step.title()}</DialogTitle>
                  <p>{step.text()}</p>
                </div>
              </Carousel.Item>
            )}
          </For>
        </Carousel.ItemGroup>
        <Carousel.IndicatorGroup class={styles.indicators}>
          <For each={steps()}>
            {(_, i) => (
              <Carousel.Indicator
                index={i()}
                readOnly
                class={styles.indicator}
                aria-hidden
                tabIndex={-1}
              />
            )}
          </For>
        </Carousel.IndicatorGroup>
        <Carousel.Control class={styles.controls}>
          <div class={styles.controlsInner}>
            <Carousel.PrevTrigger
              class={styles.buttonSecondary}
              disabled={isFirstStep()}
            >
              {t.help_modal.back_btn}
            </Carousel.PrevTrigger>
            <Carousel.NextTrigger
              ref={startScanningBtnRef}
              class={styles.buttonPrimary}
              onClick={() => {
                if (currentStep() >= steps().length - 1) {
                  hideModal();
                }
              }}
              disabled={false}
            >
              {isLastStep() ? t.help_modal.done_btn : t.help_modal.next_btn}
            </Carousel.NextTrigger>
          </div>
        </Carousel.Control>
      </Carousel.Root>
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
  const { store, updateStore } = useBlinkCardUiStore();

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

  createEffect(() => {
    if (tooltipOpen()) {
      void store.blinkCardUxManager.logHelpTooltipDisplayed();
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
        aria-label={t.help_button.aria_label}
        class={styles.helpButton}
        onClick={() => updateStore({ showHelpModal: true })}
      >
        <QuestionIcon />
      </Tooltip.Trigger>

      <Tooltip.Positioner>
        <Tooltip.Content part="help-button-tooltip-part" class={styles.tooltip}>
          <Tooltip.Arrow class={styles.arrow}>
            <Tooltip.ArrowTip />
          </Tooltip.Arrow>
          {t.help_button.tooltip}
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  );
};
