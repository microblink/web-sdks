/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { afterEach, describe, expect, it, vi } from "vitest";

import { Camera } from "../core/Camera";
import { CameraManager } from "../core/CameraManager";
import { cameraManagerStore } from "../core/cameraManagerStore";
import type { CameraManagerComponent } from "./createCameraManagerUi";
import { createCameraManagerUi } from "./createCameraManagerUi";

let cameraUi: CameraManagerComponent | undefined;

afterEach(() => {
  cameraUi?.dismount();
  cameraUi = undefined;
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

describe("CaptureScreenPortalled", () => {
  it("creates the preview video imperatively", async () => {
    const createElement = vi.spyOn(document, "createElement");

    cameraUi = await createCameraManagerUi(new CameraManager());

    const shadowRoot = document.querySelector<HTMLElement>("#mb-camera-host")?.shadowRoot;
    const previewVideo = shadowRoot?.querySelector<HTMLVideoElement>('[part="video-element-part"]');
    const createdVideos = createElement.mock.results
      .map((result) => result.value as unknown)
      .filter((element): element is HTMLVideoElement => element instanceof HTMLVideoElement);

    expect(previewVideo).toBeInstanceOf(HTMLVideoElement);
    expect(createdVideos).toContain(previewVideo);
  });

  it("focuses the dialog content when opened", async () => {
    cameraUi = await createCameraManagerUi(new CameraManager());

    const shadowRoot = document.querySelector<HTMLElement>("#mb-camera-host")?.shadowRoot;

    expect(shadowRoot).not.toBeNull();

    const dialog = shadowRoot?.querySelector<HTMLElement>('[role="dialog"]');

    await vi.waitFor(() => expect(shadowRoot?.activeElement).toBe(dialog));
  });

  it.each([
    { options: undefined, expected: true, name: "by default" },
    {
      options: { showCameraSelector: false },
      expected: false,
      name: "when disabled",
    },
  ])("shows the camera selector $name", async ({ options, expected }) => {
    cameraUi = await createCameraManagerUi(new CameraManager(), undefined, options);

    cameraManagerStore.setState({
      cameras: [createCamera("front-camera", "Front Camera"), createCamera("back-camera", "Back Camera")],
    });

    const shadowRoot = document.querySelector<HTMLElement>("#mb-camera-host")?.shadowRoot;

    await vi.waitFor(() => {
      expect(shadowRoot?.querySelector('[part="camera-select-part"]') !== null).toBe(expected);
    });
  });
});

function createCamera(deviceId: string, label: string) {
  return new Camera({
    deviceId,
    groupId: "",
    kind: "videoinput",
    label,
    getCapabilities: () => ({}),
    toJSON: () => ({}),
  });
}
