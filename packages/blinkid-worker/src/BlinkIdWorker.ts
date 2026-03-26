/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { expose, finalizer, proxy, ProxyMarked, transfer } from "comlink";

import type {
  BlinkIdProcessResult,
  BlinkIdScanningResult,
  BlinkIdScanningSession,
  BlinkIdSessionError,
  BlinkIdSessionSettings,
  BlinkIdWasmModule,
  DocumentClassInfo,
  DocumentRotation,
  EmscriptenModuleFactory,
  WasmVariant,
} from "@microblink/blinkid-wasm";
import { OverrideProperties } from "type-fest";

import type { Ping } from "@microblink/analytics/ping";
import { detectWasmFeatures } from "@microblink/worker-common/wasm-feature-detect";

import sizeManifest from "@microblink/blinkid-wasm/size-manifest.json";
import { buildResourcePath } from "@microblink/worker-common/buildResourcePath";
import {
  downloadResourceBuffer,
  type DownloadProgress,
} from "@microblink/worker-common/downloadResourceBuffer";
import { getCrossOriginWorkerURL } from "@microblink/worker-common/getCrossOriginWorkerURL";
import { getWasmFileSize } from "@microblink/worker-common/getWasmFileSize";
import { isIOS } from "@microblink/worker-common/isSafari";
import { obtainNewServerPermission } from "@microblink/worker-common/licencing";
import { mbToWasmPages } from "@microblink/worker-common/mbToWasmPages";
import {
  SanitizedProxyUrls,
  sanitizeProxyUrls,
  validateLicenseProxyPermissions,
} from "@microblink/worker-common/proxy-url-validator";
import {
  buildSessionSettings,
  PartialBlinkIdSessionSettings,
} from "./buildSessionSettings";
import {
  LicenseError,
  ServerPermissionError,
} from "@microblink/worker-common/errors";
import { installWorkerCrashReporter } from "@microblink/worker-common/workerCrashReporter";

export type { DownloadProgress } from "@microblink/worker-common/downloadResourceBuffer";

const FRAME_TRANSFER_ERROR_NAME = "FrameTransferError";

const createFrameTransferError = (message: string, error: unknown) => {
  const causeMessage =
    error instanceof Error && error.message ? `: ${error.message}` : "";

  const frameTransferError = new Error(
    `${message}${causeMessage}`,
    error instanceof Error ? { cause: error } : undefined,
  );
  frameTransferError.name = FRAME_TRANSFER_ERROR_NAME;

  return frameTransferError;
};

/**
 * The BlinkID worker.
 */
export class BlinkIdWorker {
  /**
   * The Wasm module.
   */
  #wasmModule?: BlinkIdWasmModule;
  /**
   * Active scanning session created by this worker.
   */
  #activeSession?: BlinkIdScanningSession;
  /**
   * The default session settings.
   *
   * Must be initialized when calling initBlinkId.
   */
  #defaultSessionSettings!: BlinkIdSessionSettings;
  /**
   * The progress status callback.
   */
  progressStatusCallback?: ProgressStatusCallback;
  /**
   * Whether the demo overlay is shown.
   */
  #showDemoOverlay = true;
  /**
   * Whether the production overlay is shown.
   */
  #showProductionOverlay = true;

  /**
   * The current session number.
   */
  #currentSessionNumber = 0;

  /**
   * Sanitized proxy URLs for Microblink services.
   */
  #proxyUrls?: SanitizedProxyUrls;

  #userId!: string;

  #cleanupCrashReporter: (() => void) | undefined;

