[**@microblink/blinkcard-core**](../README.md)

***

[@microblink/blinkcard-core](../README.md) / BlinkCardProcessResult

# Type Alias: BlinkCardProcessResult

> **BlinkCardProcessResult** = `object`

Represents the overall result of the card processing pipeline.

This structure combines the results of input image analysis and processing,
including detection, card image quality analysis, along with information
about the completeness of the extraction process for the card.

## Properties

### inputImageAnalysisResult

> **inputImageAnalysisResult**: [`InputImageAnalysisResult`](InputImageAnalysisResult.md)

Result of the processing and analysis of the input image.

***

### resultCompleteness

> **resultCompleteness**: [`ResultCompleteness`](ResultCompleteness.md)

Completeness of the extraction process.
