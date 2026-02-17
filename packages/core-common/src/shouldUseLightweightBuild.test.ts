/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { DeviceInfo } from "./deviceInfo/deviceInfo";
import { getDeviceInfo } from "./deviceInfo/deviceInfo";
import { shouldUseLightweightBuild } from "./shouldUseLightweightBuild";

vi.mock("./deviceInfo/deviceInfo", () => ({
  getDeviceInfo: vi.fn(),
}));

const defaultDeviceInfo: DeviceInfo = {
  userAgent: "Mozilla/5.0",
  threads: 4,
  screen: {
    screenWidth: 1920,
    screenHeight: 1080,
    devicePixelRatio: 1,
    physicalScreenWidth: 1920,
    physicalScreenHeight: 1080,
    maxTouchPoints: 0,
  },
  browserStorageSupport: {
    cookieEnabled: true,
    localStorageEnabled: true,
  },
  derivedDeviceInfo: {
    formFactors: ["Desktop"],
    model: "Unknown",
    platform: "",
    browser: { brand: "Chrome", version: "120.0" },
  },
};

function createMockDeviceInfo(
  overrides: Partial<Omit<DeviceInfo, "derivedDeviceInfo">> & {
    derivedDeviceInfo?: Partial<DeviceInfo["derivedDeviceInfo"]>;
  } = {},
): DeviceInfo {
  const { derivedDeviceInfo: derivedOverrides, ...rest } = overrides;
  return {
    ...defaultDeviceInfo,
    ...rest,
    derivedDeviceInfo: {
      ...defaultDeviceInfo.derivedDeviceInfo,
      ...derivedOverrides,
    },
  };
}

describe("shouldUseLightweightBuild", () => {
  beforeEach(() => {
    vi.mocked(getDeviceInfo).mockReset();
  });

  it("should return true for mobile device with less than 4GB memory", async () => {
    vi.mocked(getDeviceInfo).mockResolvedValue(
      createMockDeviceInfo({
        memory: 2.0,
        derivedDeviceInfo: { formFactors: ["Mobile"], model: "Test Phone", platform: "Android" },
      }),
    );

    const result = await shouldUseLightweightBuild();

    expect(getDeviceInfo).toHaveBeenCalledOnce();
    expect(result).toBe(true);
  });

  it("should return false for mobile device with 4GB or more memory", async () => {
    vi.mocked(getDeviceInfo).mockResolvedValue(
      createMockDeviceInfo({
        memory: 4.0,
        derivedDeviceInfo: { formFactors: ["Mobile"], model: "Test Phone", platform: "Android" },
      }),
    );

    const result = await shouldUseLightweightBuild();

    expect(getDeviceInfo).toHaveBeenCalledOnce();
    expect(result).toBe(false);
  });

  it("should return true for mobile device with 2GB memory", async () => {
    vi.mocked(getDeviceInfo).mockResolvedValue(
      createMockDeviceInfo({
        memory: 2,
        derivedDeviceInfo: { formFactors: ["Mobile"], model: "Test Phone", platform: "Android" },
      }),
    );

    const result = await shouldUseLightweightBuild();

    expect(getDeviceInfo).toHaveBeenCalledOnce();
    expect(result).toBe(true);
  });

  it("should return true for tablet device with less than 4GB memory", async () => {
    vi.mocked(getDeviceInfo).mockResolvedValue(
      createMockDeviceInfo({
        memory: 2.0,
        derivedDeviceInfo: { formFactors: ["Tablet"], model: "Test Tablet", platform: "Android" },
      }),
    );

    const result = await shouldUseLightweightBuild();

    expect(getDeviceInfo).toHaveBeenCalledOnce();
    expect(result).toBe(true);
  });

  it("should return undefined for mobile device without memory info", async () => {
    vi.mocked(getDeviceInfo).mockResolvedValue(
      createMockDeviceInfo({
        memory: undefined,
        derivedDeviceInfo: { formFactors: ["Mobile"], model: "Test Phone", platform: "iOS", browser: { brand: "Safari", version: "17.0" } },
      }),
    );

    const result = await shouldUseLightweightBuild();

    expect(getDeviceInfo).toHaveBeenCalledOnce();
    expect(result).toBeUndefined();
  });

  it("should return undefined for desktop device with memory info", async () => {
    vi.mocked(getDeviceInfo).mockResolvedValue(
      createMockDeviceInfo({
        memory: 8.0,
        derivedDeviceInfo: { formFactors: ["Desktop"], model: "Mac", platform: "macOS" },
      }),
    );

    const result = await shouldUseLightweightBuild();

    expect(getDeviceInfo).toHaveBeenCalledOnce();
    expect(result).toBeUndefined();
  });

  it("should return undefined for desktop device without memory info", async () => {
    vi.mocked(getDeviceInfo).mockResolvedValue(
      createMockDeviceInfo({
        memory: undefined,
        derivedDeviceInfo: { formFactors: ["Desktop"], model: "Mac", platform: "macOS", browser: { brand: "Safari", version: "17.0" } },
      }),
    );

    const result = await shouldUseLightweightBuild();

    expect(getDeviceInfo).toHaveBeenCalledOnce();
    expect(result).toBeUndefined();
  });

  it("should handle device with multiple form factors including Mobile", async () => {
    vi.mocked(getDeviceInfo).mockResolvedValue(
      createMockDeviceInfo({
        memory: 2.0,
        derivedDeviceInfo: { formFactors: ["Mobile", "Tablet"], model: "Test Device", platform: "Android" },
      }),
    );

    const result = await shouldUseLightweightBuild();

    expect(getDeviceInfo).toHaveBeenCalledOnce();
    expect(result).toBe(true);
  });

  it("should return true for very low memory mobile device (1GB)", async () => {
    vi.mocked(getDeviceInfo).mockResolvedValue(
      createMockDeviceInfo({
        memory: 1,
        derivedDeviceInfo: { formFactors: ["Mobile"], model: "Budget Phone", platform: "Android" },
      }),
    );

    const result = await shouldUseLightweightBuild();

    expect(getDeviceInfo).toHaveBeenCalledOnce();
    expect(result).toBe(true);
  });

  it("should return false for high-end mobile device (8GB)", async () => {
    vi.mocked(getDeviceInfo).mockResolvedValue(
      createMockDeviceInfo({
        memory: 8.0,
        derivedDeviceInfo: { formFactors: ["Mobile"], model: "Flagship Phone", platform: "Android" },
      }),
    );

    const result = await shouldUseLightweightBuild();

    expect(getDeviceInfo).toHaveBeenCalledOnce();
    expect(result).toBe(false);
  });
});
