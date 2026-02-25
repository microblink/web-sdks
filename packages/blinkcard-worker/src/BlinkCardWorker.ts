/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import sizeManifest from "@microblink/blinkcard-wasm/size-manifest.json";
import { buildResourcePath } from "@microblink/worker-common/buildResourcePath";
import {
  downloadResourceBuffer,
  type DownloadProgress,
} from "@microblink/worker-common/downloadResourceBuffer";
import {
  LicenseError,
  ServerPermissionError,
} from "@microblink/worker-common/errors";
import { getCrossOriginWorkerURL } from "@microblink/worker-common/getCrossOriginWorkerURL";
import { getWasmFileSize } from "@microblink/worker-common/getWasmFileSize";
import { isIOS } from "@microblink/worker-common/isSafari";
import { obtainNewServerPermission } from "@microblink/worker-common/licencing";
import { mbToWasmPages } from "@microblink/worker-common/mbToWasmPages";
import {
  sanitizeProxyUrls,
  validateLicenseProxyPermissions,
  type SanitizedProxyUrls,
} from "@microblink/worker-common/proxy-url-validator";
import { detectWasmFeatures } from "@microblink/worker-common/wasm-feature-detect";
import { expose, finalizer, proxy, ProxyMarked, transfer } from "comlink";

import type { Ping } from "@microblink/analytics/ping";
import type {
  BlinkCardProcessResult,
  BlinkCardScanningResult,
  BlinkCardScanningSession,
  BlinkCardSessionSettings,
  BlinkCardSessionSettingsInput,
  BlinkCardWasmModule,
  EmscriptenModuleFactory,
  WasmVariant,
} from "@microblink/blinkcard-wasm";
import { OverrideProperties } from "type-fest";

export type { DownloadProgress } from "@microblink/worker-common/downloadResourceBuffer";

/**
 * The BlinkCard worker.
 */
export class BlinkCardWorker {
  /**
   * The Wasm module.
   */
  #wasmModule?: BlinkCardWasmModule;
  /**
   * Active scanning session created by this worker.
   */
  #activeSession?: BlinkCardScanningSession;
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

  /**
   * This method loads the Wasm module.
   */
  async #loadWasm({ resourceUrl, wasmVariant, initialMemory }: LoadWasmParams) {
    if (this.#wasmModule) {
      console.warn("Wasm already loaded, skipping loadWasm");
      return;
    }

    const MODULE_NAME = "BlinkCardModule";

    const variantUrl = buildResourcePath(resourceUrl, wasmVariant);

    const workerUrl = buildResourcePath(variantUrl, `${MODULE_NAME}.js`);
    const wasmUrl = buildResourcePath(variantUrl, `${MODULE_NAME}.wasm`);
    const dataUrl = buildResourcePath(variantUrl, `${MODULE_NAME}.data`);

    const crossOriginWorkerUrl = await getCrossOriginWorkerURL(workerUrl);

