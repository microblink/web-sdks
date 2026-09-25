/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

/** @jsxImportSource solid-js */

import { BiometricsError } from "@microblink/biometrics-core";
import type { CDPSession } from "@vitest/browser-playwright";
import { render } from "solid-js/web";
import { afterEach, vi } from "vitest";
import { cdp, page } from "vitest/browser";

import "virtual:uno.css";

import type { BiometricsUxState } from "../src/core/BiometricsUxManager";
import { BiometricsFeedbackUi } from "../src/ui/BiometricsFeedbackUi";
import type { BiometricsErrorDialogs, BiometricsFeedbackUiController } from "../src/ui/createBiometricsFeedbackUi";
import { LocalizationProvider, type PartialLocalizationStrings } from "../src/ui/LocalizationContext";

import "../src/ui/styles.css";

type FeedbackUiState = BiometricsUxState<BiometricsError, string>;

export function createFeedbackUiError(message = "capture failed", isRetryable = true): BiometricsError {
  return new BiometricsError({
    message,
    code: "INTERNAL_ERROR",
    stage: "capture",
    component: "sdk",
    isRetryable,
  });
}

export function createFeedbackUiState(patch: Partial<FeedbackUiState> = {}): FeedbackUiState {
  return {
    key: "capturing",
    sessionState: "ANALYZING",
    feedback: "FACE_NOT_FOUND",
    helpNudgeVisible: false,
    frameSize: { width: 640, height: 480 },
    mirrorX: false,
    ...patch,
  };
}

export function createFeedbackUiController(
  initialState = createFeedbackUiState(),
  options: { isDesktop?: boolean } = {},
) {
  let state = initialState;

  const captureAnimationComplete = vi.fn();
  const closeHelp = vi.fn(() => Promise.resolve());
  const close = vi.fn();

  const listeners = new Set<(state: FeedbackUiState) => void>();
  const manager = {
    isDesktop: options.isDesktop ?? true,
    getState: () => state,
    subscribe(listener: (state: FeedbackUiState) => void) {
      listeners.add(listener);
      listener(state);
      return () => listeners.delete(listener);
    },
    beginCapture: vi.fn(() => Promise.resolve(undefined)),
    retry: vi.fn(() => Promise.resolve(undefined)),
    openHelp: vi.fn(),
    closeHelp,
    captureAnimationComplete,
    close,
  } satisfies BiometricsFeedbackUiController<string>;

  return {
    manager,
    captureAnimationComplete,
    closeHelp,
    close,
    setState(patch: Partial<FeedbackUiState>) {
      state = { ...state, ...patch };
      for (const listener of listeners) {
        listener(state);
      }
    },
  };
}

export function setupFeedbackUiHarness() {
  const activeCleanups = new Set<() => void>();

  afterEach(async () => {
    for (const cleanup of [...activeCleanups]) {
      cleanup();
    }

    await new Promise((resolve) => setTimeout(resolve, 0));

    document.body.replaceChildren();
    document.documentElement.removeAttribute("dir");

    await page.viewport(1024, 768);

    const session: CDPSession = cdp();

    await session.send("Emulation.setEmulatedMedia", { features: [] });
    await session.send("Emulation.setPageScaleFactor", { pageScaleFactor: 1 });
  });

  const mount = (
    initialState: FeedbackUiState,
    options: {
      onClose?: () => void;
      strings?: PartialLocalizationStrings;
      isDesktop?: boolean;
      showHelpButton?: boolean;
      errorDialogs?: BiometricsErrorDialogs<string>;
    } = {},
  ) => {
    const overlay = document.createElement("div");
    const root = document.createElement("div");
    const controller = createFeedbackUiController(initialState, {
      isDesktop: options.isDesktop,
    });

    let cleaned = false;

    overlay.style.setProperty("--mb-size", "1");
    root.style.setProperty("--mb-size", "1");
    document.body.append(root, overlay);

    const dispose = render(
      // This Vitest harness lives outside the package build tsconfig, so typed lint cannot resolve its JSX return type.
      // oxlint-disable-next-line typescript/no-unsafe-return
      () => (
        <LocalizationProvider userStrings={options.strings}>
          <BiometricsFeedbackUi
            manager={controller.manager}
            overlayLayerNode={overlay}
            onClose={options.onClose}
            showHelpButton={options.showHelpButton ?? true}
            errorDialogs={options.errorDialogs}
          />
        </LocalizationProvider>
      ),
      root,
    );

    const query = <T extends Element>(selector: string): T | null =>
      overlay.querySelector<T>(selector) ?? root.querySelector<T>(selector);

    const queryAll = <T extends Element>(selector: string): T[] => [
      ...overlay.querySelectorAll<T>(selector),
      ...root.querySelectorAll<T>(selector),
    ];

    const cleanup = () => {
      if (cleaned) {
        return;
      }

      cleaned = true;
      activeCleanups.delete(cleanup);
      dispose();
      root.remove();
      overlay.remove();
    };

    activeCleanups.add(cleanup);

    return {
      root,
      overlay,
      ...controller,
      query,
      queryAll,
      buttonNamed(name: string): HTMLButtonElement | undefined {
        return queryAll<HTMLButtonElement>("button").find((button) => button.textContent?.trim() === name);
      },
      referencedText(element: Element, attribute: string): string | null {
        const id = element.getAttribute(attribute);

        if (!id) {
          return null;
        }

        return (
          root.querySelector<HTMLElement>(`#${CSS.escape(id)}`)?.textContent ??
          overlay.querySelector<HTMLElement>(`#${CSS.escape(id)}`)?.textContent ??
          null
        );
      },
      cleanup,
    };
  };

  return { mount };
}
