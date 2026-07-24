/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { buildResourcePath } from "@microblink/worker-common/buildResourcePath";
import { MemFSModule } from "@microblink/blinkid-wasm";

const OTA_VERSIONS_ENDPOINT = "api/v1/versions";
const OTA_VERSIONS_PATH_SUFFIX = "/api/v1/versions";

export const BLINK_ID_OTA_RESOURCES_PATH = "/microblink/blinkid-ota";
export const BLINK_ID_OTA_RESOURCES_DIRECTORY = "ota-resources";
export const BLINK_ID_OTA_RESOURCES_MANIFEST_FILENAME = "ota-resources.json";

const OTA_RESOURCES_DOWNLOAD_TIMEOUT_MILIS = 20_000;

export type BlinkIdOtaVersionsResponse = {
  generic_version: string;
  embedder_engine: BlinkIdOtaEngineEntry;
  template_engine: BlinkIdOtaEngineEntry;
  document_knowledge_engine: BlinkIdOtaEngineEntry;
};

type BlinkIdOtaEngineField = Exclude<
  keyof BlinkIdOtaVersionsResponse,
  "generic_version"
>;

const OTA_RESOURCE_FILENAMES: Record<BlinkIdOtaEngineField, string> = {
  embedder_engine: "serialized-embedder-database.bin",
  template_engine: "template-database.zzip",
  document_knowledge_engine: "knowledge-database.zzip",
};

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
  fallbackUrl?: string;
};

export type BlinkIdOtaResourcesManifest = {
  resources?: BlinkIdOtaResourcesManifestEntry[];
};

export type BlinkIdOtaResourcesManifestEntry = {
  filename?: string;
  version?: string;
  url?: string;
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
  timeoutMilis?: number;
};

export type ResolveBlinkIdOtaResourcesFromLocationParams = {
  resourcesLocation: string;
  fetchFn?: typeof fetch;
  timeoutMilis?: number;
};

export type WriteBlinkIdOtaResourcesParams = {
  module: MemFSModule;
  resources: BlinkIdOtaResource[];
  directory?: string;
  fetchFn?: typeof fetch;
  fallbackOnError?: boolean;
  timeoutMilis?: number;
};

export type InspectBlinkIdOtaMemfsParams = {
  module: MemFSModule;
  resources: BlinkIdOtaResource[];
  directory?: string;
};

export function normalizeOtaResourceProviderUrl(
  resourceProviderUrl: string,
): string {
  const trimmed = resourceProviderUrl.trim().replace(/\/+$/, "");

  if (trimmed.endsWith(OTA_VERSIONS_PATH_SUFFIX)) {
    return trimmed
      .slice(0, -OTA_VERSIONS_PATH_SUFFIX.length)
      .replace(/\/+$/, "");
  }

  return trimmed;
}

export async function resolveBlinkIdOtaResourcesFromLocation({
  resourcesLocation,
  fetchFn = fetch,
  timeoutMilis = OTA_RESOURCES_DOWNLOAD_TIMEOUT_MILIS,
}: ResolveBlinkIdOtaResourcesFromLocationParams): Promise<
  BlinkIdOtaResource[]
> {
  const normalizedResourcesLocation = resourcesLocation
    .trim()
    .replace(/\/+$/, "");

  if (!normalizedResourcesLocation) {
    throw new Error("BlinkID OTA resources location is empty");
  }

  const manifestUrl = buildResourcePath(
    normalizedResourcesLocation,
    BLINK_ID_OTA_RESOURCES_MANIFEST_FILENAME,
  );

  const response = await fetchFn(manifestUrl, {
    signal: createOtaDownloadTimeoutSignal(timeoutMilis),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to resolve BlinkID OTA resources manifest: ${response.status} ${response.statusText}`,
    );
  }

  const payload =
    (await response.json()) as Partial<BlinkIdOtaResourcesManifest>;

  if (!Array.isArray(payload.resources) || payload.resources.length === 0) {
    throw new Error("BlinkID OTA resources manifest is missing resources");
  }

  return payload.resources.map((entry, index) =>
    resourceFromManifestEntry(entry, index, normalizedResourcesLocation),
  );
}

export function selectBlinkIdOtaResources(
  hostedResources: BlinkIdOtaResource[],
  providerResources: BlinkIdOtaResource[],
): BlinkIdOtaResource[] {
  const providerResourcesByFilename = new Map(
    providerResources.map((resource) => [resource.filename, resource]),
  );

  return hostedResources.map((hostedResource) => {
    const providerResource = providerResourcesByFilename.get(
      hostedResource.filename,
    );

    if (
      !providerResource ||
      compareSemver(providerResource.version, hostedResource.version) <= 0
    ) {
      return hostedResource;
    }

    return {
      ...providerResource,
      fallbackUrl: hostedResource.url,
    };
  });
}

export async function resolveBlinkIdOtaResources({
  resourceProviderUrl,
  genericVersion,
  fetchFn = fetch,
  timeoutMilis = OTA_RESOURCES_DOWNLOAD_TIMEOUT_MILIS,
}: ResolveBlinkIdOtaResourcesParams): Promise<BlinkIdOtaResource[]> {
  const normalizedProviderUrl =
    normalizeOtaResourceProviderUrl(resourceProviderUrl);
  const url = new URL(
    OTA_VERSIONS_ENDPOINT,
    normalizedProviderUrl.endsWith("/")
      ? normalizedProviderUrl
      : `${normalizedProviderUrl}/`,
  );
  url.searchParams.set("generic_version", genericVersion);

  const response = await fetchFn(url.toString(), {
    signal: createOtaDownloadTimeoutSignal(timeoutMilis),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to resolve BlinkID OTA resources: ${response.status} ${response.statusText}`,
    );
  }

  const payload =
    (await response.json()) as Partial<BlinkIdOtaVersionsResponse>;

  return [
    resourceFromEntry(payload.embedder_engine, "embedder_engine"),
    resourceFromEntry(payload.template_engine, "template_engine"),
    resourceFromEntry(
      payload.document_knowledge_engine,
      "document_knowledge_engine",
    ),
  ];
}

