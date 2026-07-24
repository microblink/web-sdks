/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { describe, expect, it, vi } from "vitest";
import {
  BLINK_ID_OTA_RESOURCES_PATH,
  inspectBlinkIdOtaMemfs,
  normalizeOtaResourceProviderUrl,
  resolveBlinkIdOtaResources,
  resolveBlinkIdOtaResourcesFromLocation,
  selectBlinkIdOtaResources,
  writeBlinkIdOtaResourcesToMemfs,
} from "./otaResources";

const createJsonResponse = (body: unknown, ok = true) =>
  ({
    ok,
    status: ok ? 200 : 500,
    statusText: ok ? "OK" : "Server Error",
    json: vi.fn().mockResolvedValue(body),
  }) as unknown as Response;

const createBufferResponse = (body: ArrayBuffer, ok = true) =>
  ({
    ok,
    status: ok ? 200 : 404,
    statusText: ok ? "OK" : "Not Found",
    arrayBuffer: vi.fn().mockResolvedValue(body),
  }) as unknown as Response;

describe("BlinkID OTA resources", () => {
  it("normalizes provider URLs that already include /api/v1/versions", () => {
    expect(
      normalizeOtaResourceProviderUrl(
        "https://blinkid-ota.microblink.com/api/v1/versions",
      ),
    ).toBe("https://blinkid-ota.microblink.com");
    expect(
      normalizeOtaResourceProviderUrl(
        "https://blinkid-ota.microblink.com/api/v1/versions/",
      ),
    ).toBe("https://blinkid-ota.microblink.com");
  });

  it("resolves OTA service response filename metadata", async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      createJsonResponse({
        generic_version: "1.2.3",
        embedder_engine: {
          latest_version: "999.0.0",
          db_file_name: "serialized_embedder_db.bin",
          db_download_link:
            "http://localhost:4443/download/storage/v1/b/ota-models/o/serialized_embedder_db%2F11111111-1111-4111-8111-111111111111%2F21111111-1111-4111-8111-111111111111%2Fserialized_embedder_db.bin?alt=media",
        },
        template_engine: {
          latest_version: "999.0.0",
          db_file_name: "template_db.bin",
          db_download_link:
            "http://localhost:4443/download/storage/v1/b/ota-models/o/template_db%2F12222222-2222-4222-8222-222222222222%2F22222222-2222-4222-8222-222222222222%2Ftemplate_db.bin?alt=media",
        },
        document_knowledge_engine: {
          latest_version: "999.0.0",
          db_file_name: "document_knowledge_db.bin",
          db_download_link:
            "http://localhost:4443/download/storage/v1/b/ota-models/o/document_knowledge_db%2F13333333-3333-4333-8333-333333333333%2F23333333-3333-4333-8333-333333333333%2Fdocument_knowledge_db.bin?alt=media",
        },
      }),
    );

    await expect(
      resolveBlinkIdOtaResources({
        resourceProviderUrl: "http://localhost:8080",
        genericVersion: "1.2.3",
        fetchFn,
      }),
    ).resolves.toEqual([
      {
        filename: "serialized-embedder-database.bin",
        version: "999.0.0",
        url: "http://localhost:4443/download/storage/v1/b/ota-models/o/serialized_embedder_db%2F11111111-1111-4111-8111-111111111111%2F21111111-1111-4111-8111-111111111111%2Fserialized_embedder_db.bin?alt=media",
      },
      {
        filename: "template-database.zzip",
        version: "999.0.0",
        url: "http://localhost:4443/download/storage/v1/b/ota-models/o/template_db%2F12222222-2222-4222-8222-222222222222%2F22222222-2222-4222-8222-222222222222%2Ftemplate_db.bin?alt=media",
      },
      {
        filename: "knowledge-database.zzip",
        version: "999.0.0",
        url: "http://localhost:4443/download/storage/v1/b/ota-models/o/document_knowledge_db%2F13333333-3333-4333-8333-333333333333%2F23333333-3333-4333-8333-333333333333%2Fdocument_knowledge_db.bin?alt=media",
      },
    ]);

    expect(fetchFn).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/versions?generic_version=1.2.3",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("uses canonical filenames regardless of signed download URLs", async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      createJsonResponse({
        generic_version: "1.2.3",
        embedder_engine: {
          latest_version: "999.0.0",
          db_download_link:
            "https://storage.example.com/download/o/resources%2Fembedder.bin?alt=media",
        },
        template_engine: {
          latest_version: "999.0.0",
          db_download_link:
            "https://storage.example.com/download/o/resources%2Ftemplate.zzip?alt=media",
        },
        document_knowledge_engine: {
          latest_version: "999.0.0",
          db_download_link:
            "https://storage.example.com/download/o/resources%2Fknowledge.zzip?alt=media",
        },
      }),
    );

    await expect(
      resolveBlinkIdOtaResources({
        resourceProviderUrl: "http://localhost:8080",
        genericVersion: "1.2.3",
        fetchFn,
      }),
    ).resolves.toEqual([
      {
        filename: "serialized-embedder-database.bin",
        version: "999.0.0",
        url: "https://storage.example.com/download/o/resources%2Fembedder.bin?alt=media",
      },
      {
        filename: "template-database.zzip",
        version: "999.0.0",
        url: "https://storage.example.com/download/o/resources%2Ftemplate.zzip?alt=media",
      },
      {
        filename: "knowledge-database.zzip",
        version: "999.0.0",
        url: "https://storage.example.com/download/o/resources%2Fknowledge.zzip?alt=media",
      },
    ]);
  });

  it("accepts provider URLs that already include /api/v1/versions", async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      createJsonResponse({
        generic_version: "1.2.3",
        embedder_engine: {
          latest_version: "999.0.0",
          db_download_link: "https://ota.example.com/embedder.bin",
        },
        template_engine: {
          latest_version: "999.0.0",
          db_download_link: "https://ota.example.com/template.bin",
        },
        document_knowledge_engine: {
          latest_version: "999.0.0",
          db_download_link: "https://ota.example.com/knowledge.bin",
        },
      }),
    );

    await resolveBlinkIdOtaResources({
      resourceProviderUrl: "http://localhost:8080/api/v1/versions",
      genericVersion: "1.2.3",
      fetchFn,
    });

    expect(fetchFn).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/versions?generic_version=1.2.3",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("resolves direct OTA resource URLs from a resources-location manifest", async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      createJsonResponse({
        resources: [
          {
            filename: "serialized-embedder-database.bin",
            version: "1.0.12",
            url: "serialized_embedder_db_1.12.bin",
          },
          {
            filename: "template-database.zzip",
            version: "1.0.1",
            url: "template-database_0.1.zzip",
          },
          {
            filename: "knowledge-database.zzip",
            version: "2.0.1",
            url: "https://assets.example.com/blinkid-ota/knowledge-database_0.1.zzip?token=1",
          },
        ],
      }),
    );

    await expect(
      resolveBlinkIdOtaResourcesFromLocation({
        resourcesLocation: "  https://cdn.example.com/blinkid-ota/  ",
        fetchFn,
      }),
    ).resolves.toEqual([
      {
        filename: "serialized-embedder-database.bin",
        version: "1.0.12",
        url: "https://cdn.example.com/blinkid-ota/serialized_embedder_db_1.12.bin",
      },
      {
        filename: "template-database.zzip",
        version: "1.0.1",
        url: "https://cdn.example.com/blinkid-ota/template-database_0.1.zzip",
      },
      {
        filename: "knowledge-database.zzip",
        version: "2.0.1",
        url: "https://assets.example.com/blinkid-ota/knowledge-database_0.1.zzip?token=1",
      },
    ]);

    expect(fetchFn).toHaveBeenCalledWith(
      "https://cdn.example.com/blinkid-ota/ota-resources.json",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("rejects failed direct OTA resources manifest requests", async () => {
    const fetchFn = vi.fn().mockResolvedValue(createJsonResponse({}, false));

    await expect(
      resolveBlinkIdOtaResourcesFromLocation({
        resourcesLocation: "https://cdn.example.com/blinkid-ota/",
        fetchFn,
      }),
    ).rejects.toThrow(
      "Failed to resolve BlinkID OTA resources manifest: 500 Server Error",
    );
  });

  it("rejects malformed direct OTA resources manifests", async () => {
    const fetchFn = vi.fn().mockResolvedValue(createJsonResponse({}));

    await expect(
      resolveBlinkIdOtaResourcesFromLocation({
        resourcesLocation: "https://cdn.example.com/blinkid-ota/",
        fetchFn,
      }),
    ).rejects.toThrow("BlinkID OTA resources manifest is missing resources");
  });

  it("rejects direct OTA resources manifest entries without filenames", async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      createJsonResponse({
        resources: [{ url: "template_database_0.1.bin" }],
      }),
    );

    await expect(
      resolveBlinkIdOtaResourcesFromLocation({
        resourcesLocation: "https://cdn.example.com/blinkid-ota/",
        fetchFn,
      }),
    ).rejects.toThrow(
      "BlinkID OTA resources manifest entry 0 is missing filename",
    );
  });

  it("rejects hosted OTA manifest entries without versions", async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      createJsonResponse({
        resources: [{ filename: "template-database.zzip" }],
      }),
    );

    await expect(
      resolveBlinkIdOtaResourcesFromLocation({
        resourcesLocation: "https://cdn.example.com/resources/ota-resources",
        fetchFn,
      }),
    ).rejects.toThrow(
      "BlinkID OTA resources manifest entry 0 is missing version",
    );
  });

  it("selects only strictly newer provider resources", () => {
    const hostedResources = [
      {
        filename: "serialized-embedder-database.bin",
        version: "1.0.14",
        url: "hosted-embedder-url",
      },
      {
        filename: "template-database.zzip",
        version: "1.0.1",
        url: "hosted-template-url",
      },
      {
        filename: "knowledge-database.zzip",
        version: "2.0.1",
        url: "hosted-knowledge-url",
      },
    ];
    const providerResources = [
      {
        filename: "serialized-embedder-database.bin",
        version: "1.0.14",
        url: "provider-embedder-url",
      },
      {
        filename: "template-database.zzip",
        version: "1.0.2",
        url: "provider-template-url",
      },
      {
        filename: "knowledge-database.zzip",
        version: "2.0.0",
        url: "provider-knowledge-url",
      },
    ];

    expect(
      selectBlinkIdOtaResources(hostedResources, providerResources),
    ).toEqual([
      hostedResources[0],
      {
        ...providerResources[1],
        fallbackUrl: hostedResources[1].url,
      },
      hostedResources[2],
    ]);
  });

  it("rejects malformed resource versions during provider selection", () => {
    expect(() =>
      selectBlinkIdOtaResources(
        [
          {
            filename: "template-database.zzip",
            version: "1.0.1",
            url: "hosted",
          },
        ],
        [
          {
            filename: "template-database.zzip",
            version: "latest",
            url: "provider",
          },
        ],
      ),
    ).toThrow("Invalid BlinkID OTA resource version: latest");
  });

  it("writes downloaded OTA resources into MEMFS", async () => {
    const embedder = new Uint8Array([1]).buffer;
    const template = new Uint8Array([2]).buffer;
    const knowledge = new Uint8Array([3]).buffer;
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(createBufferResponse(embedder))
      .mockResolvedValueOnce(createBufferResponse(template))
      .mockResolvedValueOnce(createBufferResponse(knowledge));
    const module = {
      FS: {},
      FS_createPath: vi.fn(),
      FS_createDataFile: vi.fn(),
      FS_unlink: vi.fn(),
    };

    await expect(
      writeBlinkIdOtaResourcesToMemfs({
        module,
        resources: [
          { filename: "embedder.bin", version: "1.0.0", url: "embedder-url" },
          { filename: "template.zzip", version: "1.0.0", url: "template-url" },
          {
            filename: "knowledge.zzip",
            version: "1.0.0",
            url: "knowledge-url",
          },
        ],
        fetchFn,
      }),
    ).resolves.toBe(BLINK_ID_OTA_RESOURCES_PATH);

    expect(module.FS_createPath).toHaveBeenCalledWith(
      "/",
      "microblink",
      true,
      true,
    );
    expect(module.FS_createPath).toHaveBeenCalledWith(
      "/microblink",
      "blinkid-ota",
      true,
      true,
    );
    expect(module.FS_createDataFile).toHaveBeenCalledTimes(3);
    expect(module.FS_createDataFile).toHaveBeenNthCalledWith(
      1,
      BLINK_ID_OTA_RESOURCES_PATH,
      "embedder.bin",
      new Uint8Array(embedder),
      true,
      true,
      true,
    );
  });

  it("reads back OTA resources from Emscripten FS for diagnostics", async () => {
    const files = new Map<string, Uint8Array>();
    const template = new Uint8Array([0x50, 0x4b, 0x03, 0x04]).buffer;
    const fetchFn = vi.fn().mockResolvedValue(createBufferResponse(template));
    const module = {
      FS: {
        mkdirTree: vi.fn(),
        writeFile: vi.fn((path: string, data: Uint8Array) => {
          files.set(path, data);
        }),
        readdir: vi.fn(() => [".", "..", "template.zzip"]),
        readFile: vi.fn((path: string) => {
          const file = files.get(path);
          if (!file) {
            throw new Error("ENOENT");
          }
          return file;
        }),
        stat: vi.fn((path: string) => {
          const file = files.get(path);
          if (!file) {
            throw new Error("ENOENT");
          }
          return { size: file.byteLength };
        }),
      },
    };
    const resources = [
      { filename: "template.zzip", version: "1.0.0", url: "template-url" },
    ];

    await writeBlinkIdOtaResourcesToMemfs({
      module,
      resources,
      fetchFn,
    });

    expect(
      inspectBlinkIdOtaMemfs({
        module,
        resources,
      }),
    ).toEqual({
      directory: BLINK_ID_OTA_RESOURCES_PATH,
      fsAvailable: true,
      directoryEntries: [".", "..", "template.zzip"],
      files: [
        {
          filename: "template.zzip",
          path: `${BLINK_ID_OTA_RESOURCES_PATH}/template.zzip`,
          exists: true,
          size: 4,
          firstBytesHex: "50 4b 03 04",
          firstBytesAscii: "PK..",
        },
      ],
    });
  });

  it("falls back to the hosted file when a provider download fails", async () => {
    const hosted = new Uint8Array([7]).buffer;
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(createBufferResponse(new ArrayBuffer(0), false))
      .mockResolvedValueOnce(createBufferResponse(hosted));
    const module = {
      FS_createPath: vi.fn(),
      FS_createDataFile: vi.fn(),
    };
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    await writeBlinkIdOtaResourcesToMemfs({
      module,
      resources: [
        {
          filename: "template-database.zzip",
          version: "1.0.2",
          url: "provider-url",
          fallbackUrl: "hosted-url",
        },
      ],
      fetchFn,
      fallbackOnError: true,
    });

    expect(fetchFn).toHaveBeenNthCalledWith(
      1,
      "provider-url",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(fetchFn).toHaveBeenNthCalledWith(
      2,
      "hosted-url",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(module.FS_createDataFile).toHaveBeenCalledWith(
      BLINK_ID_OTA_RESOURCES_PATH,
      "template-database.zzip",
      new Uint8Array(hosted),
      true,
      true,
      true,
    );

    warnSpy.mockRestore();
  });

  it("rejects malformed resolve responses", async () => {
    const fetchFn = vi.fn().mockResolvedValue(createJsonResponse({}));

    await expect(
      resolveBlinkIdOtaResources({
        resourceProviderUrl: "https://ota.example.com",
        genericVersion: "1.0.0",
        fetchFn,
      }),
    ).rejects.toThrow(
      "BlinkID OTA response is missing embedder_engine.db_download_link",
    );
  });

  it("rejects empty OTA downloads before writing to MEMFS", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValue(createBufferResponse(new ArrayBuffer(0), true));
    const module = {
      FS_createPath: vi.fn(),
      FS_createDataFile: vi.fn(),
    };

    await expect(
      writeBlinkIdOtaResourcesToMemfs({
        module,
        resources: [
          { filename: "template.zzip", version: "1.0.0", url: "empty-url" },
        ],
        fetchFn,
      }),
    ).rejects.toThrow(
      "Failed to download BlinkID OTA resource template.zzip: empty response body",
    );

    expect(module.FS_createDataFile).not.toHaveBeenCalled();
  });

  it("rejects failed downloads before writing the failed file", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValue(createBufferResponse(new ArrayBuffer(0), false));
    const module = {
      FS_createPath: vi.fn(),
      FS_createDataFile: vi.fn(),
    };

    await expect(
      writeBlinkIdOtaResourcesToMemfs({
        module,
        resources: [
          { filename: "template.zzip", version: "1.0.0", url: "bad-url" },
        ],
        fetchFn,
      }),
    ).rejects.toThrow("Failed to download BlinkID OTA resource template.zzip");

    expect(module.FS_createDataFile).not.toHaveBeenCalled();
  });
});
