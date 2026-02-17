/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type { Remote } from "comlink";
import { releaseProxy, transfer, wrap } from "comlink";
import { oneLineTrim } from "common-tags";
import { getCrossOriginWorkerURL } from "./getCrossOriginWorkerURL";

/**
 * Checks if a URL is a data URL
 * @param url URL to check
 * @returns boolean indicating if it's a data URL
 */
const isDataUrl = (url: string): boolean => {
  return url.startsWith("data:");
};

/**
 * Checks if a URL is a blob URL
 * @param url URL to check
 * @returns boolean indicating if it's a blob URL
 */
const isBlobUrl = (url: string): boolean => {
  return url.startsWith("blob:");
};

/**
 * Checks if a URL needs HTTP validation
 * @param url URL to check
 * @returns boolean indicating if HTTP validation is needed
 */
const needsHttpValidation = (url: string): boolean => {
  return !isDataUrl(url) && !isBlobUrl(url);
};

/**
 * Validates a worker file via HTTP request
 * @param workerUrl URL of the worker file
 * @throws Error if the worker file is not valid
 */
const validateHttpWorkerFile = async (workerUrl: string): Promise<void> => {
  const response = await fetch(workerUrl, { method: "HEAD" });
  const contentType = response.headers.get("content-type");

  const isJavascript = contentType?.includes("javascript");
  const isHtml = contentType?.includes("html");

  if (isHtml) {
    throw new Error(
      oneLineTrim`${workerUrl} resolved to a resource with the content type ${contentType}.
      This is likely an issue with the server configuration redirecting to an index.html file.
      Check that your resources are properly hosted`,
    );
  }

  if (!isJavascript) {
    throw new Error(`Worker file is not a JavaScript file: ${contentType}`);
  }

  if (!response.ok) {
    throw new Error(
      `Worker file not found or inaccessible: ${response.status} ${response.statusText}`,
    );
  }
};

/**
 * Base interface for a scanning session.
 * All SDK scanning sessions must implement this interface to work with the proxy worker.
 */
export interface BaseScanningSession {
  /**
   * Processes an image frame and returns a result.
   * @param image - The image data to process
   * @returns The processing result (type varies by SDK)
   */
  process: (image: ImageData) => unknown;
}

/**
 * Base interface for an SDK worker proxy.
 * All SDK worker proxies must implement this interface to work with the auto-transfer wrapper.
 *
 * Note: The return type can be sync or async (Promise) because Comlink wraps synchronous
 * methods as async when accessed remotely.
 */
export interface BaseSdkWorkerProxy {
  /**
   * Creates a new scanning session.
   * @param args - Session configuration arguments (varies by SDK)
   * @returns A scanning session (sync or Promise-wrapped)
   */
  createScanningSession: (
    ...args: never[]
  ) => BaseScanningSession | Promise<BaseScanningSession>;
}

/**
 * Extracts the session type from an SDK worker proxy type.
 * Unwraps Promise if present.
 */
type ExtractSession<T extends BaseSdkWorkerProxy> = Awaited<
  ReturnType<T["createScanningSession"]>
>;

/**
 * Creates a Comlink-proxied Web Worker (generic) with automatic ImageData buffer transfer.
 *
 * This function wraps the worker proxy to automatically transfer ImageData buffers when calling
 * `session.process()`, eliminating ~8MB copy per frame during scanning.
 *
 * The wrapper intercepts `createScanningSession` and wraps the returned session to auto-transfer
 * ImageData buffers when `process()` is called. This pattern is common across all Microblink SDKs.
 *
 * @param resourcesLocation - Where the "resources" directory is placed.
 * @param workerScriptName - The worker script filename.
 * @returns A promise that resolves with a Comlink-proxied instance of the Web Worker.
 */
export async function createProxyWorker<T extends BaseSdkWorkerProxy>(
  resourcesLocation: string,
  workerScriptName: string,
): Promise<Remote<T>> {
  const workerUrl = await getCrossOriginWorkerURL(
    new URL(`resources/${workerScriptName}`, resourcesLocation).toString(),
  );

  // Only validate HTTP URLs, skip data: and blob: URLs
  if (needsHttpValidation(workerUrl)) {
    await validateHttpWorkerFile(workerUrl);
  }

  const worker = new Worker(workerUrl, {
    type: "module",
  });

  const proxyWorker = wrap<T>(worker);

  worker.onerror = (e) => {
    console.error("Worker error:", e);
    proxyWorker[releaseProxy]();
  };

  // Wrap the proxy to automatically transfer ImageData buffers
  // This is a generic pattern used across all Microblink SDKs
  const wrappedProxyWorker = new Proxy(proxyWorker, {
    get(target, prop, receiver) {
      if (prop === "createScanningSession") {
        return async (
          ...args: Parameters<T["createScanningSession"]>
        ): Promise<ExtractSession<T>> => {
          const session = (await target.createScanningSession(
            ...args,
          )) as ExtractSession<T>;

          // Wrap the session to auto-transfer on process()
          // Type assertion needed because Proxy returns `any` for generic targets
          const wrappedSession = new Proxy(session, {
            get(sessionTarget, sessionProp, sessionReceiver): unknown {
              if (sessionProp === "process") {
                return (imageData: ImageData) => {
                  // Workaround for https://issues.chromium.org/issues/379999322
                  const imageDataLike = {
                    data: imageData.data,
                    width: imageData.width,
                    height: imageData.height,
                    colorSpace: imageData.colorSpace ?? "srgb",
                  } satisfies ImageData;

                  return (sessionTarget as BaseScanningSession).process(
                    transfer(imageDataLike, [imageData.data.buffer]),
                  );
                };
              }
              return Reflect.get(sessionTarget, sessionProp, sessionReceiver);
            },
          });
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return wrappedSession;
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  });

  return wrappedProxyWorker;
}

/**
 * Represents a remote worker instance.
 *
 * This type is the return type of the createProxyWorker function, which creates a Comlink-proxied Web Worker.
 * It simplifies the type to remove unnecessary complexity.
 */
export type RemoteWorker<T extends BaseSdkWorkerProxy> = ReturnType<
  typeof createProxyWorker<T>
>;
