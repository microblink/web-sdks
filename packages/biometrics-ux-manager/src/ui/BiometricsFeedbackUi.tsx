/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { CaptureSessionState } from "@microblink/biometrics-core";
import type {
  BiometricsUxManager,
  BiometricsUxSessionEvent,
  BiometricsUxState,
} from "@microblink/biometrics-ux-manager/core";
import { createEffect, createMemo, createSignal, onCleanup, onMount, Show, untrack } from "solid-js";

import { ErrorModal } from "./dialogs/ErrorModal";
import { HelpButton } from "./dialogs/HelpButton";
import { HelpModal } from "./dialogs/HelpModal";
import { OnboardingModal } from "./dialogs/OnboardingModal";
import { type BiometricsErrorDialogs, resolveErrorDialogCopy } from "./errorDialogs";
import { feedbackMessages } from "./feedbackMessages";
import { useLocalization } from "./LocalizationContext";
import { createPoliteAnnouncementStream } from "./politeAnnouncementStream";
import { UiFeedbackOverlay } from "./UiFeedbackOverlay";

export type BiometricsFeedbackUiProps<DialogKind extends string = never> = {
  manager: BiometricsFeedbackUiManager<DialogKind>;
  overlayLayerNode: HTMLElement;
  onClose?: () => void;
  showHelpButton: boolean;
  errorDialogs?: BiometricsErrorDialogs<DialogKind>;
};

export type BiometricsFeedbackUiManager<DialogKind extends string = never> = Pick<
  BiometricsUxManager<unknown, BiometricsUxSessionEvent, unknown, unknown, DialogKind>,
  | "isDesktop"
  | "getState"
  | "subscribe"
  | "beginCapture"
  | "retry"
  | "openHelp"
  | "closeHelp"
  | "captureAnimationComplete"
>;

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const CAPTURE_PROGRESS_START = 0.1;
const VISUAL_CAPTURE_PROGRESS_DURATION_MS = 1_000;
const CAPTURE_SUCCESS_DURATION_MS = 2_000;
const PROGRESS_UPDATE_INTERVAL_MS = 50;

declare global {
  interface Window {
    __biometricsUxManagerCssCode?: string;
  }
}

