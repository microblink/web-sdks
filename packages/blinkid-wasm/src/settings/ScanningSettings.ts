/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { SensitivityLevel } from "./SensitivityLevel";

/**
 * Settings for the document capture module.
 *
 * This module is responsible for the initial document detection, image
 * extraction (such as face and document images), and image quality validation
 * (blur, glare, and lighting checks).
 *
 * For Automatic ScanningMode, when scanning a supported document, the front
 * side must be captured first, followed by the back side. When scanning an
 * unsupported document, the capture order is flexible; since the side cannot be
 * identified, either side can be scanned first.
 *
 * This setting must be turned on for Viz and Mrz extraction to work correctly.
 *
 * If enabled, session will start with document detection step at the
 * initialization.
 */
export type DocumentCaptureModuleSettings = {
  /**
   * Indicates whether the input image is already cropped and
   * perspective-corrected.
   *
   * If `true`, the input image must consist solely of the already cropped and
   * corrected document.
   *
   * Default value is `false`.
   *
   * This setting is not applicable to `Video` sources and will cause a
   * validation error if set to true.
   *
   * @default false
   */
  inputImageCropped: boolean;
  /**
   * Enables the scanning and processing of unsupported document types.
   *
   * A document is considered unsupported if its classification result is
   * `OTHER`.
   *
   * @default false
   */
  unsupportedDocumentsAllowed: boolean;
  /**
   * Indicates whether the back side scan should be skipped if that side
   * supports image capture only (no MRZ, Barcode, etc.).
   *
   * Some documents have a back side that is supported for capture but contains
   * no extractable data. These sides can be captured only.
   *
   * When `true`, processing stops after the front side for these documents.
   * When `false`, the back side is captured even if no data is extracted.
   *
   * Default value is `true`.
   *
   * Note for `ScanningMode`:
   *
   * - `Automatic`: Can be toggled as needed to optimize the flow.
   * - `Single`: This must remain `true`. Since only one side is captured in this
   *   mode, setting this to `false` will result in a settings validation
   *   failure.
   *
   * @default true
   */
  secondSideWithNoExtractableDataSkipped: boolean;
  /**
   * Indicates whether only the passport data page (the page containing the MRZ)
   * should be scanned.
   *
   * If set to `false`, the scanning process will require a second page scan for
   * certain passport types that support it.
   *
   * Default value is `true`.
   *
   * Note for `ScanningMode`:
   *
   * - `Automatic`: Can be toggled as needed.
   * - `Single`: This must remain `true`. Since only one side is captured in this
   *   mode, setting this to `false` will result in a settings validation
   *   failure.
   *
   * @default true
   */
  passportDataPageScanOnly: boolean;
  /**
   * Enables the extraction of the document's face image.
   *
   * If face image is present on the document, an extraction becomes mandatory
   * for supported documents. The requirement for its presence is determined by
   * document rules.
   *
   * For unsupported documents, presence is optional.
   *
   * @default false
   */
  faceImageExtractionEnabled: boolean;
  /**
   * If set to true, face image presence will be mandatory for the scanned
   * document.
   *
   * For `Automatic` scanning mode, document side with the face image must be
   * scanned first.
   *
   * In case of a timeout and advancement to the next step in the scanning flow,
   * if a face image is detected on the scanned side but cannot be extracted,
   * the presence requirement is considered fulfilled. As a result, face image
   * extraction will no longer be a requirement to complete the scan on next
   * side.
   *
   * @default false
   */
  faceImagePresenceMandatory: boolean;
  /**
   * Indicates whether input images should be returned in the result.
   *
   * Save the input images at the moment of the data extraction or timeout. This
   * significantly increases memory consumption. The scanning performance is not
   * affected.
   *
   * @default false
   */
  inputImageReturnEnabled: boolean;
  /**
   * Indicates whether the document image should be returned.
   *
   * @default false
   */
  documentImageReturnEnabled: boolean;
  /**
   * Defines the minimum required margin between the document and the edge of
   * the input image, expressed as a percentage of the image dimensions.
   *
   * This setting ensures compliance with regulations in certain countries that
   * mandate documents be stored with adequate visual margins.
   *
   * This setting is only applicable for the 'Video' input source Providing this
   * setting for 'Photo' will result in a settings validation failure.
   *
   * Allowed values range is [0.0, 1.0].
   *
   * Defaults to '0.02f' for `Video` mode (recommended).
   *
   * @default 0.02
   */
  inputImageMargin: number;
  /**
   * The DPI value for the cropped document, face and signature image.
   *
   * Allowed values range is [100, 400].
   *
   * @default 250
   */
  dotsPerInch: number;
  /**
   * The extension factor for the cropped document image. Applicable only to
   * document images.
   *
   * Allowed values range is [0.0, 1.0].
   *
   * @default 0.0
   */
  extensionFactor: number;
  /**
   * The sensitivity of blur detection in the document image.
   *
   * Defines the severity of blur detected in the document image, as defined in
   * `SensitivityLevel`. Values range from `Off` (detection NotAvailable) to
   * higher sensitivity levels of blur detection. Low – less sensitive to blur;
   * if something is detected as blur, it is almost certainly actual blur, but
   * some amount of blur may not be detected at all. High – highly sensitive to
   * blur; it may detect as blur even something that only resembles blur.
   *
   * @default "mid"
   */
  blurSensitivityLevel: SensitivityLevel;
  /**
   * Indicates whether images with detected blur should be rejected.
   *
   * A value of `true` means images with detected blur will be excluded from
   * further processing. If glare is detected, `ProcessingStatus` will be
   * `ImagePreprocessingFailed`.
   *
   * A value of `false` means images will be processed even if blur is detected,
   * and the blur status will be reported in the `ProcessResult`.
   *
   * Default behavior depends on `blurSensitivityLevel`:
   *
   * - `Low`, `Mid`, `High`: Defaults to `true`.
   * - `Off`: Defaults to `false`. This setting is not applicable if sensitivity
   *   level is `Off` and setting it to `true` will result in a settings
   *   validation failure.
   *
   * @default true
   */
  imageWithBlurRejected: boolean;
  /**
   * The sensitivity of glare detection in the document image.
   *
   * Defines the severity of glare detected in the document image, as defined in
   * `SensitivityLevel`. Values range from `Off` (detection NotAvailable) to
   * higher sensitivity levels of glare detection. Low – less sensitive to
   * glare; if something is detected as glare, it is almost certainly actual
   * glare, but some amount of glare may not be detected at all. High – highly
   * sensitive to glare; it may detect as glare even something that only
   * resembles glare.
   *
   * @default "mid"
   */
  glareSensitivityLevel: SensitivityLevel;
  /**
   * Indicates whether images with detected glare should be rejected.
   *
   * A value of `true` means images with detected glare will be excluded from
   * further processing. If glare is detected, `ProcessingStatus` will be
   * `ImagePreprocessingFailed`.
   *
   * A value of `false` means images will be processed even if glare is
   * detected, and the glare status will be reported in the `ProcessResult`.
   *
   * Default behavior depends on `glareSensitivityLevel`:
   *
   * - `Low`, `Mid`, `High`: Defaults to `true`.
   * - `Off`: Defaults to `false`. This setting is not applicable if sensitivity
   *   level is `Off` and Setting it to `true` will result in a settings
   *   validation failure.
   *
   * @default true
   */
  imageWithGlareRejected: boolean;
  /**
   * The sensitivity of allowed detected tilt of the document in the image.
   *
   * Defines the severity of allowed detected tilt of the document in the image,
   * as defined in `SensitivityLevel`. Values range from `Off` (detection
   * NotAvailable) to higher sensitivity levels of allowed tilt. Low – less
   * sensitive to tilt. High – highly sensitive to tilt.
   *
   * @default "mid"
   */
  tiltSensitivityLevel: SensitivityLevel;
  /**
   * Indicates whether images with poor lighting conditions should be rejected.
   *
   * Poor lighting conditions are represented as either `TooBright` or `TooDark`
   * document images, as defined in the `ImageAnalysisLightingStatus` type.
   *
   * A value of `true` means images with poor lighting conditions will be
   * excluded from further processing to prevent images with inadequate lighting
   * from being used.
   *
   * If poor light conditions are detected, `ProcessingStatus` will be
   * `ImagePreprocessingFailed` and lighting status will be reported in the
   * `ProcessResult`.
   *
   * @default true
   */
  imageWithPoorLightingRejected: boolean;
  /**
   * Indicates whether images occluded by hand should be rejected.
   *
   * When set to `true`, images where a hand is detected covering parts of the
   * document will be excluded from further processing. If occlusion is
   * detected, `ProcessingStatus` will be `ImagePreprocessingFailed` and hand
   * occlusion status will be reported in the `ProcessResult`.
   *
   * Default behavior depends on `inputImageCropped`:
   *
   * - `true`: Defaults to `false`. This setting is not applicable. Setting this
   *   to `true` while `inputImageCropped` is also `true` will result in a
   *   settings validation failure.
   * - `false`: Defaults to `true`. Images with hand occlusion are rejected.
   *
   * @default true
   */
  imageWithHandOcclusionRejected: boolean;
};

