/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { CameraManagerComponent } from "@microblink/camera-manager/ui";
import { afterEach, describe, expect, test, vi } from "vitest";

import { showConsentUi } from "./showConsentUi";

describe("showConsentUi", () => {
  let overlay: HTMLDivElement | undefined;

  afterEach(() => {
    overlay?.remove();
    overlay = undefined;
    document.body.replaceChildren();
  });

  const mountCameraUi = () => {
    overlay = document.createElement("div");
    document.body.append(overlay);

    return {
      overlayLayerNode: overlay,
      owner: null,
    } as unknown as CameraManagerComponent;
  };

  const requiredConsentFields = {
    userId: "ui-user",
    durationDays: 180,
  };

  const clickConsent = async () => {
    const acceptButton = await vi.waitFor(() => {
      const button = [...overlay!.querySelectorAll("button")].find((candidate) => candidate.textContent === "Consent");
      expect(button).toBeDefined();
      return button!;
    });
    acceptButton.click();
  };

  test("generates consent from integrator fields and the required accept action", async () => {
    const cameraUi = mountCameraUi();
    const consentPromise = showConsentUi(cameraUi, {
      ...requiredConsentFields,
      customerContext: { customerId: "customer-1" },
    });

    await clickConsent();

    const consent = await consentPromise;

    expect(consent).toEqual({
      durationDays: 180,
      userId: "ui-user",
      customerContext: { customerId: "customer-1" },
      note: "Store and/or access personal information for the purpose of verifying your identity.\nI consent to the use of my personal data by the provider for the purpose of optimizing its technology.",
      givenOn: expect.any(String),
    });
    expect(Date.parse(consent.givenOn!)).not.toBeNaN();
    expect(consent.givenOn).toBe(new Date(consent.givenOn!).toISOString());
    expect(overlay!.textContent).toBe("");
  });

  test("keeps both purposes in the note when the optional switch is enabled", async () => {
    const cameraUi = mountCameraUi();
    const consentPromise = showConsentUi(cameraUi, requiredConsentFields);

    const toggle = await vi.waitFor(() => {
      const switchRoot = overlay!.querySelector<HTMLElement>("[data-scope='switch'][data-part='root']");
      expect(switchRoot).not.toBeNull();
      return switchRoot!;
    });
    toggle.click();
    await vi.waitFor(() => {
      expect(toggle.getAttribute("data-state")).toBe("checked");
    });

    await clickConsent();

    const consent = await consentPromise;
    expect(consent).toEqual({
      durationDays: 180,
      userId: "ui-user",
      note: "Store and/or access personal information for the purpose of verifying your identity.\nI consent to the use of my personal data by the provider for the purpose of optimizing its technology.",
      givenOn: expect.any(String),
    });
  });

  test("records overridden consent copy in the note", async () => {
    const cameraUi = mountCameraUi();
    const consentPromise = showConsentUi(cameraUi, requiredConsentFields, {
      consent_modal: {
        consent_btn: "Agree",
        details: "Required purpose.",
        consent_switch: "Optional purpose.",
      },
    });

    const acceptButton = await vi.waitFor(() => {
      const button = [...overlay!.querySelectorAll("button")].find((candidate) => candidate.textContent === "Agree");
      expect(button).toBeDefined();
      return button!;
    });
    acceptButton.click();

    const consent = await consentPromise;
    expect(consent.note).toBe("Required purpose.\nOptional purpose.");
    expect(overlay!.textContent).toBe("");
  });

  test("rejects and unmounts when Close is clicked", async () => {
    const cameraUi = mountCameraUi();
    const consentPromise = showConsentUi(cameraUi, requiredConsentFields);

    const closeButton = await vi.waitFor(() => {
      const button = [...overlay!.querySelectorAll("button")].find(
        (candidate) => candidate.getAttribute("aria-label") === "Close",
      );
      expect(button).toBeDefined();
      return button!;
    });

    closeButton.click();

    await expect(consentPromise).rejects.toBeUndefined();
    expect(overlay!.textContent).toBe("");
  });

  test("keeps sibling overlay content after consent is accepted", async () => {
    const cameraUi = mountCameraUi();
    const sibling = document.createElement("div");
    sibling.textContent = "debug overlay";
    overlay!.append(sibling);

    const consentPromise = showConsentUi(cameraUi, requiredConsentFields);
    await clickConsent();
    await consentPromise;

    expect(sibling.isConnected).toBe(true);
    expect(overlay!.contains(sibling)).toBe(true);
    expect(overlay!.querySelector("[role='alertdialog']")).toBeNull();
  });

  test("keeps sibling overlay content after consent is declined", async () => {
    const cameraUi = mountCameraUi();
    const sibling = document.createElement("div");
    sibling.textContent = "debug overlay";
    overlay!.append(sibling);

    const consentPromise = showConsentUi(cameraUi, requiredConsentFields);

    const closeButton = await vi.waitFor(() => {
      const button = [...overlay!.querySelectorAll("button")].find(
        (candidate) => candidate.getAttribute("aria-label") === "Close",
      );
      expect(button).toBeDefined();
      return button!;
    });
    closeButton.click();

    await expect(consentPromise).rejects.toBeUndefined();
    expect(sibling.isConnected).toBe(true);
    expect(overlay!.contains(sibling)).toBe(true);
    expect(overlay!.querySelector("[role='alertdialog']")).toBeNull();
  });
});
