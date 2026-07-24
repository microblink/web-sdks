/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  BlinkIdWorkerInitSettings,
  ProgressStatusCallback,
} from "@microblink/blinkid-worker";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BlinkIdInitSettings } from "./loadBlinkIdCore";

const {
  createProxyWorkerMock,
  getUserIdMock,
  proxyMock,
  remoteWorker,
  shouldUseLightweightBuildMock,
} = vi.hoisted(() => {
  const initBlinkId = vi.fn();
  const sendPinglets = vi.fn();
  const createProxyWorkerMock = vi.fn().mockResolvedValue({
    initBlinkId,
    sendPinglets,
  });
  const getUserIdMock = vi.fn(() => "user-123");
  const proxyMock = vi.fn((callback: ProgressStatusCallback) => callback);
  const shouldUseLightweightBuildMock = vi.fn().mockResolvedValue(false);

  return {
    createProxyWorkerMock,
    getUserIdMock,
    proxyMock,
    remoteWorker: {
      initBlinkId,
      sendPinglets,
    },
    shouldUseLightweightBuildMock,
  };
});

vi.mock("@microblink/core-common/createProxyWorker", () => ({
  createProxyWorker: createProxyWorkerMock,
}));

vi.mock("@microblink/core-common/getUserId", () => ({
  getUserId: getUserIdMock,
}));

vi.mock("@microblink/core-common/shouldUseLightweightBuild", () => ({
  shouldUseLightweightBuild: shouldUseLightweightBuildMock,
}));

vi.mock("comlink", () => ({
  proxy: proxyMock,
}));

import { loadBlinkIdCore } from "./loadBlinkIdCore";

describe("loadBlinkIdCore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createProxyWorkerMock.mockResolvedValue(remoteWorker);
    remoteWorker.initBlinkId.mockResolvedValue(undefined);
    shouldUseLightweightBuildMock.mockResolvedValue(false);
  });

  it("fills default userId, resourcesLocation, and useLightweightBuild", async () => {
    const settings: BlinkIdInitSettings = { licenseKey: "test-key" };
    const expectedLocation = window.location.href;

    const result = await loadBlinkIdCore(settings);

    expect(result).toBe(remoteWorker);
    expect(createProxyWorkerMock).toHaveBeenCalledWith(
      expectedLocation,
      "blinkid-worker.js",
    );
    expect(getUserIdMock).toHaveBeenCalledWith("blinkid-userid");
    expect(shouldUseLightweightBuildMock).toHaveBeenCalledOnce();
    expect(settings.userId).toBe("user-123");
    expect(settings.resourcesLocation).toBe(expectedLocation);
    expect(settings.useLightweightBuild).toBe(false);
    expect(remoteWorker.initBlinkId).toHaveBeenCalledWith(
      settings as BlinkIdWorkerInitSettings,
      undefined,
    );
  });

  it("proxies progress callback and passes OTA resource settings to init", async () => {
    const settings: BlinkIdInitSettings = {
      licenseKey: "test-key",
      resourcesLocation: "https://resources.example.com",
      otaResources: {
        checkForUpdates: true,
        otaResourceProviderUrl: "https://ota.example.com",
        resourcesLocation: "https://cdn.example.com/blinkid-ota",
        strict: true,
      },
      useLightweightBuild: true,
    };
    const progressCallback = vi.fn();

    await loadBlinkIdCore(settings, progressCallback);

    expect(shouldUseLightweightBuildMock).not.toHaveBeenCalled();
    expect(proxyMock).toHaveBeenCalledWith(progressCallback);
    expect(remoteWorker.initBlinkId).toHaveBeenCalledWith(
      settings as BlinkIdWorkerInitSettings,
      progressCallback,
    );
  });
});
