/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { render } from "solid-js/web";
import { afterEach, describe, expect, test, vi } from "vitest";
import { commands } from "vitest/browser";

import "virtual:uno.css";

import { LocalizationProvider, type PartialLocalizationStrings } from "../LocalizationContext";
import { ConsentModal } from "./ConsentModal";

declare module "vitest/browser" {
  interface BrowserCommands {
    ariaSnapshot(selector: string): Promise<string>;
  }
}

const consentModalHostId = "consent-modal-host";
const optionalConsentName =
  "I consent to the use of my personal data by the provider for the purpose of optimizing its technology. (Optional)";

const themeVariables: Record<string, string> = {
  "--color-gray-50-rgb-value": "249 250 251",
  "--color-gray-400-rgb-value": "156 163 175",
  "--color-gray-500-rgb-value": "107 114 128",
  "--color-gray-700-rgb-value": "55 65 81",
  "--color-primary": "0 98 242",
};

function ariaName(value: string): string {
  return JSON.stringify(value);
}

function expectedConsentSnapshot({ optionalChecked = false }: { optionalChecked?: boolean } = {}): string {
  const checkboxState = optionalChecked ? " [checked]" : "";

  return [
    `- alertdialog ${ariaName("Consent")}:`,
    `  - button ${ariaName("Close")}`,
    "  - region:",
    "    - article:",
    `      - heading ${ariaName("We need your consent to:")} [level=2]`,
    "      - paragraph: Store and/or access personal information for the purpose of verifying your identity.",
    "      - paragraph:",
    "        - text: Your choices help us protect your personal information and improve our technology while maintaining the highest standards of data privacy as described in the",
    `        - link ${ariaName("Privacy Notice (opens in a new tab)")}:`,
    "          - /url: https://microblink.com/legal/privacy-notice-for-microblink-blinkid-verify/",
    "        - text: .",
    `      - checkbox ${ariaName(optionalConsentName)}${checkboxState}`,
    `      - text: ${optionalConsentName}`,
    `  - button ${ariaName("Consent")}`,
    `  - button ${ariaName("Do not consent")}`,
  ].join("\n");
}

