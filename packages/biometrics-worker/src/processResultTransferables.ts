/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { BiometricsWorkerResult } from "@microblink/biometrics-common";
import type { FaceAnalysisResult, ProcessResultPayload, WasmSuccessPayload } from "@microblink/biometrics-wasm";
import { transfer } from "comlink";

export type BiometricsProcessResultWithBuffer = ProcessResultPayload & {
  arrayBuffer: ArrayBuffer;
};

export function collectSuccessPayloadTransferables(success: WasmSuccessPayload | undefined): ArrayBuffer[] {
  if (!success) {
    return [];
  }

  const transferables: ArrayBuffer[] = [];

  transferables.push(success.captureFrame.data);

  if (success.captureFrame.signature) {
    transferables.push(success.captureFrame.signature);
  }

  for (const frame of success.livenessFrames ?? []) {
    transferables.push(frame.data);

    if (frame.signature) {
      transferables.push(frame.signature);
    }
  }

  if (success.livenessBatchSignature) {
    transferables.push(success.livenessBatchSignature);
  }

  return transferables;
}

export function collectProcessResultTransferables(result: ProcessResultPayload): ArrayBuffer[] {
  if (result.error) {
    return [];
  }

  return collectSuccessPayloadTransferables(result.success);
}

export function transferProcessResult(
  result: ProcessResultPayload,
  arrayBuffer: ArrayBuffer,
): BiometricsProcessResultWithBuffer {
  const resultWithBuffer = { ...result, arrayBuffer };
  const transferables = Array.from(new Set([arrayBuffer, ...collectProcessResultTransferables(result)]));

  return transfer(resultWithBuffer, transferables);
}

export function transferFaceAnalysisResult(result: FaceAnalysisResult): FaceAnalysisResult {
  const transferables = collectSuccessPayloadTransferables(result.success);

  return transferables.length === 0 ? result : transfer(result, transferables);
}

export function transferProcessWorkerResult(
  value: BiometricsProcessResultWithBuffer,
): BiometricsWorkerResult<BiometricsProcessResultWithBuffer> {
  const transferables = Array.from(new Set([value.arrayBuffer, ...collectProcessResultTransferables(value)]));

  return transfer({ ok: true, value }, transferables);
}

export function transferFaceAnalysisWorkerResult(
  value: FaceAnalysisResult,
): BiometricsWorkerResult<FaceAnalysisResult> {
  const result = { ok: true, value } as const;
  const transferables = collectSuccessPayloadTransferables(value.success);

  return transferables.length === 0 ? result : transfer(result, transferables);
}
