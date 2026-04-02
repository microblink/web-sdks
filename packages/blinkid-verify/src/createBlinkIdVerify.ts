/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import {
  loadBlinkIdVerifyCore,
  type BlinkIdVerifyInitSettings,
  type BlinkIdVerifySessionSettings,
  type BlinkIdVerifyCore,
} from "@microblink/blinkid-verify-core";
import {
  createBlinkIdVerifyFeedbackUi,
  type FeedbackUiOptions,
  type LocalizationStrings,
  BlinkIdVerifyUxManager,
  createBlinkIdVerifyUxManager,
} from "@microblink/blinkid-verify-ux-manager";
import {
  CameraManager,
  type CameraManagerComponent,
  type CameraManagerUiOptions,
  createCameraManagerUi,
} from "@microblink/camera-manager";
import { Simplify } from "type-fest";

/**
 * Configuration options for creating a BlinkIdVerify component.
 *
 * This type combines options with core initialization and session settings.
 * It allows customization of the UI elements, localization, and scanning behavior.
 */
export type BlinkIdVerifyComponentOptions = Simplify<
  {
    /**
     * The HTML element where the BlinkIdVerify UI will be mounted.
     * If not provided, the UI will be mounted to the document body.
     */
    targetNode?: HTMLElement;

    /**
     * Customization options for the camera manager UI.
     * Controls camera-related UI elements like the video feed container and camera selection.
     */
    cameraManagerUiOptions?: Partial<CameraManagerUiOptions>;

    /**
     * Customization options for the feedback UI.
     * Controls the appearance and behavior of scanning feedback elements.
     */
    feedbackUiOptions?: Partial<FeedbackUiOptions>;
  } & BlinkIdVerifyInitSettings &
    Partial<Omit<BlinkIdVerifySessionSettings, "inputImageSource">>
>;

/**
 * Represents the BlinkIdVerify component with all SDK instances and UI elements.
 * @public
 */
export type BlinkIdVerifyComponent = {
  /** The BlinkIdVerify Core SDK instance. */
  blinkIdVerifyCore: BlinkIdVerifyCore;
  /** The Camera Manager instance. */
  cameraManager: CameraManager;
  /** The BlinkIdVerify UX Manager instance. */
  blinkIdVerifyUxManager: BlinkIdVerifyUxManager;
  /** The Camera Manager UI instance. */
  cameraUi: CameraManagerComponent;
  /**
   * Destroys the BlinkIdVerify component and releases all resources.
   */
  destroy: () => Promise<void>;
  /**
   * Adds a callback function to be called when a result is obtained.
   */
  addOnResultCallback: BlinkIdVerifyUxManager["addOnResultCallback"];
  /**
   * Adds a callback function to be called when an error occurs.
   */
  addOnErrorCallback: BlinkIdVerifyUxManager["addOnErrorCallback"];

  /**
   * Adds a callback function to be called on each processed frame.
   */
  addOnFrameProcessCallback: BlinkIdVerifyUxManager["addOnFrameProcessCallback"];
};

/**
 * Creates a BlinkIdVerify component with all necessary SDK instances and UI elements.
 *
 * This function initializes the complete BlinkIdVerify scanning system including:
 * - BlinkIdVerify Core SDK for document processing
 * - Camera Manager for video capture and camera control
 * - UX Manager for coordinating scanning workflow
 * - Camera UI for video display and camera controls
 * - Feedback UI for scanning guidance and status
 *
 * The function sets up the entire scanning pipeline and returns a component
 * object that provides access to all SDK instances and destruction capabilities.
 *
 * @param options - Configuration options for the BlinkIdVerify component
 * @returns Promise that resolves to a BlinkIdVerifyComponent with all SDK instances and UI elements
 *
 * @example
 * ```typescript
 * const blinkIdVerify = await createBlinkIdVerify({
 *   licenseKey: "your-license-key",
 *   targetNode: document.getElementById("blinkid-verify-container"),
 *   feedbackUiOptions: {
 *     showOnboardingGuide: false
 *   }
 * });
 *
 * // Add result callback
 * blinkIdVerify.addOnResultCallback((result) => {
 *   console.log("Scanning result:", result);
 * });
 *
 * // Clean up when done
 * await blinkIdVerify.destroy();
 * ```
 */
export const createBlinkIdVerify = async ({
  licenseKey,
  microblinkProxyUrl,
  targetNode,
  cameraManagerUiOptions,
  initialMemory,
  resourcesLocation,
  scanningSettings,
  wasmVariant,
  feedbackUiOptions,
}: BlinkIdVerifyComponentOptions): Promise<BlinkIdVerifyComponent> => {
  let blinkIdVerifyCore: BlinkIdVerifyCore | undefined;
  let scanningSession:
    | Awaited<ReturnType<BlinkIdVerifyCore["createScanningSession"]>>
    | undefined;
  try {
    // we first initialize the direct API. This loads the WASM module and initializes the engine
    blinkIdVerifyCore = await loadBlinkIdVerifyCore({
      licenseKey,
      microblinkProxyUrl,
      initialMemory,
      resourcesLocation,
      wasmVariant,
    });

    scanningSession = await blinkIdVerifyCore.createScanningSession({
      scanningSettings,
    });

    // we create the camera manager
    const cameraManager = new CameraManager();

    // we create the UX manager
    const blinkIdVerifyUxManager = await createBlinkIdVerifyUxManager(
      cameraManager,
      scanningSession,
    );

    // this creates the UI and attaches it to the DOM
    const cameraUi = await createCameraManagerUi(
      cameraManager,
      targetNode,
      cameraManagerUiOptions,
    );

    const unsub = cameraManager.subscribe(
      (s) => s.playbackState,
      (state) => {
        if (state === "playback") {
          // this creates the feedback UI and attaches it to the camera UI
          createBlinkIdVerifyFeedbackUi(
            blinkIdVerifyUxManager,
            cameraUi,
            feedbackUiOptions ?? {},
          );

          if (feedbackUiOptions?.showOnboardingGuide === false) {
            void cameraManager.startFrameCapture();
          }

          unsub(); // unsubscribe from the playback state
        }
      },
    );

    // selects the camera and starts the stream
    await cameraManager.startCameraStream();

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

    return {
      blinkIdVerifyCore,
      cameraManager,
      blinkIdVerifyUxManager,
      cameraUi,
      destroy,
      addOnErrorCallback: blinkIdVerifyUxManager.addOnErrorCallback.bind(
        blinkIdVerifyUxManager,
      ),
      addOnResultCallback: blinkIdVerifyUxManager.addOnResultCallback.bind(
        blinkIdVerifyUxManager,
      ),
      addOnFrameProcessCallback:
        blinkIdVerifyUxManager.addOnFrameProcessCallback.bind(
          blinkIdVerifyUxManager,
        ),
    };
  } catch (error) {
    if (blinkIdVerifyCore) {
      const data = {
        errorType: "Crash" as const,
        errorMessage:
          "sdk.createBlinkIdVerify: " +
          (error instanceof Error ? error.message : String(error)),
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
        console.warn(
          "Failed to report BlinkID Verify SDK crash pinglet:",
          reportError,
        );
      }
    }

    throw error;
  }
};