    const imported = (await import(
      /* @vite-ignore */ crossOriginWorkerUrl
    )) as {
      default: EmscriptenModuleFactory<BlinkCardWasmModule>;
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
    }) => getWasmFileSize(params, sizeManifest);

    // Replace simple fetch with progress tracking for both wasm and data downloads
    const [preloadedWasm, preloadedData] = await Promise.all([
      downloadResourceBuffer(
        {
          url: wasmUrl,
          fileType: "wasm",
          variant: wasmVariant,
          progressCallback: wasmProgressCallback,
        },
        getExpectedSize,
      ),
      downloadResourceBuffer(
        {
          url: dataUrl,
          fileType: "data",
          variant: wasmVariant,
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

  reportPinglet({ data, schemaName, schemaVersion, sessionNumber }: Ping) {
    if (!this.#wasmModule) {
      throw new Error("Cannot report pinglet: Wasm module not loaded");
    }

    if (!this.#wasmModule.isPingEnabled()) {
      // Ping is not enabled, do nothing
      return;
    }

    try {
      this.#wasmModule.queuePinglet(
        JSON.stringify(data),
        schemaName,
        schemaVersion,
        sessionNumber!, // we know sesion number is provided because we're using proxy function
      );
    } catch (error) {
      console.warn("Failed to queue pinglet:", error, {
        data,
        schemaName,
        schemaVersion,
        sessionNumber,
      });
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
   * This method initializes the BlinkCard Wasm module.
   */
  async initBlinkCard(
    settings: BlinkCardWorkerInitSettings,
    progressCallback?: ProgressStatusCallback,
  ) {
    const resourcesPath = new URL(
      "resources/",
      settings.resourcesLocation,
    ).toString();

    this.progressStatusCallback = progressCallback;
    this.#userId = settings.userId;

    const wasmVariant = settings.wasmVariant ?? (await detectWasmFeatures());

    await this.#loadWasm({
      resourceUrl: resourcesPath,
      wasmVariant,
      initialMemory: settings.initialMemory,
    });

    if (!this.#wasmModule) {
      throw new Error("Wasm module not loaded");
    }

    // Initialize with license key
    const licenseUnlockResult = this.#wasmModule.initializeWithLicenseKey(
      settings.licenseKey,
      settings.userId,
      false,
    );

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
    this.reportPinglet({
      schemaName: "ping.sdk.init.start",
      schemaVersion: "1.1.0",
      sessionNumber: 0,
      data: {
        packageName: self.location.hostname,
        platform: "Emscripten",
        platformDetails: wasmVariant,
        product: "BlinkCard",
        userId: this.#userId,
      },
    });

    this.sendPinglets();

    if (licenseUnlockResult.licenseError) {
      throw new LicenseError(
        "License unlock error: " + licenseUnlockResult.licenseError,
      );
    }

    // Check if we need to obtain a server permission
    if (licenseUnlockResult.unlockResult === "requires-server-permission") {
      const shouldUseBaltazarProxy =
        this.#proxyUrls?.baltazar && licenseUnlockResult.allowBaltazarProxy;

      const baltazarProxyUrl = shouldUseBaltazarProxy
        ? this.#proxyUrls!.baltazar
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

    console.debug(`BlinkCard SDK ${licenseUnlockResult.sdkVersion} unlocked`);

    this.#showDemoOverlay = licenseUnlockResult.showDemoOverlay;
    this.#showProductionOverlay = licenseUnlockResult.showProductionOverlay;

    this.#wasmModule.initializeSdk(settings.userId);
    this.sendPinglets();
  }

  /**
   * This method creates a BlinkCard scanning session.
   *
   * @param sessionSettings - The options for the session.
   * @returns The session.
   */
  createScanningSession(sessionSettings?: BlinkCardSessionSettingsInput) {
    if (!this.#wasmModule) {
      throw new Error("Wasm module not loaded");
    }

    const session = this.#wasmModule.createScanningSession(
      sessionSettings ?? {},
      this.#userId,
    );

    this.#currentSessionNumber++;

    this.sendPinglets();

    return this.createProxySession(session);
  }

  /**
   * This method creates a proxy session.
   *
   * @param session - The BlinkCard scanning session.
   * @returns The proxy session.
   */
  createProxySession(
    session: BlinkCardScanningSession,
  ): WorkerScanningSession & ProxyMarked {
    this.#activeSession = session;

    /**
     * this is a custom session that will be proxied
     * it handles the transfer of the image data buffer
     */
    const customSession: WorkerScanningSession = {
      getResult: () => {
        try {
          return session.getResult();
        } catch (error) {
          this.reportPinglet({
            schemaName: "ping.error",
            schemaVersion: "1.0.0",
            sessionNumber: session.getSessionNumber(),
            data: {
              errorType: "NonFatal",
              errorMessage:
                error instanceof Error ? error.message : String(error),
            },
          });
          throw error;
        }
      },
      process: (image) => {
        try {
          const processResult = session.process(image);

          const transferPackage: ProcessResultWithBuffer = transfer(
            {
              ...processResult,
              arrayBuffer: image.data.buffer,
            },
            [image.data.buffer],
          );

          return transferPackage;
        } catch (error) {
          this.reportPinglet({
            schemaName: "ping.error",
            schemaVersion: "1.0.0",
            sessionNumber: session.getSessionNumber(),
            data: {
              errorType: "NonFatal",
              errorMessage:
                error instanceof Error ? error.message : String(error),
              stackTrace: error instanceof Error ? error.stack : undefined,
            },
          });
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
      getSettings: () => session.getSettings(),
      getSessionId: () => session.getSessionId(),
      getSessionNumber: () => session.getSessionNumber(),
      reset: () => {
        try {
          session.reset();
        } catch (error) {
          this.reportPinglet({
            schemaName: "ping.error",
            schemaVersion: "1.0.0",
            sessionNumber: session.getSessionNumber(),
            data: {
              errorType: "NonFatal",
              errorMessage:
                error instanceof Error ? error.message : String(error),
              stackTrace: error instanceof Error ? error.stack : undefined,
            },
          });
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
    // console.debug("Comlink.finalizer called on proxyWorker");
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
          console.debug("Deleting BlinkCard session during terminate");
          this.#activeSession.delete();
        }
      } catch (error) {
        console.warn(
          "Failed to delete BlinkCard session during terminate:",
          error,
        );
      } finally {
        this.#activeSession = undefined;
      }
    }

    if (!this.#wasmModule) {
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

    console.debug("BlinkCardWorker terminated 🔴");
    self.close();
  }
}

/**
 * The BlinkCard worker.
 */
const blinkCardWorker = new BlinkCardWorker();

/**
 * The BlinkCard worker proxy.
 */
expose(blinkCardWorker);

/**
 * The BlinkCard worker proxy.
 */
export type BlinkCardWorkerProxy = Omit<BlinkCardWorker, typeof finalizer>;

/**
 * This is a workaround for the fact that the types are not exported.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface _BlinkCardScanningResult extends BlinkCardScanningResult {}

/**
 * The process result with buffer.
 */
export type ProcessResultWithBuffer = BlinkCardProcessResult & {
  arrayBuffer: ArrayBuffer;
};

/**
 * The worker scanning session.
 */
export type WorkerScanningSession = OverrideProperties<
  BlinkCardScanningSession,
  {
    process: (image: ImageData) => ProcessResultWithBuffer;
  }
> & {
  /**
   * Gets the settings.
   *
   * @returns The settings.
   */
  getSettings: () => BlinkCardSessionSettings;
  /**
   * Gets the session ID.
   *
   * @returns The session ID.
   */
  getSessionId: () => string;
  /**
   * Gets the session number.
   *
   * @returns The session number.
   */
  getSessionNumber: () => number;
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
  ping: BlinkCardWorker["reportPinglet"];
  sendPinglets: BlinkCardWorker["sendPinglets"];
};

/**
 * Initialization settings for the BlinkCard worker.
 *
 * These settings control how the BlinkCard worker is initialized and configured,
 * including resource locations, memory allocation, and build variants.
 */
export type BlinkCardWorkerInitSettings = {
  /**
   * The license key required to unlock and use the BlinkCard SDK.
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
};

/**
 * The load Wasm params.
 */
export type LoadWasmParams = {
  resourceUrl: string;
  wasmVariant: WasmVariant;
  initialMemory?: number;
};

/**
 * The progress status callback.
 */
export type ProgressStatusCallback = (progress: DownloadProgress) => void;