describe("ConsentModal", () => {
  let overlay: HTMLDivElement | undefined;
  let cleanup: (() => void) | undefined;

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
    overlay?.remove();
    overlay = undefined;
    document.body.replaceChildren();
  });

  const mountModal = (localization?: PartialLocalizationStrings) => {
    overlay = document.createElement("div");
    overlay.id = consentModalHostId;
    document.body.append(overlay);

    for (const [name, value] of Object.entries(themeVariables)) {
      document.documentElement.style.setProperty(name, value);
    }

    cleanup = render(
      () => (
        <LocalizationProvider userStrings={localization}>
          <ConsentModal
            mountTarget={overlay!}
            userId="ui-user"
            durationDays={180}
            onConsent={() => {
              void 0;
            }}
            onDecline={() => {
              void 0;
            }}
          />
        </LocalizationProvider>
      ),
      overlay,
    );

    return overlay;
  };

  test("uses dialog wrappers, left-aligned purpose text, a notice background, and a switch", async () => {
    const root = mountModal();

    const purpose = await vi.waitFor(() => {
      const statement = [...root.querySelectorAll("p")].find((candidate) =>
        candidate.textContent?.includes("Store and/or access personal information"),
      );
      expect(statement).toBeDefined();
      return statement!;
    });

    const notice = [...root.querySelectorAll("p")].find((candidate) =>
      candidate.textContent?.includes("Your choices help us protect your personal information"),
    );
    const privacyNoticeLink = notice?.querySelector("a");
    const title = [...root.querySelectorAll("[data-part='title']")].find((candidate) =>
      candidate.textContent?.includes("We need your consent to:"),
    );
    const description = [...root.querySelectorAll("[data-part='description']")].find((candidate) =>
      candidate.textContent?.includes("Store and/or access personal information"),
    );
    const actionButtons = [...root.querySelectorAll("button")].filter((candidate) => {
      const label = candidate.textContent ?? "";
      return label.includes("Consent") || label.includes("Do not consent");
    });
    const toggle = root.querySelector<HTMLElement>("[data-scope='switch'][data-part='root']");
    const optionalLabel = root.querySelector<HTMLElement>("[data-scope='switch'][data-part='label']");
    const optionalMarker = [...(optionalLabel?.querySelectorAll("span") ?? [])].find((candidate) =>
      candidate.textContent?.includes("(Optional)"),
    );

    expect(title).toBeDefined();
    expect(title?.className.split(/\s+/)).toContain("dialog-title");
    expect(title?.className.split(/\s+/)).toContain("!text-2xl");
    expect(["center", "middle"]).toContain(getComputedStyle(title!).textAlign);
    expect(description).toBeDefined();
    expect(["left", "start"]).toContain(getComputedStyle(purpose).textAlign);
    expect(purpose.className.split(/\s+/)).toContain("text-sm");
    expect(purpose.className.split(/\s+/)).toContain("font-bold");
    expect(notice).toBeDefined();
    expect(notice?.className.split(/\s+/)).toContain("bg-gray-50");
    expect(notice?.className.split(/\s+/)).toContain("text-sm");
    expect(privacyNoticeLink).toBeDefined();
    expect(privacyNoticeLink?.textContent).toContain("Privacy Notice");
    expect(privacyNoticeLink?.querySelector(".sr-only")?.textContent?.trim()).toBe("(opens in a new tab)");
    expect(privacyNoticeLink?.getAttribute("href")).toBe(
      "https://microblink.com/legal/privacy-notice-for-microblink-blinkid-verify/",
    );
    expect(privacyNoticeLink?.getAttribute("target")).toBe("_blank");
    expect(privacyNoticeLink?.getAttribute("rel")).toBe("noopener noreferrer");
    expect(actionButtons).toHaveLength(2);
    for (const button of actionButtons) {
      expect(button.className.split(/\s+/)).toContain("btn-secondary");
      expect(button.className.split(/\s+/)).not.toContain("btn-primary");
      expect(button.className.split(/\s+/)).toContain("font-bold");
      expect(button.className.split(/\s+/)).toContain("!text-base");
      expect(["center", "middle"]).toContain(getComputedStyle(button).textAlign);
    }
    expect(toggle).not.toBeNull();
    expect(toggle?.className.split(/\s+/)).toContain("items-center");
    expect(optionalLabel?.className.split(/\s+/)).toContain("text-xs");
    expect(optionalMarker).toBeDefined();
    expect(optionalMarker?.className.split(/\s+/)).toContain("italic");
    expect(getComputedStyle(optionalMarker!).fontStyle).toBe("italic");
    expect(toggle?.getAttribute("data-state")).toBe("unchecked");
    expect(toggle?.textContent).toContain("I consent to the use of my personal data");
    expect(root.querySelector('[role="switch"]') ?? root.querySelector('input[type="checkbox"]')).not.toBeNull();
    expect(await commands.ariaSnapshot(`#${consentModalHostId}`)).toBe(expectedConsentSnapshot());

    toggle!.click();

    await vi.waitFor(() => {
      expect(toggle?.getAttribute("data-state")).toBe("checked");
    });
    expect(await commands.ariaSnapshot(`#${consentModalHostId}`)).toBe(
      expectedConsentSnapshot({ optionalChecked: true }),
    );
  });

  test("names the dialog, wires close and Escape to decline, and keeps initial focus off Close", async () => {
    overlay = document.createElement("div");
    overlay.id = consentModalHostId;
    document.body.append(overlay);

    for (const [name, value] of Object.entries(themeVariables)) {
      document.documentElement.style.setProperty(name, value);
    }

    const onConsent = vi.fn();
    const onDecline = vi.fn();

    cleanup = render(
      () => (
        <LocalizationProvider>
          <ConsentModal
            mountTarget={overlay!}
            userId="ui-user"
            durationDays={180}
            onConsent={onConsent}
            onDecline={onDecline}
          />
        </LocalizationProvider>
      ),
      overlay,
    );

    const dialog = await vi.waitFor(() => {
      const node = overlay!.querySelector<HTMLElement>('[role="alertdialog"]');
      expect(node).not.toBeNull();
      return node!;
    });

    const closeButton = [...overlay!.querySelectorAll("button")].find(
      (candidate) => candidate.getAttribute("aria-label") === "Close",
    );
    const consentButton = [...overlay!.querySelectorAll("button")].find(
      (candidate) => candidate.textContent === "Consent",
    );
    const privacyNoticeLink = overlay!.querySelector("a");
    const region = overlay!.querySelector('[role="region"]');

    expect(dialog.getAttribute("aria-label")).toBe("Consent");
    expect(closeButton).toBeDefined();
    expect(consentButton).toBeDefined();
    expect(region).not.toBeNull();
    expect(privacyNoticeLink?.querySelector(".sr-only")?.textContent?.trim()).toBe("(opens in a new tab)");

    await vi.waitFor(() => {
      expect(document.activeElement).toBe(consentButton);
    });

    closeButton!.click();
    expect(onDecline).toHaveBeenCalledTimes(1);
    expect(onConsent).not.toHaveBeenCalled();

    dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await vi.waitFor(() => {
      expect(onDecline).toHaveBeenCalledTimes(2);
    });
  });

  // Safari keeps buttons, links, and checkboxes out of sequential focus navigation unless the tab index is explicit,
  // which otherwise leaves Consent and Do not consent unreachable by keyboard.
  test("gives every control an explicit tab index so Safari keeps them in the tab order", async () => {
    const root = mountModal();

    const controls = await vi.waitFor(() => {
      const candidates = [...root.querySelectorAll<HTMLElement>("button, a[href], input")];
      expect(candidates.length).toBe(5);
      return candidates;
    });

    for (const control of controls) {
      expect(control.getAttribute("tabindex")).toBe("0");
    }
  });

  test("renders overridden consent copy", async () => {
    const root = mountModal({
      consent_modal: {
        title: "Custom consent title",
        consent_btn: "Agree",
        decline_btn: "Decline",
      },
    });

    await vi.waitFor(() => {
      expect(root.textContent).toContain("Custom consent title");
    });
    expect(root.textContent).toContain("Agree");
    expect(root.textContent).toContain("Decline");
    expect(root.textContent).toContain("Store and/or access personal information");
  });
});
