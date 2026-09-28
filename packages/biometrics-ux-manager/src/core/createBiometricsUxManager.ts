/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { getDeviceInfo } from "@microblink/biometrics-core";
import type { BiometricsDiagnosticEvent, BiometricsError } from "@microblink/biometrics-core";
import type { CameraManager } from "@microblink/camera-manager/core";

import { BiometricsUxManager } from "./BiometricsUxManager";
import type { BiometricsUxManagerOptions, BiometricsUxSession, BiometricsUxSessionEvent } from "./types";

/*
  Creates a new Biometrics UX manager instance.
*/
export async function createBiometricsUxManager<
  Result,
  Event = BiometricsUxSessionEvent,
  SessionError = BiometricsError,
  DiagnosticEvent = BiometricsDiagnosticEvent,
  DialogKind extends string = never,
>(
  cameraManager: CameraManager,
  session: BiometricsUxSession<Result, Event, SessionError, DiagnosticEvent>,
  options?: BiometricsUxManagerOptions<Result, Event, SessionError, DiagnosticEvent, DialogKind>,
): Promise<BiometricsUxManager<Result, Event, SessionError, DiagnosticEvent, DialogKind>> {
  const deviceInfo = await getDeviceInfo();

  return new BiometricsUxManager(cameraManager, session, deviceInfo, options);
}
