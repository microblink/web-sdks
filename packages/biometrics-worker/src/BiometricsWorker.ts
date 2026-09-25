/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { Ping } from "@microblink/analytics/ping";
import type { WasmVariant } from "@microblink/biometrics-common";
import type {
  BiometricsWasmLandmarks,
  BiometricsWasmModule,
  BiometricsWasmModuleFactory,
  BiometricsWasmSession,
  FaceAnalysisResult,
  FaceAnalysisSessionSettings,
  ResetResultPayload,
  ResolvedFaceAnalysisSessionSettings,
} from "@microblink/biometrics-wasm";
import { LoadError, parseLoadErrorFromThrown, resolveFaceAnalysisSessionSettings } from "@microblink/biometrics-wasm";
import sizeManifest from "@microblink/biometrics-wasm/size-manifest.json";
import { buildResourcePath } from "@microblink/worker-common/buildResourcePath";
import { createWasmInstantiator, downloadAndCompileWasm } from "@microblink/worker-common/compileWasm";
import { downloadResourceBuffer, type DownloadProgress } from "@microblink/worker-common/downloadResourceBuffer";
import { LicenseError, ServerPermissionError } from "@microblink/worker-common/errors";
import { getCrossOriginWorkerURL } from "@microblink/worker-common/getCrossOriginWorkerURL";
import { getWasmFileSize } from "@microblink/worker-common/getWasmFileSize";
import { isIOS } from "@microblink/worker-common/isSafari";
import { obtainNewServerPermission } from "@microblink/worker-common/licencing";
import { mbToWasmPages } from "@microblink/worker-common/mbToWasmPages";
import { sanitizeProxyUrls } from "@microblink/worker-common/proxy-url-validator";
import { detectWasmFeatures } from "@microblink/worker-common/wasm-feature-detect";
import { getSdkInitPlatformDetails, isThreadedWasmVariant } from "@microblink/worker-common/wasmVariant";
import { installWorkerCrashReporter } from "@microblink/worker-common/workerCrashReporter";

import { BiometricsWorkerLifecycleError } from "./BiometricsWorkerLifecycleError";
import { PingTransport, resolvePingEndpoint } from "./PingTransport";
import {
  type BiometricsProcessResultWithBuffer,
  transferFaceAnalysisResult,
  transferProcessResult,
} from "./processResultTransferables";

const MODULE_NAME = "biometrics-wasm";

declare const __EMSCRIPTEN_VERSION__: string;

export type { DownloadProgress } from "@microblink/worker-common/downloadResourceBuffer";
export type { WasmVariant } from "@microblink/biometrics-common";

/** Callback for WASM and data-file download progress. */
export type ProgressStatusCallback = (progress: DownloadProgress) => void;

/** Parameters for initializing the Biometrics web worker. */
export interface InitBiometricsParams {
  /** URL to the directory containing WASM resources. */
  resourceUrl: string;
  /** License key used to unlock the core SDK. */
  licenseKey: string;
  /** User identifier included in analytics. */
  userId: string;
  /** Optional license-authorized Ping proxy endpoint. */
  pingProxyUrl?: string;
  /** Session settings for face analysis. */
  settings?: FaceAnalysisSessionSettings;
  /** Initial WASM memory in MB (default: 700 on iOS, 200 otherwise). */
  initialMemory?: number;
  /** WASM variant override. Automatically detected when omitted. */
  wasmVariant?: WasmVariant;
}

/** Error thrown from {@link BiometricsWorker.init} when the core session cannot be created. */
export class BiometricsWorkerLoadError extends Error {
  readonly code: LoadError;

  constructor(code: LoadError, cause?: unknown, message?: string) {
    super(message ?? `Failed to create Biometrics session (LoadError=${LoadError[code]})`, {
      cause,
    });

    this.name = "BiometricsWorkerLoadError";
    this.code = code;
  }
}

