/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

export const getResolutionFromConstraints = (
  constraints: MediaStreamConstraints,
): { width: number; height: number } => {
  if (
    typeof constraints.video === "object" &&
    constraints.video.width &&
    constraints.video.height
  ) {
    return {
      width:
        typeof constraints.video.width === "number"
          ? constraints.video.width
          : (constraints.video.width.ideal ?? 1920),
      height:
        typeof constraints.video.height === "number"
          ? constraints.video.height
          : (constraints.video.height.ideal ?? 1080),
    };
  }
  return { width: 1920, height: 1080 };
};
