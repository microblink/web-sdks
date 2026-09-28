/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type {} from "@vitest/browser-playwright";
import { createSignal } from "solid-js";
import { render } from "solid-js/web";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cdp, page, userEvent } from "vitest/browser";

import { createFeedbackUiError, createFeedbackUiState, setupFeedbackUiHarness } from "../../test/feedbackUiHarness";
import { HelpModal } from "./dialogs/HelpModal";
import en from "./locales/en";
import { LocalizationProvider } from "./LocalizationContext";

const { mount } = setupFeedbackUiHarness();

const errorDialogCases = [
  {
    kind: "scanningUnsuccessful",
    title: en.error_dialogs.scanning_unsuccessful.title,
    description: en.error_dialogs.scanning_unsuccessful.details,
    primaryAction: en.error_dialogs.retry_btn,
  },
  {
    kind: "scanningNotAvailable",
    title: en.error_dialogs.scanning_not_available.title,
    description: en.error_dialogs.scanning_not_available.aria_description,
    primaryAction: en.close,
  },
] as const;

afterEach(() => {
  vi.useRealTimers();
});

describe("BiometricsFeedbackUi accessibility", () => {
  it("keeps one paced polite status stream separate from visible feedback", () => {
    vi.useFakeTimers();
    const view = mount(createFeedbackUiState({ key: "capturing" }));
    const status = view.query<HTMLElement>('[role="status"]');
    const visibleFeedback = view.query<HTMLElement>(".mb-bio-status-stack");

    expect(status?.textContent).toBe(en.feedback_messages.face_not_found);
    expect(visibleFeedback?.getAttribute("aria-hidden")).toBe("true");
    expect(visibleFeedback?.textContent).toContain(en.feedback_messages.face_not_found);

    vi.advanceTimersByTime(1_000);
    view.setState({ sessionState: "PROCESSING" });

    expect(status?.textContent).toBe(en.processing);

    view.setState({ key: "complete", sessionState: "COMPLETE" });

    expect(status?.textContent).toBe(en.processing);
    expect(visibleFeedback?.textContent).toContain(en.feedback_messages.ok);

    vi.advanceTimersByTime(999);
    expect(status?.textContent).toBe(en.processing);

    vi.advanceTimersByTime(1);
    expect(status?.textContent).toBe(en.feedback_messages.capture_complete_aria);

    expect(view.queryAll('[role="status"]')).toHaveLength(1);
    expect(view.query('[role="status"]')).toBe(status);
    view.cleanup();
  });

  it("announces face guidance when capture starts after onboarding", () => {
    vi.useFakeTimers();
    const view = mount(createFeedbackUiState({ key: "onboarding" }));
    const status = view.query('[role="status"]');

    expect(status?.textContent).toBe("");

    view.setState({ key: "capturing" });

    expect(status?.textContent).toContain(en.feedback_messages.face_not_found);

    view.setState({ feedback: "TOO_CLOSE" });

    expect(status?.textContent).toContain(en.feedback_messages.face_not_found);

    vi.advanceTimersByTime(1_000);

    expect(status?.textContent).toContain(en.feedback_messages.too_close);
    expect(view.query('[role="status"]')).toBe(status);
    view.cleanup();
  });

  it("narrates onboarding before moving to the start action", async () => {
    const view = mount(createFeedbackUiState({ key: "onboarding" }));
    const heading = await vi.waitFor(() => {
      const element = view.query<HTMLElement>('[role="dialog"]');
      const title = view.query<HTMLElement>("h2.mb-bio-dialog-title[tabindex='-1']");

      expect(title).toBeInstanceOf(HTMLHeadingElement);
      expect(document.activeElement).toBe(title);
      expect(element?.getAttribute("aria-label")).toBe(en.onboarding_modal.aria);
      expect(element?.hasAttribute("aria-labelledby")).toBe(false);
      expect(element?.hasAttribute("aria-describedby")).toBe(false);
      expect(view.referencedText(title!, "aria-describedby")).toBe(en.onboarding_modal.details);

      return title!;
    });

    await userEvent.tab();
    expect(document.activeElement).toBe(view.buttonNamed(en.onboarding_modal.start_btn));
    expect(view.query<HTMLElement>('[role="dialog"]')?.contains(document.activeElement)).toBe(true);
    expect(heading.tabIndex).toBe(-1);
    await userEvent.keyboard("{Enter}");
    expect(view.manager.beginCapture).toHaveBeenCalledOnce();
    view.cleanup();
  });

  it("cancels onboarding with Escape", async () => {
    const onClose = vi.fn();
    const view = mount(createFeedbackUiState({ key: "onboarding" }), {
      onClose,
    });

    await vi.waitFor(() => {
      const heading = view.query<HTMLElement>("h2.mb-bio-dialog-title[tabindex='-1']");
      expect(document.activeElement).toBe(heading);
    });
    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledOnce();
    view.cleanup();
  });

  it.each(errorDialogCases)(
    "names and describes every error dialog and focuses its primary action",
    async ({ kind, title, description, primaryAction }) => {
      const view = mount(
        createFeedbackUiState({
          key: "error",
          error: createFeedbackUiError(),
          errorDialogKind: kind,
        }),
      );

      const dialog = await vi.waitFor(() => {
        const element = view.query<HTMLElement>('[role="dialog"]');

        expect(element).toBeInstanceOf(HTMLElement);
        expect(document.activeElement).toBe(view.buttonNamed(primaryAction));

        return element!;
      });

      expect(view.referencedText(dialog, "aria-labelledby")).toBe(title);
      expect(view.referencedText(dialog, "aria-describedby")).toBe(description);

      view.cleanup();
    },
  );

  it("supports retryable error actions and focus trapping from the keyboard", async () => {
    const onClose = vi.fn();
    const view = mount(
      createFeedbackUiState({
        key: "error",
        error: createFeedbackUiError(),
        errorDialogKind: "scanningUnsuccessful",
      }),
      { onClose },
    );

    const retry = view.buttonNamed(en.error_dialogs.retry_btn);
    const cancel = view.buttonNamed(en.error_dialogs.cancel_btn);
    const dialog = view.query<HTMLElement>('[role="dialog"]');

    await vi.waitFor(() => expect(document.activeElement).toBe(retry));

    await userEvent.keyboard("{Enter}");
    expect(view.manager.retry).toHaveBeenCalledOnce();

    await userEvent.tab();
    expect(document.activeElement).toBe(cancel);

    await userEvent.tab();
    expect(document.activeElement).toBe(retry);
    expect(dialog?.contains(document.activeElement)).toBe(true);

    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(cancel);

    await userEvent.keyboard(" ");
    expect(onClose).toHaveBeenCalledOnce();

    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(2);

    view.cleanup();
  });

  it("supports terminal error dismissal from the keyboard", async () => {
    const onClose = vi.fn();
    const view = mount(
      createFeedbackUiState({
        key: "error",
        error: createFeedbackUiError("terminal", false),
        errorDialogKind: "scanningNotAvailable",
      }),
      { onClose },
    );
    const close = view.buttonNamed(en.close);

    await vi.waitFor(() => expect(document.activeElement).toBe(close));

    await userEvent.keyboard("{Enter}");
    expect(onClose).toHaveBeenCalledOnce();

    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(2);

    view.cleanup();
  });

  it("traps help-dialog focus, handles Escape, and restores focus", async () => {
    const view = mount(createFeedbackUiState({ key: "capturing" }));
    const helpButton = view.query<HTMLButtonElement>(`button[aria-label="${en.help_button.aria_label}"]`);
    expect(helpButton).toBeInstanceOf(HTMLButtonElement);
    helpButton?.focus();
    view.setState({ key: "help" });

    const dialog = await vi.waitFor(() => {
      const element = view.query<HTMLElement>('[role="dialog"]');
      const heading = view.query<HTMLElement>("[data-active-step='true'] h2[tabindex='-1']");

      expect(heading).toBeInstanceOf(HTMLHeadingElement);
      expect(document.activeElement).toBe(heading);
      expect(element?.getAttribute("aria-label")).toBe(en.help_modal.aria);
      expect(element?.hasAttribute("aria-labelledby")).toBe(false);
      expect(element?.hasAttribute("aria-describedby")).toBe(false);
      expect(view.referencedText(heading!, "aria-describedby")).toBe(en.help_modal.steps.camera_lens.details);

      return element!;
    });

    const helpAnnouncements = dialog.querySelector('[aria-live="polite"]');
    const captureStatus = view.query('[role="status"]');
    const activePage = dialog.querySelector("[data-active-step='true']");

    expect(helpAnnouncements?.textContent).toBe("");
    expect(captureStatus?.textContent).toBe("");
    expect(activePage?.hasAttribute("aria-hidden")).toBe(false);

    await userEvent.tab();
    expect(document.activeElement).toBe(view.buttonNamed(en.help_modal.next_btn));

    const nextMutations: MutationRecord[] = [];
    const nextObserver = new MutationObserver((records) => {
      nextMutations.push(...records);
    });
    nextObserver.observe(helpAnnouncements!, {
      characterData: true,
      childList: true,
      subtree: true,
    });

    await userEvent.keyboard("{Enter}");

    await vi.waitFor(() => {
      expect(helpAnnouncements?.textContent).toBe(
        `${en.help_modal.steps.centered_face.title}. ${en.help_modal.steps.centered_face.details}`,
      );
      expect(
        [...dialog.querySelectorAll("[data-active-step]")].every((page) => page.getAttribute("aria-hidden") === "true"),
      ).toBe(true);
      expect(captureStatus?.textContent).toBe("");
    });
    await vi.waitFor(() => expect(nextMutations).toHaveLength(1));
    nextObserver.disconnect();

    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(view.buttonNamed(en.help_modal.back_btn));

    const backMutations: MutationRecord[] = [];
    const backObserver = new MutationObserver((records) => {
      backMutations.push(...records);
    });
    backObserver.observe(helpAnnouncements!, {
      characterData: true,
      childList: true,
      subtree: true,
    });

    await userEvent.keyboard(" ");

    await vi.waitFor(() => {
      expect(helpAnnouncements?.textContent).toBe(
        `${en.help_modal.steps.camera_lens.title}. ${en.help_modal.steps.camera_lens.details}`,
      );
    });
    await vi.waitFor(() => expect(backMutations).toHaveLength(1));
    backObserver.disconnect();

    view.buttonNamed(en.help_modal.next_btn)?.click();
    view.buttonNamed(en.help_modal.next_btn)?.click();
    view.buttonNamed(en.help_modal.next_btn)?.click();

    expect(view.buttonNamed(en.help_modal.done_btn)?.getAttribute("aria-label")).toBe(en.help_modal.done_btn_aria);

    await userEvent.tab({ shift: true });

    expect(dialog.contains(document.activeElement)).toBe(true);

    await userEvent.keyboard("{Escape}");

    expect(view.closeHelp).toHaveBeenCalledOnce();

    view.setState({ key: "capturing" });

    await vi.waitFor(() => expect(document.activeElement).toBe(helpButton));

    view.setState({ key: "help" });

    await vi.waitFor(() => {
      const reopenedDialog = view.query<HTMLElement>('[role="dialog"]');
      const reopenedHeading = reopenedDialog?.querySelector<HTMLElement>("[data-active-step='true'] h2[tabindex='-1']");
      const reopenedAnnouncements = reopenedDialog?.querySelector('[aria-live="polite"]');

      expect(document.activeElement).toBe(reopenedHeading);
      expect(reopenedAnnouncements?.textContent).toBe("");
      expect(captureStatus?.textContent).toBe("");
    });

    view.cleanup();
  });

  it("resets and refocuses Help when its layout changes", async () => {
    const root = document.createElement("div");
    const overlay = document.createElement("div");
    const [isDesktop, setIsDesktop] = createSignal(true);

    document.body.append(root, overlay);

    const dispose = render(
      () => (
        <LocalizationProvider>
          <HelpModal mountTarget={overlay} open isDesktop={isDesktop()} onClose={() => undefined} />
        </LocalizationProvider>
      ),
      root,
    );

    await vi.waitFor(() => {
      const heading = overlay.querySelector<HTMLElement>("[data-active-step='true'] h2[tabindex='-1']");
      expect(document.activeElement).toBe(heading);
      expect(heading?.textContent).toBe(en.help_modal.steps.camera_lens.title);
    });

    const next = [...overlay.querySelectorAll<HTMLButtonElement>("button")].find(
      (button) => button.textContent?.trim() === en.help_modal.next_btn,
    );
    next?.click();

    await vi.waitFor(() => expect(overlay.querySelector('[aria-live="polite"]')?.textContent).not.toBe(""));

    setIsDesktop(false);

    await vi.waitFor(() => {
      const heading = overlay.querySelector<HTMLElement>("[data-active-step='true'] h2[tabindex='-1']");
      expect(document.activeElement).toBe(heading);
      expect(heading?.textContent).toBe(en.help_modal.steps.centered_face.title);
      expect(overlay.querySelector('[aria-live="polite"]')?.textContent).toBe("");
      const pages = [...overlay.querySelectorAll<HTMLElement>("[data-active-step]")];
      expect(pages.find((page) => page.dataset.activeStep === "true")?.hasAttribute("aria-hidden")).toBe(false);
      expect(
        pages
          .filter((page) => page.dataset.activeStep !== "true")
          .every((page) => page.getAttribute("aria-hidden") === "true"),
      ).toBe(true);
    });

    dispose();
    root.remove();
    overlay.remove();
  });

  it("focuses and describes the mobile Help first page", async () => {
    const view = mount(createFeedbackUiState({ key: "help" }), {
      isDesktop: false,
    });

    await vi.waitFor(() => {
      const dialog = view.query<HTMLElement>('[role="dialog"]');
      const heading = dialog?.querySelector<HTMLElement>("[data-active-step='true'] h2[tabindex='-1']");

      expect(document.activeElement).toBe(heading);
      expect(heading?.textContent).toBe(en.help_modal.steps.centered_face.title);
      expect(view.referencedText(heading!, "aria-describedby")).toBe(en.help_modal.steps.centered_face.details);
      expect(dialog?.querySelector('[aria-live="polite"]')?.textContent).toBe("");
    });

    view.cleanup();
  });

  it("uses reduced-motion scan and success animation settings", async () => {
    const session = cdp();

    await session.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });

    const view = mount(createFeedbackUiState({ key: "capturing", sessionState: "PROCESSING" }));

    await vi.waitFor(() => expect(view.query("section.mb-bio")?.getAttribute("data-reduced-motion")).toBe("true"));

    const startedAt = performance.now();
    view.setState({ key: "complete", sessionState: "COMPLETE" });

    const scan = view.query<HTMLElement>(".mb-bio-scan");
    const scanTrail = scan?.querySelector<HTMLElement>(".mb-bio-scan-trail") ?? null;
    const scanLine = scan?.querySelector<HTMLElement>(".mb-bio-scan-line") ?? null;

    expect(scanTrail?.style.height).toBe("100%");
    expect(window.getComputedStyle(scanTrail!).transitionProperty).toBe("none");
    expect(window.getComputedStyle(scanLine!).display).toBe("none");
    expect(view.query(".mb-bio-success-animation")).toBeNull();
    expect(view.query(".mb-bio-status")?.textContent).toBe(en.feedback_messages.ok);

    const successAnimation = await vi.waitFor(
      () => {
        const element = view.query<HTMLElement>(".mb-bio-success-animation");

        expect(element).toBeInstanceOf(HTMLElement);

        return element!;
      },
      { timeout: 1_500 },
    );
    const successMark = successAnimation.querySelector<SVGElement>(".mb-bio-success-mark");
    const successAnimationStyle = window.getComputedStyle(successAnimation);

    expect(performance.now() - startedAt).toBeGreaterThanOrEqual(900);
    expect(view.query(".mb-bio-scan")).toBeNull();
    expect(window.getComputedStyle(successMark!).animationName).toBe("none");

    expect(successAnimationStyle.opacity).toBe("1");
    expect(successAnimationStyle.transitionProperty).toBe("none");
    expect(successAnimationStyle.transitionDuration).toBe("0s");
    expect(view.captureAnimationComplete).not.toHaveBeenCalled();

    await vi.waitFor(() => expect(view.captureAnimationComplete).toHaveBeenCalledOnce(), { timeout: 1_500 });

    expect(performance.now() - startedAt).toBeGreaterThanOrEqual(1_900);

    await new Promise((resolve) => window.setTimeout(resolve, 350));

    expect(view.captureAnimationComplete).toHaveBeenCalledOnce();

    view.cleanup();
  });

  it("reflows long localized dialog copy and actions", async () => {
    await page.viewport(640, 640);

    document.documentElement.dir = "rtl";
    const session = cdp();

    await session.send("Emulation.setEmulatedMedia", {
      features: [{ name: "forced-colors", value: "active" }],
    });

    const view = mount(createFeedbackUiState({ key: "onboarding" }), {
      strings: {
        onboarding_modal: {
          title: "Prepare to capture your face securely with a considerably longer localized heading",
          details: "Keep your entire face visible and follow every instruction shown on screen before continuing.",
          start_btn: "Begin secure face capture when you are completely ready",
          cancel_btn: "Cancel and return to the previous step",
        },
        help_modal: {
          back_btn: "Return to the previous detailed instruction",
          next_btn: "Continue to the following detailed instruction",
          done_btn: "Finish reviewing all capture instructions",
        },
      },
    });

    const expectActionsFit = (target = view) => {
      const actions = target.queryAll<HTMLButtonElement>(".mb-bio-dialog-action");
      expect(actions.length).toBeGreaterThan(0);

      for (const action of actions) {
        const style = window.getComputedStyle(action);
        expect(style.whiteSpace).toBe("normal");
        expect(action.scrollWidth).toBeLessThanOrEqual(action.clientWidth + 1);
        expect(action.scrollHeight).toBeLessThanOrEqual(action.clientHeight + 1);
        expect(action.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
      }
    };

    await vi.waitFor(() => expect(view.query('[role="dialog"]')).toBeInstanceOf(HTMLElement));

    expect(window.matchMedia("(forced-colors: active)").matches).toBe(true);
    expect(getComputedStyle(view.query("section.mb-bio")!).direction).toBe("rtl");
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth + 1);
    expectActionsFit();

    await page.viewport(320, 640);

    view.setState({ key: "help" });

    await vi.waitFor(
      () => {
        expect(view.query("[data-active-step='true']")).toBeInstanceOf(HTMLElement);
        expect(document.body.textContent).toContain(en.help_modal.steps.camera_lens.title);
      },
      { timeout: 3_000 },
    );

    expectActionsFit();
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth + 1);

    view.cleanup();
  });

  it("reflows error copy and actions", async () => {
    await page.viewport(320, 640);

    const session = cdp();
    await session.send("Emulation.setEmulatedMedia", {
      features: [{ name: "forced-colors", value: "active" }],
    });

    const view = mount(
      createFeedbackUiState({
        key: "error",
        error: createFeedbackUiError(),
        errorDialogKind: "scanningUnsuccessful",
      }),
    );

    await vi.waitFor(() => expect(view.overlay.textContent).toContain(en.error_dialogs.scanning_unsuccessful.title));

    const actions = view.queryAll<HTMLButtonElement>(".mb-bio-dialog-action");
    expect(actions).toHaveLength(2);

    for (const action of actions) {
      const style = window.getComputedStyle(action);

      expect(style.whiteSpace).toBe("normal");
      expect(action.scrollWidth).toBeLessThanOrEqual(action.clientWidth + 1);
      expect(action.scrollHeight).toBeLessThanOrEqual(action.clientHeight + 1);
      expect(action.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    }

    expect(window.matchMedia("(forced-colors: active)").matches).toBe(true);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth + 1);

    view.cleanup();
  });

  it("uses logical text alignment in compact RTL Help", async () => {
    await page.viewport(844, 390);

    document.documentElement.dir = "rtl";
    const view = mount(createFeedbackUiState({ key: "help" }));

    const title = await vi.waitFor(() => {
      const element = view.query<HTMLElement>("[data-active-step='true'] .mb-bio-dialog-title");

      return element!;
    });

    const description = view.query<HTMLElement>("[data-active-step='true'] .mb-bio-dialog-description");

    expect(window.getComputedStyle(title).textAlign).toBe("start");
    expect(description).toBeInstanceOf(HTMLElement);
    expect(window.getComputedStyle(description!).textAlign).toBe("start");

    view.cleanup();
  });

  it("scales compact landscape dialogs by width", async () => {
    await page.viewport(844, 390);

    const view = mount(createFeedbackUiState({ key: "onboarding" }));

    await vi.waitFor(() => {
      const dialog = view.query<HTMLElement>('[role="dialog"]');

      expect(dialog).toBeInstanceOf(HTMLElement);
      expect(dialog!.clientHeight).toBeLessThan(dialog!.clientWidth);

      const widthScale = Math.min(1, Math.max(0, (dialog!.clientWidth - 300) / 240)).toFixed(4);
      const minimumScale = Math.min(
        1,
        Math.max(0, (Math.min(dialog!.clientWidth, dialog!.clientHeight) - 300) / 240),
      ).toFixed(4);

      expect(dialog!.style.getPropertyValue("--modal-t")).toBe(widthScale);
      expect(widthScale).not.toBe(minimumScale);
    });

    view.cleanup();
  });

  it("scales dialog illustrations to the available width and height", async () => {
    const measureActiveVisual = async (view: ReturnType<typeof mount>) =>
      vi.waitFor(() => {
        const wrapper = view.query<HTMLElement>(".mb-bio-dialog-layout:not(.invisible) .mb-bio-dialog-visual");
        const illustration = wrapper?.querySelector<SVGSVGElement>(".mb-bio-dialog-illustration");

        expect(wrapper).toBeInstanceOf(HTMLElement);
        expect(illustration).toBeInstanceOf(SVGSVGElement);

        const wrapperBounds = wrapper!.getBoundingClientRect();
        const illustrationBounds = illustration!.getBoundingClientRect();
        const intrinsicWidth = Number(illustration!.getAttribute("width"));
        const intrinsicHeight = Number(illustration!.getAttribute("height"));

        expect(illustrationBounds.width).toBeGreaterThan(0);
        expect(illustrationBounds.height).toBeGreaterThan(0);
        expect(intrinsicWidth).toBeGreaterThan(0);
        expect(intrinsicHeight).toBeGreaterThan(0);
        expect(illustration!.getAttribute("viewBox")).toBe(`0 0 ${intrinsicWidth} ${intrinsicHeight}`);
        expect(illustrationBounds.left).toBeGreaterThanOrEqual(wrapperBounds.left - 0.5);
        expect(illustrationBounds.right).toBeLessThanOrEqual(wrapperBounds.right + 0.5);
        expect(illustrationBounds.top).toBeGreaterThanOrEqual(wrapperBounds.top - 0.5);
        expect(illustrationBounds.bottom).toBeLessThanOrEqual(wrapperBounds.bottom + 0.5);
        expect(illustrationBounds.width / illustrationBounds.height).toBeCloseTo(intrinsicWidth / intrinsicHeight, 2);

        return illustrationBounds.height;
      });

    await page.viewport(320, 640);

    const onboarding = mount(createFeedbackUiState({ key: "onboarding" }));
    const tallOnboardingHeight = await measureActiveVisual(onboarding);

    await page.viewport(200, 640);

    const narrowOnboardingHeight = await measureActiveVisual(onboarding);

    expect(narrowOnboardingHeight).toBeLessThan(tallOnboardingHeight);
    onboarding.cleanup();

    await page.viewport(500, 640);

    const heightConstrainedOnboarding = mount(createFeedbackUiState({ key: "onboarding" }));
    const tallWideOnboardingHeight = await measureActiveVisual(heightConstrainedOnboarding);

    await page.viewport(500, 320);

    const shortWideOnboardingHeight = await measureActiveVisual(heightConstrainedOnboarding);

    expect(shortWideOnboardingHeight).toBeLessThan(tallWideOnboardingHeight);
    heightConstrainedOnboarding.cleanup();

    const measureHelpVisuals = async (width: number, height: number) => {
      await page.viewport(width, height);

      const help = mount(createFeedbackUiState({ key: "help" }));
      const heights: number[] = [];

      for (let index = 0; index < 4; index += 1) {
        heights.push(await measureActiveVisual(help));

        if (index < 3) {
          help.buttonNamed(en.help_modal.next_btn)?.click();
        }
      }

      help.cleanup();

      return heights;
    };

    const tallHelpHeights = await measureHelpVisuals(320, 640);
    const narrowHelpHeights = await measureHelpVisuals(200, 640);
    const tallWideHelpHeights = await measureHelpVisuals(500, 640);
    const shortWideHelpHeights = await measureHelpVisuals(500, 320);

    expect(narrowHelpHeights).toHaveLength(tallHelpHeights.length);

    for (const [index, narrowHeight] of narrowHelpHeights.entries()) {
      expect(narrowHeight).toBeLessThan(tallHelpHeights[index]);
    }

    expect(shortWideHelpHeights).toHaveLength(tallWideHelpHeights.length);

    for (const [index, shortHeight] of shortWideHelpHeights.entries()) {
      expect(shortHeight).toBeLessThan(tallWideHelpHeights[index]);
    }

    await page.viewport(320, 320);

    const constrainedOnboarding = mount(createFeedbackUiState({ key: "onboarding" }));
    const constrainedOnboardingHeight = await measureActiveVisual(constrainedOnboarding);

    expect(constrainedOnboardingHeight).toBeGreaterThanOrEqual(40);
    constrainedOnboarding.cleanup();

    const constrainedHelpHeights = await measureHelpVisuals(320, 320);

    for (const constrainedHeight of constrainedHelpHeights) {
      expect(constrainedHeight).toBeGreaterThanOrEqual(40);
    }
  });

  it("preserves dialog action hit areas", async () => {
    await page.viewport(320, 640);

    const view = mount(createFeedbackUiState({ key: "onboarding" }));

    const expectMinimumHitAreas = () => {
      const buttons = view.queryAll<HTMLButtonElement>("button");

      expect(buttons.length).toBeGreaterThan(0);

      for (const button of buttons) {
        const bounds = button.getBoundingClientRect();
        const label = button.getAttribute("aria-label") ?? button.textContent?.trim();

        expect(bounds.width, `${label} button width`).toBeGreaterThanOrEqual(44);
        expect(bounds.height, `${label} button height`).toBeGreaterThanOrEqual(44);
      }
    };

    await vi.waitFor(() => expect(view.query('[role="dialog"]')).toBeInstanceOf(HTMLElement));
    expectMinimumHitAreas();

    view.setState({ key: "help" });

    await vi.waitFor(() => expect(view.buttonNamed(en.help_modal.next_btn)).toBeInstanceOf(HTMLButtonElement));

    expectMinimumHitAreas();

    view.setState({
      key: "error",
      error: createFeedbackUiError(),
      errorDialogKind: "scanningUnsuccessful",
    });

    await vi.waitFor(() => expect(view.buttonNamed(en.error_dialogs.retry_btn)).toBeInstanceOf(HTMLButtonElement));

    expectMinimumHitAreas();

    view.setState({
      errorDialogKind: "scanningNotAvailable",
    });

    await vi.waitFor(() => expect(view.buttonNamed(en.close)).toBeInstanceOf(HTMLButtonElement));

    expectMinimumHitAreas();

    view.cleanup();
  });
});
