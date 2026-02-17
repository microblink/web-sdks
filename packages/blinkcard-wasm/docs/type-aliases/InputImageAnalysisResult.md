[**@microblink/blinkcard-wasm**](../README.md)

***

[@microblink/blinkcard-wasm](../README.md) / InputImageAnalysisResult

# Type Alias: InputImageAnalysisResult

> **InputImageAnalysisResult** = `object`

Represents the results of processing and analyzing an input image.

This structure contains the status of the processing, along with detailed
results from detection, and information about the card analysis performed on
the input image.

## Properties

### blurDetectionStatus

> **blurDetectionStatus**: [`ImageAnalysisDetectionStatus`](ImageAnalysisDetectionStatus.md)

***

### cardLocation

> **cardLocation**: \{ `lowerLeft`: \{ `x`: `number`; `y`: `number`; \}; `lowerRight`: \{ `x`: `number`; `y`: `number`; \}; `upperLeft`: \{ `x`: `number`; `y`: `number`; \}; `upperRight`: \{ `x`: `number`; `y`: `number`; \}; \} \| `undefined`

***

### cardRotation

> **cardRotation**: [`CardRotation`](CardRotation.md)

***

### detectionStatus

> **detectionStatus**: [`DetectionStatus`](DetectionStatus.md)

***

### processingStatus

> **processingStatus**: [`ProcessingStatus`](ProcessingStatus.md)

***

### scanningSide

> **scanningSide**: [`ScanningSide`](ScanningSide.md)
