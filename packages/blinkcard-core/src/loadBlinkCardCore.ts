/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type {
  BlinkCardWorkerInitSettings,
  BlinkCardWorkerProxy,
  ProgressStatusCallback,
} from "@microblink/blinkcard-worker";
import { createProxyWorker } from "@microblink/core-common/createProxyWorker";
import { getUserId } from "@microblink/core-common/getUserId";
import { proxy, Remote } from "comlink";
import type { SetOptional, Simplify } from "type-fest";

/**
 * Configuration options for initializing the BlinkCard core.
 *
 * This type extends the BlinkCardWorkerInitSettings type by making the userId property optional.
 * It allows for partial configuration of the initialization settings.
 */
export type BlinkCardInitSettings = SetOptional<
  BlinkCardWorkerInitSettings,
  // User ID is optional outside the worker scope
  "userId"
>;

/**
 * Represents the BlinkCard core instance.
 *
 * This type extends the Remote type from Comlink, which is used to proxy calls to the BlinkCard worker.
 * It simplifies the type to remove unnecessary complexity.
 */
export type BlinkCardCore = Simplify<Remote<BlinkCardWorkerProxy>>;

const STORAGE_KEY = "blinkcard-userid";

/**
 * Creates and initializes a BlinkCard core instance.
 *
 * @param settings - Configuration for BlinkCard initialization including license key and resources location
 * @param progressCallback - Optional callback for tracking resource download progress (WASM, data files)
 * @returns Promise that resolves with initialized BlinkCard core instance
 * @throws Error if initialization fails
 */
export async function loadBlinkCardCore(
  settings: BlinkCardInitSettings,
  progressCallback?: ProgressStatusCallback,
): Promise<BlinkCardCore> {
  const remoteWorker = await createProxyWorker<BlinkCardWorkerProxy>(
    settings.resourcesLocation ?? window.location.href,
    "blinkcard-worker.js",
  );

  if (!settings.userId) {
    settings.userId = getUserId(STORAGE_KEY);
  }

  if (!settings.resourcesLocation) {
    settings.resourcesLocation = window.location.href;
  }

  const proxyProgressCallback = progressCallback
    ? proxy(progressCallback)
    : undefined;

  try {
    // we added the `userid` to the settings if not provided, so this assertion is safe
    await remoteWorker.initBlinkCard(
      settings as BlinkCardWorkerInitSettings,
      proxyProgressCallback,
    );

    return remoteWorker;
  } catch (error) {
    void remoteWorker.reportPinglet({
      schemaName: "ping.error",
      schemaVersion: "1.0.0",
      data: {
        errorType: "Crash",
        errorMessage: error instanceof Error ? error.message : String(error),
        stackTrace: error instanceof Error ? error.stack : undefined,
      },
    });
    void remoteWorker.sendPinglets();
    throw new Error("Failed to initialize BlinkCard", {
      cause: error,
    });
  }
}
