/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import {
  sanitizeBiometricsResourceUrl,
  selectWasmVariant,
  WASM_VARIANTS,
  type BiometricsResourceKind,
  type WasmCapabilities,
  type WasmVariant,
} from "@microblink/biometrics-common";
import { isWasmVariant } from "@microblink/biometrics-common";
import { isThreadedWasmVariant } from "@microblink/worker-common/wasmVariant";

import { ConfigurationError } from "../error";
import {
  getBiometricsRuntimeResourceManifest,
  resolveBiometricsResourcesLocation,
  resolveRuntimeResourceUrl,
  type BiometricsRuntimeResource,
} from "../resources/resourceManifest";
import { detectMainThreadWasmCapabilities } from "./wasmCapabilityDetection";

const DEFAULT_TIMEOUT_MS = 10_000;

export type BiometricsSupportCheckStatus = "passed" | "failed" | "warning" | "skipped";

export type BiometricsSupportCheckId =
  | "secureContext"
  | "fetch"
  | "worker"
  | "webAssembly"
  | "wasmMinimumFeatures"
  | "wasmThreads"
  | "threadWorker"
  | "sharedMemory"
  | "crossOriginIsolated"
  | "safariThreads"
  | "arrayBufferTransfer"
  | "mediaDevices"
  | "getUserMedia"
  | "camera"
  | "resource";

export type BiometricsSupportCheck = {
  id: BiometricsSupportCheckId;
  status: BiometricsSupportCheckStatus;
  message: string;
  durationMs?: number;
  resource?: {
    kind: BiometricsResourceKind;
    url: string;
  };
};

export type BiometricsSupportReport = {
  supported: boolean;
  checks: readonly BiometricsSupportCheck[];
  /** Variant selected for the checked environment, if minimum WASM features are available. */
  wasmVariant?: WasmVariant;
};

export type CheckBiometricsSupportOptions = {
  resourcesLocation?: string;
  requestCameraPermission?: boolean;
  timeoutMs?: number;
  /** Variant to validate. Omit to select the best supported variant automatically. */
  wasmVariant?: WasmVariant;
};

type Deadline = {
  expiresAt: number;
};

type ResourceWithUrl = BiometricsRuntimeResource & {
  url: string;
};

function monotonicNow(): number {
  return globalThis.performance?.now() ?? Date.now();
}

function durationSince(startedAt: number): number {
  return Math.max(0, monotonicNow() - startedAt);
}

function browserCheck(
  id: BiometricsSupportCheckId,
  isSupported: () => boolean,
  supportedMessage: string,
  unsupportedMessage: string,
): BiometricsSupportCheck {
  const startedAt = monotonicNow();
  let supported = false;

  try {
    supported = isSupported();
  } catch {
    return {
      id,
      status: "failed",
      message: `${unsupportedMessage} The capability check failed.`,
      durationMs: durationSince(startedAt),
    };
  }

  return {
    id,
    status: supported ? "passed" : "failed",
    message: supported ? supportedMessage : unsupportedMessage,
    durationMs: durationSince(startedAt),
  };
}

function checkArrayBufferTransferability(): BiometricsSupportCheck {
  const startedAt = monotonicNow();

  if (typeof MessageChannel === "undefined") {
    return {
      id: "arrayBufferTransfer",
      status: "failed",
      message: "MessageChannel is unavailable.",
      durationMs: durationSince(startedAt),
    };
  }

  let channel: MessageChannel | undefined;

  try {
    channel = new MessageChannel();
    const buffer = new ArrayBuffer(1);
    channel.port1.postMessage(buffer, [buffer]);

    return {
      id: "arrayBufferTransfer",
      status: buffer.byteLength === 0 ? "passed" : "failed",
      message: buffer.byteLength === 0 ? "ArrayBuffer transfer is supported." : "ArrayBuffer transfer is unavailable.",
      durationMs: durationSince(startedAt),
    };
  } catch {
    return {
      id: "arrayBufferTransfer",
      status: "failed",
      message: "ArrayBuffer transfer is unavailable.",
      durationMs: durationSince(startedAt),
    };
  } finally {
    closeMessagePort(channel?.port1);
    closeMessagePort(channel?.port2);
  }
}

function closeMessagePort(port: MessagePort | undefined): void {
  try {
    port?.close();
  } catch {
    return;
  }
}

