/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { BiometricsResourceKind, WasmVariant } from "@microblink/biometrics-common";

export type { BiometricsResourceKind } from "@microblink/biometrics-common";

type BiometricsResourceContentKind = "data" | "javascript" | "wasm";

export type BiometricsRuntimeResource = {
  kind: BiometricsResourceKind;
  path: string;
  contentKind: BiometricsResourceContentKind;
};

export type BiometricsWasmResources = Record<
  WasmVariant,
  {
    script: BiometricsRuntimeResource;
    wasm: BiometricsRuntimeResource;
    data: BiometricsRuntimeResource;
  }
>;

export const BIOMETRICS_RUNTIME_RESOURCES = {
  workerScript: {
    kind: "worker-script",
    path: "biometrics-worker.js",
    contentKind: "javascript",
  },
} as const satisfies Record<string, BiometricsRuntimeResource>;

export const BIOMETRICS_WASM_RESOURCES = {
  simd: {
    script: {
      kind: "biometrics-wasm-script",
      path: "simd/biometrics-wasm.js",
      contentKind: "javascript",
    },
    wasm: {
      kind: "biometrics-wasm-binary",
      path: "simd/biometrics-wasm.wasm",
      contentKind: "wasm",
    },
    data: {
      kind: "biometrics-wasm-data",
      path: "simd/biometrics-wasm.data",
      contentKind: "data",
    },
  },
  "simd-threads": {
    script: {
      kind: "biometrics-wasm-script",
      path: "simd-threads/biometrics-wasm.js",
      contentKind: "javascript",
    },
    wasm: {
      kind: "biometrics-wasm-binary",
      path: "simd-threads/biometrics-wasm.wasm",
      contentKind: "wasm",
    },
    data: {
      kind: "biometrics-wasm-data",
      path: "simd-threads/biometrics-wasm.data",
      contentKind: "data",
    },
  },
  "simd-relaxed": {
    script: {
      kind: "biometrics-wasm-script",
      path: "simd-relaxed/biometrics-wasm.js",
      contentKind: "javascript",
    },
    wasm: {
      kind: "biometrics-wasm-binary",
      path: "simd-relaxed/biometrics-wasm.wasm",
      contentKind: "wasm",
    },
    data: {
      kind: "biometrics-wasm-data",
      path: "simd-relaxed/biometrics-wasm.data",
      contentKind: "data",
    },
  },
  "simd-relaxed-threads": {
    script: {
      kind: "biometrics-wasm-script",
      path: "simd-relaxed-threads/biometrics-wasm.js",
      contentKind: "javascript",
    },
    wasm: {
      kind: "biometrics-wasm-binary",
      path: "simd-relaxed-threads/biometrics-wasm.wasm",
      contentKind: "wasm",
    },
    data: {
      kind: "biometrics-wasm-data",
      path: "simd-relaxed-threads/biometrics-wasm.data",
      contentKind: "data",
    },
  },
} as const satisfies BiometricsWasmResources;

export function getBiometricsRuntimeResourceManifest(
  wasmVariant: WasmVariant | undefined,
): readonly BiometricsRuntimeResource[] {
  const commonResources = Object.values(BIOMETRICS_RUNTIME_RESOURCES);

  if (wasmVariant === undefined) {
    return commonResources;
  }

  const wasmResources = BIOMETRICS_WASM_RESOURCES[wasmVariant];

  return [...commonResources, wasmResources.script, wasmResources.wasm, wasmResources.data];
}

function appendResourcePath(base: string, path: string): string {
  const separator = base === "" || base.endsWith("/") ? "" : "/";

  return `${base}${separator}${path}`;
}

export function resolveCaptureResourceBaseUrl(resourcePath?: string): string {
  if (resourcePath) {
    return resourcePath.replace(/\/$/, "");
  }

  if (typeof window === "undefined") {
    return "";
  }

  return new URL("./", window.location.href).href;
}

export function resolveBiometricsWorkerScriptUrl(resourceBaseUrl: string): string {
  return appendResourcePath(resourceBaseUrl, BIOMETRICS_RUNTIME_RESOURCES.workerScript.path);
}

export function resolveRuntimeResourceUrl(resourceBaseUrl: string, path: string): string {
  return appendResourcePath(resourceBaseUrl, path);
}

export function resolveBiometricsResourcesLocation(
  resourcesLocation: string | undefined,
  currentPageLocation: string | undefined,
): string | undefined {
  const baseLocation = resourcesLocation ?? currentPageLocation;

  if (baseLocation === undefined) {
    return undefined;
  }

  const baseUrl =
    currentPageLocation === undefined ? new URL(baseLocation) : new URL(baseLocation, currentPageLocation);

  return new URL("resources/", baseUrl).href;
}
