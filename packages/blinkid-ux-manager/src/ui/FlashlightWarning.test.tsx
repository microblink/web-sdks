/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { FlashlightWarning } from "@microblink/shared-components/FlashlightWarning";
import { createSignal } from "solid-js";
import { render } from "solid-js/web";
import { afterEach, expect, test, vi } from "vitest";

import { LocalizationProvider, useLocalization } from "./LocalizationContext";

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  vi.useRealTimers();
  document.body.replaceChildren();
});

test("shows the localized warning for five seconds when the flashlight turns on", () => {
  vi.useFakeTimers();

  const [torchEnabled, setTorchEnabled] = createSignal(false);
  const [visible, setVisible] = createSignal(true);

  const Warning = () => {
    const { t } = useLocalization();
    return <FlashlightWarning enabled={torchEnabled()} visible={visible()} message={t.flashlight_warning_message} />;
  };

  cleanup = render(
    () => (
      <LocalizationProvider userStrings={{ flashlight_warning_message: "Custom flashlight warning" }}>
        <Warning />
      </LocalizationProvider>
    ),
    document.body,
  );

  expect(document.querySelector('[role="status"]')).toBeNull();

  setTorchEnabled(true);

  expect(document.querySelector('[role="status"]')?.textContent).toBe("Custom flashlight warning");

  setVisible(false);
  expect(document.querySelector('[role="status"]')).toBeNull();
  setVisible(true);

  vi.advanceTimersByTime(5000);

  expect(document.querySelector('[role="status"]')).toBeNull();

  setTorchEnabled(false);
  setTorchEnabled(true);

  expect(document.querySelector('[role="status"]')?.textContent).toBe("Custom flashlight warning");
});
