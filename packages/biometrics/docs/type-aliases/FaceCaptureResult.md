[**@microblink/biometrics**](../README.md)

***

[@microblink/biometrics](../README.md) / FaceCaptureResult

# Type Alias: FaceCaptureResult

> **FaceCaptureResult** = `object`

Complete result produced by a face capture session.

## Properties

### bestImage

> **bestImage**: [`CapturedImage`](CapturedImage.md)

***

### captureFrame?

> `optional` **captureFrame?**: [`CaptureFrame`](CaptureFrame.md)

***

### details?

> `optional` **details?**: `object`

#### boundingBox?

> `optional` **boundingBox?**: `BoundingBox`

#### inputImageSize?

> `optional` **inputImageSize?**: `object`

##### inputImageSize.height

> **height**: `number`

##### inputImageSize.width

> **width**: `number`

#### landmarks?

> `optional` **landmarks?**: [`FaceLandmarks`](FaceLandmarks.md)

***

### livenessBatchSignature?

> `optional` **livenessBatchSignature?**: [`CaptureSignature`](CaptureSignature.md)

***

### livenessFrames

> **livenessFrames**: [`LivenessFrame`](LivenessFrame.md)[]

***

### livenessMetadata?

> `optional` **livenessMetadata?**: `string`

***

### sessionNumber

> **sessionNumber**: `number`

***

### supportingImages

> **supportingImages**: [`CapturedImage`](CapturedImage.md)[]

***

### traceId

> **traceId**: `string`
