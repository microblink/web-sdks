/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type {
  Consent,
  RemoteScanningSession,
  SerializedPayload,
  TypedPayload,
  VerifyApiResult,
} from "@microblink/blinkid-verify-core";
import { VerifyApiError } from "@microblink/blinkid-verify-core";
import { createFakeScanningSession } from "@microblink/test-utils";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { createVerifyApiResult } from "./__testdata/verifyApiResult";
import { createCaptureResultResolver } from "./capture-result-resolver";

const consent: Consent = {
  durationDays: 30,
  userId: "resolver-user",
  givenOn: "2026-01-01T00:00:00.000Z",
};

const configuration = { verification: { settings: { cropAffectsVerdict: true } } };

const typedPayload = {
  configuration,
  consent,
  traceId: "trace-1",
} as TypedPayload;

const serializedPayload: SerializedPayload = {
  configuration: JSON.stringify(configuration),
  consent: JSON.stringify(consent),
  sdkMetadata: '{"sdk":"blinkid-verify"}',
  traceId: "trace-1",
  imageFirstSide: { jpegBytes: new Uint8Array([1, 2, 3]) },
  imageBarcode: { jpegBytes: new Uint8Array([4, 5]) },
};

const apiResult = createVerifyApiResult();

const createSession = () => {
  return createFakeScanningSession({
    result: {
      serializedPayload,
      typedPayload,
    },
    extra: {
      submitResult: vi.fn().mockResolvedValue(apiResult),
    },
  });
};

describe("createCaptureResultResolver", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getCaptureResult always requests typed payload data and returns the whole session result", async () => {
    const scanningSession = createSession();
    const resolver = createCaptureResultResolver(scanningSession as unknown as RemoteScanningSession, () => consent);

    const result = await resolver.getCaptureResult();

    expect(scanningSession.getResult).toHaveBeenCalledWith(consent, "include-typed-payload");
    expect(result).toEqual({ serializedPayload, typedPayload });
  });

  test("getCaptureResult forwards an absent consent", async () => {
    const scanningSession = createSession();
    const resolver = createCaptureResultResolver(scanningSession as unknown as RemoteScanningSession, () => undefined);

    await resolver.getCaptureResult();

    expect(scanningSession.getResult).toHaveBeenCalledWith(undefined, "include-typed-payload");
  });

  test("verifyCaptureResult forwards consent", async () => {
    const scanningSession = createSession();
    const resolver = createCaptureResultResolver(scanningSession as unknown as RemoteScanningSession, () => consent);

    await expect(resolver.verifyCaptureResult()).resolves.toEqual({ ok: true, result: apiResult });

    expect(scanningSession.submitResult).toHaveBeenCalledWith(consent);
  });

  test("verifyCaptureResult reuses the in-flight or completed promise", async () => {
    const scanningSession = createSession();
    const firstResult = createVerifyApiResult();
    scanningSession.submitResult.mockResolvedValueOnce(firstResult);

    const resolver = createCaptureResultResolver(scanningSession as unknown as RemoteScanningSession, () => consent);

    await expect(resolver.verifyCaptureResult()).resolves.toEqual({ ok: true, result: firstResult });
    await expect(resolver.verifyCaptureResult()).resolves.toEqual({ ok: true, result: firstResult });

    expect(scanningSession.submitResult).toHaveBeenCalledTimes(1);
  });

  test("verifyCaptureResult resolves a non-VerifyApiError as VerifyApiError", async () => {
    const scanningSession = createSession();
    scanningSession.submitResult.mockRejectedValueOnce(new Error("network down"));
    const resolver = createCaptureResultResolver(scanningSession as unknown as RemoteScanningSession, () => consent);

    await expect(resolver.verifyCaptureResult()).resolves.toMatchObject({
      ok: false,
      error: { name: "VerifyApiError", message: "network down" },
    });
  });

  test("verifyCaptureResult shares one in-flight failure, then the next call resubmits", async () => {
    const scanningSession = createSession();
    const failure = new VerifyApiError("submit failed", { status: 503 });
    const retryResult = createVerifyApiResult();
    let rejectSubmit!: (error: VerifyApiError) => void;
    scanningSession.submitResult.mockImplementationOnce(
      () =>
        new Promise<VerifyApiResult>((_resolve, reject) => {
          rejectSubmit = reject;
        }),
    );

    const resolver = createCaptureResultResolver(scanningSession as unknown as RemoteScanningSession, () => consent);
    const first = resolver.verifyCaptureResult();
    const second = resolver.verifyCaptureResult();
    rejectSubmit(failure);

    await expect(first).resolves.toEqual({ ok: false, error: failure });
    await expect(second).resolves.toBe(await first);
    expect(scanningSession.submitResult).toHaveBeenCalledTimes(1);

    scanningSession.submitResult.mockResolvedValueOnce(retryResult);
    await expect(resolver.verifyCaptureResult()).resolves.toEqual({ ok: true, result: retryResult });
    expect(scanningSession.submitResult).toHaveBeenCalledTimes(2);
  });
});
