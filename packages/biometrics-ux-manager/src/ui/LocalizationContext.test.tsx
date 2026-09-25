/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { render } from "solid-js/web";
import { afterEach, describe, expect, it } from "vitest";

import en from "./locales/en";
import { LocalizationProvider, useLocalization } from "./LocalizationContext";

describe("Biometrics UX localization", () => {
  let dispose: (() => void) | undefined;

  afterEach(() => {
    dispose?.();
    dispose = undefined;
    document.body.replaceChildren();
  });

  it("uses processing copy while capture is pending", () => {
    expect(en.processing).toBe("Processing...");
  });

  it("deeply merges nested localization overrides", () => {
    const Probe = () => {
      const { t } = useLocalization();

      return (
        <>
          <span>{t.onboarding_modal.title}</span>
          <span>{t.help_modal.back_btn}</span>
          <span>{t.help_modal.steps.lighting.details}</span>
          <span>{t.error_dialogs.retry_btn}</span>
          <span>{t.feedback_messages.too_dark}</span>
          <span>{t.feedback_messages.face_not_found}</span>
        </>
      );
    };

    dispose = render(
      () => (
        <LocalizationProvider
          userStrings={{
            onboarding_modal: {
              title: "Custom onboarding title",
            },
            help_modal: {
              steps: {
                lighting: {
                  details: "Custom lighting guidance",
                },
              },
            },
            error_dialogs: {
              retry_btn: "Try once more",
            },
            feedback_messages: {
              too_dark: "Custom brightness guidance",
            },
          }}
        >
          <Probe />
        </LocalizationProvider>
      ),
      document.body,
    );

    expect(document.body.textContent).toContain("Custom onboarding title");
    expect(document.body.textContent).toContain(en.help_modal.back_btn);
    expect(document.body.textContent).toContain("Custom lighting guidance");
    expect(document.body.textContent).toContain("Try once more");
    expect(document.body.textContent).toContain("Custom brightness guidance");
    expect(document.body.textContent).toContain(en.feedback_messages.face_not_found);
  });

  it("throws outside the localization provider", () => {
    expect(() => useLocalization()).toThrow("LocalizationContext.Provider not in scope.");
  });
});
