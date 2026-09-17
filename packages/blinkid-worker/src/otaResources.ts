/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { MemFSModule } from "@microblink/blinkid-wasm";
import { buildResourcePath } from "@microblink/worker-common/buildResourcePath";
import { fetchWithInactivityTimeout, type DownloadProgress } from "@microblink/worker-common/downloadResourceBuffer";

const OTA_VERSIONS_ENDPOINT = "api/v1/versions";
const OTA_VERSIONS_PATH_SUFFIX = "/api/v1/versions";

export const BLINK_ID_OTA_RESOURCES_PATH = "/microblink/blinkid-ota";
export const BLINK_ID_OTA_RESOURCES_DIRECTORY = "ota-resources";
export const BLINK_ID_OTA_RESOURCES_MANIFEST_FILENAME = "ota-resources.json";

export type BlinkIdOtaVersionsResponse = {
  generic_version: string;
  embedder_engine: BlinkIdOtaEngineEntry;
  template_engine: BlinkIdOtaEngineEntry;
  document_knowledge_engine: BlinkIdOtaEngineEntry;
};

type BlinkIdOtaEngineField = Exclude<keyof BlinkIdOtaVersionsResponse, "generic_version">;

const OTA_RESOURCE_FILENAMES: Record<BlinkIdOtaEngineField, string> = {
  embedder_engine: "serialized-embedder-database.bin",
  template_engine: "template-database.zzip",
  document_knowledge_engine: "knowledge-database.zzip",
};
const REQUIRED_OTA_RESOURCE_FILENAMES = new Set(Object.values(OTA_RESOURCE_FILENAMES));

export type BlinkIdOtaEngineEntry = {
  latest_version: string;
  db_download_link: string;
  db_file_name?: string;
  db_filename?: string;
  filename?: string;
};

export type BlinkIdOtaResource = {
  filename: string;
  url: string;
  version: string;
  contentLength?: number;
  fallbackUrl?: string;
};

export type BlinkIdOtaResourcesManifest = {
  resources: BlinkIdOtaResourcesManifestEntry[];
};

export type BlinkIdOtaResourcesManifestEntry = {
  filename: string;
  version: string;
  url: string;
  contentLength: number;
};

type UntrustedBlinkIdOtaResourcesManifest = {
  resources?: (Partial<BlinkIdOtaResourcesManifestEntry> | null)[];
};

export type BlinkIdOtaMemfsInspection = {
  directory: string;
  fsAvailable: boolean;
  directoryEntries?: string[];
  directoryError?: string;
  files: BlinkIdOtaMemfsFileInspection[];
};

export type BlinkIdOtaMemfsFileInspection = {
  filename: string;
  path: string;
  exists: boolean;
  size?: number;
  firstBytesHex?: string;
  firstBytesAscii?: string;
  error?: string;
};

export type ResolveBlinkIdOtaResourcesParams = {
  resourceProviderUrl: string;
  genericVersion: string;
  fetchFn?: typeof fetch;
  timeoutMs?: number;
};

export type ResolveBlinkIdOtaResourcesFromLocationParams = {
  resourcesLocation: string;
  fetchFn?: typeof fetch;
  timeoutMs?: number;
};

export type WriteBlinkIdOtaResourcesParams = {
  module: MemFSModule;
  resources: BlinkIdOtaResource[];
  directory?: string;
  fetchFn?: typeof fetch;
  fallbackOnError?: boolean;
  progressCallback?: (filename: string, progress: DownloadProgress) => void;
  timeoutMs?: number;
};

export type WriteBlinkIdOtaResourcesParamsLazy = Omit<WriteBlinkIdOtaResourcesParams, "module">;

export type InspectBlinkIdOtaMemfsParams = {
  module: MemFSModule;
  resources: BlinkIdOtaResource[];
  directory?: string;
};

export function normalizeOtaResourceProviderUrl(resourceProviderUrl: string): string {
  const trimmed = resourceProviderUrl.trim().replace(/\/+$/, "");

  if (trimmed.endsWith(OTA_VERSIONS_PATH_SUFFIX)) {
    return trimmed.slice(0, -OTA_VERSIONS_PATH_SUFFIX.length).replace(/\/+$/, "");
  }

  return trimmed;
}