function useReducedMotion(): () => boolean {
  const [reducedMotion, setReducedMotion] = createSignal(false);

  onMount(() => {
    const mediaQuery = window.matchMedia(reducedMotionQuery);
    const update = () => setReducedMotion(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    onCleanup(() => mediaQuery.removeEventListener("change", update));
  });

  return reducedMotion;
}

function getVisualCaptureProgress(elapsedMs: number, visualDurationMs: number, startProgress: number): number {
  const normalizedProgress = Math.min(1, Math.max(0, elapsedMs / Math.max(1, visualDurationMs)));

  return Math.max(startProgress, normalizedProgress);
}

function statusText(sessionState: CaptureSessionState, feedbackText: string, processingText: string): string {
  switch (sessionState) {
    case "PROCESSING":
      return processingText;
    default:
      return feedbackText;
  }
}

export function BiometricsFeedbackUi<DialogKind extends string = never>(props: BiometricsFeedbackUiProps<DialogKind>) {
  const { t } = useLocalization();
  const announcementStream = createPoliteAnnouncementStream();
  const [state, setState] = createSignal<BiometricsUxState<unknown, DialogKind>>(
    untrack(() => props.manager.getState()),
  );
  const reducedMotion = useReducedMotion();
  const [progressStartTimeMs, setProgressStartTimeMs] = createSignal<number | null>(null);
  const [progressNowMs, setProgressNowMs] = createSignal(0);
  const [isProgressComplete, setIsProgressComplete] = createSignal(false);
  const [captureCompletionNotified, setCaptureCompletionNotified] = createSignal(false);

  onMount(() => {
    const unsubscribe = props.manager.subscribe((nextState) => {
      setState(nextState);

      switch (nextState.key) {
        case "capturing":
          announcementStream.publish(
            nextState.sessionState === "PROCESSING"
              ? { text: t.processing, kind: "milestone" }
              : {
                  text: t.feedback_messages[feedbackMessages[nextState.feedback]],
                  kind: "guidance",
                },
          );
          break;
        case "processing":
          announcementStream.publish({
            text: t.processing,
            kind: "milestone",
          });
          break;
        case "complete":
          announcementStream.publish({
            text: t.feedback_messages.capture_complete_aria,
            kind: "milestone",
          });
          break;
        default:
          announcementStream.reset();
      }
    });
    onCleanup(() => {
      unsubscribe();
      announcementStream.dispose();
    });

    if (state().key === "idle") {
      void props.manager.beginCapture();
    }
  });

  const feedbackText = () => t.feedback_messages[feedbackMessages[state().feedback]];

  const isCaptureComplete = () => state().key === "complete" && state().sessionState === "COMPLETE";

  const visibleStatusText = () => {
    switch (state().key) {
      case "capturing":
        return statusText(state().sessionState, feedbackText(), t.processing);
      case "processing":
        return t.processing;
      case "complete":
        return t.feedback_messages.ok;
      default:
        return "";
    }
  };

  const captureProgress = createMemo(() => {
    if (state().sessionState === "PROCESSING") {
      return CAPTURE_PROGRESS_START;
    }

    if (state().sessionState !== "COMPLETE") {
      return 0;
    }

    if (reducedMotion()) {
      return 1;
    }

    const progressStart = progressStartTimeMs();

    if (progressStart === null) {
      return CAPTURE_PROGRESS_START;
    }

    const elapsedMs = progressNowMs() - progressStart;

    return getVisualCaptureProgress(elapsedMs, VISUAL_CAPTURE_PROGRESS_DURATION_MS, CAPTURE_PROGRESS_START);
  });

  const captureAnimationComplete = () => {
    if (captureCompletionNotified()) {
      return;
    }

    setCaptureCompletionNotified(true);
    props.manager.captureAnimationComplete();
  };

  createEffect(() => {
    if (!isCaptureComplete()) {
      setProgressStartTimeMs(null);
      setProgressNowMs(0);
      setIsProgressComplete(false);
      setCaptureCompletionNotified(false);

      return;
    }

    const now = performance.now();
    const progressStart = progressStartTimeMs() ?? now;

    if (progressStartTimeMs() === null) {
      setProgressStartTimeMs(progressStart);
      setProgressNowMs(now);
    }

    const progressTimerId = window.setTimeout(
      () => {
        setProgressNowMs(performance.now());
        setIsProgressComplete(true);
      },
      Math.max(0, progressStart + VISUAL_CAPTURE_PROGRESS_DURATION_MS - now),
    );
    const completionTimerId = window.setTimeout(
      captureAnimationComplete,
      Math.max(0, progressStart + CAPTURE_SUCCESS_DURATION_MS - now),
    );

    onCleanup(() => {
      window.clearTimeout(progressTimerId);
      window.clearTimeout(completionTimerId);
    });
  });

  createEffect(() => {
    if (!isCaptureComplete() || isProgressComplete()) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setProgressNowMs(performance.now());
    }, PROGRESS_UPDATE_INTERVAL_MS);

    onCleanup(() => window.clearInterval(intervalId));
  });

  const showProgress = createMemo(
    () => state().sessionState === "PROCESSING" || (isCaptureComplete() && !isProgressComplete()),
  );

  const start = () => {
    void props.manager.beginCapture();
  };

  const retry = () => {
    void props.manager.retry();
  };

  const close = () => {
    props.onClose?.();
  };

  const openHelp = () => {
    props.manager.openHelp();
  };

  const closeHelp = () => {
    void props.manager.closeHelp();
  };

  return (
    <section
      class="mb-bio"
      data-layout={props.manager.isDesktop ? "desktop" : "mobile"}
      data-reduced-motion={reducedMotion() ? "true" : "false"}
      aria-label={t.sdk_aria}
    >
      <style
        id="biometrics-ux-manager-style"
        ref={(ref) => {
          if (window.__biometricsUxManagerCssCode) {
            ref.innerHTML = window.__biometricsUxManagerCssCode;
          }
        }}
      />

      <UiFeedbackOverlay
        landmarks={state().landmarks}
        boundingBox={state().boundingBox}
        faceBounds={state().faceBounds}
        feedback={state().feedback}
        frameWidth={state().frameSize.width}
        frameHeight={state().frameSize.height}
        mirrorX={state().mirrorX}
        landmarksVisible={!!state().landmarks}
        showProgress={showProgress()}
        captureProgress={captureProgress()}
        showSuccess={isCaptureComplete() && isProgressComplete()}
      />

      <div class="mb-bio-status-stack" aria-hidden="true">
        <Show when={visibleStatusText()}>
          <div
            class="mb-bio-status rounded-2 bg-gray-550/90 px-4 py-3 text-center
              text-balance text-white
              text-shadow-[0_1px_4px_rgba(0,0,0,0.1)] backdrop-blur-xl"
          >
            {visibleStatusText()}
          </div>
        </Show>
      </div>
      <div class="sr-only" role="status" aria-atomic="true">
        {announcementStream.text()}
      </div>

      <Show when={props.showHelpButton && (state().key === "capturing" || state().key === "help")}>
        <HelpButton showNudge={state().key === "capturing" && state().helpNudgeVisible} onClick={openHelp} />
      </Show>

      <Show when={state().key === "onboarding"}>
        <OnboardingModal
          mountTarget={props.overlayLayerNode}
          open={state().key === "onboarding"}
          isDesktop={props.manager.isDesktop}
          onStart={start}
          onCancel={close}
        />
      </Show>

      <Show when={state().key === "help"}>
        <HelpModal
          mountTarget={props.overlayLayerNode}
          open={state().key === "help"}
          isDesktop={props.manager.isDesktop}
          onClose={closeHelp}
        />
      </Show>

      <Show when={state().key === "error"}>
        <ErrorModal
          mountTarget={props.overlayLayerNode}
          open={state().key === "error"}
          isDesktop={props.manager.isDesktop}
          copy={resolveErrorDialogCopy(state().errorDialogKind, t, props.errorDialogs)}
          onRetry={retry}
          onExit={close}
        />
      </Show>
    </section>
  );
}
