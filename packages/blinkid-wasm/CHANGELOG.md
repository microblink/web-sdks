# @microblink/blinkid-wasm

## 8001.0.1

### Patch Changes

- Fix crash caused by bounding boxes of fields out of the dewarped image
- Fix crash caused by fields not sorted properly before the merge
- Ensure VectorDB is properly terminated once last session using it is terminated, regardless of whether it was loaded from OTA or non-OTA resource folder
- When using photo inputs, resolveCurrentStep now transitions scanning to BarcodeStep if barcode scanning is required for the current side and has not yet been successful, as part of full document recognition
- Fixed BarcodeRecognitionFailed process-result image-analysis reporting so fields are suppressed only for actual barcode-capture step frames

## 8001.0.0

### Major Changes

- **Breaking:** `DocumentClassInfo.country`, `region`, and `type` are now wrapper objects (`{ id?, rawValue }`) instead of plain string values. `id` carries the strongly-typed kebab-case value (`Country` / `Region` / `DocumentType`) when the document class is known at build time; `rawValue` always carries the raw classification token from the document knowledge database, including OTA-delivered document classes unknown at build time. Update comparisons such as `documentClassInfo.country === "usa"` to `documentClassInfo.country?.id === "usa"`, and use `id ?? rawValue` when displaying values. This affects `redactionSettingsResolver`, `addDocumentClassFilter`, `addOnDocumentFilteredCallback`, and the `documentClassInfo` fields on process and scanning results.
  - Added the `DocumentClassComponent`, `DocumentClassCountry`, `DocumentClassRegion`, and `DocumentClassDocumentType` types.
  - `countryName` and the ISO country-code fields on `DocumentClassInfo` are unchanged (plain strings, empty when unknown), and `documentClassInfo` on results remains non-optional — an unclassified document still yields `undefined` components and empty strings.
  - Updated the native bindings to the new document classification API (enum identifiers renamed to `CountryID` / `RegionID` / `DocumentTypeID`; document class construction now goes through the document knowledge database). Unrecognized classification strings passed to `getDefaultRedactionSettings` no longer abort the Wasm module; they are forwarded as raw values instead.
- Removed the `basic` Wasm build for full and lightweight feature variants.
  - Renamed shipped Wasm build directories: `advanced` → `simd` and `advanced-threads` → `simd-threads`.
- Renamed `DocumentClassInfo.type` to `DocumentClassInfo.documentType` to align with other platforms.
  - Migration: replace `documentClassInfo.type` with `documentClassInfo.documentType`.
- Updated the Emscripten toolchain used to build the BlinkID WebAssembly module to v6.x.
- Fixed compilation with newer Emscripten toolchains by replacing the deprecated lowercase `__EMSCRIPTEN_major__` / `__EMSCRIPTEN_minor__` / `__EMSCRIPTEN_tiny__` macros with their uppercase equivalents.

## 8000.0.1

### Patch Changes

- Improved barcode scanning for iOS devices

## 8000.0.0

### Major Changes

