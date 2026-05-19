/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { EmbindObject } from "@microblink/wasm-common";
import { BlinkIdProcessResult } from "./BlinkIdProcessResult";
import { BlinkIdScanningResult } from "./BlinkIdScanningResult";
import { BlinkIdSessionSettings } from "./BlinkIdSessionSettings";
import { ScanningStatus } from "../result/ScanningStatus";
import { RedactionSettings } from "../settings/RedactionSettings";

/** Represents the scanning session for BlinkID */
export type BlinkIdScanningSession = EmbindObject<{
  /** Resets the scanning session to initial state. */
  reset: () => void;

  /** Resolves the current step and advances the session when possible. */
  resolveCurrentStep: () => void;

  /**
   * Processes the input camera frame
   *
   * @param image The frame to process
   * @returns The `BlinkIdProcessResult`.
   */
  process: (image: ImageData) => BlinkIdProcessResult;

  /**
   * Returns the result of the scanning session.
   *
   * @param redactionSettings - The redaction settings to apply to the result.
   *   If not provided, the default redaction settings will be used.
   * @returns The `BlinkIdScanningResult`
   */
  getResult: (redactionSettings?: RedactionSettings) => BlinkIdScanningResult;

  /** Returns session settings used to create this session. */
  getSettings: () => BlinkIdSessionSettings;

  /** Returns the resolved settings used to configure the recognizer. */
  getResolvedSessionSettings: () => BlinkIdSessionSettings;

  /** Returns the session ID. */
  getSessionId: () => string;

  /** Returns the session number. */
  getSessionNumber: () => number;

  /** Returns the scanning status. */
  getScanningStatus: () => ScanningStatus;
}>;
