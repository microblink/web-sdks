/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

/** Face position thresholds for face analysis. */
export interface FacePositionThresholds {
  minEyeDistance?: number;
  maxEyeDistance?: number;
  closeToBorderMargin?: number;
  maxPitchUpAngle?: number;
  maxPitchDownAngle?: number;
  maxRollAngle?: number;
  maxYawAngle?: number;
}

/** Lighting thresholds for face analysis. */
export interface LightingThresholds {
  tooDarkThreshold?: number;
  tooBrightThreshold?: number;
}

/** Landmark stability thresholds for face analysis. */
export interface LandmarkStabilityThresholds {
  maxCaptures?: number;
  differenceThreshold?: number;
  sharpnessWeight?: number;
}

export type ResolvedFacePositionThresholds = Required<FacePositionThresholds>;
export type ResolvedLightingThresholds = Required<LightingThresholds>;
export type ResolvedLandmarkStabilityThresholds = Required<LandmarkStabilityThresholds>;

/** Settings for creating a face analysis session. */
export interface FaceAnalysisSessionSettings {
  maximumInputLongEdge?: number;
  maximumInputShortEdge?: number;
  facePositionThresholds?: FacePositionThresholds;
  lightingThresholds?: LightingThresholds;
  landmarkStabilityThresholds?: LandmarkStabilityThresholds;
  /** Number of liveness frames returned by the engine. Must be an integer from 1 to 12. */
  livenessFramesCount?: number;
}

export interface ResolvedFaceAnalysisSessionSettings {
  maximumInputLongEdge: number;
  maximumInputShortEdge: number;
  facePositionThresholds: ResolvedFacePositionThresholds;
  lightingThresholds: ResolvedLightingThresholds;
  landmarkStabilityThresholds: ResolvedLandmarkStabilityThresholds;
  livenessFramesCount: number;
}

export const defaultFaceAnalysisSessionSettings: ResolvedFaceAnalysisSessionSettings = {
  maximumInputLongEdge: 1920,
  maximumInputShortEdge: 1080,
  facePositionThresholds: {
    minEyeDistance: 0.2,
    maxEyeDistance: 0.35,
    closeToBorderMargin: 0.04,
    maxPitchUpAngle: 28,
    maxPitchDownAngle: 35,
    maxRollAngle: 15,
    maxYawAngle: 30,
  },
  lightingThresholds: {
    tooDarkThreshold: 0.99,
    tooBrightThreshold: 0.99,
  },
  landmarkStabilityThresholds: {
    maxCaptures: 4,
    differenceThreshold: 0.13,
    sharpnessWeight: 0,
  },
  livenessFramesCount: 1,
};

const MAXIMUM_INPUT_EDGE = 65_535;
const MAXIMUM_LIVENESS_FRAMES_COUNT = 12;

function withDefaults<T extends object>(defaults: T, overrides: Partial<T> = {}): T {
  const definedOverrides = Object.fromEntries(Object.entries(overrides).filter(([, value]) => value !== undefined));
  return { ...defaults, ...definedOverrides };
}

function assertIntegerInRange(name: string, value: number, min: number, max: number) {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new TypeError(`${name} must be an integer from ${min} to ${max}.`);
  }
}

/** Merges optional overrides into base session settings, which default to {@link defaultFaceAnalysisSessionSettings}. */
export function resolveFaceAnalysisSessionSettings(
  settings: FaceAnalysisSessionSettings = {},
  base: ResolvedFaceAnalysisSessionSettings = defaultFaceAnalysisSessionSettings,
): ResolvedFaceAnalysisSessionSettings {
  if ((settings.maximumInputLongEdge === undefined) !== (settings.maximumInputShortEdge === undefined)) {
    throw new TypeError("maximumInputLongEdge and maximumInputShortEdge must be supplied together.");
  }

  const resolved: ResolvedFaceAnalysisSessionSettings = {
    maximumInputLongEdge: settings.maximumInputLongEdge ?? base.maximumInputLongEdge,
    maximumInputShortEdge: settings.maximumInputShortEdge ?? base.maximumInputShortEdge,
    facePositionThresholds: withDefaults(base.facePositionThresholds, settings.facePositionThresholds),
    lightingThresholds: withDefaults(base.lightingThresholds, settings.lightingThresholds),
    landmarkStabilityThresholds: withDefaults(base.landmarkStabilityThresholds, settings.landmarkStabilityThresholds),
    livenessFramesCount: settings.livenessFramesCount ?? base.livenessFramesCount,
  };

  assertIntegerInRange("maximumInputLongEdge", resolved.maximumInputLongEdge, 1, MAXIMUM_INPUT_EDGE);
  assertIntegerInRange("maximumInputShortEdge", resolved.maximumInputShortEdge, 1, MAXIMUM_INPUT_EDGE);
  assertIntegerInRange("livenessFramesCount", resolved.livenessFramesCount, 1, MAXIMUM_LIVENESS_FRAMES_COUNT);

  if (resolved.maximumInputLongEdge < resolved.maximumInputShortEdge) {
    throw new TypeError("maximumInputLongEdge must be greater than or equal to maximumInputShortEdge.");
  }

  return resolved;
}