function getBrowserChecks(): BiometricsSupportCheck[] {
  return [
    browserCheck(
      "secureContext",
      () => globalThis.isSecureContext === true,
      "The page is running in a secure context.",
      "Biometrics requires a secure context.",
    ),
    browserCheck("fetch", () => typeof globalThis.fetch === "function", "Fetch is supported.", "Fetch is unavailable."),
    browserCheck(
      "worker",
      () => typeof globalThis.Worker === "function",
      "Web Workers are supported.",
      "Web Workers are unavailable.",
    ),
    browserCheck(
      "webAssembly",
      () => typeof globalThis.WebAssembly === "object",
      "WebAssembly is supported.",
      "WebAssembly is unavailable.",
    ),
    checkArrayBufferTransferability(),
    browserCheck(
      "mediaDevices",
      () => globalThis.navigator?.mediaDevices !== undefined,
      "Media device APIs are supported.",
      "Media device APIs are unavailable.",
    ),
    browserCheck(
      "getUserMedia",
      () => typeof globalThis.navigator?.mediaDevices?.getUserMedia === "function",
      "Camera access is supported.",
      "Camera access is unavailable.",
    ),
  ];
}

function capabilityCheck(
  id: BiometricsSupportCheckId,
  supported: boolean,
  required: boolean,
  supportedMessage: string,
  unsupportedMessage: string,
): BiometricsSupportCheck {
  return {
    id,
    status: supported ? "passed" : required ? "failed" : "skipped",
    message: supported
      ? supportedMessage
      : required
        ? unsupportedMessage
        : `${unsupportedMessage} The SIMD fallback remains available.`,
  };
}

function getWasmCapabilityChecks(
  capabilities: WasmCapabilities,
  wasmVariant: WasmVariant | undefined,
  configuredVariant: WasmVariant | undefined,
): BiometricsSupportCheck[] {
  const requiresThreads =
    (configuredVariant !== undefined && isThreadedWasmVariant(configuredVariant)) ||
    (wasmVariant !== undefined && isThreadedWasmVariant(wasmVariant));

  return [
    capabilityCheck(
      "wasmMinimumFeatures",
      capabilities.minimumFeatures,
      true,
      "The required WebAssembly features, including SIMD, are supported.",
      "The required WebAssembly features, including SIMD, are unavailable.",
    ),
    capabilityCheck(
      "wasmThreads",
      capabilities.threads,
      requiresThreads,
      "WebAssembly threads are supported.",
      "WebAssembly threads are unavailable.",
    ),
    capabilityCheck(
      "threadWorker",
      capabilities.worker,
      requiresThreads,
      "The required worker APIs are supported.",
      "Worker support is required for multithreaded WebAssembly.",
    ),
    capabilityCheck(
      "sharedMemory",
      capabilities.sharedMemory,
      requiresThreads,
      "Shared WebAssembly memory is supported.",
      "SharedArrayBuffer is unavailable.",
    ),
    capabilityCheck(
      "crossOriginIsolated",
      capabilities.crossOriginIsolated,
      requiresThreads,
      "The page is cross-origin isolated.",
      "Cross-origin isolation is required for multithreaded WebAssembly.",
    ),
    capabilityCheck(
      "safariThreads",
      !capabilities.safari,
      requiresThreads,
      "The browser supports the Biometrics threaded worker topology.",
      "Safari uses the single-threaded SIMD variant.",
    ),
  ];
}

function stopTracks(stream: MediaStream): void {
  let tracks: MediaStreamTrack[];

  try {
    tracks = stream.getTracks();
  } catch {
    return;
  }

  for (const track of tracks) {
    try {
      track.stop();
    } catch {
      continue;
    }
  }
}

