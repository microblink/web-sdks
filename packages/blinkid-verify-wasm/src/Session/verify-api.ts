/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { SerializedPayload } from "./session-result";
import type { VerifyApiDocumentVerificationResponse } from "./verify-api-response";

/**
 * POST-ready Verify request. `body` is the exact assembled bytes (the payload that would be signed). Do not rebuild
 * `FormData` from parts.
 *
 * `url` is `{baseUrl}/api/v3/verify`. `headers` contain only `Content-Type`.
 */
export type PreparedVerifyRequest = {
  url: string;
  method: "POST";
  /** Contains only `Content-Type`. */
  headers: Record<string, string>;
  body: Uint8Array;
  /** Structured multipart parts for inspection and debug only. */
  serializedPayload?: SerializedPayload;
};

/**
 * Successful `POST /api/v3/verify` response body.
 *
 * Generated from the public v3 OpenAPI document, see {@link VerifyApiDocumentVerificationResponse}. Enum-like fields
 * such as `verification.verdict` accept unknown string values so a newer API can add members without breaking the SDK.
 */
export type VerifyApiResult = VerifyApiDocumentVerificationResponse;
