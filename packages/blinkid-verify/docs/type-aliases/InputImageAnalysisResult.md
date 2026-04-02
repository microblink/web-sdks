[**@microblink/blinkid-verify**](../README.md)

***

[@microblink/blinkid-verify](../README.md) / InputImageAnalysisResult

# Type Alias: InputImageAnalysisResult

> **InputImageAnalysisResult** = `object`

## Properties

### blurDetected

> **blurDetected**: `boolean`

***

### extractionInputImageAnalysisResult

> **extractionInputImageAnalysisResult**: `object`

Information extracted from the currently processed frame

#### detectionStatus

> **detectionStatus**: [`DetectionStatus`](DetectionStatus.md)

The status of the detection. This status is used for guidance of the
document placement. Giving instructions to the user on how to position
the document in the frame.

#### documentLocation

> **documentLocation**: [`Quadrilateral`](Quadrilateral.md)

The location of the document quadrilateral in the frame.

#### documentOrientation

> **documentOrientation**: [`DocumentOrientation`](DocumentOrientation.md)

#### documentRotation

> **documentRotation**: [`DocumentRotation`](DocumentRotation.md)

#### isPassport

> **isPassport**: `boolean`

Categorieses the document as a passport

#### isPassportWithBarcode

> **isPassportWithBarcode**: `boolean`

Categorieses the document as a passport with barcode

#### processingStatus

> **processingStatus**: [`ProcessingStatus`](ProcessingStatus.md)

The status of the processing. Beeing either `success` or a potential
`issue in the scannign process`

***

### glareDetected

> **glareDetected**: `boolean`

***

### hasBarcodeReadingIssue

> **hasBarcodeReadingIssue**: `boolean`

***

### occlusionDetected

> **occlusionDetected**: `boolean`

***

### tiltDetected

> **tiltDetected**: `boolean`