export async function resolveBlinkIdOtaResourcesFromLocation({
  resourcesLocation,
  fetchFn = fetch,
  timeoutMs,
}: ResolveBlinkIdOtaResourcesFromLocationParams): Promise<BlinkIdOtaResource[]> {
  const normalizedResourcesLocation = resourcesLocation.trim().replace(/\/+$/, "");

  if (!normalizedResourcesLocation) {
    throw new Error("BlinkID OTA resources location is empty");
  }

  const manifestUrl = buildResourcePath(normalizedResourcesLocation, BLINK_ID_OTA_RESOURCES_MANIFEST_FILENAME);

  const response = await fetchWithInactivityTimeout({
    url: manifestUrl,
    resourceDescription: "BlinkID OTA resources manifest",
    timeoutMs,
    fetchFn,
  });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`Failed to resolve BlinkID OTA resources manifest: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as UntrustedBlinkIdOtaResourcesManifest;

  if (!Array.isArray(payload.resources) || payload.resources.length === 0) {
    throw new Error("BlinkID OTA resources manifest is missing resources");
  }

  const resources = payload.resources.map((entry, index) =>
    resourceFromManifestEntry(entry ?? undefined, index, normalizedResourcesLocation),
  );
  validateHostedOtaResources(resources);

  return resources;
}

export function selectBlinkIdOtaResources(
  hostedResources: BlinkIdOtaResource[],
  providerResources: BlinkIdOtaResource[],
): BlinkIdOtaResource[] {
  const providerResourcesByFilename = new Map(providerResources.map((resource) => [resource.filename, resource]));

  return hostedResources.map((hostedResource) => {
    const providerResource = providerResourcesByFilename.get(hostedResource.filename);

    if (!providerResource || compareSemver(providerResource.version, hostedResource.version) <= 0) {
      return hostedResource;
    }

    return {
      ...providerResource,
      ...(hostedResource.contentLength === undefined ? {} : { contentLength: hostedResource.contentLength }),
      fallbackUrl: hostedResource.url,
    };
  });
}

export async function resolveBlinkIdOtaResources({
  resourceProviderUrl,
  genericVersion,
  fetchFn = fetch,
  timeoutMs,
}: ResolveBlinkIdOtaResourcesParams): Promise<BlinkIdOtaResource[]> {
  const normalizedProviderUrl = normalizeOtaResourceProviderUrl(resourceProviderUrl);
  const url = new URL(
    OTA_VERSIONS_ENDPOINT,
    normalizedProviderUrl.endsWith("/") ? normalizedProviderUrl : `${normalizedProviderUrl}/`,
  );
  url.searchParams.set("generic_version", genericVersion);

  const response = await fetchWithInactivityTimeout({
    url: url.toString(),
    resourceDescription: "BlinkID OTA provider response",
    timeoutMs,
    fetchFn,
  });

  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`Failed to resolve BlinkID OTA resources: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as Partial<BlinkIdOtaVersionsResponse>;

  return [
    resourceFromEntry(payload.embedder_engine, "embedder_engine"),
    resourceFromEntry(payload.template_engine, "template_engine"),
    resourceFromEntry(payload.document_knowledge_engine, "document_knowledge_engine"),
  ];
}

export async function writeBlinkIdOtaResourcesToMemfs({
  module,
  ...params
}: WriteBlinkIdOtaResourcesParams): Promise<string> {
  const writeToMemfs = await writeBlinkIdOtaResourcesToMemfsLazy(params);
  return writeToMemfs(module);
}

export async function writeBlinkIdOtaResourcesToMemfsLazy({
  resources,
  directory = BLINK_ID_OTA_RESOURCES_PATH,
  fetchFn = fetch,
  fallbackOnError = false,
  progressCallback,
  timeoutMs,
}: WriteBlinkIdOtaResourcesParamsLazy): Promise<(wasmModule: MemFSModule) => string> {
  const files = await Promise.all(
    resources.map(async (resource) => {
      let lastReportedProgress = 0;
      const reportProgress = progressCallback
        ? (progress: DownloadProgress) => {
            lastReportedProgress = Math.max(lastReportedProgress, progress.progress);
            progressCallback(resource.filename, {
              ...progress,
              progress: lastReportedProgress,
            });
          }
        : undefined;
      const download = await prepareOtaResourceDownload({
        resource,
        fetchFn,
        fallbackOnError,
        timeoutMs,
      });
      reportOtaResponseStart(download.response, reportProgress, download.resource.contentLength);
      const buffer = await downloadPreparedOtaResource({
        download,
        fetchFn,
        fallbackOnError,
        progressCallback: reportProgress,
        timeoutMs,
      });
      const data = new Uint8Array(buffer);
      return {
        data,
        resource: download.resource,
      };
    }),
  );

  return (module) => {
    createDirectory(module, directory);

    for (const { data, resource } of files) {
      writeFile(module, directory, resource.filename, data);
      assertWrittenFileReadable(module, `${directory}/${resource.filename}`, data.byteLength);
      progressCallback?.(resource.filename, {
        loaded: data.byteLength,
        contentLength: data.byteLength,
        progress: 100,
        finished: true,
      });
    }

    return directory;
  };
}