export async function writeBlinkIdOtaResourcesToMemfs({
  module,
  resources,
  directory = BLINK_ID_OTA_RESOURCES_PATH,
  fetchFn = fetch,
  fallbackOnError = false,
  timeoutMilis = OTA_RESOURCES_DOWNLOAD_TIMEOUT_MILIS,
}: WriteBlinkIdOtaResourcesParams): Promise<string> {
  createDirectory(module, directory);

  await Promise.all(
    resources.map(async (resource) => {
      const buffer = await downloadOtaResource({
        resource,
        fetchFn,
        fallbackOnError,
        timeoutMilis,
      });
      const data = new Uint8Array(buffer);
      writeFile(module, directory, resource.filename, data);
      assertWrittenFileReadable(
        module,
        `${directory}/${resource.filename}`,
        data.byteLength,
      );
    }),
  );

  return directory;
}

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
    inspection.directoryError =
      "Loaded BlinkID Wasm module does not expose the Emscripten FS object";
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

function createOtaDownloadTimeoutSignal(
  timeoutMilis = OTA_RESOURCES_DOWNLOAD_TIMEOUT_MILIS,
) {
  const controller = new AbortController();

  setTimeout(() => {
    controller.abort(new Error("Ota resource download failed"));
  }, timeoutMilis);

  return controller.signal;
}

async function downloadOtaResource({
  resource,
  fetchFn,
  fallbackOnError,
  timeoutMilis,
}: {
  resource: BlinkIdOtaResource;
  fetchFn: typeof fetch;
  fallbackOnError: boolean;
  timeoutMilis: number;
}): Promise<ArrayBuffer> {
  try {
    return await fetchOtaResource(
      resource.filename,
      resource.url,
      fetchFn,
      timeoutMilis,
    );
  } catch (error) {
    if (!fallbackOnError || !resource.fallbackUrl) {
      throw error;
    }

    console.warn(
      `BlinkID OTA provider resource ${resource.filename} was not loaded. Falling back to the hosted resource.`,
      error,
    );

    return fetchOtaResource(
      resource.filename,
      resource.fallbackUrl,
      fetchFn,
      timeoutMilis,
    );
  }
}

async function fetchOtaResource(
  filename: string,
  url: string,
  fetchFn: typeof fetch,
  timeoutMilis: number,
): Promise<ArrayBuffer> {
  const response = await fetchFn(url, {
    signal: createOtaDownloadTimeoutSignal(timeoutMilis),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to download BlinkID OTA resource ${filename}: ${response.status} ${response.statusText}`,
    );
  }

  const buffer = await response.arrayBuffer();
  if (buffer.byteLength === 0) {
    throw new Error(
      `Failed to download BlinkID OTA resource ${filename}: empty response body`,
    );
  }

  return buffer;
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
    throw new Error(
      `BlinkID OTA resources manifest entry ${index} is missing filename`,
    );
  }

  const version = entry?.version?.trim();
  if (!version) {
    throw new Error(
      `BlinkID OTA resources manifest entry ${index} is missing version`,
    );
  }

  return {
    filename,
    version,
    url: resolveManifestResourceUrl(resourcesLocation, filename, entry?.url),
  };
}

function resolveManifestResourceUrl(
  resourcesLocation: string,
  filename: string,
  url: string | undefined,
): string {
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

function requireDownloadLink(
  entry: Partial<BlinkIdOtaEngineEntry> | undefined,
  field: BlinkIdOtaEngineField,
): string {
  const downloadLink = entry?.db_download_link;

  if (!downloadLink) {
    throw new Error(
      `BlinkID OTA response is missing ${field}.db_download_link`,
    );
  }

  return downloadLink;
}

function requireVersion(
  entry: Partial<BlinkIdOtaEngineEntry> | undefined,
  field: BlinkIdOtaEngineField,
): string {
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
    throw new Error(
      "Loaded BlinkID Wasm module does not expose Emscripten filesystem path creation",
    );
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

function writeFile(
  module: MemFSModule,
  directory: string,
  filename: string,
  data: Uint8Array,
) {
  if (typeof module.FS?.writeFile === "function") {
    module.FS.writeFile(`${directory}/${filename}`, data);
    return;
  }

  if (!module.FS_createDataFile) {
    throw new Error(
      "Loaded BlinkID Wasm module does not expose Emscripten filesystem file creation",
    );
  }

  try {
    module.FS_unlink?.(`${directory}/${filename}`);
  } catch {
    // Ignore missing files; unlink is only used to make repeated init attempts
    // deterministic when the same worker survives a failed initialization.
  }

  module.FS_createDataFile(directory, filename, data, true, true, true);
}

function assertWrittenFileReadable(
  module: MemFSModule,
  path: string,
  expectedByteLength: number,
) {
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

function inspectMemfsFile(
  module: MemFSModule,
  filename: string,
  path: string,
): BlinkIdOtaMemfsFileInspection {
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
  return Array.from(data.slice(0, length), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join(" ");
}

function formatBytesAsAscii(data: Uint8Array, length = 16): string {
  return Array.from(data.slice(0, length), (byte) =>
    byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : ".",
  ).join("");
}

function errorToString(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