  constructor() {
    this.#cleanupCrashReporter = installWorkerCrashReporter({
      getSessionNumber: () => this.#currentSessionNumber,
      onError: ({ error, sessionNumber }) => {
        if (!this.#wasmModule) {
          return;
        }

        this.reportPinglet({
          schemaName: "ping.error",
          schemaVersion: "1.0.0",
          sessionNumber,
          data: {
            errorType: "Crash",
            errorMessage:
              error instanceof Error ? error.message : String(error),
            stackTrace: error instanceof Error ? error.stack : undefined,
          },
        });
        this.sendPinglets();
      },
    });
  }

  /**
   * This method loads the Wasm module.
   */
  async #loadWasm({
    resourceUrl,
    wasmVariant,
    featureVariant,
    initialMemory,
  }: LoadWasmParams) {
    if (this.#wasmModule) {
      console.log("Wasm already loaded");
      return;
    }

    const MODULE_NAME = "BlinkIdModule";

    const variantUrl = buildResourcePath(
      resourceUrl,
      featureVariant,
      wasmVariant,
    );

    const workerUrl = buildResourcePath(variantUrl, `${MODULE_NAME}.js`);
    const wasmUrl = buildResourcePath(variantUrl, `${MODULE_NAME}.wasm`);
    const dataUrl = buildResourcePath(variantUrl, `${MODULE_NAME}.data`);

    const crossOriginWorkerUrl = await getCrossOriginWorkerURL(workerUrl);

    const imported = (await import(
      /* @vite-ignore */ crossOriginWorkerUrl
    )) as {
      default: EmscriptenModuleFactory<BlinkIdWasmModule>;
    };

    const createModule = imported.default;

    // use default memory settings if not provided
    if (!initialMemory) {
      // safari requires a larger initial memory allocation as it often block memory growth
      initialMemory = isIOS() ? 700 : 200;
    }

    const wasmMemory = new WebAssembly.Memory({
      initial: mbToWasmPages(initialMemory),
      maximum: mbToWasmPages(2048),
      shared: wasmVariant === "advanced-threads",
    });

    // Create progress trackers for each download
    let wasmProgress: DownloadProgress | undefined;
    let dataProgress: DownloadProgress | undefined;

    let lastProgressUpdate = 0;
    const progressUpdateInterval = 32; // 32ms interval ~ 30fps

    // Update the overall combined progress based on both downloads
    // Throttle to avoid updating too frequently
    const throttledCombinedProgress = () => {
      // Don't update progress if the callback is not set
      if (!this.progressStatusCallback) {
        return;
      }

      // wait until both have started so that we know the total length
      if (!wasmProgress || !dataProgress) {
        return;
      }

      const totalFinished = wasmProgress.finished && dataProgress.finished;
      const totalLoaded = wasmProgress.loaded + dataProgress.loaded;
      const totalLength =
        wasmProgress.contentLength + dataProgress.contentLength;

      const combinedPercent = totalFinished
        ? 100
        : Math.min(Math.round((totalLoaded / totalLength) * 100), 100);

      // Check if enough time has elapsed since the last update
      const currentTime = performance.now();
      if (currentTime - lastProgressUpdate < progressUpdateInterval) {
        return;
      }

      // Update the timestamp
      lastProgressUpdate = currentTime;

      this.progressStatusCallback({
        loaded: totalLoaded,
        contentLength: totalLength,
        progress: combinedPercent,
        finished: totalFinished,
      });
    };

    // Wrap each download's progress callback to update the combined progress.
    const wasmProgressCallback = (progress: DownloadProgress) => {
      wasmProgress = progress;
      void throttledCombinedProgress();
    };

    const dataProgressCallback = (progress: DownloadProgress) => {
      dataProgress = progress;
      void throttledCombinedProgress();
    };

    const getExpectedSize = (params: {
      fileType: "wasm" | "data";
      variant: WasmVariant;
      buildType?: "full" | "lightweight";
    }) =>
      getWasmFileSize({ ...params, buildType: featureVariant }, sizeManifest);

    // Replace simple fetch with progress tracking for both wasm and data downloads
    const [preloadedWasm, preloadedData] = await Promise.all([
      downloadResourceBuffer(
        {
          url: wasmUrl,
          fileType: "wasm",
          variant: wasmVariant,
          buildType: featureVariant,
          progressCallback: wasmProgressCallback,
        },
        getExpectedSize,
      ),
      downloadResourceBuffer(
        {
          url: dataUrl,
          fileType: "data",
          variant: wasmVariant,
          buildType: featureVariant,
          progressCallback: dataProgressCallback,
        },
        getExpectedSize,
      ),
    ]);

    // Ensure final 100% progress update is sent
    if (this.progressStatusCallback && wasmProgress && dataProgress) {
      const totalLength =
        wasmProgress.contentLength + dataProgress.contentLength;
      this.progressStatusCallback({
        loaded: totalLength,
        contentLength: totalLength,
        progress: 100,
        finished: true,
      });
    }

    /**
     * https://emscripten.org/docs/api_reference/module.html#module-object
     */
    this.#wasmModule = await createModule({
      locateFile: (path) => {
        return `${variantUrl}/${wasmVariant}/${path}`;
      },
      onAbort: (what) => {
        if (!this.#wasmModule) {
          return;
        }

        this.reportPinglet({
          schemaName: "ping.error",
          schemaVersion: "1.0.0",
          sessionNumber: this.#currentSessionNumber,
          data: {
            errorType: "Crash",
            errorMessage: what instanceof Error ? what.message : String(what),
            stackTrace: what instanceof Error ? what.stack : undefined,
          },
        });
        this.sendPinglets();
      },
      printErr: (message) => {
        console.error(message);

        if (/\babort(ed)?\b/i.test(message)) {
          if (!this.#wasmModule) {
            return;
          }

          this.reportPinglet({
            schemaName: "ping.error",
            schemaVersion: "1.0.0",
            sessionNumber: this.#currentSessionNumber,
            data: {
              errorType: "Crash",
              errorMessage: String(message),
              stackTrace: undefined,
            },
          });
          this.sendPinglets();
        }
      },
      // pthreads build breaks without this:
      // "Failed to execute 'createObjectURL' on 'URL': Overload resolution failed."
      mainScriptUrlOrBlob: crossOriginWorkerUrl,
      wasmBinary: preloadedWasm,
      getPreloadedPackage() {
        return preloadedData;
      },
      wasmMemory,
      noExitRuntime: true,
    });

    if (!this.#wasmModule) {
      throw new Error("Failed to load Wasm module");
    }
  }

  reportPinglet(pinglet: Ping) {
    if (!this.#wasmModule) {
      throw new Error("Cannot report pinglet: Wasm module not loaded");
    }

    try {
      this.#wasmModule.queuePinglet(
        JSON.stringify(pinglet.data),
        pinglet.schemaName,
        pinglet.schemaVersion,
        pinglet.sessionNumber ?? this.#currentSessionNumber,
      );
    } catch (error) {
      console.warn("Failed to queue pinglet:", error, pinglet);
    }
  }

  sendPinglets() {
    if (!this.#wasmModule) {
      throw new Error("Cannot send pinglets: Wasm module not loaded");
    }

    try {
      this.#wasmModule.sendPinglets();
    } catch (error) {
      console.warn("Failed to send pinglets:", error);
    }
  }

  /**
   * This method initializes everything.
   */
  async initBlinkId(
    settings: BlinkIdWorkerInitSettings,
    defaultSessionSettings: BlinkIdSessionSettings,
    progressCallback?: ProgressStatusCallback,
  ) {
    const resourcesPath = new URL(
      "resources/",
      settings.resourcesLocation,
    ).toString();

    this.#defaultSessionSettings = defaultSessionSettings;
    this.progressStatusCallback = progressCallback;
    this.#userId = settings.userId;

    const wasmVariant = settings.wasmVariant ?? (await detectWasmFeatures());
    const featureVariant = settings.useLightweightBuild
      ? "lightweight"
      : "full";

    await this.#loadWasm({
      resourceUrl: resourcesPath,
      wasmVariant,
      featureVariant,
      initialMemory: settings.initialMemory,
    });

    if (!this.#wasmModule) {
      // we do not flush pinglets here because we don't know if license allows it
      throw new Error("Wasm module not loaded");
    }

    // Initialize with license key
    const licenseUnlockResult = this.#wasmModule.initializeWithLicenseKey(
      settings.licenseKey,
      settings.userId,
      false,
    );

    // Queue init pinglet before remote license check; flush only if init fails.
    this.reportPinglet({
      schemaName: "ping.sdk.init.start",
      schemaVersion: "1.1.0",
      sessionNumber: 0,
      data: {
        packageName: self.location.hostname,
        platform: "Emscripten",
        platformDetails: `${featureVariant}-${wasmVariant}`,
        product: "BlinkID",
        userId: this.#userId,
      },
    });

    if (licenseUnlockResult.licenseError) {
      throw new LicenseError(
        "License unlock error: " + licenseUnlockResult.licenseError,
      );
    }

    if (settings.microblinkProxyUrl) {
      // Validate the proxy URL permissions
      // This will throw if the permissions are not valid
      validateLicenseProxyPermissions(licenseUnlockResult);

      // Sanitize the proxy URLs
      this.#proxyUrls = sanitizeProxyUrls(settings.microblinkProxyUrl);

      if (licenseUnlockResult.allowPingProxy && licenseUnlockResult.hasPing) {
        // If ping proxy is allowed, configure the WASM module with the sanitized URLs
        this.#wasmModule.setPingProxyUrl(this.#proxyUrls.ping);
        console.debug(`Using ping proxy URL: ${this.#proxyUrls.ping}`);
      }
    }

    // Check if we need to obtain a server permission
    if (licenseUnlockResult.unlockResult === "requires-server-permission") {
      const shouldUseBaltazarProxy =
        this.#proxyUrls?.baltazar && licenseUnlockResult.allowBaltazarProxy;

      const baltazarProxyUrl = shouldUseBaltazarProxy
        ? this.#proxyUrls?.baltazar
        : undefined;

      if (baltazarProxyUrl) {
        console.debug(`Using Baltazar proxy URL: ${baltazarProxyUrl}`);
      }

      const serverPermissionResponse = baltazarProxyUrl
        ? await obtainNewServerPermission(licenseUnlockResult, baltazarProxyUrl)
        : await obtainNewServerPermission(licenseUnlockResult);

      const serverPermissionResult = this.#wasmModule.submitServerPermission(
        serverPermissionResponse,
      );

      if (serverPermissionResult?.error) {
        throw new ServerPermissionError(
          "Server unlock error: " + serverPermissionResult.error,
        );
      }
    }

    try {
      console.debug(`BlinkID SDK ${licenseUnlockResult.sdkVersion} unlocked`);

      this.#showDemoOverlay = licenseUnlockResult.showDemoOverlay;
      this.#showProductionOverlay = licenseUnlockResult.showProductionOverlay;

      this.#wasmModule.initializeSdk(settings.userId);
    } catch (error) {
      console.warn("Failed to initialize BlinkID SDK:", error);
      this.reportPinglet({
        schemaName: "ping.error",
        schemaVersion: "1.0.0",
        sessionNumber: 0,
        data: {
          errorType: "Crash",
          errorMessage: error instanceof Error ? error.message : String(error),
          stackTrace: error instanceof Error ? error.stack : undefined,
        },
      });
      // Flush only for failed SDK initialization.
      this.sendPinglets();
      throw error;
    }
  }

  /**
   * This method creates a BlinkID scanning session.
   *
   * @param options - The options for the session.
   * @returns The session.
   */
  createScanningSession(options?: PartialBlinkIdSessionSettings) {
    if (!this.#wasmModule) {
      throw new Error("Wasm module not loaded");
    }

    try {
      const sessionSettings = buildSessionSettings(
        options,
        this.#defaultSessionSettings,
      );

      const session = this.#wasmModule.createScanningSession(
        sessionSettings,
        this.#userId,
      );

      this.#currentSessionNumber++;

      this.sendPinglets();

      return this.createProxySession(session, sessionSettings);
    } catch (error) {
      this.reportPinglet({
        schemaName: "ping.error",
        schemaVersion: "1.0.0",
        sessionNumber: this.#currentSessionNumber,
        data: {
          errorType: "Crash",
          errorMessage: error instanceof Error ? error.message : String(error),
          stackTrace: error instanceof Error ? error.stack : undefined,
        },
      });
      this.sendPinglets();
      throw error;
    }
  }

  /**
   * Backward-compatible alias for `createScanningSession`.
   *
   * @deprecated Use `createScanningSession` instead.
   */
  createBlinkIdScanningSession(options?: PartialBlinkIdSessionSettings) {
    return this.createScanningSession(options);
  }

  /**
   * This method creates a proxy session.
   *
   * @param session - The session.
   * @param sessionSettings - The session settings.
   * @returns The proxy session.
   */
  createProxySession(
    session: BlinkIdScanningSession,
    sessionSettings: BlinkIdSessionSettings,
  ): WorkerScanningSession & ProxyMarked {
    this.#activeSession = session;

    /**
     * Cache for document class info and rotation, since it's cleared on each process call,
     * however the classification is immutable across the session lifecycle.
     * TODO: hoist to C++ side to avoid redundant allocations altogether.
     */
    let cachedClassInfo: DocumentClassInfo | null = null;
    let cachedRotation: DocumentRotation | null = null;
    /**
     * this is a custom session that will be proxied
     * it handles the transfer of the image data buffer
     */
    const customSession: WorkerScanningSession = {
      getResult: () => {
        try {
          return session.getResult();
        } catch (error) {
          if (!this.#wasmModule) {
            throw error;
          }

          this.reportPinglet({
            schemaName: "ping.error",
            schemaVersion: "1.0.0",
            sessionNumber: this.#currentSessionNumber,
            data: {
              errorType: "NonFatal",
              errorMessage:
                error instanceof Error ? error.message : String(error),
              stackTrace: error instanceof Error ? error.stack : undefined,
            },
          });
          this.sendPinglets();
          throw error;
        }
      },
      process: (image) => {
        try {
          const processResult = session.process(image);

          if ("error" in processResult) {
            // processResult is BlinkIdSessionErrorWithBuffer
            if (this.#wasmModule) {
              this.reportPinglet({
                schemaName: "ping.error",
                schemaVersion: "1.0.0",
                sessionNumber: this.#currentSessionNumber,
                data: {
                  errorType: "NonFatal",
                  errorMessage: String(processResult.error),
                  stackTrace: undefined,
                },
              });
              this.sendPinglets();
            }

            // not an error: processResult is ProcessResultWithBuffer
          } else {
            /**
             * As documentClassInfo is not an optional property, assume that `type` being
             * defined means the whole object is defined and can be cached.
             */
            if (processResult.inputImageAnalysisResult.documentClassInfo.type) {
              // cache class info for future use
              cachedClassInfo =
                processResult.inputImageAnalysisResult.documentClassInfo;
            }

            /**
             * Cache rotation, assume that rotation remains the same if document is not detected,
             * i.e. rotation is only updated when detection is successful.
             */
            if (
              processResult.inputImageAnalysisResult.documentRotation !==
              "not-available"
            ) {
              // cache rotation for future use
              cachedRotation =
                processResult.inputImageAnalysisResult.documentRotation;
            }

            if (
              cachedClassInfo &&
              cachedClassInfo?.type !==
                processResult.inputImageAnalysisResult.documentClassInfo.type
            ) {
              processResult.inputImageAnalysisResult.documentClassInfo =
                cachedClassInfo;
            }

            if (
              cachedRotation &&
              cachedRotation !==
                processResult.inputImageAnalysisResult.documentRotation
            ) {
              processResult.inputImageAnalysisResult.documentRotation =
                cachedRotation;
            }
          }

          let transferPackage:
            | ProcessResultWithBuffer
            | BlinkIdSessionErrorWithBuffer;

          try {
            transferPackage = transfer(
              {
                ...processResult,
                arrayBuffer: image.data.buffer,
              },
              [image.data.buffer],
            );
          } catch (error) {
            const frameTransferError = createFrameTransferError(
              "Failed to transfer frame from worker",
              error,
            );

            if (!this.#wasmModule) {
              throw frameTransferError;
            }

            this.reportPinglet({
              schemaName: "ping.error",
              schemaVersion: "1.0.0",
              sessionNumber: this.#currentSessionNumber,
              data: {
                errorType: "Crash",
                errorMessage: frameTransferError.message,
                stackTrace: frameTransferError.stack,
              },
            });
            this.sendPinglets();
            throw frameTransferError;
          }

          return transferPackage;
        } catch (error) {
          if (
            error instanceof Error &&
            error.name === FRAME_TRANSFER_ERROR_NAME
          ) {
            throw error;
          }

          if (!this.#wasmModule) {
            throw error;
          }

          this.reportPinglet({
            schemaName: "ping.error",
            schemaVersion: "1.0.0",
            sessionNumber: this.#currentSessionNumber,
            data: {
              errorType: "NonFatal",
              errorMessage:
                error instanceof Error ? error.message : String(error),
              stackTrace: error instanceof Error ? error.stack : undefined,
            },
          });
          this.sendPinglets();
          throw error;
        }
      },
      ping: (ping: Ping) => {
        this.reportPinglet({
          ...ping,
          sessionNumber: ping.sessionNumber ?? this.#currentSessionNumber,
        });
      },
      sendPinglets: () => this.sendPinglets(),
      getSettings: () => sessionSettings,
      reset: () => {
        try {
          session.reset();
          cachedClassInfo = null;
          cachedRotation = null;
        } catch (error) {
          if (!this.#wasmModule) {
            throw error;
          }

          this.reportPinglet({
            schemaName: "ping.error",
            schemaVersion: "1.0.0",
            sessionNumber: this.#currentSessionNumber,
            data: {
              errorType: "NonFatal",
              errorMessage:
                error instanceof Error ? error.message : String(error),
              stackTrace: error instanceof Error ? error.stack : undefined,
            },
          });
          this.sendPinglets();
          throw error;
        }
      },
      delete: () => {
        if (!session.isDeleted()) {
          session.delete();
        }
        if (this.#activeSession === session) {
          this.#activeSession = undefined;
        }
      },
      deleteLater: () => {
        if (!session.isDeleted()) {
          session.deleteLater();
        }
        if (this.#activeSession === session) {
          this.#activeSession = undefined;
        }
      },
      isDeleted: () => session.isDeleted(),
      isAliasOf: (other) => session.isAliasOf(other),
      showDemoOverlay: () => this.#showDemoOverlay,
      showProductionOverlay: () => this.#showProductionOverlay,
    };

    return proxy(customSession);
  }

  /**
   * This method is called when the worker is terminated.
   */
  [finalizer]() {
    // console.log("Comlink.finalizer called on proxyWorker");
    // Can't use this as the `proxyWorker` gets randomly GC'd, even if in use
    // self.close();
  }

  /**
   * Terminates the workers and the Wasm runtime.
   */
  async terminate() {
    const gracePeriod = 5000;

    self.setTimeout(() => self.close, gracePeriod);

    // ensure session deconstructed before we terminate to ensure pinglets are reported
    if (this.#activeSession) {
      try {
        if (!this.#activeSession.isDeleted()) {
          console.debug("Deleting BlinkId session during terminate");
          this.#activeSession.delete();
        }
      } catch (error) {
        console.warn(
          "Failed to delete BlinkId session during terminate:",
          error,
        );
        if (!this.#wasmModule) {
          return;
        }

        this.reportPinglet({
          schemaName: "ping.error",
          schemaVersion: "1.0.0",
          sessionNumber: this.#currentSessionNumber,
          data: {
            errorType: "NonFatal",
            errorMessage:
              error instanceof Error ? error.message : String(error),
            stackTrace: error instanceof Error ? error.stack : undefined,
          },
        });
        this.sendPinglets();
      } finally {
        this.#activeSession = undefined;
      }
    }

    if (!this.#wasmModule) {
      this.#cleanupCrashReporter?.();
      this.#cleanupCrashReporter = undefined;
      console.warn(
        "No Wasm module loaded during worker termination. Skipping cleanup.",
      );

      self.close();
      return;
    }

    // wasm module loaded
    this.#wasmModule.terminateSdk();

    // allow any pending pings to be reported before we report shutdown
    await new Promise((resolve) => setTimeout(resolve, 0));

    this.sendPinglets();

    // Wait for any in-flight ping requests to finish, but don't wait forever
    const startTime = Date.now();

    while (
      this.#wasmModule.arePingRequestsInProgress() &&
      Date.now() - startTime < gracePeriod
    ) {
      // wait 100ms between checks
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    this.#wasmModule = undefined;
    this.#cleanupCrashReporter?.();
    this.#cleanupCrashReporter = undefined;

    console.debug("BlinkIdWorker terminated 🔴");
    self.close();
  }
}

