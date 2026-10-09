/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { getDeviceInfo, type Consent, type RemoteScanningSession } from "@microblink/blinkid-verify-core";
import { CameraManager } from "@microblink/camera-manager/core";

import { BlinkIdVerifyUiStateKey } from "./blinkid-verify-ui-state";
import { BlinkIdVerifyConsentGate } from "./BlinkIdVerifyConsentGate";
import { BlinkIdVerifyUxManager } from "./BlinkIdVerifyUxManager";

export type NoConsentUI = { consentMode: "NoConsentUI" };
/** Consent values used to render the SDK consent UI. */
export type ConsentUiInput = Pick<Consent, "userId" | "durationDays" | "customerContext">;
export type RequireConsent = {
  consentMode: "RequireConsent";
  /** Values used to render the consent UI and generate the accepted consent object. */
  consent: ConsentUiInput;
};
export type ProvideExternalConsent = { consentMode: "ProvideExternalConsent"; consent: Consent };
export type BlinkIdVerifyConsentUxConfiguration = NoConsentUI | RequireConsent | ProvideExternalConsent;

export type BlinkIdVerifyUxManagerOptions = {
  /** Initial UI state key used by the manager/stabilizer reset flow. Defaults to `INTRO_FRONT_PAGE`. */
  initialUiStateKey?: BlinkIdVerifyUiStateKey;

  consentUxConfig: BlinkIdVerifyConsentUxConfiguration;
};

type ManagerOptionsWithoutRequireConsent = Partial<Omit<BlinkIdVerifyUxManagerOptions, "consentUxConfig">> & {
  consentUxConfig?: NoConsentUI | ProvideExternalConsent;
};

type ManagerOptionsWithRequireConsent = Partial<Omit<BlinkIdVerifyUxManagerOptions, "consentUxConfig">> & {
  consentUxConfig: RequireConsent;
};

/**
 * Creates a BlinkID Verify UX manager, or a consent gate when scanning must wait for consent.
 *
 * @param cameraManager - The camera manager.
 * @param scanningSession - The scanning session.
 * @param options - UX manager options. `RequireConsent` returns a {@link BlinkIdVerifyConsentGate}. Call
 *   `consentUiResponse` before using the manager. Omitting `consentUxConfig`, `NoConsentUI`, and
 *   `ProvideExternalConsent` return a {@link BlinkIdVerifyUxManager} directly. `ProvideExternalConsent` stores its
 *   consent object before the frame callback is registered.
 * @returns The UX manager, or a consent gate when `consentMode` is `RequireConsent`.
 */
export async function createBlinkIdVerifyUxManager(
  cameraManager: CameraManager,
  scanningSession: RemoteScanningSession,
  options: ManagerOptionsWithRequireConsent,
): Promise<BlinkIdVerifyConsentGate>;

export async function createBlinkIdVerifyUxManager(
  cameraManager: CameraManager,
  scanningSession: RemoteScanningSession,
  options?: ManagerOptionsWithoutRequireConsent,
): Promise<BlinkIdVerifyUxManager>;

export async function createBlinkIdVerifyUxManager(
  cameraManager: CameraManager,
  scanningSession: RemoteScanningSession,
  options?: Partial<BlinkIdVerifyUxManagerOptions>,
): Promise<BlinkIdVerifyUxManager | BlinkIdVerifyConsentGate>;

export async function createBlinkIdVerifyUxManager(
  cameraManager: CameraManager,
  scanningSession: RemoteScanningSession,
  options: Partial<BlinkIdVerifyUxManagerOptions> = {},
): Promise<BlinkIdVerifyUxManager | BlinkIdVerifyConsentGate> {
  try {
    const resolvedOptions: BlinkIdVerifyUxManagerOptions = {
      ...options,
      consentUxConfig: options.consentUxConfig ?? { consentMode: "NoConsentUI" },
    };
    const [sessionSettings, showDemoOverlay, showProductionOverlay, deviceInfo] = await Promise.all([
      scanningSession.getSettings(),
      scanningSession.showDemoOverlay(),
      scanningSession.showProductionOverlay(),
      getDeviceInfo(),
    ]);

    const manager = new BlinkIdVerifyUxManager(
      cameraManager,
      scanningSession,
      resolvedOptions,
      sessionSettings,
      showDemoOverlay,
      showProductionOverlay,
      deviceInfo,
    );

    if (resolvedOptions.consentUxConfig.consentMode === "RequireConsent") {
      return new BlinkIdVerifyConsentGate(manager, resolvedOptions.consentUxConfig.consent);
    }

    return manager;
  } catch (error) {
    try {
      await scanningSession.ping({
        schemaName: "ping.error",
        schemaVersion: "1.0.0",
        data: {
          errorType: "Crash",
          errorMessage: `ux.createBlinkIdVerifyUxManager: ${error instanceof Error ? error.message : String(error)}`,
          stackTrace: error instanceof Error ? error.stack : undefined,
        },
      });
    } catch (pingError) {
      console.warn("Failed to report error pinglet:", pingError);
      throw error;
    }

    try {
      await scanningSession.sendPinglets();
    } catch (sendError) {
      console.warn("Failed to flush error pinglets:", sendError);
    }

    throw error;
  }
}
