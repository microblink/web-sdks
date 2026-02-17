/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type { EmbindObject } from "@microblink/wasm-common";
import type { BlinkCardProcessResult } from "./result/process-result";
import type { BlinkCardScanningResult } from "./result/scanning-result";
import { BlinkCardSessionSettings } from "./session-settings";

/** Represents the scanning session for BlinkCard */
export type BlinkCardScanningSession = EmbindObject<{
  /**
   * Resets the `BlinkCardScanningSession` to initial state.
   * 
   * @throws {Error} Throws an error if the card has already been scanned.
   */
  reset: () => void;

  /**
   * Performs the processing of the input image and returns the
   * `BlinkCardProcessResult`.
   * 
   * @throws {Error} Throws an error if the card has already been scanned.
   */
  process: (image: ImageData) => BlinkCardProcessResult;

  /** Returns the `ScanningResult`. */
  getResult: () => BlinkCardScanningResult;

  /** Returns the session settings. */
  getSettings: () => BlinkCardSessionSettings;

  /** Returns the session ID. */
  getSessionId: () => string;

  /** Returns the session number. */
  getSessionNumber: () => number;
}>;
