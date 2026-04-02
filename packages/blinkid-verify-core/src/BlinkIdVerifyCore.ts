/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  BlinkIdVerifyWorkerInitSettings,
  BlinkIdVerifyWorkerProxy,
  ProgressStatusCallback,
} from "@microblink/blinkid-verify-worker";
import type { SetOptional, Simplify } from "type-fest";
import { proxy, Remote } from "comlink";
import { createProxyWorker } from "@microblink/core-common/createProxyWorker";
import { getUserId } from "@microblink/core-common/getUserId";

/**
 * Configuration options for initializing the BlinkIdVerify core.
 *
 * This type extends the BlinkIdVerifyWorkerInitSettings type by making the userId and useLightweightBuild properties optional.
 * It allows for partial configuration of the initialization settings.
 */
export type BlinkIdVerifyInitSettings = SetOptional<
  BlinkIdVerifyWorkerInitSettings,
  // User ID is optional outside the worker scope
  "userId"
>;

/**
 * Represents the BlinkIdVerify core instance.
 *
 * This type extends the Remote type from Comlink, which is used to proxy calls to the BlinkIdVerify worker.
 * It simplifies the type to remove unnecessary complexity.
 */
export type BlinkIdVerifyCore = Simplify<Remote<BlinkIdVerifyWorkerProxy>>;

const STORAGE_KEY = "blinkid-verify-userid";

/**
 * Creates and initializes a BlinkIdVerify core instance.
 *
 * @param settings - Configuration for BlinkIdVerify initialization including license key and resources location
 * @param progressCallback - Optional callback for tracking resource download progress (WASM, data files)
 * @returns Promise that resolves with initialized BlinkIdVerify core instance
 * @throws Error if initialization fails
 */
export async function loadBlinkIdVerifyCore(
  settings: BlinkIdVerifyInitSettings,
  progressCallback?: ProgressStatusCallback,
): Promise<BlinkIdVerifyCore> {
  settings.resourcesLocation ??= window.location.href;

  const remoteWorker = await createProxyWorker<BlinkIdVerifyWorkerProxy>(
    settings.resourcesLocation,
    "blinkid-verify-worker.js",
  );

  settings.userId ??= getUserId(STORAGE_KEY);

  const proxyProgressCallback = progressCallback
    ? proxy(progressCallback)
    : undefined;

  try {
    await remoteWorker.initBlinkIdVerify(
      settings as BlinkIdVerifyWorkerInitSettings,
      proxyProgressCallback,
    );

    return remoteWorker;
  } catch (error) {
    throw new Error("Failed to initialize BlinkID Verify", {
      cause: error,
    });
  }
}
