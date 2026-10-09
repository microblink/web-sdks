/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BlinkIdVerifyCore, BlinkIdVerifyInitSettings } from "./BlinkIdVerifyCore";

const { createProxyWorkerMock, getUserIdMock, proxyMock, remoteWorker } = vi.hoisted(() => {
  const initBlinkIdVerify = vi.fn();
  const createProxyWorkerMock = vi.fn();
  const getUserIdMock = vi.fn(() => "user-123");
  const proxyMock = vi.fn((callback: unknown) => callback);

  return {
    createProxyWorkerMock,
    getUserIdMock,
    proxyMock,
    remoteWorker: { initBlinkIdVerify },
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

import { loadBlinkIdVerifyCore } from "./BlinkIdVerifyCore";

type Expect<T extends true> = T;
type HasKey<T, K extends PropertyKey> = K extends keyof T ? true : false;
type ScanningSession = Awaited<ReturnType<BlinkIdVerifyCore["createScanningSession"]>>;

type _SessionHasSubmit = Expect<HasKey<ScanningSession, "submitResult">>;
type _SessionHasPrepare = Expect<HasKey<ScanningSession, "prepareVerifyRequest">>;
type _InitOmitsVerifyApi = Expect<HasKey<BlinkIdVerifyInitSettings, "verifyApi"> extends false ? true : false>;

describe("loadBlinkIdVerifyCore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createProxyWorkerMock.mockResolvedValue(remoteWorker);
    remoteWorker.initBlinkIdVerify.mockResolvedValue(undefined);
  });

  it("resolves an omitted verifyApiBaseUrl to the page origin", async () => {
    const settings: BlinkIdVerifyInitSettings = { licenseKey: "test-key" };

    const result = await loadBlinkIdVerifyCore(settings);

    expect(result).toBe(remoteWorker);
    expect(getUserIdMock).toHaveBeenCalledWith("blinkid-verify-userid");
    expect(settings).not.toHaveProperty("userId");
    expect(settings).not.toHaveProperty("verifyApiBaseUrl");
    expect(settings.resourcesLocation).toBe(window.location.href);
    expect(remoteWorker.initBlinkIdVerify).toHaveBeenCalledWith(
      {
        ...settings,
        userId: "user-123",
        verifyApiBaseUrl: window.location.origin,
      },
      undefined,
    );
  });

  it("resolves a relative verifyApiBaseUrl against the page URL", async () => {
    const rawVerifyApiBaseUrl = "custom-verify";
    const settings: BlinkIdVerifyInitSettings = {
      licenseKey: "test-key",
      verifyApiBaseUrl: rawVerifyApiBaseUrl,
    };
    const resolvedVerifyApiBaseUrl = new URL(rawVerifyApiBaseUrl, window.location.href).toString().replace(/\/+$/, "");

    await loadBlinkIdVerifyCore(settings);

    expect(resolvedVerifyApiBaseUrl).not.toBe(rawVerifyApiBaseUrl);
    expect(resolvedVerifyApiBaseUrl.startsWith(window.location.origin)).toBe(true);
    expect(remoteWorker.initBlinkIdVerify).toHaveBeenCalledWith(
      expect.objectContaining({
        licenseKey: "test-key",
        userId: "user-123",
        verifyApiBaseUrl: resolvedVerifyApiBaseUrl,
      }),
      undefined,
    );
    expect(settings.verifyApiBaseUrl).toBe(rawVerifyApiBaseUrl);
  });

  it("uses an absolute verifyApiBaseUrl and strips a trailing slash", async () => {
    const rawVerifyApiBaseUrl = "https://verify.example.com/tenant/";
    const settings: BlinkIdVerifyInitSettings = {
      licenseKey: "test-key",
      verifyApiBaseUrl: rawVerifyApiBaseUrl,
    };

    await loadBlinkIdVerifyCore(settings);

    expect(remoteWorker.initBlinkIdVerify).toHaveBeenCalledWith(
      expect.objectContaining({
        licenseKey: "test-key",
        userId: "user-123",
        verifyApiBaseUrl: "https://verify.example.com/tenant",
      }),
      undefined,
    );
    expect(settings.verifyApiBaseUrl).toBe(rawVerifyApiBaseUrl);
  });

  it("ignores a client-supplied ping userId", async () => {
    const settings = { licenseKey: "test-key", userId: "integrator-user" };

    await loadBlinkIdVerifyCore(settings);

    expect(getUserIdMock).toHaveBeenCalledWith("blinkid-verify-userid");
    expect(remoteWorker.initBlinkIdVerify).toHaveBeenCalledWith(
      expect.objectContaining({
        licenseKey: "test-key",
        userId: "user-123",
        verifyApiBaseUrl: window.location.origin,
      }),
      undefined,
    );
  });
});
