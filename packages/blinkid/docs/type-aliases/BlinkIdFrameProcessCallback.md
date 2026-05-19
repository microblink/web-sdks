[**@microblink/blinkid**](../README.md)

***

[@microblink/blinkid](../README.md) / BlinkIdFrameProcessCallback

# Type Alias: BlinkIdFrameProcessCallback()

> **BlinkIdFrameProcessCallback** = (`frameResult`, `advanceToNextStep`, `triggerStepTimeout`, `getLastFrame`) => `void`

Callback invoked after BlinkID processes a camera frame.

## Parameters

### frameResult

[`BlinkIdProcessResult`](BlinkIdProcessResult.md)

Process result for the current frame. This contains the
input image analysis and result completeness data that the UX manager uses to
map feedback state; it does not include the final scanning result.

### advanceToNextStep

() => `Promise`\<`void`\>

Advances the scanning session to the next required
step. Use this for custom flows that decide, from the frame result, that the
current side or step is complete before the default UX flow advances. For
example, call this once `frameResult` contains all data your integration
needs, even if the default flow would keep waiting for an optional barcode
step that is hard to capture on a poor camera.

### triggerStepTimeout

() => `void`

Immediately triggers the scan-step timeout path
for the active step. Use this when custom validation decides that the current
step should fail or stop waiting for more frames.

### getLastFrame

() => `ArrayBuffer`

Returns the raw `ArrayBuffer` for the frame that
produced `frameResult`. The buffer is intended for diagnostics or custom
tooling that needs the exact last processed frame.

## Returns

`void`