/**
 * The BlinkID worker.
 */
const blinkIdWorker = new BlinkIdWorker();

/**
 * The BlinkID worker proxy.
 */
expose(blinkIdWorker);

/**
 * The BlinkID worker proxy.
 */
export type BlinkIdWorkerProxy = Omit<BlinkIdWorker, typeof finalizer>;

/**
 * This is a workaround for the fact that the types are not exported.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface _BlinkIdScanningResult extends BlinkIdScanningResult {}

/**
 * This is a workaround for the fact that the types are not exported.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface _BlinkIdSessionError extends BlinkIdSessionError {}

/**
 * The process result with buffer.
 */
export type ProcessResultWithBuffer = BlinkIdProcessResult & {
  arrayBuffer: ArrayBuffer;
};

export type BlinkIdSessionErrorWithBuffer = BlinkIdSessionError & {
  arrayBuffer: ArrayBuffer;
};

/**
 * The worker scanning session.
 */
export type WorkerScanningSession = OverrideProperties<
  BlinkIdScanningSession,
  {
    process: (
      image: ImageData,
    ) => ProcessResultWithBuffer | BlinkIdSessionErrorWithBuffer;
  }
> & {
  /**
   * Gets the settings.
   *
   * @returns The settings.
   */
  getSettings: () => BlinkIdSessionSettings;
  /**
   * Shows the demo overlay.
   *
   * @returns Whether the demo overlay is shown.
   */
  showDemoOverlay: () => boolean;
  /**
   * Shows the production overlay.
   *
   * @returns Whether the production overlay is shown.
   */
  showProductionOverlay: () => boolean;
  ping: BlinkIdWorker["reportPinglet"];
  sendPinglets: BlinkIdWorker["sendPinglets"];
};

