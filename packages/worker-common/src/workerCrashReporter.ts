/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

type WorkerEventTarget = Pick<
  EventTarget,
  "addEventListener" | "removeEventListener"
>;

type WorkerErrorCallback = (params: {
  origin: "worker.onerror" | "worker.unhandledrejection";
  error: unknown;
  sessionNumber: number;
}) => void;

/**
 * Installs a worker crash reporter. Adds error and unhandled rejection
 * listeners to the worker and reports the error or rejection to the provided
 * callback.
 *
 * @param params - The parameters for the worker crash reporter.
 * @param params.workerScope - The worker scope to install the crash reporter
 * on. Defaults to `self`.
 * @param params.getSessionNumber - A function to get the current session
 * number. Defaults to `() => 0`.
 * @param params.onError - A callback to call when an error or unhandled
 * rejection occurs.
 *
 * @returns A function to uninstall the worker crash reporter.
 */
export function installWorkerCrashReporter({
  workerScope,
  getSessionNumber,
  onError,
}: {
  workerScope?: WorkerEventTarget;
  getSessionNumber?: () => number;
  onError: WorkerErrorCallback;
}) {
  const target = workerScope ?? self;
  const readSessionNumber = getSessionNumber ?? (() => 0);
  let isReporting = false;

  const report = (
    origin: "worker.onerror" | "worker.unhandledrejection",
    error: unknown,
  ) => {
    if (isReporting) {
      return;
    }

    isReporting = true;

    try {
      onError({
        origin,
        error,
        sessionNumber: readSessionNumber(),
      });
    } finally {
      isReporting = false;
    }
  };

  const handleError = (event: Event) => {
    const errorEvent = event as ErrorEvent;

    report(
      "worker.onerror",
      errorEvent.error ?? errorEvent.message ?? "Unknown worker error",
    );
  };

  const handleUnhandledRejection = (event: Event) => {
    const rejectionEvent = event as PromiseRejectionEvent;

    report(
      "worker.unhandledrejection",
      rejectionEvent.reason ?? "Unhandled worker rejection",
    );
  };

  target.addEventListener("error", handleError);
  target.addEventListener("unhandledrejection", handleUnhandledRejection);

  return () => {
    target.removeEventListener("error", handleError);
    target.removeEventListener("unhandledrejection", handleUnhandledRejection);
  };
}
