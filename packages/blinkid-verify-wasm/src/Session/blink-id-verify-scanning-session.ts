/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { EmbindObject } from "../emscripten";
import type { BlinkIdVerifyProcessResult } from "./blink-id-verify-process-result";
import type { Consent } from "./consent";
import type { BlinkIdVerifySessionResult, ResultDataMode } from "./session-result";
import { BlinkIdVerifySessionSettings } from "./session-settings";
import type { PreparedVerifyRequest, VerifyApiResult } from "./verify-api";

/** Represents a scanning session for BlinkID Verify. */
export type BlinkIdVerifyScanningSession = EmbindObject<{
  /**
   * Processes the given image data.
   *
   * @param img The image data to process.
   * @returns The result of the processing.
   */
  process(img: ImageData): BlinkIdVerifyProcessResult;

  /**
   * Generates the BlinkID Verify v3 session result.
   *
   * Serialized multipart parts are always returned. Typed data is included only when requested.
   *
   * @param consent Optional consent to include in the generated payload.
   * @param resultDataMode Controls whether typed payload data is included.
   * @returns The generated session result.
   */
  getResult(consent?: Consent, resultDataMode?: ResultDataMode): BlinkIdVerifySessionResult;

  /**
   * Stores the Verify API base URL for later prepare and submit calls.
   *
   * The worker calls this once after session creation. It is not part of the proxied session.
   *
   * @param baseUrl Required before prepare or submit. Requests POST to `{baseUrl}/api/v3/verify` with no API key.
   */
  setVerifyApiBaseUrl(baseUrl: string): void;

  /**
   * Assembles a POST-ready BlinkID Verify v3 request from the captured session without sending it.
   *
   * Uses the base URL stored by `setVerifyApiBaseUrl`. `baseUrl` is required. The request includes no API key. The
   * returned `body` is the exact multipart bytes that would be POSTed.
   *
   * @param consent Optional consent to include in the generated payload.
   */
  prepareVerifyRequest(consent?: Consent): Promise<PreparedVerifyRequest>;

  /**
   * Generates the serialized payload in Wasm and POSTs it to the Verify API.
   *
   * Uses the base URL stored by `setVerifyApiBaseUrl`. `baseUrl` is required. The request includes no API key. The
   * timeout is 20000ms. In-flight requests are aborted on `reset()`, `delete()`, and SDK terminate.
   *
   * @param consent Optional consent to include in the generated payload.
   */
  submitResult(consent?: Consent): Promise<VerifyApiResult>;

  /** Returns the session settings. */
  getSettings(): BlinkIdVerifySessionSettings;

  /** Returns the session ID. This info is required for BlinkID Verify Cloud API */
  getSessionId(): string;

  /**
   * Allows the barcode step to be performed during scanning. If during the scanning process the barcode is unreadable
   * BlinkIdVerifyProcessResult will return a Scanning status for barcode scanning only.
   */
  allowBarcodeStep(): void;

  /**
   * Resets the scanning session.
   *
   * @returns An error message if reset fails, otherwise undefined.
   */
  reset(): void;
}>;
