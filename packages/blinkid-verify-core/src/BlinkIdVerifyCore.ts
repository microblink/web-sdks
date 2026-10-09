/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type {
  BlinkIdVerifyWorkerInitSettings,
  BlinkIdVerifyWorkerProxy,
  ProgressStatusCallback,
} from "@microblink/blinkid-verify-worker";
import { createProxyWorker } from "@microblink/core-common/createProxyWorker";
import { getUserId } from "@microblink/core-common/getUserId";
import { proxy, Remote } from "comlink";
import type { Simplify } from "type-fest";

/**
 * Configuration options for initializing the BlinkIdVerify core.
 *
 * Ping `userId` is generated and persisted by the SDK. It is not part of the public initialization settings.
 */
export type BlinkIdVerifyInitSettings = Simplify<
  Omit<BlinkIdVerifyWorkerInitSettings, "userId" | "verifyApi" | "verifyApiBaseUrl"> & {
    /**
     * Base URL for Verify API requests.
     *
     * Omitted means `window.location.origin`. Relative values resolve against the page URL. The SDK always POSTs to
     * `{resolved}/api/v3/verify`. The customer's server owns the real Verify host and the API key; the SDK sends no
     * Authorization header. This is not `microblinkProxyUrl` (that remains ping/Baltazar only).
     */
    verifyApiBaseUrl?: string;
  }
>;

/**
 * BlinkID Verify core.
 *
 * {@link BlinkIdVerifyCore.createScanningSession} returns a session that always has `submitResult` and
 * `prepareVerifyRequest`.
 *
 * @public
 */
export type BlinkIdVerifyCore = Simplify<Remote<BlinkIdVerifyWorkerProxy>>;

const STORAGE_KEY = "blinkid-verify-userid";

/**
 * Creates and initializes a BlinkIdVerify core instance.
 *
 * Resolves `verifyApiBaseUrl` to an absolute URL on the main thread and passes that string to the worker.
 *
 * @param settings - Configuration for BlinkIdVerify initialization including license key and resources location
 * @param progressCallback - Optional callback for tracking resource download progress (WASM, data files)
 * @returns Promise that resolves with the initialized BlinkID Verify core
 * @throws Error if initialization fails
 */
export async function loadBlinkIdVerifyCore(
  settings: BlinkIdVerifyInitSettings,
  progressCallback?: ProgressStatusCallback,
): Promise<BlinkIdVerifyCore> {
  settings.resourcesLocation ??= window.location.href;

  const verifyApiBaseUrl = new URL(settings.verifyApiBaseUrl ?? window.location.origin, window.location.href)
    .toString()
    .replace(/\/+$/, "");

  const remoteWorker = await createProxyWorker<BlinkIdVerifyWorkerProxy>(
    settings.resourcesLocation,
    "blinkid-verify-worker.js",
  );

  const workerSettings = {
    ...settings,
    userId: getUserId(STORAGE_KEY),
    verifyApiBaseUrl,
  };

  const proxyProgressCallback = progressCallback ? proxy(progressCallback) : undefined;

  try {
    await remoteWorker.initBlinkIdVerify(workerSettings, proxyProgressCallback);

    return remoteWorker;
  } catch (error) {
    throw new Error("Failed to initialize BlinkID Verify", {
      cause: error,
    });
  }
}
