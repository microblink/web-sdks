/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import {
  loadBlinkIdVerifyCore,
  type BlinkIdVerifyCore,
  type BlinkIdVerifyInitSettings,
  type BlinkIdVerifySessionSettings,
  type RemoteScanningSession,
} from "@microblink/blinkid-verify-core";
import {
  BlinkIdVerifyConsentGate,
  type BlinkIdVerifyUxManager,
  type BlinkIdVerifyUxManagerOptions,
  createBlinkIdVerifyUxManager,
} from "@microblink/blinkid-verify-ux-manager/core";
import { createBlinkIdVerifyFeedbackUi, type FeedbackUiOptions } from "@microblink/blinkid-verify-ux-manager/ui";
import { CameraManager } from "@microblink/camera-manager/core";
import {
  type CameraManagerComponent,
  type CameraManagerUiOptions,
  createCameraManagerUi,
} from "@microblink/camera-manager/ui";
import { Simplify } from "type-fest";

/**
 * Configuration options for creating a BlinkIdVerify component.
 *
 * This type combines options with core initialization and session settings. It allows customization of the UI elements,
 * localization, and scanning behavior.
 */
export type BlinkIdVerifyComponentOptions = Simplify<
  {
    /**
     * The HTML element where the BlinkIdVerify UI will be mounted. If not provided, the UI will be mounted to the
     * document body.
     */
    targetNode?: HTMLElement;

    /**
     * Customization options for the camera manager UI. Controls camera-related UI elements like the video feed
     * container and camera selection.
     */
    cameraManagerUiOptions?: Partial<CameraManagerUiOptions>;

    /** Customization options for the feedback UI. Controls the appearance and behavior of scanning feedback elements. */
    feedbackUiOptions?: Partial<FeedbackUiOptions>;

    /**
     * Customization options for BlinkIdVerify UX manager behavior. Controls consent gating and other headless UX flow
     * details.
     */
    uxManagerOptions?: Partial<BlinkIdVerifyUxManagerOptions>;

    /**
     * Base URL for Verify API requests.
     *
     * Omitted means the page origin. The SDK POSTs to `{resolved}/api/v3/verify` and sends no API key. The customer's
     * server adds Authorization.
     */
    verifyApiBaseUrl?: string;
  } & Omit<BlinkIdVerifyInitSettings, "verifyApiBaseUrl"> &
    Partial<Omit<BlinkIdVerifySessionSettings, "inputImageSource">>
>;

/**
 * BlinkID Verify component.
 *
 * Sessions always expose `submitResult` and `prepareVerifyRequest`. Capture callbacks receive the full resolver,
 * including `verifyCaptureResult`, and {@link BlinkIdVerifyComponent.verifyOnScanningCompletion} is always available.
 *
 * @public
 */
export type BlinkIdVerifyComponent = {
  /** Core initialized with Verify API submit. Its sessions can prepare and submit a Verify API request. */
  blinkIdVerifyCore: BlinkIdVerifyCore;
  /** The Camera Manager instance. */
  cameraManager: CameraManager;
  /** The BlinkIdVerify UX Manager instance. */
  blinkIdVerifyUxManager: BlinkIdVerifyUxManager;
  /** The Camera Manager UI instance. */
  cameraUi: CameraManagerComponent;
  /** Destroys the BlinkIdVerify component and releases all resources. */
  destroy: () => Promise<void>;
  /** Adds a callback function to be called when an error occurs. */
  addOnErrorCallback: BlinkIdVerifyUxManager["addOnErrorCallback"];
  /** Adds a callback function to be called on each processed frame. */
  addOnFrameProcessCallback: BlinkIdVerifyUxManager["addOnFrameProcessCallback"];
  /**
   * Adds a callback invoked after document capture with a lazy result resolver.
   *
   * The resolver includes `getCaptureResult` and `verifyCaptureResult`. Capture does not copy session results or submit
   * to the Verify API until a resolver method is called.
   */
  addOnCaptureCompletedCallback: BlinkIdVerifyUxManager["addOnCaptureCompletedCallback"];
  /**
   * Submits the captured session to the Verify API when scanning completes.
   *
   * Pass `{ onSuccess, onError }`. API failures are delivered to `onError` with the capture resolver.
   */
  verifyOnScanningCompletion: BlinkIdVerifyUxManager["verifyOnScanningCompletion"];
};

/**
 * Thrown when `createBlinkIdVerify` is used with `RequireConsent` and the user declines the consent modal.
 *
 * The camera UI is dismounted and the SDK is terminated before this error is thrown.
 */
export class BlinkIdVerifyConsentDeclinedError extends Error {
  constructor() {
    super("BlinkID Verify consent was declined");
    this.name = "BlinkIdVerifyConsentDeclinedError";
  }
}

/**
 * Creates a BlinkIdVerify component with all necessary SDK instances and UI elements.
 *
 * This function initializes the complete BlinkIdVerify scanning system including:
 *
 * - BlinkIdVerify Core SDK for document processing
 * - Camera Manager for video capture and camera control
 * - UX Manager for coordinating scanning workflow
 * - Camera UI for video display and camera controls
 * - Feedback UI for scanning guidance and status
 *
 * The function sets up the entire scanning pipeline and returns a component object that provides access to all SDK
 * instances and destruction capabilities.
 *
 * @example
 *   ```typescript
 *   const blinkIdVerify = await createBlinkIdVerify({
 *     licenseKey: "your-license-key",
 *     targetNode: document.getElementById("blinkid-verify-container"),
 *     feedbackUiOptions: {
 *       showOnboardingGuide: false,
 *     },
 *   });
 *
 *   blinkIdVerify.addOnCaptureCompletedCallback(async (resolver) => {
 *     const result = await resolver.getCaptureResult();
 *     console.log("Typed payload:", result.typedPayload);
 *   });
 *
 *   blinkIdVerify.verifyOnScanningCompletion({
 *     onSuccess: (apiResult) => {
 *       console.log(apiResult);
 *     },
 *     onError: (error) => {
 *       console.error(error);
 *     },
 *   });
 *
 *   // Clean up when done
 *   await blinkIdVerify.destroy();
 *   ```;
 *
 * @param options - Configuration options for the BlinkIdVerify component
 * @returns Promise that resolves to a {@link BlinkIdVerifyComponent}
 */
