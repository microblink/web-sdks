/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";

import { createFeedbackUiError, createFeedbackUiState, setupFeedbackUiHarness } from "../../test/feedbackUiHarness";
import en from "./locales/en";

const { mount } = setupFeedbackUiHarness();

function pauseAnimations(element: Element) {
  const animations = element.getAnimations({ subtree: true });
  expect(animations.length).toBeGreaterThan(0);

  for (const animation of animations) {
    animation.pause();
    animation.currentTime = 0;
  }

  return animations;
}

function finishAnimations(element: Element) {
  for (const animation of element.getAnimations({ subtree: true })) {
    animation.finish();
  }

  element.dispatchEvent(new AnimationEvent("animationend", { bubbles: true }));
}

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

function transform(element: Element) {
  return new DOMMatrix(getComputedStyle(element).transform);
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

  it.each([true, false])("plays the whole scan and success animation (desktop: %s)", async (isDesktop) => {
    const view = mount(createFeedbackUiState({ key: "capturing", sessionState: "PROCESSING" }), { isDesktop });
    const trail = view.query<HTMLElement>(".mb-bio-scan-trail")!;
    const line = view.query<HTMLElement>(".mb-bio-scan-line")!;

    expect(transform(trail).d).toBe(0);
    expect(transform(line).f).toBe(0);

    view.setState({ key: "complete", sessionState: "COMPLETE", feedback: "OK" });
    const scan = view.query<HTMLElement>(".mb-bio-scan")!;
    const scanAnimations = pauseAnimations(scan);

    expect(transform(trail).d).toBe(0);
    expect(view.query(".mb-bio-success-animation")).toBeNull();
    expect(view.query(".mb-bio-status")?.textContent).toBe(en.feedback_messages.ok);

    for (const time of [50, 500, 950]) {
      for (const animation of scanAnimations) animation.currentTime = time;
      expect(transform(trail).d).toBeCloseTo(time / 1_000);
      expect(transform(line).f / line.getBoundingClientRect().height).toBeCloseTo(time / 1_000);
    }

    finishAnimations(trail);
    scanAnimations.forEach((animation) => animation.finish());
    expect(trail.isConnected).toBe(true);
    expect(transform(trail).d).toBe(1);
    expect(transform(line).f / line.getBoundingClientRect().height).toBeCloseTo(1);
    expect(view.captureAnimationComplete).not.toHaveBeenCalled();

    await vi.waitFor(() => expect(view.query(".mb-bio-success-animation")).toBeTruthy());
    const success = view.query<HTMLElement>(".mb-bio-success-animation")!;
    const mark = view.query<SVGElement>(".mb-bio-success-mark")!;
    const successAnimations = pauseAnimations(success);

    expect(getComputedStyle(success).opacity).toBe("0");
    expect(transform(mark).a).toBeCloseTo(0.82);
    successAnimations.forEach((animation) => {
      animation.currentTime = 150;
    });
    expect(Number(getComputedStyle(success).opacity)).toBeGreaterThan(0);
    expect(Number(getComputedStyle(success).opacity)).toBeLessThan(1);

    finishAnimations(mark);
    expect(view.captureAnimationComplete).not.toHaveBeenCalled();
    finishAnimations(success);
    expect(success.isConnected).toBe(true);
    expect(getComputedStyle(success).opacity).toBe("1");
    expect(transform(mark).a).toBe(1);
    expect(view.captureAnimationComplete).not.toHaveBeenCalled();

    await vi.waitFor(() => expect(view.captureAnimationComplete).toHaveBeenCalledOnce());
  });

  it("does not shorten success when the scan is delayed", async () => {
    const view = mount(createFeedbackUiState({ key: "complete", sessionState: "COMPLETE" }));
    const trail = view.query<HTMLElement>(".mb-bio-scan-trail")!;
    pauseAnimations(view.query(".mb-bio-scan")!);

    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"] });
    vi.advanceTimersByTime(5_000);
    expect(view.query(".mb-bio-success-animation")).toBeNull();
    expect(view.captureAnimationComplete).not.toHaveBeenCalled();
    vi.useRealTimers();

    finishAnimations(trail);
    await vi.waitFor(() => expect(view.query(".mb-bio-success-animation")).toBeTruthy());
    const success = view.query<HTMLElement>(".mb-bio-success-animation")!;
    pauseAnimations(success);
    await nextFrame();
    expect(view.captureAnimationComplete).not.toHaveBeenCalled();
    finishAnimations(success);
    await vi.waitFor(() => expect(view.captureAnimationComplete).toHaveBeenCalledOnce());
  });

  it.each(["error", "retry", "dispose"])("cancels pending completion on %s", async (interruption) => {
    const view = mount(createFeedbackUiState({ key: "complete", sessionState: "COMPLETE" }));
    finishAnimations(view.query(".mb-bio-scan-trail")!);
    await vi.waitFor(() => expect(view.query(".mb-bio-success-animation")).toBeTruthy());
    const success = view.query<HTMLElement>(".mb-bio-success-animation")!;
    pauseAnimations(success);
    finishAnimations(success);

    if (interruption === "dispose") {
      view.cleanup();
    } else {
      view.setState({
        key: interruption === "error" ? "error" : "capturing",
        sessionState: interruption === "error" ? "COMPLETE" : "ANALYZING",
        errorDialogKind: "scanningNotAvailable",
      });
    }

    await nextFrame();
    await nextFrame();
    expect(view.query(".mb-bio-success-animation")).toBeNull();
    expect(view.captureAnimationComplete).not.toHaveBeenCalled();

    if (interruption === "retry") {
      view.setState({ key: "complete", sessionState: "COMPLETE" });
      const trail = view.query<HTMLElement>(".mb-bio-scan-trail")!;
      pauseAnimations(view.query(".mb-bio-scan")!);
      expect(transform(trail).d).toBe(0);
      finishAnimations(trail);
      await vi.waitFor(() => expect(view.query(".mb-bio-success-animation")).toBeTruthy());
      finishAnimations(view.query(".mb-bio-success-animation")!);
      await vi.waitFor(() => expect(view.captureAnimationComplete).toHaveBeenCalledOnce());
    }
  });

  it.each([false, true])("anchors scan and success on the same face point with mirroring %s", async (mirrorX) => {
    const view = mount(
      createFeedbackUiState({
        key: "complete",
        sessionState: "COMPLETE",
        feedback: "OK",
        faceBounds: { x: 0.25, y: 0.25, width: 0.5, height: 0.5 },
        faceCenter: { x: 0.6, y: 0.4 },
        mirrorX,
      }),
    );

    const scanOval = view.query<HTMLElement>(".mb-bio-scan-oval")!;
    const scanRect = scanOval.getBoundingClientRect();
    const scanCenter = { x: scanRect.x + scanRect.width / 2, y: scanRect.y + scanRect.height / 2 };
    expect(scanOval.style.left).toBe(mirrorX ? "40%" : "60%");
    expect(scanOval.style.top).not.toBe("50%");
    finishAnimations(view.query(".mb-bio-scan-trail")!);
    await vi.waitFor(() => expect(view.query(".mb-bio-success-animation")).toBeTruthy());
    const success = view.query<HTMLElement>(".mb-bio-success-animation")!;
    pauseAnimations(success);
    const successRect = success.getBoundingClientRect();
    expect(successRect.x + successRect.width / 2).toBeCloseTo(scanCenter.x, 1);
    expect(successRect.y + successRect.height / 2).toBeLessThan(scanCenter.y);
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