/**
 * Settings for the barcode extraction module.
 *
 * This module manages the detection and data extraction from various 1D and 2D
 * barcode formats (such as PDF417, QR codes, and various retail codes).
 *
 * If barcode is present on the document, an extraction becomes mandatory if
 * supported.
 *
 * For supported documents, the requirement for its presence is determined by
 * document rules. For unsupported documents, presence is optional.
 *
 * This setting can function independently of document capture module. If
 * enabled and document capture module is disabled session will be set to
 * extract barcode immediately at the initialization.
 */
export type BarcodeModuleSettings = {
  /**
   * If set to true, barcode presence becomes mandatory for the scanned
   * document.
   *
   * For Single ScanningMode, the barcode must be present on the scanned side.
   * For Automatic ScanningMode, the barcode must be present on one of the
   * scanned sides.
   *
   * In case of a timeout and advancement to the next step in the scanning flow,
   * if a barcode is detected on the scanned side but cannot be extracted, the
   * presence requirement is considered fulfilled. As a result, barcode
   * extraction will no longer be a requirement to complete the scan on next
   * side.
   *
   * @default false
   */
  presenceMandatory: boolean;
  /**
   * Indicates whether the barcode image should be returned in the result.
   *
   * The DPI setting and the extension factor do not affect returned barcode
   * image.
   *
   * @default false
   */
  barcodeImageReturnEnabled: boolean;
  /**
   * Enables the scanning and processing of Pdf417 barcodes.
   *
   * The current analyzer model flags a barcode as "present" if either a
   * `PDF417` or a `QR` code is detected. Because the model does not distinguish
   * between the two types at this stage, a conflict can occur: if `PDF417` is
   * enabled but `QR` is disabled, the analyzer may trigger for a `QR` code,
   * causing the process to hang.
   *
   * To prevent this, `pdf417ScanningEnabled` and `qrScanningEnabled` must be
   * enabled together.
   *
   * @default true
   */
  pdf417ScanningEnabled: boolean;
  /**
   * Enables the scanning and processing of QR barcodes.
   *
   * The current analyzer model flags a barcode as "present" if either a
   * `PDF417` or a `QR` code is detected. Because the model does not distinguish
   * between the two types at this stage, a conflict can occur: if `PDF417` is
   * enabled but `QR` is disabled, the analyzer may trigger for a `QR` code,
   * causing the process to hang.
   *
   * To prevent this, `qrScanningEnabled` and `pdf417ScanningEnabled` must be
   * enabled together.
   *
   * @default true
   */
  qrScanningEnabled: boolean;
  /**
   * Enables the scanning and processing of UPC-E barcodes.
   *
   * This setting can be enabled only if `documentCaptureEnabled` is disabled.
   *
   * @default false
   */
  upceScanningEnabled: boolean;
  /**
   * Enables the scanning and processing of UPC-A barcodes.
   *
   * This setting can be enabled only if `documentCaptureEnabled` is disabled.
   *
   * @default false
   */
  upcaScanningEnabled: boolean;
  /**
   * Enables the scanning and processing of Code-128 barcodes.
   *
   * This setting can be enabled only if `documentCaptureEnabled` is disabled.
   *
   * @default false
   */
  code128ScanningEnabled: boolean;
  /**
   * Enables the scanning and processing of Code-39 barcodes.
   *
   * This setting can be enabled only if `documentCaptureEnabled` is disabled.
   *
   * @default false
   */
  code39ScanningEnabled: boolean;
  /**
   * Enables the scanning and processing of EAN-8 barcodes.
   *
   * This setting can be enabled only if `documentCaptureEnabled` is disabled.
   *
   * @default false
   */
  ean8ScanningEnabled: boolean;
  /**
   * Enables the scanning and processing of EAN-13 barcodes.
   *
   * This setting can be enabled only if `documentCaptureEnabled` is disabled.
   *
   * @default false
   */
  ean13ScanningEnabled: boolean;
  /**
   * Enables the scanning and processing of ITF barcodes.
   *
   * This setting can be enabled only if `documentCaptureEnabled` is disabled.
   *
   * @default false
   */
  itfScanningEnabled: boolean;
  /**
   * Enables the scanning and processing of DataMatrix barcodes.
   *
   * This setting can be enabled only if `documentCaptureEnabled` is disabled.
   *
   * @default false
   */
  dataMatrixScanningEnabled: boolean;
};

