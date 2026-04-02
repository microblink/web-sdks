/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type { EmbindObject } from "../emscripten";
import type { BlinkIdVerifyProcessResult } from "./blink-id-verify-process-result";
import type { BlinkIdVerifyScanningResult } from "./blink-id-verify-scanning-result";
import { BlinkIdVerifySessionSettings } from "./session-settings";

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
   * Retrieves the current scanning result.
   *
   * @returns The scanning result containing captured frames.
   */
  getResult(): BlinkIdVerifyScanningResult;

  /** Returns the session settings. */
  getSettings(): BlinkIdVerifySessionSettings;

  /** Returns the session ID. This info is required for BlinkID Verify Cloud API */
  getSessionId(): string;

  /**
   * Allows the barcode step to be performed during scanning. If during the
   * scanning process the barcode is unreadable BlinkIdVerifyProcessResult will
   * return a Scanning status for barcode scanning only.
   */
  allowBarcodeStep(): void;

  /**
   * Resets the scanning session.
   *
   * @returns An error message if reset fails, otherwise undefined.
   */
  reset(): void;
}>;
