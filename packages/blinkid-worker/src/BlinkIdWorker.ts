/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { Ping } from "@microblink/analytics/ping";
import type {
  BlinkIdProcessResult,
  BlinkIdScanningResult,
  BlinkIdScanningSession,
  BlinkIdSessionError,
  // todo
  BlinkIdSessionErrorType,
  BlinkIdSessionSettings,
  BlinkIdSessionSettingsInput,
  BlinkIdWasmModule,
  DocumentClassInfo,
  DocumentRotation,
  EmscriptenModuleFactory,
  MemFSModule,
  RedactionSettings,
  ScanningStatus,
  WasmVariant,
} from "@microblink/blinkid-wasm";
import { BLINK_ID_RECOGNIZER_VERSION } from "@microblink/blinkid-wasm/BlinkIdRecognizerVersion";
import sizeManifest from "@microblink/blinkid-wasm/size-manifest.json";
import { buildResourcePath } from "@microblink/worker-common/buildResourcePath";
import { createWasmInstantiator, downloadAndCompileWasm } from "@microblink/worker-common/compileWasm";
import { downloadResourceBuffer, type DownloadProgress } from "@microblink/worker-common/downloadResourceBuffer";
import { LicenseError, ServerPermissionError } from "@microblink/worker-common/errors";
import { getCrossOriginWorkerURL } from "@microblink/worker-common/getCrossOriginWorkerURL";
import { getWasmFileSize } from "@microblink/worker-common/getWasmFileSize";
import { isIOS } from "@microblink/worker-common/isSafari";
import { obtainNewServerPermission } from "@microblink/worker-common/licencing";
import { mbToWasmPages } from "@microblink/worker-common/mbToWasmPages";
import {
  SanitizedProxyUrls,
  getMicroblinkProxyPingFlags,
  sanitizeProxyUrls,
  validateLicenseProxyPermissions,
} from "@microblink/worker-common/proxy-url-validator";
import { detectWasmFeatures } from "@microblink/worker-common/wasm-feature-detect";
import { getSdkInitPlatformDetails, isThreadedWasmVariant } from "@microblink/worker-common/wasmVariant";
import { installWorkerCrashReporter } from "@microblink/worker-common/workerCrashReporter";
import { expose, finalizer, proxy, ProxyMarked, transfer } from "comlink";

import { BlinkIdInitializationProgress, type ProgressStatusCallback } from "./BlinkIdInitializationProgress";
import {
  BLINK_ID_OTA_RESOURCES_DIRECTORY,
  BLINK_ID_OTA_RESOURCES_PATH,
  resolveBlinkIdOtaResources,
  resolveBlinkIdOtaResourcesFromLocation,
  selectBlinkIdOtaResources,
  type BlinkIdOtaResource,
  writeBlinkIdOtaResourcesToMemfsLazy,
} from "./otaResources";
import { mergeRedactionSettings } from "./utils";

export type { DownloadProgress } from "@microblink/worker-common/downloadResourceBuffer";

const FRAME_TRANSFER_ERROR_NAME = "FrameTransferError";
export const DEFAULT_BLINK_ID_OTA_RESOURCE_PROVIDER_URL = "https://blinkid-ota.microblink.com";
export const DEFAULT_BLINK_ID_RESOURCE_DOWNLOAD_TIMEOUT_MS = 60_000;

export type BlinkIdOtaResourceSettings = {
  /**
   * Check the OTA provider for newer resources during SDK initialization.
   *
   * The hosted baseline resources are always loaded.
   *
   * @defaultValue `true`
   */
  checkForUpdates?: boolean;

  /**
   * Fail SDK initialization when OTA resolve or download fails.
   *
   * @defaultValue `false`
   */
  strict?: boolean;

  /**
   * Base URL of the OTA resource provider service.
   *
   * Use this when the SDK should ask an OTA API service for the current resource download URLs.
   *
   * @defaultValue `"https://blinkid-ota.microblink.com"`
   */
  otaResourceProviderUrl?: string;

  /**
   * Base URL where the baseline OTA resource files are hosted.
   *
   * When omitted, the worker loads them from the SDK's `resources/ota-resources` directory.
   */
  resourcesLocation?: string;
};

type ResolvedBlinkIdOtaResourceSettings = {
  checkForUpdates: boolean;
  strict: boolean;
  otaResourceProviderUrl: string;
  resourcesLocation?: string;
};