/**
 * Settings for the MRZ (Machine Readable Zone) extraction module.
 *
 * This module is dedicated to the detection and parsing of machine-readable
 * zone typically found on passports, visas, and identity cards.
 *
 * If Mrz is present on the document, an extraction becomes mandatory if
 * supported.
 *
 * For supported documents, the requirement for its presence is determined by
 * document rules. For unsupported documents, presence is optional.
 *
 * This setting requires document capture module to be enabled. Disabling
 * document document capture module will result in a settings validation
 * failure.
 */
export type MrzModuleSettings = {
  /**
   * If set to true, Mrz presence becomes mandatory for the scanned document
   * regardless of the document rules.
   *
   * For Single ScanningMode, the Mrz must be present on the scanned side. For
   * Automatic ScanningMode, the Mrz must be present on one of the scanned
   * sides.
   *
   * In case of a timeout and advancement to the next step in the scanning flow,
   * if a Mrz is detected on the scanned side but cannot be extracted, the
   * presence requirement is considered fulfilled. As a result, Mrz extraction
   * will no longer be a requirement to complete the scan on next side.
   *
   * @default false
   */
  presenceMandatory: boolean;
};

/**
 * Settings for the VIZ (Visual Inspection Zone) extraction module.
 *
 * This module is responsible for extracting data from the document's visual
 * fields.
 *
 * It supports features such as character validation for increased accuracy,
 * signature image extraction, and data aggregation across multiple video
 * frames.
 *
 * Viz consists of various fields whose presence requirements are determined by
 * document rules. Successful VIZ extraction is only achieved once all mandatory
 * fields have been extracted (this doesn't imply that all optional fields have
 * been extracted)
 *
 * If Viz is present on the document, an extraction becomes mandatory if
 * supported.
 *
 * Scanning the back side only is insufficient as it lacks the necessary context
 * for data validation; in such cases, the Viz will be treated as not present.
 *
 * The Viz extraction must always initiate with the front side of the document.
 *
 * This setting requires document capture module to be enabled. Disabling
 * document document capture module will result in a settings validation
 * failure.
 */
