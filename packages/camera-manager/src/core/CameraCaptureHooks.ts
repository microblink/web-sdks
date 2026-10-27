/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

/**
 * Browser operations used to acquire and extract camera frames.
 *
 * @internal
 */
export type FrameExtractionOperations = {
  drawImage?: CanvasRenderingContext2D["drawImage"];
  getImageData?: CanvasRenderingContext2D["getImageData"];
  texImage2D?: WebGL2RenderingContext["texImage2D"];
  readPixels?: WebGL2RenderingContext["readPixels"];
};

/**
 * Optional instrumentation for camera acquisition and frame extraction.
 *
 * @internal
 */
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

/**
 * Capture hooks that call the browser APIs directly.
 *
 * @internal
 */
export const nativeCaptureHooks: CameraCaptureHooks = {
  getUserMedia: (devices, constraints) => devices.getUserMedia(constraints),
  getVideoTracks: (stream) => stream.getVideoTracks(),
  setSource: (video, stream) => {
    video.srcObject = stream;
  },
  extractFrame: (_context, _source, extract) => extract({}),
};
