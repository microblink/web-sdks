/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

/** Failed BlinkID Verify API request. */
export class VerifyApiError extends Error {
  readonly status?: number;
  readonly body?: unknown;

  constructor(message: string, options?: { status?: number; body?: unknown; cause?: unknown }) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "VerifyApiError";
    this.status = options?.status;
    this.body = options?.body;
  }
}

/** Coerces an unknown rejection into {@link VerifyApiError}. */
export function toVerifyApiError(error: unknown): VerifyApiError {
  if (error instanceof VerifyApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new VerifyApiError(error.message, {
      cause: error,
      status: "status" in error && typeof error.status === "number" ? error.status : undefined,
      body: "body" in error ? error.body : undefined,
    });
  }

  return new VerifyApiError(String(error));
}
