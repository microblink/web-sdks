/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { useFocusVisible } from "@ark-ui/solid";
import { CameraManager } from "@microblink/camera-manager/core";
import { createCameraManagerUi } from "@microblink/camera-manager/ui";
import { createRoot } from "solid-js";
import { expect, it } from "vitest";

import { createFeedbackUiController } from "../../test/feedbackUiHarness";

const getFocusDescriptor = () => Object.getOwnPropertyDescriptor(HTMLElement.prototype, "focus");

const nextAnimationFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const trackFocusVisible = () => createRoot((dispose) => ({ isFocusVisible: useFocusVisible(), dispose }));

it("sets up focus tracking when the module loads", async () => {
  const focusBeforeImport = getFocusDescriptor();

  await import("./createBiometricsFeedbackUi");

  expect(getFocusDescriptor()).not.toEqual(focusBeforeImport);
});

it("keeps focus tracking unchanged across UI remounts", async () => {
  const { createBiometricsFeedbackUi } = await import("./createBiometricsFeedbackUi");
  const preparedFocus = getFocusDescriptor();

  for (let mount = 0; mount < 2; mount++) {
    const cameraUi = await createCameraManagerUi(new CameraManager());
    const feedbackUi = createBiometricsFeedbackUi(createFeedbackUiController().manager, cameraUi);
    const focus = trackFocusVisible();

    document.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(focus.isFocusVisible()).toBe(false);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    expect(focus.isFocusVisible()).toBe(true);

    focus.dispose();
    feedbackUi.dismiss();
    cameraUi.dismount();
    await nextAnimationFrame();
    await nextAnimationFrame();

    expect(getFocusDescriptor()).toEqual(preparedFocus);
  }
});
