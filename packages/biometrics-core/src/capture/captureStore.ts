/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { BiometricsError } from "@microblink/biometrics-common";
import { subscribeWithSelector } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

import type { UnifiedFeedback } from "../analyzer/feedback";
import type { CaptureSessionState } from "../session/session";
import type { CaptureAnalysisResult } from "./captureTypes";

/** Reactive session state exposed by `BiometricsCaptureSession.getState()`. */
export type CaptureStore = {
  sessionState: CaptureSessionState;
  feedback: UnifiedFeedback;
  analysisResult?: CaptureAnalysisResult;
  error?: BiometricsError;
};

export const getInitialCaptureStoreState = (): CaptureStore => ({
  sessionState: "IDLE",
  feedback: "FACE_NOT_FOUND",
  analysisResult: undefined,
  error: undefined,
});

export const createCaptureStore = () => createStore<CaptureStore>()(subscribeWithSelector(getInitialCaptureStoreState));
