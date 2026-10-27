/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { BiometricsWasmLandmarks, ProcessResultPayload } from "@microblink/biometrics-wasm";
export type FrameExtractionOperations = Partial<
  Pick<CanvasRenderingContext2D, "drawImage" | "getImageData"> &
    Pick<WebGL2RenderingContext, "texImage2D" | "readPixels">
>;
export type CameraCaptureHooks = {
  getUserMedia(devices: MediaDevices, constraints: MediaStreamConstraints): Promise<MediaStream>;
  getVideoTracks(stream: MediaStream): MediaStreamTrack[];
  setSource(video: HTMLVideoElement, stream: MediaStream | null): void;
  extractFrame(
    context: CanvasRenderingContext2D | WebGL2RenderingContext,
    source: HTMLVideoElement | HTMLCanvasElement | ImageBitmap,
    extract: (operations: FrameExtractionOperations) => ImageData,
  ): ImageData;
};
export type CaptureObservation = {
  kind: number;
  value: bigint;
  target: number;
  text?: string;
  timeUs: bigint;
};
export type CaptureLifecycle = {
  hooks: CameraCaptureHooks;
  start(source?: { video: HTMLVideoElement; track: MediaStreamTrack }): void;
  claimFrame(image: ImageData, frame: ImageData): void;
  check(): void;
  finalize(): void;
  cancel(): void;
  drain(): CaptureObservation[];
};
export declare function createCaptureLifecycle(): CaptureLifecycle;
export type CaptureRuntimeOptions = {
  source?: {
    video: HTMLVideoElement;
    track: MediaStreamTrack;
  };
  captureLifecycle?: CaptureLifecycle;
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
export declare function createCaptureRuntime({
  source,
  mode,
  transport,
  captureLifecycle,
}: CaptureRuntimeOptions): CaptureRuntime;