export type VizModuleSettings = {
  /**
   * If set to true, Viz presence becomes mandatory for the scanned document.
   *
   * For Single ScanningMode, the Viz must be present on the scanned side. Only
   * the front side of supported documents can be scanned. For Automatic
   * ScanningMode, this setting won't affect the default behaviour; front side
   * must be scanned first followed by the back side.
   *
   * In case of a timeout and advancement to the next step in the scanning flow,
   * if a Viz was not extracted fully from a front side, we'll proceed to
   * extract Viz from the back side, if present.
   *
   * @default false
   */
  presenceMandatory: boolean;
  /**
   * Enables the extraction of the document's signature image if supported.
   *
   * For supported documents, signature image extraction is determined by
   * document rules. For unsupported documents, extraction won't be performed.
   *
   * @default false
   */
  signatureImageExtractionEnabled: boolean;
  /**
   * Indicates whether character validation is enabled.
   *
   * Allow only results containing expected characters for a given field. Each
   * field is validated against a set of rules. All fields have to be
   * successfully validated in order to successfully scan a document. Setting is
   * used to improve scanning accuracy.
   *
   * If set to `true`, when an invalid character is detected
   * `ProcessingStatus::InvalidCharactersFound` is returned.
   *
   * @default true
   */
  characterValidationEnabled: boolean;
  /**
   * Indicates whether the aggregation of data from multiple input images is
   * enabled.
   *
   * Disabling this setting will yield higher-quality captured images, but it
   * may slow down the scanning process due to the additional effort required to
   * find the optimal image.
   *
   * Enabling this setting will simplify the extraction process, but the
   * extracted data will be aggregated from multiple images instead of being
   * sourced from a single image.
   *
   * This setting is only applicable to the 'Video' input source. For 'Video',
   * it defaults to 'true'. Providing this setting for a 'Photo' source will
   * result in a settings validation failure.
   *
   * @default true for 'Video' input source, false for 'Photo' input source
   */
  resultAggregationEnabled: boolean;
};

