/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { vi } from "vitest";
type FrameCaptureCallback = (
  frame: ImageData,
) => Promise<ArrayBufferLike | void> | ArrayBufferLike | void;
type PlaybackState = "idle" | "playback" | "capturing";

type CameraPermission = "prompt" | "granted" | "denied" | "blocked" | undefined;

export type FakeCameraManagerState = {
  playbackState: PlaybackState;
  cameras: unknown[];
  isSwappingCamera: boolean;
  isQueryingCameras: boolean;
  mirrorX: boolean;
  videoElement?: HTMLVideoElement;
  selectedCamera?: {
    name?: string;
    facingMode?: "front" | "back";
    torchEnabled?: boolean;
  };
  videoResolution?: { width: number; height: number };
  extractionArea?: { x: number; y: number; width: number; height: number };
  cameraPermission?: CameraPermission;
};

type CreateFakeCameraManagerOptions = {
  initialState?: Partial<FakeCameraManagerState>;
  isActive?: boolean;
};

type SelectorSubscription = {
  selector: (state: FakeCameraManagerState) => unknown;
  listener: (selectedState: unknown, previousSelectedState: unknown) => void;
  equalityFn: (a: unknown, b: unknown) => boolean;
  previousSelectedState: unknown;
};

type RootSubscription = (
  selectedState: FakeCameraManagerState,
  previousSelectedState: FakeCameraManagerState,
) => void;

const defaultState: FakeCameraManagerState = {
  playbackState: "idle",
  cameras: [],
  isSwappingCamera: false,
  isQueryingCameras: false,
  mirrorX: false,
  videoElement: undefined,
  selectedCamera: undefined,
  videoResolution: undefined,
  extractionArea: undefined,
  cameraPermission: undefined,
};

export class FakeCameraManager {
  #state: FakeCameraManagerState;
  #frameCaptureCallback: FrameCaptureCallback | undefined;
  #isActive: boolean;
  #rootSubscriptions = new Set<RootSubscription>();
  #selectorSubscriptions = new Set<SelectorSubscription>();

  readonly stopFrameCapture = vi.fn();
  readonly startFrameCapture = vi.fn().mockResolvedValue(undefined);
  readonly startCameraStream = vi.fn().mockResolvedValue(undefined);
  readonly getState = vi.fn(() => this.#state);

  constructor(options: CreateFakeCameraManagerOptions = {}) {
    this.#state = {
      ...defaultState,
      ...options.initialState,
    };
    this.#isActive = options.isActive ?? true;
  }

  get isActive() {
    return this.#isActive;
  }

  set isActive(value: boolean) {
    this.#isActive = value;
  }

  addFrameCaptureCallback = vi.fn((callback: FrameCaptureCallback) => {
    this.#frameCaptureCallback = callback;
    return () => {
      if (this.#frameCaptureCallback === callback) {
        this.#frameCaptureCallback = undefined;
        return true;
      }
      return false;
    };
  });

  subscribe = vi.fn(
    (selectorOrListener: unknown, listener?: unknown, optionsArg?: unknown) => {
      if (typeof listener === "function") {
        const selector = selectorOrListener as (
          currentState: FakeCameraManagerState,
        ) => unknown;
        const typedOptions = (optionsArg ?? {}) as {
          equalityFn?: (a: unknown, b: unknown) => boolean;
          fireImmediately?: boolean;
        };
        const entry: SelectorSubscription = {
          selector,
          listener: listener as (
            selectedState: unknown,
            previousSelectedState: unknown,
          ) => void,
          equalityFn: typedOptions.equalityFn ?? Object.is,
          previousSelectedState: selector(this.#state),
        };
        this.#selectorSubscriptions.add(entry);
        if (typedOptions.fireImmediately) {
          entry.listener(
            entry.previousSelectedState,
            entry.previousSelectedState,
          );
        }
        return () => {
          this.#selectorSubscriptions.delete(entry);
        };
      }

      const rootListener = selectorOrListener as RootSubscription;
      this.#rootSubscriptions.add(rootListener);
      return () => {
        this.#rootSubscriptions.delete(rootListener);
      };
    },
  );

  emitState(patch: Partial<FakeCameraManagerState>) {
    const previousState = this.#state;
    this.#state = { ...this.#state, ...patch };

    this.#rootSubscriptions.forEach((listener) => {
      listener(this.#state, previousState);
    });

    this.#selectorSubscriptions.forEach((entry) => {
      const nextSelected = entry.selector(this.#state);
      if (!entry.equalityFn(nextSelected, entry.previousSelectedState)) {
        const previousSelected = entry.previousSelectedState;
        entry.previousSelectedState = nextSelected;
        entry.listener(nextSelected, previousSelected);
      }
    });
  }

  emitPlaybackState(playbackState: PlaybackState) {
    this.emitState({ playbackState });
  }

  async emitFrame(imageData: ImageData): Promise<ArrayBufferLike | void> {
    return this.#frameCaptureCallback?.(imageData);
  }

  getCurrentState() {
    return this.#state;
  }
}

