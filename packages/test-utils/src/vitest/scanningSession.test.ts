/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { describe, expect, test, vi } from "vitest";
import { createFakeScanningSession } from "./scanningSession";

describe("createFakeScanningSession", () => {
  const imageData = {} as ImageData;

  test("provides shared session API defaults", async () => {
    const session = createFakeScanningSession();

    expect(typeof session.process).toBe("function");
    expect(typeof session.getSettings).toBe("function");
    expect(typeof session.showDemoOverlay).toBe("function");
    expect(typeof session.showProductionOverlay).toBe("function");
    expect(typeof session.getResult).toBe("function");
    expect(typeof session.ping).toBe("function");
    expect(typeof session.sendPinglets).toBe("function");
    expect(typeof session.reset).toBe("function");
    expect(typeof session.delete).toBe("function");
    expect(typeof session.deleteLater).toBe("function");
    expect(typeof session.isAliasOf).toBe("function");
    expect(typeof session.isDeleted).toBe("function");

    await session.process(imageData);
    await session.getSettings();
    await session.showDemoOverlay();
    await session.showProductionOverlay();
    await session.getResult();
    await session.ping({});
    await session.sendPinglets();
    await session.reset();
    await session.delete();
    session.deleteLater();
    session.isAliasOf({});
    await session.isDeleted();
  });

  test("applies explicit defaults and supports method overrides", async () => {
    const session = createFakeScanningSession<
      { arrayBuffer: ArrayBuffer },
      { scanningSettings: { skipImagesWithBlur: boolean } },
      { status: "ok" }
    >({
      processResult: { arrayBuffer: new ArrayBuffer(8) },
      settings: { scanningSettings: { skipImagesWithBlur: true } },
      result: { status: "ok" },
      showDemoOverlay: true,
      showProductionOverlay: false,
      isDeleted: true,
      overrides: {
        isAliasOf: vi.fn((value: unknown) => value === "same-session"),
      },
    });

    const processResult = await session.process(imageData);
    const settings = await session.getSettings();
    const result = await session.getResult();

    expect(processResult.arrayBuffer.byteLength).toBe(8);
    expect(settings.scanningSettings.skipImagesWithBlur).toBe(true);
    expect(result.status).toBe("ok");
    expect(await session.showDemoOverlay()).toBe(true);
    expect(await session.showProductionOverlay()).toBe(false);
    expect(await session.isDeleted()).toBe(true);
    expect(session.isAliasOf("same-session")).toBe(true);
  });

  test("supports SDK-specific extension fields without coupling", () => {
    const session = createFakeScanningSession<
      unknown,
      unknown,
      unknown,
      { getSessionId: () => string; getSessionNumber: () => number }
    >({
      extra: {
        getSessionId: () => "session-id",
        getSessionNumber: () => 7,
      },
    });

    expect(session.getSessionId()).toBe("session-id");
    expect(session.getSessionNumber()).toBe(7);
  });
});
