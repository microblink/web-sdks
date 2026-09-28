/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { EmbindObject } from "@microblink/wasm-common";

import type { FaceAnalysisResult, ProcessResultPayload, ResetResultPayload } from "./result.js";
import type { ResolvedFaceAnalysisSessionSettings } from "./settings.js";

export type BiometricsWasmLandmarkPoint = {
  x: number;
  y: number;
};

/**
 * Canonical landmark order expected by `BiometricsWasmSession.process(...)`: left eye, right eye, left ear, right ear,
 * nose tip, mouth center.
 */
export type BiometricsWasmLandmarks = readonly [
  BiometricsWasmLandmarkPoint,
  BiometricsWasmLandmarkPoint,
  BiometricsWasmLandmarkPoint,
  BiometricsWasmLandmarkPoint,
  BiometricsWasmLandmarkPoint,
  BiometricsWasmLandmarkPoint,
];

/** A face analysis session. */
export type BiometricsWasmSession = EmbindObject<{
  /**
   * Process a single frame.
   *
   * Returns a structured result: `status` is a `NativeFrameStatus` (`Continue` | `Done`) on success together with the
   * native frame `feedback`, or `-1` when `error` is non-null.
   */
  process(
    imageData: ImageData,
    landmarks?: BiometricsWasmLandmarks,
    signalBatch?: Uint8Array<ArrayBuffer>,
  ): ProcessResultPayload;
  /** Finalize attempt metadata after capture completes. Returns `null` when metadata is unavailable. */
  finalizeCaptureMetadata(finalSignalBatch: Uint8Array<ArrayBuffer>): string | null;

  /** Get the current face analysis result. */
  getResult(): FaceAnalysisResult;

  /** Echoes back the resolved session settings used by this session. */
  getSettings(): ResolvedFaceAnalysisSessionSettings;

  /** Returns the session UUID. Stable across resets, changes when a new session is created. */
  getSessionId(): string;

  /**
   * Returns the monotonically increasing session number used to correlate telemetry with other Microblink WASM
   * scanners.
   */
  getSessionNumber(): number;

  /**
   * Reset the session for a new capture.
   *
   * Returns `{ error: null }` on success or `{ error: SessionError }` on failure. Never throws.
   */
  reset(): ResetResultPayload;
}>;
