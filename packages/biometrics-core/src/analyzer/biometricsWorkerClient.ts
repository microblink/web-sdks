/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { BiometricsError, normalizeBiometricsError, unwrapBiometricsWorkerResult } from "@microblink/biometrics-common";
import type { ProcessResultPayload, ResetResultPayload } from "@microblink/biometrics-wasm";
import type { BiometricsWorkerApi } from "@microblink/biometrics-worker";
import { getCrossOriginWorkerURL } from "@microblink/worker-common/getCrossOriginWorkerURL";
import type { Remote } from "comlink";
import { releaseProxy, wrap } from "comlink";

import { resolveBiometricsWorkerScriptUrl } from "../resources/resourceManifest";

type BiometricsWorkerMethod =
  | "init"
  | "startSession"
  | "endSession"
  | "process"
  | "finalizeCaptureMetadata"
  | "getSessionId"
  | "getTraceId"
  | "getSessionNumber"
  | "getWasmVariant"
  | "reset"
  | "ping"
  | "sendPinglets"
  | "close";

type BiometricsWorkerProxy = Remote<Pick<BiometricsWorkerApi, BiometricsWorkerMethod | "ready">>;

export type BiometricsWorkerRemote = Pick<
  BiometricsWorkerProxy,
  "endSession" | "getSessionId" | "getTraceId" | "getSessionNumber" | "getWasmVariant" | "sendPinglets" | "close"
> & {
  init(...args: Parameters<BiometricsWorkerApi["init"]>): Promise<void>;
  startSession(...args: Parameters<BiometricsWorkerApi["startSession"]>): Promise<void>;
  reset(...args: Parameters<BiometricsWorkerApi["reset"]>): Promise<ResetResultPayload>;
  ping(...args: Parameters<BiometricsWorkerApi["ping"]>): Promise<void>;
  process(...args: Parameters<BiometricsWorkerApi["process"]>): Promise<BiometricsProcessResultWithBuffer>;
  finalizeCaptureMetadata(...args: Parameters<BiometricsWorkerApi["finalizeCaptureMetadata"]>): Promise<string | null>;
};

export type BiometricsProcessResultWithBuffer = ProcessResultPayload & {
  arrayBuffer: ArrayBuffer;
};

function resolveWorkerScriptUrl(resourcesBaseUrl: string): string {
  return resolveBiometricsWorkerScriptUrl(resourcesBaseUrl);
}

export async function createBiometricsWorkerProxy(
  resourcesBaseUrl: string,
  options: { timeoutMs?: number } = {},
): Promise<{
  remote: BiometricsWorkerRemote;
  terminate: () => void;
}> {
  const workerScriptUrl = resolveWorkerScriptUrl(resourcesBaseUrl);

  const crossOriginWorkerUrl = await getCrossOriginWorkerURL(workerScriptUrl);

  const worker = new Worker(crossOriginWorkerUrl, { type: "module" });
  const raw = wrap<Pick<BiometricsWorkerApi, BiometricsWorkerMethod | "ready">>(worker);

  const timeoutMs = options.timeoutMs ?? 60_000;

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let rejectWorkerStartup: ((error: BiometricsError) => void) | undefined;

  const workerStartupFailure = new Promise<never>((_, reject) => {
    rejectWorkerStartup = reject;
  });

  const handleWorkerError = (event: ErrorEvent): void => {
    rejectWorkerStartup?.(
      normalizeBiometricsError(event.error ?? event.message, {
        stage: "initialization",
        component: "worker",
        code: "WORKER_LOAD_FAILED",
        isRetryable: true,
      }),
    );
  };

  const handleWorkerMessageError = (event: MessageEvent): void => {
    rejectWorkerStartup?.(
      normalizeBiometricsError(event.data, {
        stage: "initialization",
        component: "worker",
        code: "WORKER_LOAD_FAILED",
        isRetryable: true,
        message: "Biometrics Worker message could not be deserialized",
      }),
    );
  };

  worker.addEventListener("error", handleWorkerError);
  worker.addEventListener("messageerror", handleWorkerMessageError);

  try {
    await Promise.race([
      Promise.resolve(raw.ready()).then(unwrapBiometricsWorkerResult),
      workerStartupFailure,
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(
            new BiometricsError({
              message: "Biometrics Worker did not become ready in time",
              code: "WORKER_START_TIMEOUT",
              stage: "initialization",
              component: "worker",
              isRetryable: true,
            }),
          );
        }, timeoutMs);
      }),
    ]);
  } catch (error) {
    void raw[releaseProxy]();
    worker.terminate();
    throw error;
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    worker.removeEventListener("error", handleWorkerError);
    worker.removeEventListener("messageerror", handleWorkerMessageError);
  }

  const remote: BiometricsWorkerRemote = {
    init: (...args) => Promise.resolve(raw.init(...args)).then(unwrapBiometricsWorkerResult),
    startSession: (...args) => Promise.resolve(raw.startSession(...args)).then(unwrapBiometricsWorkerResult),
    endSession: raw.endSession,
    process: (...args) => Promise.resolve(raw.process(...args)).then(unwrapBiometricsWorkerResult),
    finalizeCaptureMetadata: (...args) =>
      Promise.resolve(raw.finalizeCaptureMetadata(...args)).then(unwrapBiometricsWorkerResult),
    getSessionId: raw.getSessionId,
    getTraceId: raw.getTraceId,
    getSessionNumber: raw.getSessionNumber,
    getWasmVariant: raw.getWasmVariant,
    reset: (...args) => Promise.resolve(raw.reset(...args)).then(unwrapBiometricsWorkerResult),
    ping: (...args) => Promise.resolve(raw.ping(...args)).then(unwrapBiometricsWorkerResult),
    sendPinglets: raw.sendPinglets,
    close: raw.close,
  };

  return {
    remote,
    terminate: () => {
      void raw[releaseProxy]();
      worker.terminate();
    },
  };
}
