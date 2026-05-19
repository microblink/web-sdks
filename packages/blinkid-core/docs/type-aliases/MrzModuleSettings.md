[**@microblink/blinkid-core**](../README.md)

***

[@microblink/blinkid-core](../README.md) / MrzModuleSettings

# Type Alias: MrzModuleSettings

> **MrzModuleSettings** = `object`

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

## Properties

### presenceMandatory

> **presenceMandatory**: `boolean`

If set to true, Mrz presence becomes mandatory for the scanned document
regardless of the document rules.

For Single ScanningMode, the Mrz must be present on the scanned side. For
Automatic ScanningMode, the Mrz must be present on one of the scanned
sides.

In case of a timeout and advancement to the next step in the scanning flow,
if a Mrz is detected on the scanned side but cannot be extracted, the
presence requirement is considered fulfilled. As a result, Mrz extraction
will no longer be a requirement to complete the scan on next side.

#### Default

```ts
false
```