function resolveOtaSettings(settings: BlinkIdOtaResourceSettings | undefined): ResolvedBlinkIdOtaResourceSettings {
  const configuredResourcesLocation = settings?.resourcesLocation?.trim();
  const configuredOtaResourceProviderUrl = settings?.otaResourceProviderUrl?.trim();
  let otaResourceProviderUrl = DEFAULT_BLINK_ID_OTA_RESOURCE_PROVIDER_URL;
  if (configuredOtaResourceProviderUrl) {
    otaResourceProviderUrl = configuredOtaResourceProviderUrl;
  }

  return {
    checkForUpdates: settings?.checkForUpdates ?? true,
    otaResourceProviderUrl,
    ...(configuredResourcesLocation ? { resourcesLocation: configuredResourcesLocation } : {}),
    strict: settings?.strict ?? false,
  };
}

function resolveResourceDownloadTimeoutMs(configuredTimeout: number | undefined): number {
  const timeout = configuredTimeout ?? DEFAULT_BLINK_ID_RESOURCE_DOWNLOAD_TIMEOUT_MS;
  if (!Number.isSafeInteger(timeout) || timeout <= 0) {
    throw new Error(`Invalid BlinkID resource download timeout: ${timeout}`);
  }

  return timeout;
}

/** Default redaction settings used when @type {RedactionSettingsResolver} returns a partial/incomplete setting */
export const DEFAULT_REDACTION_SETTINGS = {
  fields: [],
  mode: "full-result",
  redactBarcode: false,
  redactMrz: false,
} as const satisfies RedactionSettings;

/**
 * Resolves custom result redaction settings for a classified document.
 *
 * Return `null` to keep the SDK default redaction behavior.
 */
export type RedactionSettingsResolver = (
  classInfo: DocumentClassInfo,
  getDefaultRedactionSettings: (options: GetDefaultRedactionSettingsOptions) => Promise<RedactionSettings>,
) => RedactionSettingsResolverReturn | null | Promise<RedactionSettingsResolverReturn | null>;

type RedactionSettingsResolverReturn = Partial<RedactionSettings>;

export type GetDefaultRedactionSettingsOptions = Omit<
  DocumentClassInfo,
  "isoNumericCountryCode" | "isoAlpha2CountryCode" | "isoAlpha3CountryCode" | "countryName"
>;

/** Options applied by BlinkID Worker when creating a scanning session. */
export type BlinkIdCreateScanningSessionOptions = {
  /**
   * Resolves custom result redaction settings for the classified document.
   *
   * Returning `null` or `undefined` keeps the SDK default redaction behavior.
   */
  redactionSettingsResolver?: RedactionSettingsResolver;
};

const createFrameTransferError = (message: string, error: unknown) => {
  const causeMessage = error instanceof Error && error.message ? `: ${error.message}` : "";

  const frameTransferError = new Error(
    `${message}${causeMessage}`,
    error instanceof Error ? { cause: error } : undefined,
  );
  frameTransferError.name = FRAME_TRANSFER_ERROR_NAME;

  return frameTransferError;
};

/** The BlinkID worker. */
export class BlinkIdWorker {
  /** The Wasm module. */
  #wasmModule?: BlinkIdWasmModule;
  /** Active scanning session created by this worker. */
  #activeSession?: BlinkIdScanningSession;
  /** Progress callback used during initialization. */
  progressStatusCallback?: ProgressStatusCallback;
  /** Whether the demo overlay is shown. */
  #showDemoOverlay = true;
  /** Whether the production overlay is shown. */
  #showProductionOverlay = true;

  /** The current session number. */
  #currentSessionNumber = 0;

