[**@microblink/blinkid-core**](../README.md)

***

[@microblink/blinkid-core](../README.md) / ResultCompleteness

# Type Alias: ResultCompleteness

> **ResultCompleteness** = `object`

Represents the completeness of the extraction process for a scanned document.

This structure tracks the status of the scanning process and indicates
whether specific components of the document, such as the specific fields from
the VIZ, MRZ, and barcode, have been successfully extracted.

## Properties

### barcode

> **barcode**: [`BarcodeCompleteness`](BarcodeCompleteness.md) \| `undefined`

Rich completeness for barcode extraction.

***

### barcodeImage

> **barcodeImage**: [`ImageCompleteness`](ImageCompleteness.md) \| `undefined`

Rich completeness for barcode image extraction.

***

### documentImages

> **documentImages**: [`ImageCompleteness`](ImageCompleteness.md)[] \| `undefined`

Rich completeness for document image extraction.

***

### faceImage

> **faceImage**: [`ImageCompleteness`](ImageCompleteness.md) \| `undefined`

Rich completeness for face image extraction.

***

### mrz

> **mrz**: [`MrzCompleteness`](MrzCompleteness.md) \| `undefined`

Rich completeness for MRZ extraction.

***

### signatureImage

> **signatureImage**: [`ImageCompleteness`](ImageCompleteness.md) \| `undefined`

Rich completeness for signature image extraction.

***

### viz

> **viz**: ([`VizCompleteness`](VizCompleteness.md) \| `null`)[] \| `undefined`

Rich per-module completeness for VIZ side results.
