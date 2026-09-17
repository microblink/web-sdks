/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

const type = "application/javascript";
const ipv4LoopbackPattern = /^127(?:\.\d{1,3}){3}$/;

const isLocalhost = (hostname: string): boolean =>
  hostname === "localhost" ||
  hostname.endsWith(".localhost") ||
  ipv4LoopbackPattern.test(hostname) ||
  hostname === "[::1]";

const isAllowedWorkerUrl = (url: URL): boolean =>
  url.protocol === "https:" || (url.protocol === "http:" && isLocalhost(url.hostname));

/**
 * Options for the getCrossOriginWorkerURL function.
 *
 * @param skipSameOrigin - If true, the function will return the original URL if it is same-origin.
 * @param useBlob - If true, the function will return a blob URL.
 */
type Options = {
  /** If true, the function will return the original URL if it is same-origin. */
  skipSameOrigin?: boolean;
  /** If true, the function will return a blob URL if not same-origin. */
  useBlob?: boolean;
};

/**
 * Gets a cross-origin worker URL as a data URL or blob URL. If the URL is same-origin, it will return the original URL.
 *
 * @param originalWorkerUrl - The original worker URL.
 * @param _options - The options for the worker.
 * @returns A promise that resolves with the cross-origin worker URL.
 */
export const getCrossOriginWorkerURL = (originalWorkerUrl: string, _options: Options = {}) => {
  const options = {
    skipSameOrigin: true,
    useBlob: true,

    ..._options,
  };
  const workerUrl = new URL(originalWorkerUrl);

  if (options.skipSameOrigin && workerUrl.origin === self.location.origin) {
    // The same origin - Worker will run fine
    return Promise.resolve(originalWorkerUrl);
  }

  if (!isAllowedWorkerUrl(workerUrl)) {
    return Promise.reject(new Error(`Worker URL must use HTTPS or a loopback host: ${originalWorkerUrl}`));
  }

  let signal: AbortSignal;

  try {
    // Setup the abort controller
    const controller = new AbortController();
    signal = controller.signal;

    const timeout = setTimeout(() => {
      controller.abort();
    }, 3000);

    const cleanup = () => {
      clearTimeout(timeout);
      controller.abort();
    };

    signal.addEventListener("abort", cleanup);
  } catch (error) {
    // just swallow the error
  }

  return new Promise<string>(
    (resolve, reject) =>
      void fetch(workerUrl, {
        // abort if the worker is not fetched in a reasonable time
        signal,
      })
        .then((res) => {
          const responseUrl = new URL(res.url || workerUrl);
          if (!isAllowedWorkerUrl(responseUrl)) {
            throw new Error("Worker response URL is not allowed");
          }

          return res.text();
        })
        .then((codeString) => {
          let finalURL = "";

          if (options.useBlob) {
            const blob = new Blob([codeString], { type });
            finalURL = URL.createObjectURL(blob);
          } else {
            finalURL = `data:${type},` + encodeURIComponent(codeString);
          }
          resolve(finalURL);
        })
        .catch(() => {
          reject(new Error(`Failed to fetch worker from ${originalWorkerUrl}`));
        }),
  );
};
