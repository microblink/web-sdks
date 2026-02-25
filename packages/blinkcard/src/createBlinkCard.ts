/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import {
  loadBlinkCardCore,
  type BlinkCardCore,
  type BlinkCardInitSettings,
  type BlinkCardSessionSettingsInput,
} from "@microblink/blinkcard-core";
import {
  createBlinkCardFeedbackUi,
  createBlinkCardUxManager,
  FeedbackUiOptions,
} from "@microblink/blinkcard-ux-manager";
import {
  CameraManager,
  CameraManagerComponent,
  CameraManagerUiOptions,
  createCameraManagerUi,
} from "@microblink/camera-manager";
import { Simplify } from "type-fest";

/**
 * Configuration options for creating a BlinkCard component.
 *
 * This type combines options with core initialization and session settings.
 * It allows customization of the UI elements, localization, and scanning behavior.
 */
export type BlinkCardComponentOptions = Simplify<
  {
    /**
     * The HTML element where the BlinkCard UI will be mounted.
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
  } & BlinkCardInitSettings &
    Partial<Omit<BlinkCardSessionSettingsInput, "inputImageSource">>
>;

/**
 * The BlinkCard UX Manager type.
 */
export type BlinkCardUxManagerType = Awaited<
  ReturnType<typeof createBlinkCardUxManager>
>;

/**
 * Represents the BlinkCard component with all SDK instances and UI elements.
 * @public
 */
export type BlinkCardComponent = {
  /** The BlinkCard Core SDK instance. */
  blinkCardCore: BlinkCardCore;
  /** The Camera Manager instance. */
  cameraManager: CameraManager;
  /** The BlinkCard UX Manager instance. */
  blinkCardUxManager: BlinkCardUxManagerType;
  /** The Camera Manager UI instance. */
  cameraUi: CameraManagerComponent;
  /**
   * Destroys the BlinkCard component and releases all resources.
   */
  destroy: () => Promise<void>;
  /**
   * Adds a callback function to be called when a result is obtained.
   */
  addOnResultCallback: BlinkCardUxManagerType["addOnResultCallback"];
  /**
   * Adds a callback function to be called when an error occurs.
   */
  addOnErrorCallback: BlinkCardUxManagerType["addOnErrorCallback"];
};

/**
 * Creates a BlinkCard component with all necessary SDK instances and UI elements.
 *
 * This function initializes the complete BlinkCard scanning system including:
 * - BlinkCard Core SDK for document processing
 * - Camera Manager for video capture and camera control
 * - UX Manager for coordinating scanning workflow
 * - Camera UI for video display and camera controls
 * - Feedback UI for scanning guidance and status
 *
 * The function sets up the entire scanning pipeline and returns a component
 * object that provides access to all SDK instances and destruction capabilities.
 *
 * @param options - Configuration options for the BlinkCard component
 * @returns Promise that resolves to a BlinkCardComponent with all SDK instances and UI elements
 *
 * @example
 * ```typescript
 * const blinkCard = await createBlinkCard({
 *   licenseKey: "your-license-key",
 *   targetNode: document.getElementById("blinkcard-container"),
 *   feedbackUiOptions: {
 *     showOnboardingGuide: false
 *   }
 * });
 *
 * // Add result callback
 * blinkCard.addOnResultCallback((result) => {
 *   console.log("Scanning result:", result);
 * });
 *
 * // Clean up when done
 * await blinkCard.destroy();
 * ```
 */
export const createBlinkCard = async ({
  licenseKey,
  microblinkProxyUrl,
  targetNode,
  cameraManagerUiOptions,
  initialMemory,
  resourcesLocation,
  scanningSettings,
  wasmVariant,
  feedbackUiOptions,
}: BlinkCardComponentOptions) => {
  // we first initialize the direct API. This loads the WASM module and initializes the engine
  const blinkCardCore = await loadBlinkCardCore({
    licenseKey,
    microblinkProxyUrl,
    initialMemory,
    resourcesLocation,
    wasmVariant,
  });

  const scanningSession = await blinkCardCore.createScanningSession({
    scanningSettings,
  });

  // we create the camera manager
  const cameraManager = new CameraManager();

  // we create the UX manager
  const blinkCardUxManager = await createBlinkCardUxManager(
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
        createBlinkCardFeedbackUi(
          blinkCardUxManager,
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

  const destroy = async () => {
    cameraUi.dismount();
    try {
      await blinkCardCore.terminate();
    } catch (error) {
      console.warn(error);
    }
  };

  const returnObject: BlinkCardComponent = {
    blinkCardCore,
    cameraManager,
    blinkCardUxManager,
    cameraUi,
    destroy,
    addOnErrorCallback:
      blinkCardUxManager.addOnErrorCallback.bind(blinkCardUxManager),
    addOnResultCallback:
      blinkCardUxManager.addOnResultCallback.bind(blinkCardUxManager),
  };

  return returnObject;
};
