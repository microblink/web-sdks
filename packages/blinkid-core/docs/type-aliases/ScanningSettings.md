[**@microblink/blinkid-core**](../README.md)

***

[@microblink/blinkid-core](../README.md) / ScanningSettings

# Type Alias: ScanningSettings

> **ScanningSettings** = `object`

Represents the configurable settings for scanning a document.

This structure allows for the granular configuration of different extraction
modules, enabling or disabling specific features based on the scanning use
case.

## Properties

### barcodeModule

> **barcodeModule**: [`BarcodeModuleSettings`](BarcodeModuleSettings.md) \| `null`

Settings for the barcode extraction module.

This module manages the detection and data extraction from various 1D and
2D barcode formats (such as PDF417, QR codes, and various retail codes).

If barcode is present on the document, an extraction becomes mandatory if
supported.

For supported documents, the requirement for its presence is determined by
document rules. For unsupported documents, presence is optional.

This setting can function independently of document capture module. If
enabled and document capture module is disabled session will be set to
extract barcode immediately at the initialization.

***

### documentCaptureModule

> **documentCaptureModule**: [`DocumentCaptureModuleSettings`](DocumentCaptureModuleSettings.md) \| `null`

Settings for the document capture module.

This module is responsible for the initial document detection, image
extraction (such as face and document images), and image quality validation
(blur, glare, and lighting checks).

For Automatic ScanningMode, when scanning a supported document, the front
side must be captured first, followed by the back side. When scanning an
unsupported document, the capture order is flexible; since the side cannot
be identified, either side can be scanned first.

This setting must be turned on for Viz and Mrz extraction to work
correctly.

If enabled, session will start with document detection step at the
initialization.

***

### maxAllowedMismatchesPerField

> **maxAllowedMismatchesPerField**: `number`

The maximum allowed mismatches per field during data matching.

Configures the maximum number of characters per field that can be
inconsistent during data matching. By default, no mismatches are allowed.

***

### mrzModule

> **mrzModule**: [`MrzModuleSettings`](MrzModuleSettings.md) \| `null`

Settings for the MRZ (Machine Readable Zone) extraction module.

This module is dedicated to the detection and parsing of machine-readable
zone typically found on passports, visas, and identity cards.

If Mrz is present on the document, an extraction becomes mandatory if
supported.

For supported documents, the requirement for its presence is determined by
document rules. For unsupported documents, presence is optional.

This setting requires document capture module to be enabled. Disabling
document document capture module will result in a settings validation
failure.

***

### vizModule

> **vizModule**: [`VizModuleSettings`](VizModuleSettings.md) \| `null`

Settings for the VIZ (Visual Inspection Zone) extraction module.

This module is responsible for extracting data from the document's visual
fields.

It supports features such as character validation for increased accuracy,
signature image extraction, and data aggregation across multiple video
frames.

Viz consists of various fields whose presence requirements are determined
by document rules. Successful VIZ extraction is only achieved once all
mandatory fields have been extracted (this doesn't imply that all optional
fields have been extracted)

If Viz is present on the document, an extraction becomes mandatory if
supported.

Scanning the back side only is insufficient as it lacks the necessary
context for data validation; in such cases, the Viz will be treated as not
present.

The Viz extraction must always initiate with the front side of the
document.

This setting requires document capture module to be enabled. Disabling
document document capture module will result in a settings validation
failure.
