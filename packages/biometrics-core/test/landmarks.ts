/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { FaceLandmarks } from "@microblink/biometrics-common";

const DEFAULT_LANDMARKS: FaceLandmarks = {
  LeftEye: { x: 0.4, y: 0.4 },
  RightEye: { x: 0.6, y: 0.4 },
  NoseTip: { x: 0.5, y: 0.52 },
  Mouth: { x: 0.5, y: 0.66 },
  LeftEar: { x: 0.25, y: 0.42 },
  RightEar: { x: 0.75, y: 0.42 },
};

export function createLandmarks(): FaceLandmarks;

export function createLandmarks(offsetX: number, offsetY?: number): FaceLandmarks;

export function createLandmarks(overrides: Partial<FaceLandmarks>): FaceLandmarks;

export function createLandmarks(firstArg?: number | Partial<FaceLandmarks>, secondArg = 0): FaceLandmarks {
  const offsetX = typeof firstArg === "number" ? firstArg : 0;
  const offsetY = typeof firstArg === "number" ? secondArg : 0;
  const overrides = typeof firstArg === "number" || !firstArg ? undefined : firstArg;

  const offsetLandmarks: FaceLandmarks = {
    LeftEye: {
      x: DEFAULT_LANDMARKS.LeftEye.x + offsetX,
      y: DEFAULT_LANDMARKS.LeftEye.y + offsetY,
    },
    RightEye: {
      x: DEFAULT_LANDMARKS.RightEye.x + offsetX,
      y: DEFAULT_LANDMARKS.RightEye.y + offsetY,
    },
    NoseTip: {
      x: DEFAULT_LANDMARKS.NoseTip.x + offsetX,
      y: DEFAULT_LANDMARKS.NoseTip.y + offsetY,
    },
    Mouth: {
      x: DEFAULT_LANDMARKS.Mouth.x + offsetX,
      y: DEFAULT_LANDMARKS.Mouth.y + offsetY,
    },
    LeftEar: {
      x: DEFAULT_LANDMARKS.LeftEar.x + offsetX,
      y: DEFAULT_LANDMARKS.LeftEar.y + offsetY,
    },
    RightEar: {
      x: DEFAULT_LANDMARKS.RightEar.x + offsetX,
      y: DEFAULT_LANDMARKS.RightEar.y + offsetY,
    },
  };

  return {
    ...offsetLandmarks,
    ...overrides,
  };
}
