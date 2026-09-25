/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { BoundingBox, UnifiedFeedback } from "@microblink/biometrics-core";
import type { FaceLandmarks } from "@microblink/biometrics-core";
import { createMemo, createSignal, createUniqueId, For, onCleanup, onMount, Show } from "solid-js";

import SuccessMark from "./assets/success-mark.svg?component-solid";
import {
  boxToPercent,
  faceAnchorPercent,
  pointToPercent,
  renderedRect,
  type FaceAnchor,
  type Size,
} from "./videoContainProjection";

const PERCENTAGE_MULTIPLIER = 100;
const MIN_LANDMARK_PX = 4;
const MAX_LANDMARK_PX = 14;
const LANDMARK_RATIO = 0.03;
const SUCCESS_OFFSET_FACE_WIDTH_RATIO = 0.07;

const FACE_CLIP_PATH = "M0.5,0 C0.8,0 1,0.2 1,0.42 C1,0.7 0.78,1 0.5,1 " + "C0.22,1 0,0.7 0,0.42 C0,0.2 0.2,0 0.5,0 Z";

export type UiFeedbackOverlayProps = {
  landmarks?: FaceLandmarks;
  boundingBox?: BoundingBox;
  faceBounds?: BoundingBox;
  feedback: UnifiedFeedback;
  frameWidth: number;
  frameHeight: number;
  mirrorX: boolean;
  landmarksVisible: boolean;
  showProgress: boolean;
  captureProgress: number;
  showSuccess: boolean;
};

function FaceScan(props: { progress: number; anchor?: FaceAnchor }) {
  const clipId = `mb-bio-face-clip-${createUniqueId()}`;
  const progressPercent = createMemo(() => {
    const clampedProgress = Math.min(Math.max(props.progress, 0), 1);

    return clampedProgress * PERCENTAGE_MULTIPLIER;
  });

  return (
    <div class="mb-bio-scan" aria-hidden="true">
      <svg class="mb-bio-scan-defs" width="0" height="0" aria-hidden="true">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={FACE_CLIP_PATH} />
          </clipPath>
        </defs>
      </svg>
      <div
        class="mb-bio-scan-oval"
        style={{
          "clip-path": `url(#${clipId})`,
          ...(props.anchor
            ? {
                left: props.anchor.left,
                top: props.anchor.top,
                transform: `translate(-50%, -50%) scale(${props.anchor.scale})`,
              }
            : {}),
        }}
      >
        <div class="mb-bio-scan-trail" style={{ height: `${progressPercent()}%` }} />
        <div class="mb-bio-scan-line" style={{ top: `${progressPercent()}%` }} />
      </div>
    </div>
  );
}

function SuccessAnimation(props: { anchor?: FaceAnchor }) {
  const [isVisible, setIsVisible] = createSignal(false);

  onMount(() => {
    setIsVisible(true);
  });

  return (
    <div
      class="mb-bio-success-animation"
      classList={{
        "mb-bio-success-animation-visible": isVisible(),
      }}
      style={
        props.anchor
          ? {
              left: props.anchor.left,
              top: `calc(${props.anchor.top} - ${props.anchor.renderedFaceWidth * SUCCESS_OFFSET_FACE_WIDTH_RATIO}px)`,
              transform: `translate(-50%, -50%) scale(${props.anchor.scale})`,
            }
          : undefined
      }
    >
      <SuccessMark class="mb-bio-success-mark" aria-hidden="true" />
    </div>
  );
}

function LandmarkOverlay(props: {
  landmarks?: FaceLandmarks;
  boundingBox?: BoundingBox;
  feedback: UnifiedFeedback;
  frameWidth: number;
  frameHeight: number;
  mirrorX: boolean;
  visible: boolean;
  containerSize: Size;
}) {
  const rect = createMemo(() => renderedRect(props.containerSize, props.frameWidth, props.frameHeight));

  const landmarks = createMemo(() => {
    if (!props.landmarks) {
      return [] as { type: string; left: string; top: string }[];
    }

    return Object.entries(props.landmarks).map(([type, point]) => ({
      type,
      ...pointToPercent(point.x, point.y, props.containerSize, rect(), props.mirrorX),
    }));
  });

  const box = createMemo(() => {
    if (!props.boundingBox) {
      return undefined;
    }

    return boxToPercent(props.boundingBox, props.containerSize, rect(), props.mirrorX);
  });

  const landmarkPx = createMemo(() => {
    if (!props.boundingBox) {
      return MIN_LANDMARK_PX;
    }

    const videoRect = rect();

    if (videoRect.width <= 0 || videoRect.height <= 0) {
      return MIN_LANDMARK_PX;
    }

    const base =
      Math.min(props.boundingBox.width * videoRect.width, props.boundingBox.height * videoRect.height) * LANDMARK_RATIO;

    return Math.min(MAX_LANDMARK_PX, Math.max(MIN_LANDMARK_PX, base));
  });

  return (
    <div class="mb-bio-landmarks" aria-hidden="true">
      <Show when={props.visible}>
        <Show when={box()}>
          {(styles) => (
            <div
              class="mb-bio-landmark-box"
              classList={{
                "mb-bio-landmark-box-ok": props.feedback === "OK",
                "mb-bio-landmark-box-error": props.feedback !== "OK",
              }}
              style={{
                left: styles().left,
                top: styles().top,
                width: styles().width,
                height: styles().height,
              }}
            />
          )}
        </Show>
        <For each={landmarks()}>
          {(point) => (
            <div
              class="mb-bio-landmark-point"
              style={{
                left: point.left,
                top: point.top,
                width: `${landmarkPx()}px`,
                height: `${landmarkPx()}px`,
              }}
              title={point.type}
            />
          )}
        </For>
      </Show>
    </div>
  );
}

export function UiFeedbackOverlay(props: UiFeedbackOverlayProps) {
  const [containerSize, setContainerSize] = createSignal<Size>({
    width: 0,
    height: 0,
  });

  let containerElement: HTMLDivElement | undefined;

  onMount(() => {
    const update = (): void => {
      const bounds = containerElement?.getBoundingClientRect();

      if (!bounds) {
        return;
      }

      setContainerSize({ width: bounds.width, height: bounds.height });
    };

    update();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(update);

    if (containerElement) {
      observer.observe(containerElement);
    }

    onCleanup(() => observer.disconnect());
  });

  const faceAnchor = createMemo(() =>
    faceAnchorPercent(props.faceBounds, containerSize(), props.frameWidth, props.frameHeight, props.mirrorX),
  );

  return (
    <div ref={(el) => (containerElement = el)} class="mb-bio-feedback-overlay" aria-hidden="true">
      <LandmarkOverlay
        visible={props.landmarksVisible}
        landmarks={props.landmarks}
        boundingBox={props.boundingBox}
        feedback={props.feedback}
        frameWidth={props.frameWidth}
        frameHeight={props.frameHeight}
        mirrorX={props.mirrorX}
        containerSize={containerSize()}
      />

      <Show when={props.showProgress}>
        <FaceScan progress={props.captureProgress} anchor={faceAnchor()} />
      </Show>

      <Show when={props.showSuccess}>
        <SuccessAnimation anchor={faceAnchor()} />
      </Show>
    </div>
  );
}