function createWasmThreadsSupportError(wasmVariant: WasmVariant, cause?: unknown) {
  return new BiometricsWorkerLoadError(
    LoadError.Unknown,
    cause,
    `Failed to initialize the ${wasmVariant} WASM variant. WebAssembly threads, SharedArrayBuffer, cross-origin isolation, and nested Worker support are required.`,
  );
}

function wrapInitializationError(thrown: unknown, hadModule: boolean): unknown {
  if (
    thrown instanceof BiometricsWorkerLifecycleError ||
    thrown instanceof BiometricsWorkerLoadError ||
    thrown instanceof LicenseError ||
    thrown instanceof ServerPermissionError
  ) {
    return thrown;
  }

  if (hadModule) {
    return new BiometricsWorkerLoadError(parseLoadErrorFromThrown(thrown), thrown);
  }

  return thrown;
}

type Runtime = {
  module: BiometricsWasmModule;
  pingTransport: PingTransport;
  sessionSettings: ResolvedFaceAnalysisSessionSettings;
  userId: string;
};

type SessionRecord = {
  native: BiometricsWasmSession;
  id: string;
  number: number;
};

type InitializationCandidate = {
  pingTransport: PingTransport;
  module?: BiometricsWasmModule;
  nativeInitialized: boolean;
};

type InitializationAttempt = {
  candidate: InitializationCandidate;
};

type Lifecycle =
  | { kind: "cold" }
  | { kind: "initializing"; attempt: InitializationAttempt; promise: Promise<void> }
  | { kind: "running"; runtime: Runtime; session?: SessionRecord }
  | { kind: "closing" }
  | { kind: "closed" };

/** The Biometrics web worker. Loads the WASM module and provides methods for face analysis. */
export class BiometricsWorker {
  #lifecycle: Lifecycle = { kind: "cold" };
  #progressStatusCallback?: ProgressStatusCallback;
  #wasmVariant?: WasmVariant;
  #currentSessionId = "";
  #currentSessionNumber = 0;
  #closePromise?: Promise<void>;
  #cleanupCrashReporter: (() => void) | undefined;

