/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { BoundingBox } from "@microblink/biometrics-core";

const PERCENTAGE_MULTIPLIER = 100;
const FACE_SCALE_REFERENCE_HEIGHT = 0.45;
const FACE_SCALE_INFLUENCE = 0.15;
const FACE_SCALE_MIN = 0.92;
const FACE_SCALE_MAX = 1.08;

export type Size = { width: number; height: number };
export type RenderedVideoRect = Size & { offsetX: number; offsetY: number };
export type FaceAnchor = {
  left: string;
  top: string;
  scale: number;
  renderedFaceWidth: number;
};

export function renderedRect(container: Size, frameWidth: number, frameHeight: number): RenderedVideoRect {
  if (container.width <= 0 || container.height <= 0 || frameWidth <= 0 || frameHeight <= 0) {
    return { width: 0, height: 0, offsetX: 0, offsetY: 0 };
  }

  const containerAspect = container.width / container.height;
  const frameAspect = frameWidth / frameHeight;

  if (frameAspect > containerAspect) {
    const height = container.width / frameAspect;

    return {
      width: container.width,
      height,
      offsetX: 0,
      offsetY: (container.height - height) / 2,
    };
  }

  const width = container.height * frameAspect;

  return {
    width,
    height: container.height,
    offsetX: (container.width - width) / 2,
    offsetY: 0,
  };
}

export function pointToPercent(
  x: number,
  y: number,
  container: Size,
  rect: RenderedVideoRect,
  mirrorX: boolean,
): { left: string; top: string } {
  if (container.width <= 0 || container.height <= 0) {
    return { left: "0%", top: "0%" };
  }

  const normalizedX = mirrorX ? 1 - x : x;
  const px = rect.offsetX + normalizedX * rect.width;
  const py = rect.offsetY + y * rect.height;

  return {
    left: `${(px / container.width) * PERCENTAGE_MULTIPLIER}%`,
    top: `${(py / container.height) * PERCENTAGE_MULTIPLIER}%`,
  };
}

export function boxToPercent(
  box: BoundingBox,
  container: Size,
  rect: RenderedVideoRect,
  mirrorX: boolean,
): { left: string; top: string; width: string; height: string } {
  if (container.width <= 0 || container.height <= 0) {
    return { left: "0%", top: "0%", width: "0%", height: "0%" };
  }

  const normalizedX = mirrorX ? 1 - box.x - box.width : box.x;
  const left = rect.offsetX + normalizedX * rect.width;
  const top = rect.offsetY + box.y * rect.height;
  const width = box.width * rect.width;
  const height = box.height * rect.height;

  return {
    left: `${(left / container.width) * PERCENTAGE_MULTIPLIER}%`,
    top: `${(top / container.height) * PERCENTAGE_MULTIPLIER}%`,
    width: `${(width / container.width) * PERCENTAGE_MULTIPLIER}%`,
    height: `${(height / container.height) * PERCENTAGE_MULTIPLIER}%`,
  };
}

export function faceAnchorPercent(
  faceBounds: BoundingBox | undefined,
  container: Size,
  frameWidth: number,
  frameHeight: number,
  mirrorX: boolean,
): FaceAnchor | undefined {
  if (!faceBounds || container.width <= 0 || container.height <= 0) {
    return undefined;
  }

  const rect = renderedRect(container, frameWidth, frameHeight);

  if (rect.width <= 0 || rect.height <= 0) {
    return undefined;
  }

  const centerX = faceBounds.x + faceBounds.width / 2;
  const centerY = faceBounds.y + faceBounds.height / 2;
  const position = pointToPercent(centerX, centerY, container, rect, mirrorX);

  const faceHeightFraction = (faceBounds.height * rect.height) / container.height;
  const sizeRatio = faceHeightFraction / FACE_SCALE_REFERENCE_HEIGHT;
  const scale = Math.min(FACE_SCALE_MAX, Math.max(FACE_SCALE_MIN, 1 + (sizeRatio - 1) * FACE_SCALE_INFLUENCE));

  return {
    ...position,
    scale,
    renderedFaceWidth: faceBounds.width * rect.width,
  };
}