/**
 * Initialization settings for the BlinkID worker.
 *
 * These settings control how the BlinkID worker is initialized and configured,
 * including resource locations, memory allocation, and build variants.
 */
export type BlinkIdWorkerInitSettings = {
  /**
   * The license key required to unlock and use the BlinkID SDK.
   * This must be a valid license key obtained from Microblink.
   */
  licenseKey: string;

  /**
   * The URL of the Microblink proxy server. This proxy handles requests to Microblink's Baltazar and Ping servers.
   *
   * **Requirements:**
   * - Must be a valid HTTPS URL
   * - The proxy server must implement the expected Microblink API endpoints
   * - This feature is only available if explicitly permitted by your license
   *
   * **Endpoints:**
   * - Ping: `{proxyUrl}/ping`
   * - Baltazar: `{proxyUrl}/api/v2/status/check`
   *
   * @example "https://your-proxy.example.com"
   */
  microblinkProxyUrl?: string;

  /**
   * The parent directory where the `/resources` directory is hosted.
   * Defaults to `window.location.href`, at the root of the current page.
   */
  resourcesLocation?: string;

  /**
   * A unique identifier for the user/session.
   * Used for analytics and tracking purposes.
   */
  userId: string;

  /**
   * The WebAssembly module variant to use.
   * Different variants may offer different performance/size tradeoffs.
   */
  wasmVariant?: WasmVariant;

  /**
   * The initial memory allocation for the Wasm module, in megabytes.
   * Larger values may improve performance but increase memory usage.
   */
  initialMemory?: number;

  /**
   * Whether to use the lightweight build of the SDK.
   * Lightweight builds have reduced size but may have limited functionality.
   */
  useLightweightBuild: boolean;
};

/**
 * The load Wasm params.
 */
export type LoadWasmParams = {
  resourceUrl: string;
  wasmVariant: WasmVariant;
  featureVariant: "full" | "lightweight";
  initialMemory?: number;
};

/**
 * The progress status callback.
 */
export type ProgressStatusCallback = (progress: DownloadProgress) => void;