type PreparedOtaResourceDownload = {
  resource: BlinkIdOtaResource;
  response: Response;
  usingFallback: boolean;
};

export function inspectBlinkIdOtaMemfs({
  module,
  resources,
  directory = BLINK_ID_OTA_RESOURCES_PATH,
}: InspectBlinkIdOtaMemfsParams): BlinkIdOtaMemfsInspection {
  const inspection: BlinkIdOtaMemfsInspection = {
    directory,
    fsAvailable: Boolean(module.FS),
    files: [],
  };

  if (!module.FS) {
    inspection.directoryError = "Loaded BlinkID Wasm module does not expose the Emscripten FS object";
    return inspection;
  }

  try {
    inspection.directoryEntries = module.FS.readdir?.(directory);
  } catch (error) {
    inspection.directoryError = errorToString(error);
  }

  for (const resource of resources) {
    const path = `${directory}/${resource.filename}`;
    inspection.files.push(inspectMemfsFile(module, resource.filename, path));
  }

  return inspection;
}

async function prepareOtaResourceDownload({
  resource,
  fetchFn,
  fallbackOnError,
  timeoutMs,
}: {
  resource: BlinkIdOtaResource;
  fetchFn: typeof fetch;
  fallbackOnError: boolean;
  timeoutMs?: number;
}): Promise<PreparedOtaResourceDownload> {
  try {
    return {
      resource,
      response: await fetchOtaResourceResponse(resource.filename, resource.url, fetchFn, timeoutMs),
      usingFallback: false,
    };
  } catch (error) {
    if (!fallbackOnError || !resource.fallbackUrl) {
      throw error;
    }

    warnAboutOtaFallback(resource.filename, error);

    return {
      resource,
      response: await fetchOtaResourceResponse(resource.filename, resource.fallbackUrl, fetchFn, timeoutMs),
      usingFallback: true,
    };
  }
}

async function downloadPreparedOtaResource({
  download,
  fetchFn,
  fallbackOnError,
  progressCallback,
  timeoutMs,
}: {
  download: PreparedOtaResourceDownload;
  fetchFn: typeof fetch;
  fallbackOnError: boolean;
  progressCallback?: (progress: DownloadProgress) => void;
  timeoutMs?: number;
}): Promise<ArrayBuffer> {
  try {
    return await readAndValidateOtaResource(
      download.resource.filename,
      download.response,
      progressCallback,
      download.resource.contentLength,
    );
  } catch (error) {
    if (download.usingFallback || !fallbackOnError || !download.resource.fallbackUrl) {
      throw error;
    }

    warnAboutOtaFallback(download.resource.filename, error);

    const fallbackResponse = await fetchOtaResourceResponse(
      download.resource.filename,
      download.resource.fallbackUrl,
      fetchFn,
      timeoutMs,
    );
    reportOtaResponseStart(fallbackResponse, progressCallback, download.resource.contentLength);
    return readAndValidateOtaResource(
      download.resource.filename,
      fallbackResponse,
      progressCallback,
      download.resource.contentLength,
    );
  }
}

async function fetchOtaResourceResponse(
  filename: string,
  url: string,
  fetchFn: typeof fetch,
  timeoutMs?: number,
): Promise<Response> {
  const response = await fetchWithInactivityTimeout({
    url,
    resourceDescription: `BlinkID OTA resource ${filename}`,
    timeoutMs,
    fetchFn,
  });

  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`Failed to download BlinkID OTA resource ${filename}: ${response.status} ${response.statusText}`);
  }

  return response;
}

async function readAndValidateOtaResource(
  filename: string,
  response: Response,
  progressCallback: ((progress: DownloadProgress) => void) | undefined,
  expectedContentLength?: number,
): Promise<ArrayBuffer> {
  const buffer = await readOtaResourceResponse(response, progressCallback, expectedContentLength);
  if (buffer.byteLength === 0) {
    throw new Error(`Failed to download BlinkID OTA resource ${filename}: empty response body`);
  }

  return buffer;
}