async function checkCamera(requestPermission: boolean, deadline: Deadline): Promise<BiometricsSupportCheck> {
  const startedAt = monotonicNow();

  if (!requestPermission) {
    return {
      id: "camera",
      status: "skipped",
      message: "Camera permission and device availability were not requested.",
      durationMs: durationSince(startedAt),
    };
  }

  const mediaDevices = globalThis.navigator?.mediaDevices;

  if (typeof mediaDevices?.getUserMedia !== "function" || typeof mediaDevices.enumerateDevices !== "function") {
    return {
      id: "camera",
      status: "failed",
      message: "Camera permission or device enumeration is unavailable.",
      durationMs: durationSince(startedAt),
    };
  }

  const remainingMs = deadline.expiresAt - monotonicNow();

  if (remainingMs <= 0) {
    return {
      id: "camera",
      status: "failed",
      message: "Camera check exceeded the preflight deadline.",
      durationMs: durationSince(startedAt),
    };
  }

  let timedOut = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const streamPromise = Promise.resolve()
    .then(() => mediaDevices.getUserMedia({ audio: false, video: true }))
    .then((stream) => {
      if (timedOut) {
        stopTracks(stream);
      }

      return stream;
    });

  try {
    const stream = await Promise.race([
      streamPromise,
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          timedOut = true;
          reject(new Error("CAMERA_CHECK_TIMEOUT"));
        }, remainingMs);
      }),
    ]);

    stopTracks(stream);

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }

    const devices = await Promise.race([
      mediaDevices.enumerateDevices(),
      new Promise<never>((_, reject) => {
        const enumerationRemainingMs = deadline.expiresAt - monotonicNow();

        if (enumerationRemainingMs <= 0) {
          reject(new Error("CAMERA_CHECK_TIMEOUT"));

          return;
        }

        timeoutId = setTimeout(() => reject(new Error("CAMERA_CHECK_TIMEOUT")), enumerationRemainingMs);
      }),
    ]);
    const hasCamera = devices.some((device) => device.kind === "videoinput");

    return {
      id: "camera",
      status: hasCamera ? "passed" : "failed",
      message: hasCamera
        ? "Camera permission and a video input device are available."
        : "No video input device is available.",
      durationMs: durationSince(startedAt),
    };
  } catch (error) {
    return {
      id: "camera",
      status: "failed",
      message:
        error instanceof Error && error.message === "CAMERA_CHECK_TIMEOUT"
          ? "Camera check exceeded the preflight deadline."
          : "Camera permission or device enumeration failed.",
      durationMs: durationSince(startedAt),
    };
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

function getMimeType(contentType: string): string {
  return contentType.split(";", 1)[0]?.trim().toLowerCase() ?? "";
}

function isJavaScriptContentType(contentType: string): boolean {
  const mimeType = getMimeType(contentType);

  return (
    mimeType === "application/ecmascript" ||
    mimeType === "application/javascript" ||
    mimeType === "application/x-ecmascript" ||
    mimeType === "application/x-javascript" ||
    mimeType === "text/ecmascript" ||
    mimeType === "text/javascript"
  );
}

function resourceCheck(
  resource: ResourceWithUrl,
  status: BiometricsSupportCheckStatus,
  message: string,
  startedAt: number,
): BiometricsSupportCheck {
  return {
    id: "resource",
    status,
    message,
    durationMs: durationSince(startedAt),
    resource: {
      kind: resource.kind,
      url: sanitizeBiometricsResourceUrl(resource.url),
    },
  };
}

async function checkResource(resource: ResourceWithUrl, deadline: Deadline): Promise<BiometricsSupportCheck> {
  const startedAt = monotonicNow();
  const remainingMs = deadline.expiresAt - startedAt;

  if (remainingMs <= 0) {
    return resourceCheck(resource, "failed", "Resource check exceeded the preflight deadline.", startedAt);
  }

  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    const response = await Promise.race([
      globalThis.fetch(resource.url, {
        method: "HEAD",
        redirect: "follow",
        signal: controller.signal,
      }),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          controller.abort();
          reject(new Error("RESOURCE_CHECK_TIMEOUT"));
        }, remainingMs);
      }),
    ]);

    if (response.status === 405 || response.status === 501) {
      return resourceCheck(resource, "warning", "The server does not support HEAD for this resource.", startedAt);
    }

    if (!response.ok || response.status < 200 || response.status > 299) {
      return resourceCheck(resource, "failed", `Resource returned HTTP ${response.status}.`, startedAt);
    }

    const finalUrl = response.url || resource.url;
    const finalProtocol = new URL(finalUrl).protocol;

    if (finalProtocol !== "http:" && finalProtocol !== "https:") {
      return resourceCheck(resource, "failed", "Resource redirected to an unsupported URL.", startedAt);
    }

    const resolvedResource = { ...resource, url: finalUrl };
    const contentType = response.headers.get("content-type") ?? "";
    const mimeType = getMimeType(contentType);

    if (mimeType === "text/html" || mimeType === "application/xhtml+xml") {
      return resourceCheck(resolvedResource, "failed", "Resource resolved to HTML.", startedAt);
    }

    if (resource.contentKind === "javascript" && !isJavaScriptContentType(contentType)) {
      return resourceCheck(
        resolvedResource,
        "failed",
        "JavaScript resource has an incompatible content type.",
        startedAt,
      );
    }

    if (resource.contentKind === "wasm" && mimeType !== "application/wasm") {
      return resourceCheck(resolvedResource, "warning", "WASM resource has a non-standard content type.", startedAt);
    }

    return resourceCheck(resolvedResource, "passed", "Resource is available.", startedAt);
  } catch (error) {
    return resourceCheck(
      resource,
      "failed",
      (error instanceof Error && error.message === "RESOURCE_CHECK_TIMEOUT") || controller.signal.aborted
        ? "Resource check exceeded the preflight deadline."
        : "Resource request failed.",
      startedAt,
    );
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

function validateOptions(options: CheckBiometricsSupportOptions): number {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  if (options.requestCameraPermission !== undefined && typeof options.requestCameraPermission !== "boolean") {
    throw new ConfigurationError("requestCameraPermission must be a boolean.", "INVALID_CONFIGURATION");
  }

  if (options.resourcesLocation !== undefined && typeof options.resourcesLocation !== "string") {
    throw new ConfigurationError("resourcesLocation must be a string.", "INVALID_CONFIGURATION");
  }

  if (options.wasmVariant !== undefined && !isWasmVariant(options.wasmVariant)) {
    throw new ConfigurationError(`wasmVariant must be one of: ${WASM_VARIANTS.join(", ")}.`, "INVALID_CONFIGURATION");
  }

  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new ConfigurationError("timeoutMs must be a positive finite number.", "INVALID_CONFIGURATION");
  }

  return timeoutMs;
}

