/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import {
  toVerifyApiError,
  type BlinkIdVerifySessionResult,
  type Consent,
  type RemoteScanningSession,
  type VerifyApiError,
  type VerifyApiResult,
} from "@microblink/blinkid-verify-core";

/**
 * Settled Verify API submit.
 *
 * API failures resolve as `error` instead of rejecting the promise.
 */
export type VerifyCaptureResult = { ok: true; result: VerifyApiResult } | { ok: false; error: VerifyApiError };

/** Lazy accessors for a finished BlinkID Verify capture. None of these methods run until the client calls them. */
export type CaptureResultResolver = {
  /** Generates the session result with serialized parts, images, and typed payload data. */
  getCaptureResult(): Promise<BlinkIdVerifySessionResult>;
  /**
   * Generates the payload in Wasm and POSTs it from the worker. Resolves with the API result or a
   * {@link VerifyApiError}.
   */
  verifyCaptureResult(): Promise<VerifyCaptureResult>;
};

export type CaptureCompletedCallback = (resolver: CaptureResultResolver) => void | Promise<void>;

export type VerifyOnScanningCompletionSuccessCallback = (
  result: VerifyApiResult,
  resolver: CaptureResultResolver,
) => void | Promise<void>;

export type VerifyOnScanningCompletionErrorCallback = (
  error: VerifyApiError,
  resolver: CaptureResultResolver,
) => void | Promise<void>;

/** Success and error callbacks for `verifyOnScanningCompletion`. */
export type VerifyOnScanningCompletionCallbacks = {
  /** Called with the API result and capture resolver. */
  onSuccess: VerifyOnScanningCompletionSuccessCallback;
  /** Called with a {@link VerifyApiError} and the capture resolver. The client chooses whether to resubmit. */
  onError: VerifyOnScanningCompletionErrorCallback;
};

export const createCaptureResultResolver = (
  scanningSession: RemoteScanningSession,
  getConsent: () => Consent | undefined,
): CaptureResultResolver => {
  let submitPromise: Promise<VerifyCaptureResult> | undefined;

  return {
    getCaptureResult() {
      return scanningSession.getResult(getConsent(), "include-typed-payload");
    },

    verifyCaptureResult() {
      if (submitPromise) {
        return submitPromise;
      }

      let submitted: Promise<VerifyApiResult>;
      try {
        submitted = Promise.resolve(scanningSession.submitResult(getConsent()));
      } catch (error) {
        return Promise.resolve({ ok: false, error: toVerifyApiError(error) });
      }

      const pending = submitted.then(
        (result): VerifyCaptureResult => ({ ok: true, result }),
        (error: unknown): VerifyCaptureResult => ({ ok: false, error: toVerifyApiError(error) }),
      );
      submitPromise = pending;
      // Drop a failed attempt so the client can resubmit. Retry policy stays with the caller.
      void pending.then((outcome) => {
        if (!outcome.ok && submitPromise === pending) {
          submitPromise = undefined;
        }
      });
      return pending;
    },
  };
};
