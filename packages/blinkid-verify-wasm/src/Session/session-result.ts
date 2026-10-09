/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { Consent } from "./consent";
import type { DocumentVerificationConfiguration } from "./session-settings";

/** JPEG image included as a multipart file part. */
export type PayloadImage = {
  jpegBytes: Uint8Array;
};

/** Typed values captured or configured for the session before serialization. */
export type TypedPayload = {
  configuration: DocumentVerificationConfiguration;
  consent?: Consent;
  traceId?: string;
};

/** Canonical BlinkID Verify v3 multipart parts ready for HTTP submission. */
export type SerializedPayload = {
  imageFirstSide?: PayloadImage;
  imageSecondSide?: PayloadImage;
  imageBarcode?: PayloadImage;
  configuration: string;
  consent?: string;
  traceId?: string;
  sdkMetadata: string;
};

/** Controls whether native typed payload data is copied into the session result. */
export type ResultDataMode = "serialized-only" | "include-typed-payload";

/** Result generated from captured session frames. */
export type SessionResult = {
  serializedPayload: SerializedPayload;
  typedPayload?: TypedPayload;
};

/** BlinkID Verify-specific name for {@link SessionResult}. */
export type BlinkIdVerifySessionResult = SessionResult;