  /** Sanitized proxy URLs for Microblink services. */
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
            errorMessage: error instanceof Error ? error.message : String(error),
            stackTrace: error instanceof Error ? error.stack : undefined,
          },
        });
        this.sendPinglets();
      },
    });
  }

  /** This method loads the Wasm module. */
  async #loadWasm(
    { resourceUrl, wasmVariant, featureVariant, initialMemory, resourceDownloadTimeoutMs }: LoadWasmParams,
    progressTracker?: BlinkIdInitializationProgress,
  ) {
    if (this.#wasmModule) {
      console.log("Wasm already loaded");
      return;
    }

    const MODULE_NAME = "BlinkIdModule";

    const variantUrl = buildResourcePath(resourceUrl, featureVariant, wasmVariant);

    const workerUrl = buildResourcePath(variantUrl, `${MODULE_NAME}.js`);
    const wasmUrl = buildResourcePath(variantUrl, `${MODULE_NAME}.wasm`);
    const dataUrl = buildResourcePath(variantUrl, `${MODULE_NAME}.data`);

    const crossOriginWorkerUrl = await getCrossOriginWorkerURL(workerUrl);

    const imported = (await import(/* @vite-ignore */ crossOriginWorkerUrl)) as {
      default: EmscriptenModuleFactory<BlinkIdWasmModule>;
    };

    const createModule = imported.default;

    // use default memory settings if not provided
    if (initialMemory === undefined || initialMemory === 0) {
      // safari requires a larger initial memory allocation as it often block memory growth
      initialMemory = isIOS() ? 700 : 200;
    }

    const wasmMemory = new WebAssembly.Memory({
      initial: mbToWasmPages(initialMemory),
      maximum: mbToWasmPages(2048),
      shared: isThreadedWasmVariant(wasmVariant),
    });

    // Create progress trackers for each download
    let wasmProgress: DownloadProgress | undefined;
    let dataProgress: DownloadProgress | undefined;

    const updateCombinedProgress = () => {
      if (!wasmProgress || !dataProgress) {
        return;
      }

      progressTracker?.updateWasm(wasmProgress, dataProgress);
    };

    // Wrap each download's progress callback to update the combined progress.
    const wasmProgressCallback = (progress: DownloadProgress) => {
      wasmProgress = progress;
      updateCombinedProgress();
    };

    const dataProgressCallback = (progress: DownloadProgress) => {
      dataProgress = progress;
      updateCombinedProgress();
    };

    const getExpectedSize = (params: {
      fileType: "wasm" | "data";
      variant: WasmVariant;
      buildType?: "full" | "lightweight";
    }) => getWasmFileSize({ ...params, buildType: featureVariant }, sizeManifest);

    // The wasm binary is compiled while it streams in, so its download and compilation overlap with the data package
    // download instead of running after it. Compilation failures surface here, before Emscripten is involved.
    const [compiledWasm, preloadedData] = await Promise.all([
      downloadAndCompileWasm(
        {
          url: wasmUrl,
          fileType: "wasm",
          variant: wasmVariant,
          buildType: featureVariant,
          progressCallback: wasmProgressCallback,
          timeoutMs: resourceDownloadTimeoutMs,
          resourceDescription: "BlinkID Wasm resource",
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
          timeoutMs: resourceDownloadTimeoutMs,
          resourceDescription: "BlinkID data resource",
        },
        getExpectedSize,
      ),
    ]);

    if (wasmProgress && dataProgress) {
      progressTracker?.updateWasm(wasmProgress, dataProgress, true);
    }

    /** https://emscripten.org/docs/api_reference/module.html#module-object */
    this.#wasmModule = await createModule({
      locateFile: (path) => {
        return `${variantUrl}/${path}`;
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
      // Emscripten 6.x's native `-sCROSS_ORIGIN` was evaluated as a replacement
      // for this userspace cross-origin worker workaround but rejected: it is
      // incompatible with our `-sDYNAMIC_EXECUTION=0` (no-eval) CSP hardening.
      mainScriptUrlOrBlob: crossOriginWorkerUrl,
      instantiateWasm: createWasmInstantiator(compiledWasm),
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

  async #prepareOtaResources(
    settings: BlinkIdOtaResourceSettings | undefined,
    hostedResources: BlinkIdOtaResource[],
    resourceDownloadTimeoutMs: number,
    progressTracker?: BlinkIdInitializationProgress,
  ): Promise<(wasmModule: MemFSModule) => string> {
    const otaSettings = resolveOtaSettings(settings);

    let resources: BlinkIdOtaResource[] = hostedResources;
    if (otaSettings.checkForUpdates) {
      try {
        const providerResources = await this.#resolveOtaResourcesFromProvider(
          otaSettings.otaResourceProviderUrl,
          resourceDownloadTimeoutMs,
        );
        resources = selectBlinkIdOtaResources(hostedResources, providerResources);
      } catch (error) {
        if (otaSettings.strict) {
          throw error;
        }

        console.warn("BlinkID OTA provider resources were not loaded. Using hosted resources.", error);
      }
    }

    progressTracker?.setSelectedOtaResources(resources);
    const progressCallback = progressTracker
      ? (filename: string, progress: DownloadProgress) => {
          progressTracker.updateOta(filename, progress);
        }
      : undefined;

    return writeBlinkIdOtaResourcesToMemfsLazy({
      resources,
      directory: BLINK_ID_OTA_RESOURCES_PATH,
      fallbackOnError: !otaSettings.strict,
      ...(progressCallback ? { progressCallback } : {}),
      timeoutMs: resourceDownloadTimeoutMs,
    });
  }

  #resolveHostedOtaResources(
    settings: BlinkIdOtaResourceSettings | undefined,
    resourcesLocation: string,
    resourceDownloadTimeoutMs: number,
  ) {
    const otaSettings = resolveOtaSettings(settings);
    const hostedResourcesLocation =
      otaSettings.resourcesLocation ?? buildResourcePath(resourcesLocation, BLINK_ID_OTA_RESOURCES_DIRECTORY);

    return resolveBlinkIdOtaResourcesFromLocation({
      resourcesLocation: hostedResourcesLocation,
      timeoutMs: resourceDownloadTimeoutMs,
    });
  }

  async #resolveOtaResourcesFromProvider(otaResourceProviderUrl: string, timeoutMs: number) {
    return resolveBlinkIdOtaResources({
      resourceProviderUrl: otaResourceProviderUrl,
      genericVersion: BLINK_ID_RECOGNIZER_VERSION,
      timeoutMs,
    });
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

  /** This method initializes everything. */
  async initBlinkId(settings: BlinkIdWorkerInitSettings, progressCallback?: ProgressStatusCallback) {
    const resourcesPath = new URL("resources/", settings.resourcesLocation).toString();

    this.progressStatusCallback = progressCallback;
    this.#userId = settings.userId;
    const resourceDownloadTimeoutMs = resolveResourceDownloadTimeoutMs(settings.resourceDownloadTimeoutMs);

    const hostedOtaResources = await this.#resolveHostedOtaResources(
      settings.otaResources,
      resourcesPath,
      resourceDownloadTimeoutMs,
    );
    const progressTracker = this.progressStatusCallback
      ? new BlinkIdInitializationProgress(this.progressStatusCallback, hostedOtaResources)
      : undefined;

    const wasmVariant = settings.wasmVariant ?? (await detectWasmFeatures());
    const featureVariant = settings.useLightweightBuild ? "lightweight" : "full";

    const otaResourcesPromise = this.#prepareOtaResources(
      settings.otaResources,
      hostedOtaResources,
      resourceDownloadTimeoutMs,
      progressTracker,
    );

    const loadWasmPromise = this.#loadWasm(
      {
        resourceUrl: resourcesPath,
        wasmVariant,
        featureVariant,
        initialMemory: settings.initialMemory,
        resourceDownloadTimeoutMs,
      },
      progressTracker,
    );

    const [, writeOtaResourcesToMemfs] = await Promise.all([loadWasmPromise, otaResourcesPromise]);

    if (!this.#wasmModule) {
      // we do not flush pinglets here because we don't know if license allows it
      throw new Error("Wasm module not loaded");
    }
    writeOtaResourcesToMemfs(this.#wasmModule);
    progressTracker?.complete();

    // Initialize with license key
    const licenseUnlockResult = this.#wasmModule.initializeWithLicenseKey(settings.licenseKey, settings.userId, false);

    // Queue init pinglet before remote license check; flush only if init fails.
    this.reportPinglet({
      schemaName: "ping.sdk.init.start",
      schemaVersion: "3.0.0",
      sessionNumber: 0,
      data: {
        packageName: self.location.hostname,
        platform: "Emscripten",
        platformDetails: getSdkInitPlatformDetails(settings.useLightweightBuild, wasmVariant),
        product: "BlinkID",
        userId: this.#userId,
        ...getMicroblinkProxyPingFlags(settings.microblinkProxyUrl, licenseUnlockResult),
      },
    });

    if (licenseUnlockResult.licenseError) {
      throw new LicenseError("License unlock error: " + licenseUnlockResult.licenseError);
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
      const shouldUseBaltazarProxy = this.#proxyUrls?.baltazar && licenseUnlockResult.allowBaltazarProxy;

      const baltazarProxyUrl = shouldUseBaltazarProxy ? this.#proxyUrls?.baltazar : undefined;

      if (baltazarProxyUrl) {
        console.debug(`Using Baltazar proxy URL: ${baltazarProxyUrl}`);
      }

      const serverPermissionResponse = baltazarProxyUrl
        ? await obtainNewServerPermission(licenseUnlockResult, baltazarProxyUrl)
        : await obtainNewServerPermission(licenseUnlockResult);

      const serverPermissionResult = this.#wasmModule.submitServerPermission(serverPermissionResponse);

      if (serverPermissionResult?.error) {
        throw new ServerPermissionError("Server unlock error: " + serverPermissionResult.error);
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
   * @param sessionSettings - The options for the session.
   * @returns The session.
   */
  createScanningSession(
    sessionSettings?: BlinkIdSessionSettingsInput,
    options?: BlinkIdCreateScanningSessionOptions,
  ): WorkerScanningSession & ProxyMarked {
    if (!this.#wasmModule) {
      throw new Error("Wasm module not loaded");
    }

    try {
      const session = this.#wasmModule.createScanningSession(sessionSettings ?? {}, this.#userId);

      this.#currentSessionNumber++;

      this.sendPinglets();

      return this.#createProxySession(session, options?.redactionSettingsResolver);
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

  getDefaultRedactionSettings(documentType: DocumentClassInfo): RedactionSettings {
    if (!this.#wasmModule) {
      throw new Error("Wasm module not loaded");
    }
    try {
      return this.#wasmModule.getDefaultRedactionSettings(documentType);
    } catch (error) {
      console.warn("Failed to get default redaction settings:", error);
      this.reportPinglet({
        schemaName: "ping.error",
        schemaVersion: "1.0.0",
        sessionNumber: this.#currentSessionNumber,
        data: {
          errorType: "NonFatal",
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      });
      this.sendPinglets();
      throw new Error("Failed to get default redaction settings", {
        cause: error,
      });
    }
  }

  /**
   * This method creates a proxy session.
   *
   * @param session - The session.
   * @returns The proxy session.
   */
  #createProxySession(
    session: BlinkIdScanningSession,
    redactionSettingsResolver?: RedactionSettingsResolver,
  ): WorkerScanningSession & ProxyMarked {
    this.#activeSession = session;

    /**
     * Cache for document class info and rotation, since it's cleared on each process call, however the classification
     * is immutable across the session lifecycle. TODO: hoist to C++ side to avoid redundant allocations altogether.
     */
    let cachedClassInfo: DocumentClassInfo | null = null;
    let cachedRotation: DocumentRotation | null = null;
    /** This is a custom session that will be proxied it handles the transfer of the image data buffer */
    const customSession: InternalWorkerScanningSession = {
      getResult: async () => {
        try {
          if (!redactionSettingsResolver || !cachedClassInfo) {
            return session.getResult();
          }

          /**
           * The local implementation is synchronous, but consumers call it through Comlink, where proxied functions are
           * exposed as async. So we wrap the value in a promise so the callback matches @type
           * {RedactionSettingsResolver}.
           */
          const getDefaultRedactionSettings = (opts: GetDefaultRedactionSettingsOptions) =>
            Promise.resolve(
              this.getDefaultRedactionSettings({
                country: opts.country,
                region: opts.region,
                documentType: opts.documentType,
                countryName: "",
                isoAlpha2CountryCode: "",
                isoAlpha3CountryCode: "",
                isoNumericCountryCode: "",
              }),
            );

          const resolvedPartialRedactionSettings = await redactionSettingsResolver(
            cachedClassInfo,
            proxy(getDefaultRedactionSettings),
          );

          if (!resolvedPartialRedactionSettings) {
            return session.getResult();
          }

          return session.getResult(
            mergeRedactionSettings(DEFAULT_REDACTION_SETTINGS, resolvedPartialRedactionSettings),
          );
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
              errorMessage: error instanceof Error ? error.message : String(error),
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
            const analysisResult = processResult.inputImageAnalysisResult;

            /**
             * When core signals a potential document swap - the document left the frame (`detection-failed`) or a newly
             * presented document destabilised the classification window (`stability-test-failed`) - drop the cached
             * classification and rotation so we don't reintroduce stale document data for the newly presented
             * document.
             */
            if (
              analysisResult.processingStatus === "detection-failed" ||
              analysisResult.processingStatus === "stability-test-failed"
            ) {
              cachedClassInfo = null;
              cachedRotation = null;
            }

            /** DocumentClassInfo is optional; a defined `type` means the classification is available and can be cached. */
            if (analysisResult.documentClassInfo?.documentType) {
              // cache class info for future use
              cachedClassInfo = analysisResult.documentClassInfo;
            }

            /**
             * Cache rotation, assume that rotation remains the same if document is not detected, i.e. rotation is only
             * updated when detection is successful.
             */
            if (analysisResult.documentRotation !== "not-available") {
              // cache rotation for future use
              cachedRotation = analysisResult.documentRotation;
            }

            if (
              cachedClassInfo &&
              cachedClassInfo.documentType?.rawValue !== analysisResult.documentClassInfo?.documentType?.rawValue
            ) {
              analysisResult.documentClassInfo = cachedClassInfo;
            }

            if (cachedRotation && cachedRotation !== analysisResult.documentRotation) {
              analysisResult.documentRotation = cachedRotation;
            }
          }

          let transferPackage: ProcessResultWithBuffer | BlinkIdSessionErrorWithBuffer;

          try {
            transferPackage = transfer(
              {
                ...processResult,
                arrayBuffer: image.data.buffer,
              },
              [image.data.buffer],
            );
          } catch (error) {
            const frameTransferError = createFrameTransferError("Failed to transfer frame from worker", error);

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
          if (error instanceof Error && error.name === FRAME_TRANSFER_ERROR_NAME) {
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
              errorMessage: error instanceof Error ? error.message : String(error),
              stackTrace: error instanceof Error ? error.stack : undefined,
            },
          });
          this.sendPinglets();
          throw error;
        }
      },
      getScanningStatus: () => {
        try {
          return session.getScanningStatus();
        } catch (error) {
          this.reportPinglet({
            schemaName: "ping.error",
            schemaVersion: "1.0.0",
            sessionNumber: this.#currentSessionNumber,
            data: {
              errorType: "NonFatal",
              errorMessage: error instanceof Error ? error.message : String(error),
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
      getSettings: () => session.getSettings(),
      getResolvedSessionSettings: () => session.getResolvedSessionSettings(),
      getSessionId: () => session.getSessionId(),
      getSessionNumber: () => session.getSessionNumber(),
      resolveCurrentStep: () => {
        try {
          console.debug("BlinkIdWorker: resolveCurrentStep");
          session.resolveCurrentStep();
        } catch (error) {
          this.reportPinglet({
            schemaName: "ping.error",
            schemaVersion: "1.0.0",
            sessionNumber: this.#currentSessionNumber,
            data: {
              errorType: "NonFatal",
              errorMessage: error instanceof Error ? error.message : String(error),
              stackTrace: error instanceof Error ? error.stack : undefined,
            },
          });
          this.sendPinglets();
          throw error;
        }
      },
      reset: () => {
        try {
          session.reset();
          cachedClassInfo = null;
          cachedRotation = null;
        } catch (error) {
          if (!this.#wasmModule) {
            throw error;
          }

          // TODO: map error to pinglet error type
          //   const mappedError = this.#mapSessionError(error);
          this.reportPinglet({
            schemaName: "ping.error",
            schemaVersion: "1.0.0",
            sessionNumber: this.#currentSessionNumber,
            data: {
              errorType: "NonFatal",
              errorMessage: error instanceof Error ? error.message : String(error),
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

  /** This method is called when the worker is terminated. */
  [finalizer]() {
    // console.log("Comlink.finalizer called on proxyWorker");
    // Can't use this as the `proxyWorker` gets randomly GC'd, even if in use
    // self.close();
  }

  /** Terminates the workers and the Wasm runtime. */
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
        console.warn("Failed to delete BlinkId session during terminate:", error);
        if (!this.#wasmModule) {
          return;
        }

        this.reportPinglet({
          schemaName: "ping.error",
          schemaVersion: "1.0.0",
          sessionNumber: this.#currentSessionNumber,
          data: {
            errorType: "NonFatal",
            errorMessage: error instanceof Error ? error.message : String(error),
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
      console.warn("No Wasm module loaded during worker termination. Skipping cleanup.");

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

    while (this.#wasmModule.arePingRequestsInProgress() && Date.now() - startTime < gracePeriod) {
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

/** The BlinkID worker. */
const blinkIdWorker = new BlinkIdWorker();

/** The BlinkID worker proxy. */
expose(blinkIdWorker);

/** The BlinkID worker proxy. */
export type BlinkIdWorkerProxy = Omit<BlinkIdWorker, typeof finalizer>;

/** This is a workaround for the fact that the types are not exported. */
type _BlinkIdScanningResult = BlinkIdScanningResult;

/** This is a workaround for the fact that the types are not exported. */
type _BlinkIdSessionError = BlinkIdSessionError;

/** The process result with buffer. */
export type ProcessResultWithBuffer = BlinkIdProcessResult & {
  arrayBuffer: ArrayBuffer;
};

export type BlinkIdSessionErrorWithBuffer = BlinkIdSessionError & {
  arrayBuffer: ArrayBuffer;
};

/** The worker scanning session. */
export type WorkerScanningSession = Omit<
  BlinkIdScanningSession,
  "process" | "getResult" | "deleteLater" | "isAliasOf"
> & {
  process: (image: ImageData) => ProcessResultWithBuffer | BlinkIdSessionErrorWithBuffer;
  /**
   * Returns the result of the scanning session.
   *
   * Applies resolved redaction settings when a resolver is configured and the document class info is available.
   * Otherwise, SDK defaults apply.
   *
   * @returns The scanning result.
   */
  getResult: () => BlinkIdScanningResult | Promise<BlinkIdScanningResult>;
  /**
   * Gets the scanning status.
   *
   * @returns The scanning status.
   */
  getScanningStatus: () => ScanningStatus;
  /**
   * Gets the settings.
   *
   * @returns The settings.
   */
  getSettings: () => BlinkIdSessionSettings;
  /**
   * Gets the resolved settings used to configure the recognizer.
   *
   * @returns The resolved settings.
   */
  getResolvedSessionSettings: () => BlinkIdSessionSettings;
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

type InternalWorkerScanningSession = WorkerScanningSession & Pick<BlinkIdScanningSession, "deleteLater" | "isAliasOf">;

/**
 * Initialization settings for the BlinkID worker.
 *
 * These settings control how the BlinkID worker is initialized and configured, including resource locations, memory
 * allocation, and build variants.
 */
export type BlinkIdWorkerInitSettings = {
  /**
   * The license key required to unlock and use the BlinkID SDK. This must be a valid license key obtained from
   * Microblink.
   */
  licenseKey: string;

  /**
   * The URL of the Microblink proxy server. This proxy handles requests to Microblink's Baltazar and Ping servers.
   *
   * **Requirements:**
   *
   * - Must be a valid HTTPS URL
   * - The proxy server must implement the expected Microblink API endpoints
   * - This feature is only available if explicitly permitted by your license
   *
   * **Endpoints:**
   *
   * - Ping: `{proxyUrl}/ping`
   * - Baltazar: `{proxyUrl}/api/v2/status/check`
   *
   * @example
   *   "https://your-proxy.example.com";
   */
  microblinkProxyUrl?: string;

  /**
   * The parent directory where the `/resources` directory is hosted. Defaults to `window.location.href`, at the root of
   * the current page.
   */
  resourcesLocation?: string;

  /**
   * Optional browser-only OTA resource settings.
   *
   * Hosted baseline resources are always loaded. Provider update checks are enabled by default; set `checkForUpdates`
   * to `false` to skip the provider.
   */
  otaResources?: BlinkIdOtaResourceSettings;

  /**
   * Maximum time, in milliseconds, without receiving response headers or body data for each Wasm, data, or OTA request.
   *
   * The timer resets whenever data arrives, so this does not limit the total duration of a slow download.
   *
   * @defaultValue `60_000`
   */
  resourceDownloadTimeoutMs?: number;

  /** A unique identifier for the user/session. Used for analytics and tracking purposes. */
  userId: string;

  /** The WebAssembly module variant to use. Different variants may offer different performance/size tradeoffs. */
  wasmVariant?: WasmVariant;

  /**
   * The initial memory allocation for the Wasm module, in megabytes. Larger values may improve performance but increase
   * memory usage.
   */
  initialMemory?: number;

  /**
   * Whether to use the lightweight build of the SDK. Lightweight builds have reduced size but may have limited
   * functionality.
   */
  useLightweightBuild: boolean;
};

/** The load Wasm params. */
export type LoadWasmParams = {
  resourceUrl: string;
  wasmVariant: WasmVariant;
  featureVariant: "full" | "lightweight";
  initialMemory?: number;
  resourceDownloadTimeoutMs: number;
};

/** The progress status callback. */
export type { ProgressStatusCallback } from "./BlinkIdInitializationProgress";