export async function createBlinkIdVerify({
  licenseKey,
  microblinkProxyUrl,
  targetNode,
  cameraManagerUiOptions,
  initialMemory,
  resourcesLocation,
  configuration,
  traceId,
  wasmVariant,
  feedbackUiOptions,
  uxManagerOptions,
  verifyApiBaseUrl,
}: BlinkIdVerifyComponentOptions): Promise<BlinkIdVerifyComponent> {
  let blinkIdVerifyCore: BlinkIdVerifyCore | undefined;
  let scanningSession: RemoteScanningSession | undefined;
  let createdUx: BlinkIdVerifyUxManager | BlinkIdVerifyConsentGate | undefined;
  let activeManager: BlinkIdVerifyUxManager | undefined;
  try {
    // we first initialize the direct API. This loads the WASM module and initializes the engine
    blinkIdVerifyCore = await loadBlinkIdVerifyCore({
      licenseKey,
      microblinkProxyUrl,
      initialMemory,
      resourcesLocation,
      wasmVariant,
      verifyApiBaseUrl,
    });

    scanningSession = await blinkIdVerifyCore.createScanningSession({ configuration, traceId });

    // we create the camera manager
    const cameraManager = new CameraManager();

    createdUx = await createBlinkIdVerifyUxManager(cameraManager, scanningSession, uxManagerOptions);

    // this creates the UI and attaches it to the DOM
    const cameraUi = await createCameraManagerUi(cameraManager, targetNode, cameraManagerUiOptions);

    let blinkIdVerifyUxManager: BlinkIdVerifyUxManager;
    if (createdUx instanceof BlinkIdVerifyConsentGate) {
      const acceptedManager = await createdUx.consentUiResponse(cameraUi, feedbackUiOptions?.localizationStrings);
      if (!acceptedManager) {
        await blinkIdVerifyCore.terminate();
        throw new BlinkIdVerifyConsentDeclinedError();
      }
      blinkIdVerifyUxManager = acceptedManager;
    } else {
      blinkIdVerifyUxManager = createdUx;
    }
    activeManager = blinkIdVerifyUxManager;

    const unsub = cameraManager.subscribe(
      (s) => s.playbackState,
      (state) => {
        if (state === "playback") {
          // this creates the feedback UI and attaches it to the camera UI
          createBlinkIdVerifyFeedbackUi(blinkIdVerifyUxManager, cameraUi, feedbackUiOptions ?? {});

          if (feedbackUiOptions?.showOnboardingGuide === false) {
            void cameraManager.startFrameCapture();
          }

          unsub(); // unsubscribe from the playback state
        }
      },
    );

    if (!blinkIdVerifyCore) {
      throw new Error("BlinkID Verify core not initialized");
    }

    const loadedBlinkIdVerifyCore = blinkIdVerifyCore;

    const destroy = async () => {
      cameraUi.dismount();
      try {
        await loadedBlinkIdVerifyCore.terminate();
      } catch (error) {
        console.warn(error);
      }
    };

    const component: BlinkIdVerifyComponent = {
      blinkIdVerifyCore: loadedBlinkIdVerifyCore,
      cameraManager,
      blinkIdVerifyUxManager,
      cameraUi,
      destroy,
      addOnErrorCallback: blinkIdVerifyUxManager.addOnErrorCallback.bind(blinkIdVerifyUxManager),
      addOnFrameProcessCallback: blinkIdVerifyUxManager.addOnFrameProcessCallback.bind(blinkIdVerifyUxManager),
      addOnCaptureCompletedCallback: blinkIdVerifyUxManager.addOnCaptureCompletedCallback.bind(blinkIdVerifyUxManager),
      verifyOnScanningCompletion: blinkIdVerifyUxManager.verifyOnScanningCompletion.bind(blinkIdVerifyUxManager),
    };

    void cameraManager.startCameraStream().catch((error: unknown) => {
      console.warn(error);
    });

    return component;
  } catch (error) {
    if (error instanceof BlinkIdVerifyConsentDeclinedError) {
      throw error;
    }

    if (activeManager) {
      activeManager.destroy();
    } else {
      createdUx?.destroy();
    }

    if (blinkIdVerifyCore) {
      const data = {
        errorType: "Crash" as const,
        errorMessage: "sdk.createBlinkIdVerify: " + (error instanceof Error ? error.message : String(error)),
        stackTrace: error instanceof Error ? error.stack : undefined,
      };

      try {
        await blinkIdVerifyCore.reportPinglet({
          schemaName: "ping.error",
          schemaVersion: "1.0.0",
          sessionNumber: 0,
          data,
        });
        await blinkIdVerifyCore.sendPinglets();
      } catch (reportError) {
        console.warn("Failed to report BlinkID Verify SDK crash pinglet:", reportError);
      }
    }

    throw error;
  }
}
