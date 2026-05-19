[**@microblink/blinkid-core**](../README.md)

***

[@microblink/blinkid-core](../README.md) / VizModuleSettings

# Type Alias: VizModuleSettings

> **VizModuleSettings** = `object`

Settings for the VIZ (Visual Inspection Zone) extraction module.

This module is responsible for extracting data from the document's visual
fields.

It supports features such as character validation for increased accuracy,
signature image extraction, and data aggregation across multiple video
frames.

Viz consists of various fields whose presence requirements are determined by
document rules. Successful VIZ extraction is only achieved once all mandatory
fields have been extracted (this doesn't imply that all optional fields have
been extracted)

If Viz is present on the document, an extraction becomes mandatory if
supported.

Scanning the back side only is insufficient as it lacks the necessary context
for data validation; in such cases, the Viz will be treated as not present.

The Viz extraction must always initiate with the front side of the document.

This setting requires document capture module to be enabled. Disabling
document document capture module will result in a settings validation
failure.

## Properties

### characterValidationEnabled

> **characterValidationEnabled**: `boolean`

Indicates whether character validation is enabled.

Allow only results containing expected characters for a given field. Each
field is validated against a set of rules. All fields have to be
successfully validated in order to successfully scan a document. Setting is
used to improve scanning accuracy.

If set to `true`, when an invalid character is detected
`ProcessingStatus::InvalidCharactersFound` is returned.

#### Default

```ts
true
```

***

### presenceMandatory

> **presenceMandatory**: `boolean`

If set to true, Viz presence becomes mandatory for the scanned document.

For Single ScanningMode, the Viz must be present on the scanned side. Only
the front side of supported documents can be scanned. For Automatic
ScanningMode, this setting won't affect the default behaviour; front side
must be scanned first followed by the back side.

In case of a timeout and advancement to the next step in the scanning flow,
if a Viz was not extracted fully from a front side, we'll proceed to
extract Viz from the back side, if present.

#### Default

```ts
false
```

***

### resultAggregationEnabled

> **resultAggregationEnabled**: `boolean`

Indicates whether the aggregation of data from multiple input images is
enabled.

Disabling this setting will yield higher-quality captured images, but it
may slow down the scanning process due to the additional effort required to
find the optimal image.

Enabling this setting will simplify the extraction process, but the
extracted data will be aggregated from multiple images instead of being
sourced from a single image.

This setting is only applicable to the 'Video' input source. For 'Video',
it defaults to 'true'. Providing this setting for a 'Photo' source will
result in a settings validation failure.

#### Default

```ts
true for 'Video' input source, false for 'Photo' input source
```

***

### signatureImageExtractionEnabled

> **signatureImageExtractionEnabled**: `boolean`

Enables the extraction of the document's signature image if supported.

For supported documents, signature image extraction is determined by
document rules. For unsupported documents, extraction won't be performed.

#### Default

```ts
false
```