function reportOtaResponseStart(
  response: Response,
  progressCallback: ((progress: DownloadProgress) => void) | undefined,
  expectedContentLength?: number,
) {
  if (!progressCallback) {
    return;
  }

  progressCallback({
    loaded: 0,
    contentLength: getOtaResponseContentLength(response, expectedContentLength),
    progress: 0,
    finished: false,
  });
}

async function readOtaResourceResponse(
  response: Response,
  progressCallback: ((progress: DownloadProgress) => void) | undefined,
  expectedContentLength?: number,
): Promise<ArrayBuffer> {
  if (!progressCallback || !response.body) {
    return response.arrayBuffer();
  }

  const contentLength = getOtaResponseContentLength(response, expectedContentLength);
  let loaded = 0;

  const transformStream = new TransformStream({
    transform(chunk: Uint8Array, controller) {
      loaded += chunk.byteLength;
      progressCallback({
        loaded,
        contentLength,
        progress: contentLength > 0 ? Math.min(Math.round((loaded / contentLength) * 100), 100) : 0,
        finished: false,
      });
      controller.enqueue(chunk);
    },
  });

  return new Response(response.body.pipeThrough(transformStream), response).arrayBuffer();
}

function getOtaResponseContentLength(response: Response, fallback = 0): number {
  const contentLengthHeader = response.headers?.get?.("Content-Length");
  const parsedContentLength = contentLengthHeader ? Number.parseInt(contentLengthHeader, 10) : 0;
  return Number.isFinite(parsedContentLength) && parsedContentLength > 0 ? parsedContentLength : fallback;
}

function warnAboutOtaFallback(filename: string, error: unknown) {
  console.warn(`BlinkID OTA provider resource ${filename} was not loaded. Falling back to the hosted resource.`, error);
}

function resourceFromEntry(
  entry: Partial<BlinkIdOtaEngineEntry> | undefined,
  field: BlinkIdOtaEngineField,
): BlinkIdOtaResource {
  const url = requireDownloadLink(entry, field);

  return {
    filename: OTA_RESOURCE_FILENAMES[field],
    version: requireVersion(entry, field),
    url,
  };
}

function resourceFromManifestEntry(
  entry: Partial<BlinkIdOtaResourcesManifestEntry> | undefined,
  index: number,
  resourcesLocation: string,
): BlinkIdOtaResource {
  const filename = extractFilename(entry?.filename);

  if (!filename) {
    throw new Error(`BlinkID OTA resources manifest entry ${index} is missing filename`);
  }

  const version = entry?.version?.trim();
  if (!version) {
    throw new Error(`BlinkID OTA resources manifest entry ${index} is missing version`);
  }
  const contentLength = entry?.contentLength;
  if (contentLength === undefined) {
    throw new Error(`BlinkID OTA resources manifest entry ${index} is missing contentLength`);
  }
  if (!Number.isSafeInteger(contentLength) || contentLength <= 0) {
    throw new Error(`BlinkID OTA resources manifest entry ${index} has invalid contentLength`);
  }

  return {
    filename,
    version,
    url: resolveManifestResourceUrl(resourcesLocation, filename, entry?.url),
    contentLength,
  };
}

function validateHostedOtaResources(resources: BlinkIdOtaResource[]) {
  const seenFilenames = new Set<string>();

  for (const resource of resources) {
    if (!REQUIRED_OTA_RESOURCE_FILENAMES.has(resource.filename)) {
      throw new Error(`BlinkID OTA resources manifest contains unexpected resource ${resource.filename}`);
    }

    if (seenFilenames.has(resource.filename)) {
      throw new Error(`BlinkID OTA resources manifest contains duplicate resource ${resource.filename}`);
    }

    seenFilenames.add(resource.filename);
  }

  const missingFilenames = [...REQUIRED_OTA_RESOURCE_FILENAMES].filter((filename) => !seenFilenames.has(filename));
  if (missingFilenames.length > 0) {
    throw new Error(`BlinkID OTA resources manifest is missing required resources: ${missingFilenames.join(", ")}`);
  }
}

function resolveManifestResourceUrl(resourcesLocation: string, filename: string, url: string | undefined): string {
  const trimmedUrl = url?.trim();

  if (!trimmedUrl) {
    return buildResourcePath(resourcesLocation, filename);
  }

  if (isAbsoluteUrl(trimmedUrl)) {
    return trimmedUrl;
  }

  return buildResourcePath(resourcesLocation, trimmedUrl);
}

function isAbsoluteUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function requireDownloadLink(entry: Partial<BlinkIdOtaEngineEntry> | undefined, field: BlinkIdOtaEngineField): string {
  const downloadLink = entry?.db_download_link;

  if (!downloadLink) {
    throw new Error(`BlinkID OTA response is missing ${field}.db_download_link`);
  }

  return downloadLink;
}

function requireVersion(entry: Partial<BlinkIdOtaEngineEntry> | undefined, field: BlinkIdOtaEngineField): string {
  const version = entry?.latest_version?.trim();

  if (!version) {
    throw new Error(`BlinkID OTA response is missing ${field}.latest_version`);
  }

  return version;
}

function compareSemver(left: string, right: string): number {
  const leftParts = parseSemver(left);
  const rightParts = parseSemver(right);

  for (let index = 0; index < leftParts.length; index++) {
    const difference = leftParts[index] - rightParts[index];
    if (difference !== 0) {
      return difference;
    }
  }

  return 0;
}

function parseSemver(version: string): [number, number, number] {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(`Invalid BlinkID OTA resource version: ${version}`);
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function extractFilename(value: string | undefined): string | undefined {
  const filename = value?.split(/[\\/]/).filter(Boolean).at(-1)?.trim();

  if (!filename || filename === "." || filename === "..") {
    return undefined;
  }

  return filename;
}

function createDirectory(module: MemFSModule, directory: string) {
  if (typeof module.FS?.mkdirTree === "function") {
    module.FS.mkdirTree(directory);
    return;
  }

  if (!module.FS_createPath) {
    throw new Error("Loaded BlinkID Wasm module does not expose Emscripten filesystem path creation");
  }

  const segments = directory.split("/").filter(Boolean);
  let parent = "/";

  for (const segment of segments) {
    try {
      module.FS_createPath(parent, segment, true, true);
    } catch {
      // Emscripten throws if the path already exists. The bundled data package
      // already creates /microblink, so existing path segments are expected.
    }
    parent = parent === "/" ? `/${segment}` : `${parent}/${segment}`;
  }
}

function writeFile(module: MemFSModule, directory: string, filename: string, data: Uint8Array) {
  if (typeof module.FS?.writeFile === "function") {
    module.FS.writeFile(`${directory}/${filename}`, data);
    return;
  }

  if (!module.FS_createDataFile) {
    throw new Error("Loaded BlinkID Wasm module does not expose Emscripten filesystem file creation");
  }

  try {
    module.FS_unlink?.(`${directory}/${filename}`);
  } catch {
    // Ignore missing files; unlink is only used to make repeated init attempts
    // deterministic when the same worker survives a failed initialization.
  }

  module.FS_createDataFile(directory, filename, data, true, true, true);
}

function assertWrittenFileReadable(module: MemFSModule, path: string, expectedByteLength: number) {
  if (!module.FS?.readFile) {
    return;
  }

  const writtenData = module.FS.readFile(path);
  if (writtenData.byteLength !== expectedByteLength) {
    throw new Error(
      `BlinkID OTA MEMFS write verification failed for ${path}: expected ${expectedByteLength} bytes, got ${writtenData.byteLength}`,
    );
  }
}

function inspectMemfsFile(module: MemFSModule, filename: string, path: string): BlinkIdOtaMemfsFileInspection {
  try {
    const data = module.FS?.readFile?.(path);
    const stat = module.FS?.stat?.(path);

    if (!data) {
      return {
        filename,
        path,
        exists: false,
        error: "Emscripten FS.readFile is not available",
      };
    }

    return {
      filename,
      path,
      exists: true,
      size: stat?.size ?? data.byteLength,
      firstBytesHex: formatBytesAsHex(data),
      firstBytesAscii: formatBytesAsAscii(data),
    };
  } catch (error) {
    return {
      filename,
      path,
      exists: false,
      error: errorToString(error),
    };
  }
}

function formatBytesAsHex(data: Uint8Array, length = 16): string {
  return Array.from(data.slice(0, length), (byte) => byte.toString(16).padStart(2, "0")).join(" ");
}

function formatBytesAsAscii(data: Uint8Array, length = 16): string {
  return Array.from(data.slice(0, length), (byte) =>
    byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : ".",
  ).join("");
}

function errorToString(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