function resolveResources(
  resourcesLocation: string | undefined,
  wasmVariant: WasmVariant | undefined,
): ResourceWithUrl[] {
  const currentPageLocation = typeof window === "undefined" ? undefined : window.location.href;
  const resourceBaseUrl = resolveBiometricsResourcesLocation(resourcesLocation, currentPageLocation);

  if (resourceBaseUrl === undefined) {
    return [];
  }

  const protocol = new URL(resourceBaseUrl).protocol;

  if (protocol !== "http:" && protocol !== "https:") {
    throw new ConfigurationError("resourcesLocation must resolve to an HTTP(S) URL.", "INVALID_CONFIGURATION");
  }

  return getBiometricsRuntimeResourceManifest(wasmVariant).map((resource) => ({
    ...resource,
    url: resolveRuntimeResourceUrl(resourceBaseUrl, resource.path),
  }));
}

function unavailableResourceChecks(wasmVariant: WasmVariant | undefined): BiometricsSupportCheck[] {
  return getBiometricsRuntimeResourceManifest(wasmVariant).map((resource) => ({
    id: "resource",
    status: "failed",
    message: "Resource location is unavailable.",
    resource: {
      kind: resource.kind,
      url: "",
    },
  }));
}

export async function checkBiometricsSupport(
  options: CheckBiometricsSupportOptions = {},
): Promise<BiometricsSupportReport> {
  if (typeof options !== "object" || options === null) {
    throw new ConfigurationError("Preflight options must be an object.", "INVALID_CONFIGURATION");
  }

  const timeoutMs = validateOptions(options);
  const deadline = { expiresAt: monotonicNow() + timeoutMs };
  const wasmCapabilities = await detectMainThreadWasmCapabilities();
  const wasmVariant = wasmCapabilities.minimumFeatures
    ? (options.wasmVariant ?? selectWasmVariant(wasmCapabilities))
    : undefined;
  let resources: ResourceWithUrl[];

  try {
    resources = resolveResources(options.resourcesLocation, wasmVariant);
  } catch (error) {
    if (options.resourcesLocation !== undefined) {
      throw new ConfigurationError("resourcesLocation must be a valid HTTP(S) URL.", "INVALID_CONFIGURATION");
    }

    throw error;
  }

  const browserChecks = [
    ...getBrowserChecks(),
    ...getWasmCapabilityChecks(wasmCapabilities, wasmVariant, options.wasmVariant),
  ];
  const cameraCheckPromise = checkCamera(options.requestCameraPermission ?? false, deadline).catch(
    (): BiometricsSupportCheck => ({
      id: "camera",
      status: "failed",
      message: "Camera capability check failed.",
    }),
  );
  const resourceChecksPromise =
    resources.length === 0
      ? Promise.resolve(unavailableResourceChecks(wasmVariant))
      : Promise.all(resources.map((resource) => checkResource(resource, deadline)));
  const [cameraCheckResult, resourceChecks] = await Promise.all([cameraCheckPromise, resourceChecksPromise]);
  const checks = [...browserChecks, cameraCheckResult, ...resourceChecks];

  return {
    supported: checks.every((check) => check.status !== "failed"),
    checks,
    wasmVariant,
  };
}
