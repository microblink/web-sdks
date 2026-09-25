/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { CameraManager } from "@microblink/camera-manager/core";
import { createCameraManagerUi } from "@microblink/camera-manager/ui";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { commands, userEvent } from "vitest/browser";

import { createFeedbackUiController, createFeedbackUiError, createFeedbackUiState } from "../../test/feedbackUiHarness";
import {
  createBiometricsFeedbackUi,
  type BiometricsFeedbackUiHandle,
  type BiometricsFeedbackUiController,
  type BiometricsFeedbackUiOptions,
} from "./createBiometricsFeedbackUi";
import en from "./locales/en";

declare module "vitest/browser" {
  interface BrowserCommands {
    ariaSnapshot(selector: string): Promise<string>;
  }
}

let cameraUi: Awaited<ReturnType<typeof createCameraManagerUi>> | undefined;
let feedbackUi: BiometricsFeedbackUiHandle | undefined;

function getShadowRoot(): ShadowRoot {
  const shadowRoot = document.querySelector<HTMLElement>("#mb-camera-host")?.shadowRoot;

  expect(shadowRoot).not.toBeNull();

  return shadowRoot!;
}

function getReferencedText(root: ShadowRoot, element: Element, attribute: string): string | null {
  const id = element.getAttribute(attribute);

  return id ? (root.getElementById(id)?.textContent ?? null) : null;
}

function ariaName(value: string): string {
  return JSON.stringify(value);
}

function expectedCameraSnapshot({
  status,
  showHelp = false,
  modal = [],
}: {
  status?: string;
  showHelp?: boolean;
  modal?: string[];
}): string {
  const lines = [
    `- dialog ${ariaName(en.sdk_aria)}:`,
    `  - heading ${ariaName(en.sdk_aria)} [level=2]`,
    `  - button ${ariaName(en.close)}`,
    `  - region ${ariaName(en.sdk_aria)}:`,
    status === undefined ? "    - status" : `    - status: ${status}`,
  ];

  if (showHelp) {
    lines.push(`    - button ${ariaName(en.help_button.aria_label)}`);
  }

  lines.push(...modal.map((line) => `  ${line}`));

  return lines.join("\n");
}

function expectedOnboardingModal(): string[] {
  return [
    `- dialog ${ariaName(en.onboarding_modal.aria)}:`,
    `  - heading ${ariaName(en.onboarding_modal.title)} [level=2]`,
    `  - paragraph: ${en.onboarding_modal.details}`,
    `  - button ${ariaName(en.onboarding_modal.start_btn)}`,
  ];
}

function expectedHelpModal(): string[] {
  const step = en.help_modal.steps.camera_lens;

  return [
    `- dialog ${ariaName(en.help_modal.aria)}:`,
    `  - button ${ariaName(en.close)}`,
    `  - heading ${ariaName(step.title)} [level=2]`,
    `  - paragraph: ${step.details}`,
    `  - button ${ariaName(en.help_modal.back_btn)} [disabled]`,
    `  - button ${ariaName(en.help_modal.next_btn)}`,
  ];
}

function expectedErrorModal({
  title,
  description,
  retryable,
}: {
  title: string;
  description: string;
  retryable: boolean;
}): string[] {
  return [
    `- dialog ${ariaName(title)}:`,
    `  - heading ${ariaName(title)} [level=2]`,
    `  - text: ${description}`,
    ...(retryable
      ? [`  - button ${ariaName(en.error_dialogs.cancel_btn)}`, `  - button ${ariaName(en.error_dialogs.retry_btn)}`]
      : [`  - button ${ariaName(en.close)}`]),
  ];
}

async function expectNoAxeViolations(): Promise<void> {
  expect(cameraUi).toBeDefined();

  const result = await axe.run({
    include: [cameraUi!.feedbackLayerNode, cameraUi!.overlayLayerNode],
  });

  expect(
    result.violations.map(({ id, nodes }) => ({
      id,
      targets: nodes.map((node) => node.target),
    })),
  ).toEqual([]);
}

async function mount(
  manager: BiometricsFeedbackUiController<string>,
  onClose = vi.fn(),
  options: Pick<BiometricsFeedbackUiOptions, "localizationStrings" | "showHelpButton"> = {},
) {
  cameraUi = await createCameraManagerUi(new CameraManager());
  feedbackUi = createBiometricsFeedbackUi(manager, cameraUi, {
    ...options,
    onClose,
  });

  return { onClose, shadowRoot: getShadowRoot() };
}

