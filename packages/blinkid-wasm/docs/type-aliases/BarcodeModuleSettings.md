[**@microblink/blinkid-wasm**](../README.md)

***

[@microblink/blinkid-wasm](../README.md) / BarcodeModuleSettings

# Type Alias: BarcodeModuleSettings

> **BarcodeModuleSettings** = `object`

Settings for the barcode extraction module.

This module manages the detection and data extraction from various 1D and 2D
barcode formats (such as PDF417, QR codes, and various retail codes).

If barcode is present on the document, an extraction becomes mandatory if
supported.

For supported documents, the requirement for its presence is determined by
document rules. For unsupported documents, presence is optional.

This setting can function independently of document capture module. If
enabled and document capture module is disabled session will be set to
extract barcode immediately at the initialization.

## Properties

### aztecScanningEnabled

> **aztecScanningEnabled**: `boolean`

Enables the scanning and processing of Aztec barcodes.

This setting can be enabled only if `documentCaptureEnabled` is disabled.

#### Default

```ts
false
```

***

### barcodeImageReturnEnabled

> **barcodeImageReturnEnabled**: `boolean`

Indicates whether the barcode image should be returned in the result.

The DPI setting and the extension factor do not affect returned barcode
image.

#### Default

```ts
false
```

***

### code128ScanningEnabled

> **code128ScanningEnabled**: `boolean`

Enables the scanning and processing of Code-128 barcodes.

This setting can be enabled only if `documentCaptureEnabled` is disabled.

#### Default

```ts
false
```

***

### code39ScanningEnabled

> **code39ScanningEnabled**: `boolean`

Enables the scanning and processing of Code-39 barcodes.

This setting can be enabled only if `documentCaptureEnabled` is disabled.

#### Default

```ts
false
```

***

### dataMatrixScanningEnabled

> **dataMatrixScanningEnabled**: `boolean`

Enables the scanning and processing of DataMatrix barcodes.

This setting can be enabled only if `documentCaptureEnabled` is disabled.

#### Default

```ts
false
```

***

### ean13ScanningEnabled

> **ean13ScanningEnabled**: `boolean`

Enables the scanning and processing of EAN-13 barcodes.

This setting can be enabled only if `documentCaptureEnabled` is disabled.

#### Default

```ts
false
```

***

### ean8ScanningEnabled

> **ean8ScanningEnabled**: `boolean`

Enables the scanning and processing of EAN-8 barcodes.

This setting can be enabled only if `documentCaptureEnabled` is disabled.

#### Default

```ts
false
```

***

### itfScanningEnabled

> **itfScanningEnabled**: `boolean`

Enables the scanning and processing of ITF barcodes.

This setting can be enabled only if `documentCaptureEnabled` is disabled.

#### Default

```ts
false
```

***

### pdf417ScanningEnabled

> **pdf417ScanningEnabled**: `boolean`

Enables the scanning and processing of Pdf417 barcodes.

The current analyzer model flags a barcode as "present" if either a
`PDF417` or a `QR` code is detected. Because the model does not distinguish
between the two types at this stage, a conflict can occur: if `PDF417` is
enabled but `QR` is disabled, the analyzer may trigger for a `QR` code,
causing the process to hang.

To prevent this, `pdf417ScanningEnabled` and `qrScanningEnabled` must be
enabled together.

#### Default

```ts
true
```

***

### presenceMandatory

> **presenceMandatory**: `boolean`

If set to true, barcode presence becomes mandatory for the scanned
document.

For Single ScanningMode, the barcode must be present on the scanned side.
For Automatic ScanningMode, the barcode must be present on one of the
scanned sides.

In case of a timeout and advancement to the next step in the scanning flow,
if a barcode is detected on the scanned side but cannot be extracted, the
presence requirement is considered fulfilled. As a result, barcode
extraction will no longer be a requirement to complete the scan on next
side.

#### Default

```ts
false
```

***

### qrScanningEnabled

> **qrScanningEnabled**: `boolean`

Enables the scanning and processing of QR barcodes.

The current analyzer model flags a barcode as "present" if either a
`PDF417` or a `QR` code is detected. Because the model does not distinguish
between the two types at this stage, a conflict can occur: if `PDF417` is
enabled but `QR` is disabled, the analyzer may trigger for a `QR` code,
causing the process to hang.

To prevent this, `qrScanningEnabled` and `pdf417ScanningEnabled` must be
enabled together.

#### Default

```ts
true
```

***

### upcaScanningEnabled

> **upcaScanningEnabled**: `boolean`

Enables the scanning and processing of UPC-A barcodes.

This setting can be enabled only if `documentCaptureEnabled` is disabled.

#### Default

```ts
false
```

***

### upceScanningEnabled

> **upceScanningEnabled**: `boolean`

Enables the scanning and processing of UPC-E barcodes.

This setting can be enabled only if `documentCaptureEnabled` is disabled.

#### Default

```ts
false
```
