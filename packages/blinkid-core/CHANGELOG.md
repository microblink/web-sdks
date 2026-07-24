# @microblink/blinkid-core

## 8001.0.0

### Major Changes

- **Breaking:** `DocumentClassInfo.country`, `region`, and `type` are now wrapper objects (`{ id?, rawValue }`) instead of plain string values. `id` carries the strongly-typed kebab-case value (`Country` / `Region` / `DocumentType`) when the document class is known at build time; `rawValue` always carries the raw classification token from the document knowledge database, including OTA-delivered document classes unknown at build time. Update comparisons such as `documentClassInfo.country === "usa"` to `documentClassInfo.country?.id === "usa"`, and use `id ?? rawValue` when displaying values. This affects `redactionSettingsResolver`, `addDocumentClassFilter`, `addOnDocumentFilteredCallback`, and the `documentClassInfo` fields on process and scanning results.
  - Added the `DocumentClassComponent`, `DocumentClassCountry`, `DocumentClassRegion`, and `DocumentClassDocumentType` types.
  - `countryName` and the ISO country-code fields on `DocumentClassInfo` are unchanged (plain strings, empty when unknown), and `documentClassInfo` on results remains non-optional — an unclassified document still yields `undefined` components and empty strings.
  - Updated the native bindings to the new document classification API (enum identifiers renamed to `CountryID` / `RegionID` / `DocumentTypeID`; document class construction now goes through the document knowledge database). Unrecognized classification strings passed to `getDefaultRedactionSettings` no longer abort the Wasm module; they are forwarded as raw values instead.
- Adds browser OTA resource bootstrap through the `otaResources` initialization option. BlinkID always loads the hosted SDK baseline and checks the OTA provider for strictly newer resources by default; `checkForUpdates: false` skips only the provider check.
- Renamed `DocumentClassInfo.type` to `DocumentClassInfo.documentType` to align with other platforms.
  - Migration: replace `documentClassInfo.type` with `documentClassInfo.documentType`.
- Updated dependencies
  - @microblink/analytics@2.0.2
  - @microblink/blinkid-wasm@8001.0.0
  - @microblink/blinkid-worker@8001.0.0

## 8000.0.1

### Patch Changes

- Improves the redaction resolver api by adding a second argument to the resolver function which allows the user the get the SDK default redaction settings for a specific DocumentClassInfo
- Also changes the return type of the resolver to Partial<RedactionSettings> this is so the user doesn't have to specify all the properties if he's only interested in one, we then merge this partial result with the default settings
- Updated dependencies
  - @microblink/blinkid-wasm@8000.0.1
  - @microblink/blinkid-worker@8000.0.1

## 8000.0.0

### Major Changes