- Aligns BlinkID Wasm bindings and exported TypeScript types with the v8000 runtime. This is a breaking change for code that depended on the 7.x result and session surface.
- For the full upgrade guide, see the [BlinkID v8000 migration guide](https://docs.microblink.com/blinkid/migration-v8000).
- Trims result and field typings to match the runtime (for example removal of stale result-only fields and exports such as `mode`, `ParentInfo`, `RecognitionMode`, and unsupported VIZ properties). Renames `SingleSideScanningResult.barcodeInputImage` to `barcodeImage` and tightens `FieldType` to the values currently exposed by the bindings.
- Adds `getResolvedSessionSettings()` on the scanning session so callers can read the effective `BlinkIdSessionSettings` after defaults and resolvers are applied.
- Replaces 7.x session anonymization settings with result-time redaction types and bindings. Remove `scanningSettings.anonymizationMode` and `scanningSettings.customDocumentAnonymizationSettings` from `BlinkIdSessionSettings`. Use `RedactionSettings` and `RedactionMode` instead (`RedactionMode` keeps the same string values as `AnonymizationMode`: `none`, `image-only`, `result-fields-only`, `full-result`). Exposes `getDefaultRedactionSettings(documentClassInfo)` on the Wasm module. `RedactionSettings` adds `mode`, `redactMrz`, and `redactBarcode` on the result payload. For worker and core integration details, see `@microblink/blinkid-worker` and `@microblink/blinkid-core` changelogs.

## 7.8.0

### Minor Changes

- **Results:** `BlinkIdScanningResult` and `VizResult` now expose optional `cardAccessNumber` (`StringResult`).
- **`FieldType`:** added `cardAccessNumber`; removed `parentsLastName2`, `parentsFirstName2`, and `chinPermanentExpiry`.
- **`DocumentType`:** added `origin-card`.
- **`Country`:** removed `virgin-islands-us`; added `virgin-islands-of-the-united-states`.
- **Extraction behavior:** top-level `remarks` is filled using information from **both** sides when available. Document number and citizenship are also represented in the MRZ **opt1** value where applicable. Egypt driver licenses: `dateOfBirth` is derived from `personalIdNumber` when appropriate. Improved MRZ parsing for Zimbabwe ID and a new Brunei ID layout.

## 7.7.4

### Patch Changes

- Version bump for consistency with other packages

## 7.7.3

## 7.7.2

## 7.7.1

### Patch Changes

- Added shared `EmscriptenModule` and `WasmBindings` types.

## 7.7.0

### Patch Changes

- Adds country `saint-thomas-and-prince`; document types `nin-card`, `mysss-card`, `gendarmerie-id`, `police-id`; and additional Brazilian and Indian regions (e.g. `acre`, `espirito-santo`, `odisha`, `uttarakhand`) to class info.

## 7.6.4

### Patch Changes

- Shared types moved to `@microblink/wasm-common`.
- `createBlinkIdScanningSession` renamed to `createScanningSession`.

## 7.6.3

### Patch Changes

- Update version

## 7.6.2

### Patch Changes

- Bump version

## 7.6.1

### Patch Changes

- For some documents, the document type was returned as `none`, which was causing confusion. To prevent this, we are filling in the document type from the barcode in case customers are using `barcode-id` mode. The fix is applied to all the AAMVA types, plus some others (Argentina, Canada, Colombia, Nigeria, Panama, Paraguay, SouthAfrica).
- Added `sub-field-designator` value to `BarcodeElementKey` type

## 7.6.0

### Minor Changes

- Add support for ping v3
- Added support for capturing the back of US passports that feature a barcode
- Unparsable barcodes no longer prevent the scanning process from finishing and will be returned as raw data in the result if the `recognitionModeFilter` is set to `enableFullDocumentRecognition`. Using `enableBarcodeId` still requires the barcode to be parsable in order to successfully finish the scanning process
- Added a new `parsed` property on the barcode property of the `SingleSideScanningResult` which indicates if the raw barcode data was successfully parsed into structured information.
- Prevent parsing of two-line MRZ in TD1 format unless it's explicitly allowed. This will prevent false positive MRZ extraction on documents where the last line of the MRZ is covered or not fully visible
- Users are no longer forced to scan back sides of Alien and Refugee passports
- Fixed the issue with Togo ID where document number from VIZ was overriden by a wrong value from MRZ

#### New Documents Support

- Angola - Paper Passport
- Bahrain - Polycarbonate Passport
- Burkina Faso - Polycarbonate Passport
- Cameroon - Driver's License
- Canada, Manitoba - Metis Federation Card
- East Timor - Polycarbonate Passport
- El Salvador - Paper Passport
- Eritrea - Paper Passport
- France - Adr Certificate
- Germany - Adr Certificate
- Ghana - Voter ID
- India, Telangana - Driver's License
- Ivory Coast - Paper Passport
- Japan - Polycarbonate Passport
- Liberia - Paper Passport
- Liberia - Voter ID
- Malawi - Identity Card
- Malawi - Paper Passport
- Maldives - Polycarbonate Passport
- Mali - Paper Passport
- Mauritius - Paper Passport
- Oman - Vehicle Registration
- Paraguay - Polycarbonate Passport
- Rwanda - Driver's License
- Senegal - Driver's License
- Sierra Leone - Paper Passport
- Somalia - Paper Passport
- Switzerland - Adr Certificate
- Togo - Driver's License
- Togo - Paper Passport
- USA, Maryland - Medical Marijuana ID
- Vietnam - Paper Passport

#### New Document Versions for Supported Documents

- Chile - Polycarbonate Passport
- India - Paper Passport
- Moldova - Identity Card
- Pakistan - Identity Card
- Peru - Identity Card
- Romania - Identity Card
- Slovakia - Identity Card
- USA, California - Driver's License
- USA, California - Identity Card
- USA, New Hampshire - Identity Card
- USA, Georgia - Medical Marijuana ID
- USA, Pennsylvania - Medical Marijuana ID
- USA, South Carolina - Driver's License
- USA, South Carolina - Identity Card
- USA, Texas - Driver's License
- USA, Texas - Identity Card

##### New Segments Supported on Documents

- Switzerland, Residence Permit - 'dateOfEntry'
- Hungary, Identity Card - `maidenName`, `nationality`, `sex`, `documentNumber`, `dateOfBirth`
- Greece, Identity Card - `fathersName` (Latin and Greek), `mothersName` (Latin and Greek), `personalIdNumber`, `issuingAuthority` (Greek), `municipalityOfRegistration` (Greek)
- Mexico, Voter ID - `sectionCode`, `stateCode`, `municipalityCode`, `localityCode`
- Mexico, Consular Voter ID - `stateCode`, `stateName`

##### Renamed segments

- Hungary - Identity Card - `additionalNameInformation` -> `mothersName`

### Patch Changes

- Update dependencies

## 7.5.0

### Minor Changes

- Version skip

## 7.4.3

### Patch Changes

- Bump versions

## 7.4.2

### Patch Changes

- Fixed small memory leak happening while creating user agent string
- Now generating size manifests for resource files

## 7.4.1

### Patch Changes

- Bumped version

## 7.4.0

### Minor Changes

- Improved documentation

## 7.3.2

### Patch Changes

#### Bug Fixes

- Resolved issues where EMBind mapped properties with invalid names.
  - `BarcodeResult.rawBytes` has been renamed to `rawData` to match the TypeScript declaration.
  - `MrzResult` now correctly populates the `opt1` and `opt2` fields.
  - Corrected casing in `MrzResult`: `primaryId` and `secondaryId` are no longer incorrectly mapped as `primaryID` and `secondaryID`.
  - Fixed an issue where the `lowerLeft` property in `BlinkIdProcessResult` had a trailing space in its name.
  - Fixed and clarified the type specification for `MrzResult.dateOfBirth` and `MrzResult.dateOfExpiry`: although the runtime values already matched the `DateResult<string>` type, the declaration was previously set to `Date`.

- Removed unused property declarations from `BlinkIdScanningResult`:
  - `inputImagesScanningSide`
  - `barcodeInputImageScanningSide`
  - `documentImagesScanningSide`
  - `faceImageScanningSide`
  - `signatureImageScanningSide`

## 7.3.1

### Patch Changes

- Bumped version

## 7.3.0

### Minor Changes

- Fixed incorrect property name in `MrzResult`: `rawMRZString` is now correctly exposed as `rawMrzString`.
- Fixed incorrect `full-document` type `document` type in `ImageExtractionType`.
- Fixed typing issue by correctly adding the `vehicleOwner` property to `BlinkIdScanningResult`.
- Added `certificateNumber`, `countryCode` and `nationalInsuranceNumber` to `BlinkIdScanningResult` and `VizResult` types.
- Added `non-card-tribal-id` and `diplomatic-id` to `DocumentType`
- This change updates the Emscripten toolchain to version 4.0.9, upgrades multiple C++ package dependencies, and adds new document types (`non-card-tribal-id`, `diplomatic-id`) and field types (certificateNumber, countryCode, nationalInsuranceNumber) to the BlinkID recognition system.

## 7.2.2

### Patch Changes

- Fixed an issue where the Web Worker failed to initialize when SDK resources were hosted on a different origin than the application.

## 7.2.1

### Patch Changes

- Fixed an issue with frame quality estimation that could cause the recognition process to get stuck. This fix significantly improves success rate of document capturing, especially for the desktop cameras

## 7.2.0

### Minor Changes

- Update WASM files
- Implemented `showDemoOverlay` and `showProductionOverlay`
- Various bugfixes

## 7.1.0

### Minor Changes

- Updated internal dependencies
- Added new documents support

## 7.0.1

### Patch Changes

- Bump package version