/**
 * Represents the configurable settings for scanning a document.
 *
 * This structure allows for the granular configuration of different extraction
 * modules, enabling or disabling specific features based on the scanning use
 * case.
 */
export type ScanningSettings = {
  /**
   * Settings for the document capture module.
   *
   * This module is responsible for the initial document detection, image
   * extraction (such as face and document images), and image quality validation
   * (blur, glare, and lighting checks).
   *
   * For Automatic ScanningMode, when scanning a supported document, the front
   * side must be captured first, followed by the back side. When scanning an
   * unsupported document, the capture order is flexible; since the side cannot
   * be identified, either side can be scanned first.
   *
   * This setting must be turned on for Viz and Mrz extraction to work
   * correctly.
   *
   * If enabled, session will start with document detection step at the
   * initialization.
   */
  documentCaptureModule: DocumentCaptureModuleSettings | null;
  /**
   * Settings for the barcode extraction module.
   *
   * This module manages the detection and data extraction from various 1D and
   * 2D barcode formats (such as PDF417, QR codes, and various retail codes).
   *
   * If barcode is present on the document, an extraction becomes mandatory if
   * supported.
   *
   * For supported documents, the requirement for its presence is determined by
   * document rules. For unsupported documents, presence is optional.
   *
   * This setting can function independently of document capture module. If
   * enabled and document capture module is disabled session will be set to
   * extract barcode immediately at the initialization.
   */
  barcodeModule: BarcodeModuleSettings | null;
  /**
   * Settings for the MRZ (Machine Readable Zone) extraction module.
   *
   * This module is dedicated to the detection and parsing of machine-readable
   * zone typically found on passports, visas, and identity cards.
   *
   * If Mrz is present on the document, an extraction becomes mandatory if
   * supported.
   *
   * For supported documents, the requirement for its presence is determined by
   * document rules. For unsupported documents, presence is optional.
   *
   * This setting requires document capture module to be enabled. Disabling
   * document document capture module will result in a settings validation
   * failure.
   */
  mrzModule: MrzModuleSettings | null;
  /**
   * Settings for the VIZ (Visual Inspection Zone) extraction module.
   *
   * This module is responsible for extracting data from the document's visual
   * fields.
   *
   * It supports features such as character validation for increased accuracy,
   * signature image extraction, and data aggregation across multiple video
   * frames.
   *
   * Viz consists of various fields whose presence requirements are determined
   * by document rules. Successful VIZ extraction is only achieved once all
   * mandatory fields have been extracted (this doesn't imply that all optional
   * fields have been extracted)
   *
   * If Viz is present on the document, an extraction becomes mandatory if
   * supported.
   *
   * Scanning the back side only is insufficient as it lacks the necessary
   * context for data validation; in such cases, the Viz will be treated as not
   * present.
   *
   * The Viz extraction must always initiate with the front side of the
   * document.
   *
   * This setting requires document capture module to be enabled. Disabling
   * document document capture module will result in a settings validation
   * failure.
   */
  vizModule: VizModuleSettings | null;
  /**
   * The maximum allowed mismatches per field during data matching.
   *
   * Configures the maximum number of characters per field that can be
   * inconsistent during data matching. By default, no mismatches are allowed.
   */
  maxAllowedMismatchesPerField: number;
};
