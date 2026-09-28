/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";

import { createFeedbackUiError, createFeedbackUiState, setupFeedbackUiHarness } from "../../test/feedbackUiHarness";
import en from "./locales/en";

const { mount } = setupFeedbackUiHarness();

function useAnimationClock() {
  vi.useFakeTimers();
  let currentTime = 0;

  vi.spyOn(performance, "now").mockImplementation(() => currentTime);

  return (durationMs: number) => {
    let remainingMs = durationMs;

    while (remainingMs > 0) {
      const tickMs = Math.min(remainingMs, 50);
      currentTime += tickMs;
      vi.advanceTimersByTime(tickMs);
      remainingMs -= tickMs;
    }
  };
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("BiometricsFeedbackUi", () => {
  it("starts capture from onboarding", async () => {
    const view = mount(createFeedbackUiState({ key: "onboarding" }));

    const start = await vi.waitFor(() => {
      const button = view.buttonNamed(en.onboarding_modal.start_btn);
      expect(button).toBeInstanceOf(HTMLButtonElement);

      return button!;
    });
    start.click();

    expect(view.manager.beginCapture).toHaveBeenCalledOnce();
  });

  it("does not show a cancel action in onboarding", async () => {
    const view = mount(createFeedbackUiState({ key: "onboarding" }));

    await vi.waitFor(() => expect(view.buttonNamed(en.onboarding_modal.start_btn)).toBeInstanceOf(HTMLButtonElement));

    expect(view.buttonNamed(en.onboarding_modal.cancel_btn)).toBeUndefined();
  });

  it.each([
    {
      name: "desktop onboarding",
      key: "onboarding" as const,
      isDesktop: true,
      width: 500,
      viewport: [1440, 1024] as const,
    },
    {
      name: "desktop help",
      key: "help" as const,
      isDesktop: true,
      width: 500,
      viewport: [1440, 1024] as const,
    },
    {
      name: "desktop error",
      key: "error" as const,
      isDesktop: true,
      width: 452,
      viewport: [1440, 1024] as const,
    },
    {
      name: "mobile onboarding",
      key: "onboarding" as const,
      isDesktop: false,
      width: 300,
      viewport: [375, 812] as const,
    },
    {
      name: "mobile help",
      key: "help" as const,
      isDesktop: false,
      width: 300,
      viewport: [375, 812] as const,
    },
    {
      name: "mobile error",
      key: "error" as const,
      isDesktop: false,
      width: 300,
      viewport: [375, 812] as const,
    },
  ])("matches the Figma width for $name", async ({ key, isDesktop, width, viewport }) => {
    await page.viewport(viewport[0], viewport[1]);
    const view = mount(createFeedbackUiState({ key }), { isDesktop });

    const dialog = await vi.waitFor(() => {
      const element = view.query<HTMLElement>('[role="dialog"]');
      expect(element).toBeInstanceOf(HTMLElement);

      return element!;
    });
    const style = getComputedStyle(dialog);

    expect(dialog.getBoundingClientRect().width).toBe(width);
    expect(style.paddingLeft).toBe("24px");
    expect(style.paddingRight).toBe("24px");
  });

  it("shows help and its nudge only while requested", () => {
    const view = mount(createFeedbackUiState());
    const helpButton = view.query<HTMLButtonElement>(`button[aria-label="${en.help_button.aria_label}"]`);

    expect(helpButton).toBeInstanceOf(HTMLButtonElement);
    expect(view.root.textContent).not.toContain(en.help_button.tooltip);
    view.setState({ helpNudgeVisible: true });
    expect(view.root.textContent).toContain(en.help_button.tooltip);

    const helpNudge = view.query<HTMLElement>('[part="help-button-tooltip-part"]');
    expect(getComputedStyle(helpNudge!).display).toBe("flex");
    expect(getComputedStyle(helpNudge!).alignItems).toBe("center");

    helpButton?.click();

    expect(view.manager.openHelp).toHaveBeenCalledOnce();

    view.setState({ key: "help" });
    expect(view.root.textContent).not.toContain(en.help_button.tooltip);
  });

  it("hides the help button and its nudge when disabled", () => {
    const view = mount(createFeedbackUiState({ helpNudgeVisible: true }), {
      showHelpButton: false,
    });

    expect(view.query(`button[aria-label="${en.help_button.aria_label}"]`)).toBeNull();
    expect(view.root.textContent).not.toContain(en.help_button.tooltip);

    view.setState({ key: "help" });

    expect(view.query(`button[aria-label="${en.help_button.aria_label}"]`)).toBeNull();
  });

  it.each([
    { isDesktop: true, label: "desktop" },
    { isDesktop: false, label: "mobile" },
  ])("uses the host face-guide width on $label", ({ isDesktop }) => {
    const view = mount(createFeedbackUiState({ sessionState: "PROCESSING" }), {
      isDesktop,
    });

    view.root.style.setProperty("--mb-bio-face-visual-width", "180px");

    expect(view.query<HTMLElement>(".mb-bio-scan-oval")?.getBoundingClientRect().width).toBe(180);
  });

  it("uses semantic dialog text colors", async () => {
    const view = mount(createFeedbackUiState({ key: "onboarding" }));

    view.overlay.style.setProperty("--color-deep-blue", "1 2 3");
    view.overlay.style.setProperty("--color-gray-600-rgb-value", "4 5 6");

    const title = await vi.waitFor(() => {
      const element = view.query<HTMLElement>(".mb-bio-dialog-title");
      expect(element).toBeInstanceOf(HTMLElement);

      return element!;
    });
    const description = view.query<HTMLElement>(".mb-bio-dialog-description");

    expect(getComputedStyle(title).color).toBe("rgb(1, 2, 3)");
    expect(getComputedStyle(description!).color).toBe("rgb(4, 5, 6)");
  });

  it("uses semantic feedback colors", () => {
    const landmarks = {
      LeftEye: { x: 0.4, y: 0.4 },
      RightEye: { x: 0.6, y: 0.4 },
      NoseTip: { x: 0.5, y: 0.5 },
      Mouth: { x: 0.5, y: 0.6 },
      LeftEar: { x: 0.3, y: 0.5 },
      RightEar: { x: 0.7, y: 0.5 },
    };
    const view = mount(
      createFeedbackUiState({
        feedback: "OK",
        landmarks,
        boundingBox: { x: 0.3, y: 0.2, width: 0.4, height: 0.6 },
      }),
    );

    view.root.style.setProperty("--color-primary", "1 2 3");
    view.root.style.setProperty("--color-success", "4 5 6");
    view.root.style.setProperty("--color-error", "7 8 9");

    expect(getComputedStyle(view.query(".mb-bio-landmark-point")!).backgroundColor).toBe("rgb(1, 2, 3)");
    expect(getComputedStyle(view.query(".mb-bio-landmark-box")!).borderColor).toBe("rgb(4, 5, 6)");

    view.setState({ feedback: "FACE_NOT_FOUND" });

    expect(getComputedStyle(view.query(".mb-bio-landmark-box")!).borderColor).toBe("rgb(7, 8, 9)");
  });

  it("includes the camera-lens help step only on desktop", async () => {
    const desktop = mount(createFeedbackUiState({ key: "help" }));
    await vi.waitFor(() => expect(desktop.overlay.textContent).toContain(en.help_modal.steps.camera_lens.title));
    desktop.cleanup();

    const mobile = mount(createFeedbackUiState({ key: "help" }), {
      isDesktop: false,
    });
    await vi.waitFor(() => expect(mobile.overlay.textContent).toContain(en.help_modal.steps.centered_face.title));
    expect(mobile.overlay.textContent).not.toContain(en.help_modal.steps.camera_lens.title);
  });

  it("routes help close and resets its step", async () => {
    const view = mount(createFeedbackUiState({ key: "help" }));

    const next = await vi.waitFor(() => {
      const button = view.buttonNamed(en.help_modal.next_btn);
      expect(button).toBeInstanceOf(HTMLButtonElement);

      return button!;
    });
    next.click();
    expect(view.overlay.textContent).toContain(en.help_modal.steps.centered_face.title);

    view.query<HTMLButtonElement>(`button[aria-label="${en.close}"]`)?.click();
    await vi.waitFor(() => expect(view.closeHelp).toHaveBeenCalledOnce());

    view.setState({ key: "capturing" });
    view.setState({ key: "help" });

    await vi.waitFor(() => expect(view.overlay.textContent).toContain(en.help_modal.steps.camera_lens.title));
  });

  it("shows the scan overlay while processing", () => {
    const view = mount(createFeedbackUiState({ sessionState: "PROCESSING" }));

    expect(view.query(".mb-bio-scan")).toBeTruthy();
  });

  it("shows processing status after capture completes", () => {
    const view = mount(createFeedbackUiState({ key: "processing", sessionState: "COMPLETE", feedback: "OK" }));

    expect(view.query(".mb-bio-status")?.textContent).toBe(en.processing);
    expect(view.query('[role="status"]')?.textContent).toBe(en.processing);
  });

  it("shows one second of progress and one second of success", () => {
    const advance = useAnimationClock();
    const view = mount(
      createFeedbackUiState({
        key: "complete",
        sessionState: "COMPLETE",
        feedback: "OK",
      }),
    );

    expect(view.query(".mb-bio-scan")).toBeTruthy();
    expect(view.query<HTMLElement>(".mb-bio-scan-trail")?.style.height).toBe("10%");
    expect(view.query(".mb-bio-success-animation")).toBeNull();
    expect(view.captureAnimationComplete).not.toHaveBeenCalled();
    expect(view.query(".mb-bio-status")?.textContent).toBe(en.feedback_messages.ok);
    expect(view.query(".sr-only")?.textContent).toBe(en.feedback_messages.capture_complete_aria);

    advance(999);
    expect(view.query(".mb-bio-scan")).toBeTruthy();
    expect(view.query(".mb-bio-success-animation")).toBeNull();
    expect(view.captureAnimationComplete).not.toHaveBeenCalled();

    advance(1);
    expect(view.query(".mb-bio-scan")).toBeNull();
    expect(view.query(".mb-bio-success-animation")).toBeTruthy();
    expect(view.query(".mb-bio-success-mark")).toBeTruthy();
    expect(view.query(".mb-bio-status")?.textContent).toBe(en.feedback_messages.ok);
    expect(view.captureAnimationComplete).not.toHaveBeenCalled();

    advance(999);
    expect(view.query(".mb-bio-success-animation")).toBeTruthy();
    expect(view.captureAnimationComplete).not.toHaveBeenCalled();

    advance(1);
    expect(view.captureAnimationComplete).toHaveBeenCalledOnce();

    advance(1_000);
    expect(view.captureAnimationComplete).toHaveBeenCalledOnce();
  });

  it("cancels the success presentation when an alert appears", () => {
    const advance = useAnimationClock();
    const view = mount(
      createFeedbackUiState({
        key: "complete",
        sessionState: "COMPLETE",
        feedback: "OK",
      }),
    );

    advance(500);
    view.setState({
      key: "error",
      sessionState: "COMPLETE",
      errorDialogKind: "scanningNotAvailable",
    });

    expect(view.query(".mb-bio-scan")).toBeNull();
    expect(view.query(".mb-bio-success-animation")).toBeNull();

    advance(2_000);
    expect(view.captureAnimationComplete).not.toHaveBeenCalled();
  });

  it("offsets success above the scan anchor by rendered face width", () => {
    const advance = useAnimationClock();
    const view = mount(
      createFeedbackUiState({
        key: "complete",
        sessionState: "COMPLETE",
        feedback: "OK",
        faceBounds: { x: 0.25, y: 0.25, width: 0.5, height: 0.5 },
      }),
    );

    const scanOval = view.query<HTMLElement>(".mb-bio-scan-oval")!;
    expect(scanOval.style.top).toBe("50%");

    advance(1_000);

    const successAnimation = view.query<HTMLElement>(".mb-bio-success-animation")!;
    expect(successAnimation.style.top).toBe("calc(50% - 35.84px)");
  });

  it("hides raw errors and routes retry and cancel", async () => {
    const rawError = createFeedbackUiError("raw capture failure");
    const onClose = vi.fn();
    const view = mount(
      createFeedbackUiState({
        key: "error",
        errorDialogKind: "scanningUnsuccessful",
        error: rawError,
      }),
      { onClose },
    );

    await vi.waitFor(() => expect(view.overlay.textContent).toContain(en.error_dialogs.scanning_unsuccessful.title));
    expect(view.overlay.textContent).not.toContain(rawError.message);
    view.buttonNamed(en.error_dialogs.retry_btn)?.click();
    view.buttonNamed(en.error_dialogs.cancel_btn)?.click();

    expect(view.manager.retry).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders a title-only error without a description", async () => {
    const view = mount(
      createFeedbackUiState({
        key: "error",
        errorDialogKind: "scanningNotAvailable",
      }),
    );

    await vi.waitFor(() => expect(view.overlay.textContent).toContain(en.error_dialogs.scanning_not_available.title));

    expect(view.query(".mb-bio-dialog-description")).toBeNull();
  });

  it("renders custom error dialog copy", async () => {
    const view = mount(createFeedbackUiState({ key: "error", errorDialogKind: "offline" }), {
      errorDialogs: {
        offline: (t) => ({
          title: "You are offline",
          description: t.error_dialogs.scanning_unsuccessful.details,
          showDescription: true,
          retryable: true,
        }),
      },
    });

    await vi.waitFor(() => expect(view.overlay.textContent).toContain("You are offline"));

    expect(view.query(".mb-bio-dialog-description")?.textContent).toBe(en.error_dialogs.scanning_unsuccessful.details);

    view.buttonNamed(en.error_dialogs.retry_btn)?.click();
    expect(view.manager.retry).toHaveBeenCalledOnce();
  });

  it("routes the single unrecoverable action to the consumer", async () => {
    const onClose = vi.fn();
    const view = mount(
      createFeedbackUiState({
        key: "error",
        errorDialogKind: "scanningNotAvailable",
      }),
      { onClose },
    );

    await vi.waitFor(() => expect(view.queryAll("button")).toHaveLength(1));

    view.queryAll<HTMLButtonElement>("button")[0]?.click();

    expect(onClose).toHaveBeenCalledOnce();
  });
});