- Aligns the published BlinkID core API with the v8000 runtime and worker surface. This is a breaking change for integrations built against the 7.x core types and session API.
- For the full upgrade guide, see the [BlinkID v8000 migration guide](https://docs.microblink.com/blinkid/migration-v8000).
- Re-exports trimmed result and field typings from `@microblink/blinkid-wasm` (for example removal of stale result-only fields and exports such as `mode`, `ParentInfo`, `RecognitionMode`, and unsupported VIZ properties). Renames `SingleSideScanningResult.barcodeInputImage` to `barcodeImage` and tightens `FieldType` to match the runtime.
- Adds `getResolvedSessionSettings()` on the remote scanning session so apps can read the effective `BlinkIdSessionSettings` after defaults and resolvers are applied.
- Replaces 7.x session anonymization settings with a result-time redaction API. Remove `scanningSettings.anonymizationMode` and `scanningSettings.customDocumentAnonymizationSettings` from `BlinkIdSessionSettings`. Use `RedactionSettings` and `RedactionMode` instead. Pass an optional `redactionSettingsResolver` in the second argument to `BlinkIdCore.createScanningSession` (`BlinkIdCreateScanningSessionOptions`); types are re-exported from `@microblink/blinkid-worker`. When configured, `session.getResult()` applies the resolved settings automatically. Use `BlinkIdWorker.getDefaultRedactionSettings(documentClassInfo)` to seed per-document rules.
- If you use the built-in feedback UI, nested localization overrides and extraction-mode-specific copy are documented in the `@microblink/blinkid-ux-manager` changelog and README.

### Other Changes

- Updated dependencies
  - @microblink/blinkid-wasm@8000.0.0
  - @microblink/blinkid-worker@8000.0.0
  - @microblink/core-common@1.0.2

## 7.8.0

### Minor Changes

- Updated dependencies
  - @microblink/analytics@2.0.1
  - @microblink/blinkid-wasm@7.8.0
  - @microblink/blinkid-worker@7.8.0

## 7.7.4

### Patch Changes

- Updated dependencies
  - @microblink/analytics@2.0.0
  - @microblink/blinkid-worker@7.7.4
  - @microblink/blinkid-wasm@7.7.4

## 7.7.3

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-wasm@7.7.3
  - @microblink/blinkid-worker@7.7.3

## 7.7.2

### Patch Changes

- Surfaces worker frame-transfer failures as explicit `FrameTransferError`s through the proxy-worker layer, improving diagnostics for invalid or detached frame buffers.
- Updated dependencies
  - @microblink/core-common@1.0.1
  - @microblink/blinkid-worker@7.7.2
  - @microblink/blinkid-wasm@7.7.2

## 7.7.1

### Patch Changes

- Fixed missing analytics events for crashes during SDK and Wasm initialization.
- Updated dependencies
  - @microblink/blinkid-worker@7.7.1
  - @microblink/blinkid-wasm@7.7.1

## 7.7.0

### Patch Changes

- Aligns the re-exported BlinkID result typings with the current runtime surface by removing stale result-only fields and exports, including `mode`, `ParentInfo`, `RecognitionMode`, and unsupported VIZ/result properties.
- Re-exports `SingleSideScanningResult.barcodeImage` and the trimmed BlinkID `FieldType` union without compatibility aliases.
- Adds country `saint-thomas-and-prince`; document types `nin-card`, `mysss-card`, `gendarmerie-id`, `police-id`; and additional Brazilian and Indian regions (e.g. `acre`, `espirito-santo`, `odisha`, `uttarakhand`) to class info.
- Introduces `createScanningSession(...)` as the primary API and keeps `createBlinkIdScanningSession(...)` as a backward-compatible alias with a deprecation notice.
- Optimizes worker frame processing by auto-transferring `ImageData` buffers, reducing per-frame copy overhead. After `process(...)`, the original `ImageData.data.buffer` is intentionally detached.
- Updated dependencies
  - @microblink/blinkid-wasm@7.7.0
  - @microblink/blinkid-worker@7.7.0

## 7.6.4

### Patch Changes

- **Worker proxy**: Use `createProxyWorker<BlinkIdWorkerProxy>` from `@microblink/core-common` instead of local `createProxyWorker`. Optimize worker frame processing by auto-transferring ImageData buffers in the proxy worker layer, reducing per-frame copy overhead and GC pressure. After process(...), the original ImageData.data.buffer is intentionally detached.
- **core-common integration**: Depend on and re-export shared utilities from `@microblink/core-common` instead of in-package implementations: `createProxyWorker`, `getUserId`, `createCustomImageData`, `getCrossOriginWorkerURL`, `shouldUseLightweightBuild`, and `deviceInfo` (including derived device info, navigator types, and related helpers). Removed local implementations and their tests; `getUserId` is now called with a storage key (`getUserId(STORAGE_KEY)`). Prepare-publish updated to exclude `@microblink/core-common` from published package.json. README and repository URLs updated (Developer Hub, microblink/web-sdks).
- Updated dependencies
  - @microblink/blinkid-wasm@7.6.4
  - @microblink/blinkid-worker@7.6.4
  - @microblink/core-common@1.0.0

## 7.6.3

### Patch Changes

- Improved automatic lightweight build detection for mobile devices
  - Now uses Device Memory API to detect low-memory devices (< 4GB)
  - Applies to all mobile devices (phones and tablets) with available memory information
  - Falls back to `undefined` when memory information is unavailable, allowing manual configuration
  - Previously used a simple user agent check for all mobile devices
- Updated dependencies
  - @microblink/blinkid-worker@7.6.3
  - @microblink/blinkid-wasm@7.6.3

## 7.6.2

### Patch Changes

- Fixes `microblinkProxyUrl` handling
  - Prevent an extra ping to the Microblink server when a proxy URL is configured (previously one redundant request was sent).
  - Preserve the user-provided path when using a proxy URL (previously the path was removed).
- Updated dependencies
  - @microblink/blinkid-wasm@7.6.2
  - @microblink/blinkid-worker@7.6.2

## 7.6.1

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-wasm@7.6.1
  - @microblink/blinkid-worker@7.6.1

## 7.6.0

### Minor Changes

- Rename `formFactor` property on `DerivedDeviceInfo` to `formFactors`

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-worker@7.6.0
  - @microblink/blinkid-wasm@7.6.0

## 7.5.0

### Minor Changes

- Version skip

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-wasm@7.5.0
  - @microblink/blinkid-worker@7.5.0

## 7.4.3

### Patch Changes

- Fixed types
- Updated dependencies
  - @microblink/blinkid-wasm@7.4.3
  - @microblink/blinkid-worker@7.4.3

## 7.4.2

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-worker@7.4.2
  - @microblink/blinkid-wasm@7.4.2

## 7.4.1

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-worker@7.4.1

## 7.4.0

### Minor Changes

- Improved documentation
- Updated dependencies
  - @microblink/blinkid-wasm@7.4.0
  - @microblink/blinkid-worker@7.4.0

## 7.3.2

### Patch Changes

- Introduced utilities for extracting images from the `BlinkIdScanningResult`:
  - `extractSideInputImage`
  - `extractBarcodeImage`
  - `extractSideDocumentImage`
  - `extractFaceImage`
  - `extractSignatureImage`

- Updated dependencies
  - @microblink/blinkid-wasm@7.3.2
  - @microblink/blinkid-worker@7.3.2

## 7.3.1

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-worker@7.3.1

## 7.3.0

### Minor Changes

- Updated dependencies
  - @microblink/blinkid-worker@7.3.0
  - @microblink/blinkid-wasm@7.3.0

## 7.2.2

### Patch Changes

- Fixed an issue where the Web Worker failed to initialize when SDK resources were hosted on a different origin than the application.
- Updated dependencies
  - @microblink/blinkid-wasm@7.2.2
  - @microblink/blinkid-worker@7.2.2

## 7.2.1

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-wasm@7.2.1
  - @microblink/blinkid-worker@7.2.1

## 7.2.0

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-wasm@7.2.0
  - @microblink/blinkid-worker@7.2.0

## 7.1.0

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-wasm@7.1.0
  - @microblink/blinkid-worker@7.1.0

## 7.0.1

### Patch Changes

- Updated dependencies
  - @microblink/blinkid-wasm@7.0.1
  - @microblink/blinkid-worker@7.0.1
