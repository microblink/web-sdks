/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { BiometricsWasmLandmarks, ProcessResultPayload } from "@microblink/biometrics-wasm";
export type CaptureRuntimeOptions = {
  source?: {
    video: HTMLVideoElement;
    track: MediaStreamTrack;
  };
  mode: "single" | "engineFrames";
  transport: {
    process(
      image: ImageData,
      landmarks?: BiometricsWasmLandmarks,
      signalBatch?: Uint8Array<ArrayBuffer>,
    ): Promise<
      ProcessResultPayload & {
        arrayBuffer: ArrayBuffer;
      }
    >;
    finalizeCaptureMetadata(batch: Uint8Array<ArrayBuffer>): Promise<string | null>;
  };
};
export type CaptureRuntime = {
  process(
    image: ImageData,
    landmarks?: BiometricsWasmLandmarks,
  ): Promise<
    ProcessResultPayload & {
      arrayBuffer: ArrayBuffer;
    }
  >;
  finish(): Promise<{
    livenessMetadata?: string;
  }>;
  dispose(): void;
};
export declare function createCaptureRuntime({ source, mode, transport }: CaptureRuntimeOptions): CaptureRuntime;
