[**@microblink/blinkid-verify**](../README.md)

***

[@microblink/blinkid-verify](../README.md) / BlinkIdVerifyProcessResult

# Type Alias: BlinkIdVerifyProcessResult

> **BlinkIdVerifyProcessResult** = `object`

Represents the analysis and processing results of an input frame. Provides
real-time feedback on the document's state, identifying any obstacles
preventing successful processing. It also contains extracted data used to
determine the next steps in the scanning workflow.

## Properties

### inputImageAnalysisResult

> **inputImageAnalysisResult**: [`InputImageAnalysisResult`](InputImageAnalysisResult.md)

The result of analyzing the frame. Indicating any issues with the currently
processed frame as well as giving some information about the document

***

### resultCompleteness

> **resultCompleteness**: [`ResultCompleteness`](ResultCompleteness.md)

Tracking information for the scanning lifecycle. Indicates when the session
has gathered enough data to produce a final result.