  constructor() {
    this.#cleanupCrashReporter = installWorkerCrashReporter({
      getSessionNumber: () => this.#currentSessionNumber,
      onError: ({ error, sessionNumber }) => {
        this.#reportCrash(error, sessionNumber);
      },
    });
  }

  /**
   * Initialize the WASM module and create a session.
   *
   * @throws {BiometricsWorkerLoadError} When the native session fails to initialize; `error.code` carries the
   *   structured {@link LoadError}.
   */
  init(params: InitBiometricsParams, progressCallback?: ProgressStatusCallback): Promise<void> {
    if (this.#lifecycle.kind === "running") {
      return Promise.resolve();
    }

    if (this.#lifecycle.kind === "initializing") {
      return this.#lifecycle.promise;
    }

    if (this.#lifecycle.kind === "closing" || this.#lifecycle.kind === "closed") {
      return Promise.reject(new BiometricsWorkerLifecycleError("closed"));
    }

    this.#progressStatusCallback = progressCallback;

    const attempt: InitializationAttempt = {
      candidate: { pingTransport: new PingTransport(), nativeInitialized: false },
    };
    const promise = Promise.resolve().then(() => this.#initialize(params, attempt));

    this.#lifecycle = { kind: "initializing", attempt, promise };

    return promise;
  }

  async #initialize(
    {
      resourceUrl,
      licenseKey,
      userId,
      pingProxyUrl,
      settings,
      initialMemory,
      wasmVariant: configuredWasmVariant,
    }: InitBiometricsParams,
    attempt: InitializationAttempt,
  ): Promise<void> {
    try {
      if (!this.#isActiveAttempt(attempt)) {
        throw new BiometricsWorkerLifecycleError("closed");
      }

      let wasmVariant: WasmVariant;

      if (configuredWasmVariant === undefined) {
        try {
          wasmVariant = await detectWasmFeatures();
        } catch (thrown) {
          throw new BiometricsWorkerLoadError(
            LoadError.Unknown,
            thrown,
            "Failed to select a Biometrics WASM variant. The required WebAssembly features, including SIMD, are unavailable.",
          );
        }
      } else {
        wasmVariant = configuredWasmVariant;
      }

      this.#wasmVariant = wasmVariant;

      const variantUrl = buildResourcePath(resourceUrl, wasmVariant);
      const workerUrl = buildResourcePath(variantUrl, `${MODULE_NAME}.js`);
      const wasmUrl = buildResourcePath(variantUrl, `${MODULE_NAME}.wasm`);
      const dataUrl = buildResourcePath(variantUrl, `${MODULE_NAME}.data`);

      const crossOriginWorkerUrl = await getCrossOriginWorkerURL(workerUrl);

      if (!this.#isActiveAttempt(attempt)) {
        throw new BiometricsWorkerLifecycleError("closed");
      }

      const imported = (await import(/* @vite-ignore */ crossOriginWorkerUrl)) as {
        default: BiometricsWasmModuleFactory;
      };

      if (!this.#isActiveAttempt(attempt)) {
        throw new BiometricsWorkerLifecycleError("closed");
      }

      const createModule = imported.default;

      let memoryMb = initialMemory;

      if (memoryMb === undefined || memoryMb === 0) {
        memoryMb = isIOS() ? 700 : 200;
      }

      let wasmMemory: WebAssembly.Memory;

      try {
        wasmMemory = new WebAssembly.Memory({
          initial: mbToWasmPages(memoryMb),
          maximum: mbToWasmPages(2048),
          shared: isThreadedWasmVariant(wasmVariant),
        });
      } catch (thrown) {
        if (isThreadedWasmVariant(wasmVariant)) {
          throw createWasmThreadsSupportError(wasmVariant, thrown);
        }

        throw thrown;
      }

      let wasmProgress: DownloadProgress | undefined;
      let dataProgress: DownloadProgress | undefined;

      let lastProgressUpdate = 0;
      const progressUpdateInterval = 32;

      const throttledCombinedProgress = () => {
        if (!this.#progressStatusCallback) {
          return;
        }

        if (!wasmProgress || !dataProgress) {
          return;
        }

        const totalFinished = wasmProgress.finished && dataProgress.finished;
        const totalLoaded = wasmProgress.loaded + dataProgress.loaded;
        const totalLength = wasmProgress.contentLength + dataProgress.contentLength;

        const combinedPercent = totalFinished ? 100 : Math.min(Math.round((totalLoaded / totalLength) * 100), 100);

        const currentTime = performance.now();
        if (currentTime - lastProgressUpdate < progressUpdateInterval) {
          return;
        }

        lastProgressUpdate = currentTime;

        this.#progressStatusCallback({
          loaded: totalLoaded,
          contentLength: totalLength,
          progress: combinedPercent,
          finished: totalFinished,
        });
      };

      const wasmProgressCallback = (progress: DownloadProgress) => {
        wasmProgress = progress;
        void throttledCombinedProgress();
      };

      const dataProgressCallback = (progress: DownloadProgress) => {
        dataProgress = progress;
        void throttledCombinedProgress();
      };

      const getExpectedSize = (params: { fileType: "wasm" | "data"; variant: WasmVariant }) =>
        getWasmFileSize(params, sizeManifest);

      const [compiledWasm, preloadedData] = await Promise.all([
        downloadAndCompileWasm(
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

      if (!this.#isActiveAttempt(attempt)) {
        throw new BiometricsWorkerLifecycleError("closed");
      }

      if (this.#progressStatusCallback && wasmProgress && dataProgress) {
        const totalLength = wasmProgress.contentLength + dataProgress.contentLength;
        this.#progressStatusCallback({
          loaded: totalLength,
          contentLength: totalLength,
          progress: 100,
          finished: true,
        });
      }

      let module: BiometricsWasmModule;

      try {
        module = await createModule({
          locateFile: (path) => `${variantUrl}/${path}`,
          mainScriptUrlOrBlob: crossOriginWorkerUrl,
          instantiateWasm: createWasmInstantiator(compiledWasm),
          wasmMemory,
          getPreloadedPackage: () => preloadedData,
          noExitRuntime: true,
          onAbort: (what) => {
            this.#reportCrash(what);
          },
          printErr: (message) => {
            console.error(message);

            if (/\babort(ed)?\b/i.test(message)) {
              this.#reportCrash(String(message));
            }
          },
        });
      } catch (thrown) {
        throw new BiometricsWorkerLoadError(parseLoadErrorFromThrown(thrown), thrown);
      }

      const candidate = attempt.candidate;
      candidate.module = module;

      if (!this.#isActiveAttempt(attempt)) {
        throw new BiometricsWorkerLifecycleError("closed");
      }

      const licenseUnlockResult = module.initializeWithLicenseKey(licenseKey, userId, false);

      this.#queuePinglet(
        { module },
        {
          schemaName: "ping.sdk.init.start",
          schemaVersion: "3.0.0",
          sessionNumber: 0,
          data: {
            packageName: self.location.hostname,
            platform: "Emscripten",
            platformDetails: getSdkInitPlatformDetails(false, wasmVariant),
            product: "Biometrics",
            userId,
            pingProxyEnabled:
              pingProxyUrl !== undefined && licenseUnlockResult.allowPingProxy && licenseUnlockResult.hasPing,
            baltazarProxyEnabled: false,
          },
        },
      );

      if (licenseUnlockResult.licenseError) {
        throw new LicenseError(`License unlock error: ${licenseUnlockResult.licenseError}`);
      }

      if (pingProxyUrl) {
        if (!licenseUnlockResult.allowPingProxy || !licenseUnlockResult.hasPing) {
          throw new Error("Ping proxy URL is set but your license doesn't permit Ping proxy usage.");
        }

        candidate.pingTransport.setEndpoint(resolvePingEndpoint(sanitizeProxyUrls(pingProxyUrl).ping));
      }

      if (licenseUnlockResult.unlockResult === "requires-server-permission") {
        const serverPermission = await obtainNewServerPermission(licenseUnlockResult);

        const serverPermissionResult = module.submitServerPermission(serverPermission);

        if (serverPermissionResult?.error) {
          throw new ServerPermissionError(`Server unlock error: ${serverPermissionResult.error}`);
        }
      }

      const sessionSettings = resolveFaceAnalysisSessionSettings(settings);
      module.reportSdkInitialization(userId, __EMSCRIPTEN_VERSION__, navigator.userAgent);
      candidate.nativeInitialized = true;

      if (!this.#isActiveAttempt(attempt)) {
        throw new BiometricsWorkerLifecycleError("closed");
      }

      this.#lifecycle = {
        kind: "running",
        runtime: {
          module,
          pingTransport: candidate.pingTransport,
          sessionSettings,
          userId,
        },
      };
    } catch (thrown) {
      const hadModule = attempt.candidate.module !== undefined;
      this.#rollbackInitialization(attempt);

      if (!this.#isActiveAttempt(attempt)) {
        throw new BiometricsWorkerLifecycleError("closed");
      }

      this.#lifecycle = { kind: "cold" };
      throw wrapInitializationError(thrown, hadModule);
    } finally {
      this.#progressStatusCallback = undefined;
    }
  }

  /** Create a fresh native session for one capture session. */
  startSession(settings?: FaceAnalysisSessionSettings): void {
    const runtime = this.#requireRuntime();
    const sessionSettings = resolveFaceAnalysisSessionSettings(settings, runtime.sessionSettings);

    const previousSession = this.#lifecycle.kind === "running" ? this.#lifecycle.session : undefined;

    this.#lifecycle = { kind: "running", runtime };
    this.#deleteSession(previousSession?.native);
    this.#flushPinglets(runtime);

    let session: BiometricsWasmSession | undefined;

    try {
      session = runtime.module.createBiometricsWasmSession(sessionSettings, runtime.userId);
      const record: SessionRecord = {
        native: session,
        id: session.getSessionId(),
        number: session.getSessionNumber(),
      };
      this.#currentSessionId = record.id;
      this.#currentSessionNumber = record.number;
      this.#lifecycle = { kind: "running", runtime, session: record };
    } catch (error) {
      this.#deleteSession(session);
      this.#flushPinglets(runtime);

      throw error;
    }

    this.#flushPinglets(runtime);
  }

  endSession(): void {
    if (this.#lifecycle.kind !== "running" || !this.#lifecycle.session) {
      return;
    }

    const { runtime, session } = this.#lifecycle;

    this.#lifecycle = { kind: "running", runtime };
    this.#deleteSession(session.native);
    this.#flushPinglets(runtime);
  }

  /** Process a single frame. */
  process(
    imageData: ImageData,
    landmarks?: BiometricsWasmLandmarks,
    signalBatch?: Uint8Array<ArrayBuffer>,
  ): BiometricsProcessResultWithBuffer {
    const session = this.#requireSession();
    const result = session.process(imageData, landmarks, signalBatch);

    return transferProcessResult(result, imageData.data.buffer);
  }

  finalizeCaptureMetadata(finalSignalBatch: Uint8Array<ArrayBuffer>): string | null {
    try {
      return this.#requireSession().finalizeCaptureMetadata(finalSignalBatch);
    } catch {
      return null;
    }
  }

  /** Get the current face analysis result. */
  getResult(): FaceAnalysisResult {
    return transferFaceAnalysisResult(this.#requireSession().getResult());
  }

  /** Echoes back the resolved session settings used by the active session. */
  getSettings(): ResolvedFaceAnalysisSessionSettings {
    return this.#requireSession().getSettings();
  }

  /** Returns the current session's UUID. */
  getSessionId(): string {
    return this.#currentSessionId;
  }

  /** Returns the trace identifier shared by all analytics events in this SDK lifecycle. */
  getTraceId(): string {
    return this.#requireRuntime().module.traceId();
  }

  /** Returns the monotonic session number used to correlate telemetry with sibling Microblink scanners. */
  getSessionNumber(): number {
    return this.#currentSessionNumber;
  }

  getWasmVariant(): WasmVariant | undefined {
    return this.#wasmVariant;
  }

  /** Reset the session for a new capture. */
  reset(): ResetResultPayload {
    return this.#requireSession().reset();
  }

  ping(pinglet: Ping): void {
    this.#queuePinglet(this.#requireRuntime(), pinglet);
  }

  sendPinglets(): void {
    if (this.#lifecycle.kind === "running") {
      this.#flushPinglets(this.#lifecycle.runtime);
    } else if (this.#lifecycle.kind === "initializing") {
      this.#flushPinglets(this.#lifecycle.attempt.candidate);
    }
  }

  /** Clean up resources. */
  close(gracePeriodMs = 5_000): Promise<void> {
    if (this.#closePromise) {
      return this.#closePromise;
    }

    const lifecycle = this.#lifecycle;

    this.#lifecycle = { kind: "closing" };
    this.#closePromise = this.#close(lifecycle, Date.now() + gracePeriodMs);

    return this.#closePromise;
  }

  async #close(lifecycle: Lifecycle, deadline: number): Promise<void> {
    try {
      if (lifecycle.kind === "initializing") {
        await Promise.race([
          lifecycle.promise.catch(() => undefined),
          new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, deadline - Date.now()))),
        ]);
      } else if (lifecycle.kind === "running") {
        await this.#cleanupRuntime(lifecycle.runtime, lifecycle.session, deadline);
      }
    } catch (error) {
      console.warn("Failed to gracefully close Biometrics worker:", error);
    } finally {
      this.#cleanupCrashReporter?.();
      this.#cleanupCrashReporter = undefined;
      this.#lifecycle = { kind: "closed" };
    }
  }

  #requireSession(): BiometricsWasmSession {
    const lifecycle = this.#requireRunningLifecycle();

    if (!lifecycle.session) {
      throw new BiometricsWorkerLifecycleError("no-active-session");
    }

    return lifecycle.session.native;
  }

  #requireRuntime(): Runtime {
    return this.#requireRunningLifecycle().runtime;
  }

  #requireRunningLifecycle(): Extract<Lifecycle, { kind: "running" }> {
    switch (this.#lifecycle.kind) {
      case "running":
        return this.#lifecycle;
      case "cold":
        throw new BiometricsWorkerLifecycleError("not-initialized");
      case "initializing":
        throw new BiometricsWorkerLifecycleError("initializing");
      case "closing":
      case "closed":
        throw new BiometricsWorkerLifecycleError("closed");
    }
  }

  #crashPingTarget(): { module: BiometricsWasmModule; pingTransport: PingTransport } | undefined {
    if (this.#lifecycle.kind === "running") {
      return this.#lifecycle.runtime;
    }

    if (this.#lifecycle.kind === "initializing") {
      const { module, pingTransport } = this.#lifecycle.attempt.candidate;

      if (module) {
        return { module, pingTransport };
      }
    }

    return undefined;
  }

  #reportCrash(error: unknown, sessionNumber = this.#currentSessionNumber): void {
    const target = this.#crashPingTarget();

    if (!target) {
      return;
    }

    this.#queuePinglet(target, {
      schemaName: "ping.error",
      schemaVersion: "1.0.0",
      sessionNumber,
      data: {
        errorType: "Crash",
        errorMessage: error instanceof Error ? error.message : String(error),
        stackTrace: error instanceof Error ? error.stack : undefined,
      },
    });
    this.#flushPinglets(target);
  }

  #isActiveAttempt(attempt: InitializationAttempt): boolean {
    return this.#lifecycle.kind === "initializing" && this.#lifecycle.attempt === attempt;
  }

  #queuePinglet(runtime: Pick<Runtime, "module">, pinglet: Ping): void {
    try {
      const result = runtime.module.queuePinglet(
        JSON.stringify(pinglet.data),
        pinglet.schemaName,
        pinglet.schemaVersion,
        pinglet.sessionNumber ?? this.#currentSessionNumber,
      );

      if (!result.success) {
        console.warn("Failed to queue Biometrics pinglet:", result.error);
      }
    } catch (error) {
      console.warn("Failed to queue Biometrics pinglet:", error);
    }
  }

  #flushPinglets(runtime?: { module?: BiometricsWasmModule; pingTransport: PingTransport }): void {
    try {
      if (!runtime?.module?.getActiveLicenseTokenInfo().hasPing) {
        return;
      }

      const { payload, pingletCount } = runtime.module.flushPinglets();

      if (pingletCount > 0) {
        runtime.pingTransport.send(payload);
      }
    } catch (error) {
      console.warn("Failed to send Biometrics pinglets:", error);
    }
  }

  #deleteSession(session?: BiometricsWasmSession): void {
    if (!session) {
      return;
    }

    try {
      session.delete();
    } catch (error) {
      console.warn("Failed to end Biometrics session:", error);
    }
  }

  #rollbackInitialization(attempt: InitializationAttempt): void {
    const candidate = attempt.candidate;

    if (candidate.nativeInitialized) {
      try {
        candidate.module?.reportSdkTermination();
      } catch (error) {
        console.warn("Failed to report Biometrics SDK termination:", error);
      }
    }

    this.#flushPinglets(candidate);
  }

  async #cleanupRuntime(runtime: Runtime, session: SessionRecord | undefined, deadline: number): Promise<void> {
    this.#deleteSession(session?.native);
    this.#flushPinglets(runtime);

    try {
      runtime.module.reportSdkTermination();
    } catch (error) {
      console.warn("Failed to report Biometrics SDK termination:", error);
    }

    this.#flushPinglets(runtime);

    try {
      await runtime.pingTransport.waitForIdle(deadline);
    } catch (error) {
      console.warn("Failed to wait for Biometrics pinglets:", error);
    }
  }
}
