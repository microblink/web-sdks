[**@microblink/blinkid-core**](../README.md)

***

[@microblink/blinkid-core](../README.md) / SingleSideScanningResult

# Type Alias: SingleSideScanningResult

> **SingleSideScanningResult** = `object`

## Properties

### barcode

> **barcode**: [`BarcodeResult`](BarcodeResult.md) \| `undefined`

The data extracted from the barcode.

***

### barcodeImage

> **barcodeImage**: `ImageData` \| `undefined`

The input image containing parsable barcode.

***

### documentImage

> **documentImage**: `ImageData` \| `undefined`

The cropped document image.

***

### faceImage

> **faceImage**: [`DetailedCroppedImageResult`](DetailedCroppedImageResult.md) \| `undefined`

The cropped face image.

***

### inputImage

> **inputImage**: `ImageData` \| `undefined`

The input image.

***

### mrz

> **mrz**: [`MrzResult`](MrzResult.md) \| `undefined`

The data extracted from the Machine Readable Zone.

***

### signatureImage

> **signatureImage**: [`DetailedCroppedImageResult`](DetailedCroppedImageResult.md) \| `undefined`

The cropped signature image.

***

### viz

> **viz**: [`VizResult`](VizResult.md) \| `undefined`

The data extracted from the Visual Inspection Zone.
