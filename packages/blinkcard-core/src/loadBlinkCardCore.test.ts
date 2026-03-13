/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  BlinkCardWorkerInitSettings,
  ProgressStatusCallback,
} from "@microblink/blinkcard-worker";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BlinkCardInitSettings } from "./loadBlinkCardCore";

const { createProxyWorkerMock, getUserIdMock, proxyMock, remoteWorker } =
  vi.hoisted(() => {
    const initBlinkCard = vi.fn();
    const sendPinglets = vi.fn();
    const createProxyWorkerMock = vi.fn().mockResolvedValue({
      initBlinkCard,
      sendPinglets,
    });
    const getUserIdMock = vi.fn(() => "user-123");
    const proxyMock = vi.fn((callback: ProgressStatusCallback) => callback);

    return {
      createProxyWorkerMock,
      getUserIdMock,
      proxyMock,
      remoteWorker: {
        initBlinkCard,
        sendPinglets,
      },
    };
  });

vi.mock("@microblink/core-common/createProxyWorker", () => ({
  createProxyWorker: createProxyWorkerMock,
}));

vi.mock("@microblink/core-common/getUserId", () => ({
  getUserId: getUserIdMock,
}));

vi.mock("comlink", () => ({
  proxy: proxyMock,
}));

import { loadBlinkCardCore } from "./loadBlinkCardCore";

describe("loadBlinkCardCore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createProxyWorkerMock.mockResolvedValue(remoteWorker);
    remoteWorker.initBlinkCard.mockResolvedValue(undefined);
  });

  it("fills default userId and resourcesLocation", async () => {
    const settings: BlinkCardInitSettings = { licenseKey: "test-key" };
    const expectedLocation = window.location.href;

    const result = await loadBlinkCardCore(settings);

    expect(result).toBe(remoteWorker);
    expect(createProxyWorkerMock).toHaveBeenCalledWith(
      expectedLocation,
      "blinkcard-worker.js",
    );
    expect(getUserIdMock).toHaveBeenCalledWith("blinkcard-userid");
    expect(settings.userId).toBe("user-123");
    expect(settings.resourcesLocation).toBe(expectedLocation);
    expect(remoteWorker.initBlinkCard).toHaveBeenCalledWith(
      settings as BlinkCardWorkerInitSettings,
      undefined,
    );
  });

  it("proxies and passes progress callback to init", async () => {
    const settings: BlinkCardInitSettings = {
      licenseKey: "test-key",
      resourcesLocation: "https://resources.example.com",
    };
    const progressCallback = vi.fn();

    await loadBlinkCardCore(settings, progressCallback);

    expect(proxyMock).toHaveBeenCalledWith(progressCallback);
    expect(remoteWorker.initBlinkCard).toHaveBeenCalledWith(
      settings as BlinkCardWorkerInitSettings,
      progressCallback,
    );
  });
});