afterEach(async () => {
  feedbackUi?.dismiss();
  feedbackUi = undefined;
  cameraUi?.dismount();
  cameraUi = undefined;

  await new Promise(requestAnimationFrame);
  await new Promise(requestAnimationFrame);

  document.body.replaceChildren();
});

describe("createBiometricsFeedbackUi composition accessibility", () => {
  it("hides the help button and tooltip when disabled", async () => {
    const controlled = createFeedbackUiController(
      createFeedbackUiState({
        key: "capturing",
        helpNudgeVisible: true,
      }),
    );

    await mount(controlled.manager, vi.fn(), { showHelpButton: false });

    expect(getShadowRoot().querySelector('[part="help-button-part"]')).toBeNull();
    expect(getShadowRoot().querySelector('[part="help-button-tooltip-part"]')).toBeNull();
  });

  it("has no automatic violations in Biometrics-owned composed UI", async () => {
    const controlled = createFeedbackUiController(createFeedbackUiState({ key: "onboarding", sessionState: "IDLE" }));

    await mount(controlled.manager);
    await vi.waitFor(() => expect(cameraUi!.overlayLayerNode.textContent).toContain(en.onboarding_modal.title));
    await expectNoAxeViolations();

    for (const [state, expectedText] of [
      [createFeedbackUiState({ key: "capturing" }), en.feedback_messages.face_not_found],
      [createFeedbackUiState({ key: "help" }), en.help_modal.steps.camera_lens.title],
      [
        createFeedbackUiState({
          key: "capturing",
          sessionState: "PROCESSING",
        }),
        en.processing,
      ],
      [
        createFeedbackUiState({ key: "complete", sessionState: "COMPLETE" }),
        en.feedback_messages.capture_complete_aria,
      ],
      [
        createFeedbackUiState({
          key: "error",
          error: createFeedbackUiError(),
          errorDialogKind: "scanningUnsuccessful",
        }),
        en.error_dialogs.scanning_unsuccessful.title,
      ],
      [
        createFeedbackUiState({
          key: "error",
          error: createFeedbackUiError("terminal", false),
          errorDialogKind: "scanningNotAvailable",
        }),
        en.error_dialogs.scanning_not_available.title,
      ],
    ] as const) {
      controlled.setState({ key: "idle", sessionState: "IDLE" });
      controlled.setState(state);
      await vi.waitFor(() =>
        expect(`${cameraUi!.feedbackLayerNode.textContent} ${cameraUi!.overlayLayerNode.textContent}`).toContain(
          expectedText,
        ),
      );
      await expectNoAxeViolations();
    }
  });

  it("exposes localized accessibility trees across primary states", async () => {
    const controlled = createFeedbackUiController(createFeedbackUiState({ key: "onboarding", sessionState: "IDLE" }));

    await mount(controlled.manager);

    await vi.waitFor(() => expect(getShadowRoot().querySelectorAll('[role="dialog"]')).toHaveLength(2));

    const snapshots = {
      onboarding: await commands.ariaSnapshot("#mb-camera-host"),
      capturing: "",
      help: "",
      processing: "",
      complete: "",
    };

    controlled.setState({ key: "capturing", sessionState: "ANALYZING" });
    await vi.waitFor(() => expect(getShadowRoot().textContent).toContain(en.feedback_messages.face_not_found));
    snapshots.capturing = await commands.ariaSnapshot("#mb-camera-host");

    controlled.setState({ key: "help" });
    await vi.waitFor(() => expect(getShadowRoot().textContent).toContain(en.help_modal.steps.camera_lens.title));
    snapshots.help = await commands.ariaSnapshot("#mb-camera-host");

    controlled.setState({ key: "capturing", sessionState: "PROCESSING" });
    await vi.waitFor(() => expect(getShadowRoot().textContent).toContain(en.processing));
    snapshots.processing = await commands.ariaSnapshot("#mb-camera-host");

    controlled.setState({ key: "idle", sessionState: "IDLE" });
    controlled.setState({
      key: "complete",
      sessionState: "COMPLETE",
      feedback: "OK",
    });
    await vi.waitFor(() => expect(getShadowRoot().textContent).toContain(en.feedback_messages.capture_complete_aria));
    snapshots.complete = await commands.ariaSnapshot("#mb-camera-host");

    expect(snapshots).toEqual({
      onboarding: expectedCameraSnapshot({
        modal: expectedOnboardingModal(),
      }),
      capturing: expectedCameraSnapshot({
        status: en.feedback_messages.face_not_found,
        showHelp: true,
      }),
      help: expectedCameraSnapshot({
        showHelp: true,
        modal: expectedHelpModal(),
      }),
      processing: expectedCameraSnapshot({ status: en.processing, showHelp: true }),
      complete: expectedCameraSnapshot({
        status: en.feedback_messages.capture_complete_aria,
      }),
    });
  });

  it("exposes localized error names, descriptions, and actions", async () => {
    const controlled = createFeedbackUiController(
      createFeedbackUiState({
        key: "error",
        error: createFeedbackUiError(),
        errorDialogKind: "scanningUnsuccessful",
      }),
    );

    await mount(controlled.manager);

    const snapshots: Record<string, string> = {};
    const cases = [
      {
        key: "scanningUnsuccessful",
        state: createFeedbackUiState({
          key: "error",
          error: createFeedbackUiError(),
          errorDialogKind: "scanningUnsuccessful",
        }),
        copy: en.error_dialogs.scanning_unsuccessful,
        description: en.error_dialogs.scanning_unsuccessful.details,
        retryable: true,
      },
      {
        key: "scanningNotAvailable",
        state: createFeedbackUiState({
          key: "error",
          error: createFeedbackUiError("terminal", false),
          errorDialogKind: "scanningNotAvailable",
        }),
        copy: en.error_dialogs.scanning_not_available,
        description: en.error_dialogs.scanning_not_available.aria_description,
        retryable: false,
      },
    ] as const;

    for (const errorCase of cases) {
      controlled.setState(errorCase.state);
      await vi.waitFor(() => {
        const errorDialog = [...getShadowRoot().querySelectorAll('[role="dialog"]')].find((dialog) =>
          dialog.textContent?.includes(errorCase.copy.title),
        );

        expect(errorDialog?.textContent).toContain(errorCase.description);
      });
      snapshots[errorCase.key] = await commands.ariaSnapshot("#mb-camera-host");
    }

    expect(snapshots).toEqual(
      Object.fromEntries(
        cases.map((errorCase) => [
          errorCase.key,
          expectedCameraSnapshot({
            modal: expectedErrorModal({
              title: errorCase.copy.title,
              description: errorCase.description,
              retryable: errorCase.retryable,
            }),
          }),
        ]),
      ),
    );
  });

  it("labels the camera dialog and exposes one processing status", async () => {
    const controlled = createFeedbackUiController(createFeedbackUiState({ key: "onboarding", sessionState: "IDLE" }));
    const { shadowRoot } = await mount(controlled.manager);
    const cameraDialog = shadowRoot.querySelector<HTMLElement>('[role="dialog"]');

    expect(cameraDialog).toBeInstanceOf(HTMLElement);
    expect(getReferencedText(shadowRoot, cameraDialog!, "aria-labelledby")).toBe(en.sdk_aria);

    controlled.setState({
      key: "capturing",
      sessionState: "PROCESSING",
    });

    await vi.waitFor(() => {
      const statuses = shadowRoot.querySelectorAll('[role="status"]');

      expect(statuses).toHaveLength(1);
      expect(statuses[0]?.textContent).toContain(en.processing);
    });
  });

  it("uses the consumer camera-dialog accessible name", async () => {
    const sdkAria = "Custom face capture screen";
    const controlled = createFeedbackUiController(createFeedbackUiState({ key: "capturing" }));
    const { shadowRoot } = await mount(controlled.manager, vi.fn(), {
      localizationStrings: { sdk_aria: sdkAria },
    });

    await vi.waitFor(() => {
      const cameraDialog = shadowRoot.querySelector<HTMLElement>('[role="dialog"]');

      expect(cameraDialog).toBeInstanceOf(HTMLElement);
      expect(getReferencedText(shadowRoot, cameraDialog!, "aria-labelledby")).toBe(sdkAria);
    });
  });

  it("closes onboarding once with Escape", async () => {
    const controlled = createFeedbackUiController(createFeedbackUiState({ key: "onboarding", sessionState: "IDLE" }));
    const onClose = vi.fn();
    const { shadowRoot } = await mount(controlled.manager, onClose);

    await vi.waitFor(() => {
      const dialogs = shadowRoot.querySelectorAll('[role="dialog"]');
      const onboardingHeading = dialogs[1]?.querySelector("h2[tabindex='-1']");

      expect(dialogs).toHaveLength(2);
      expect(shadowRoot.activeElement).toBe(onboardingHeading);
    });

    await userEvent.keyboard("{Escape}");

    expect(controlled.close).toHaveBeenCalledWith("User");
    expect(onClose).toHaveBeenCalledOnce();
  });
});
