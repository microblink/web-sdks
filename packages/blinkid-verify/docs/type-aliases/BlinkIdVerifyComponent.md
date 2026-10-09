[**@microblink/blinkid-verify**](../README.md)

***

[@microblink/blinkid-verify](../README.md) / BlinkIdVerifyComponent

# Type Alias: BlinkIdVerifyComponent

> **BlinkIdVerifyComponent** = `object`

BlinkID Verify component.

Sessions always expose `submitResult` and `prepareVerifyRequest`. Capture callbacks receive the full resolver,
including `verifyCaptureResult`, and [BlinkIdVerifyComponent.verifyOnScanningCompletion](#verifyonscanningcompletion) is always available.

## Properties

### addOnCaptureCompletedCallback

> **addOnCaptureCompletedCallback**: [`BlinkIdVerifyUxManager`](../interfaces/BlinkIdVerifyUxManager.md)\[`"addOnCaptureCompletedCallback"`\]

Adds a callback invoked after document capture with a lazy result resolver.

The resolver includes `getCaptureResult` and `verifyCaptureResult`. Capture does not copy session results or submit
to the Verify API until a resolver method is called.

***

### addOnErrorCallback

> **addOnErrorCallback**: [`BlinkIdVerifyUxManager`](../interfaces/BlinkIdVerifyUxManager.md)\[`"addOnErrorCallback"`\]

Adds a callback function to be called when an error occurs.

***

### addOnFrameProcessCallback

> **addOnFrameProcessCallback**: [`BlinkIdVerifyUxManager`](../interfaces/BlinkIdVerifyUxManager.md)\[`"addOnFrameProcessCallback"`\]

Adds a callback function to be called on each processed frame.

***

### blinkIdVerifyCore

> **blinkIdVerifyCore**: [`BlinkIdVerifyCore`](BlinkIdVerifyCore.md)

Core initialized with Verify API submit. Its sessions can prepare and submit a Verify API request.

***

### blinkIdVerifyUxManager

> **blinkIdVerifyUxManager**: [`BlinkIdVerifyUxManager`](../interfaces/BlinkIdVerifyUxManager.md)

The BlinkIdVerify UX Manager instance.

***

### cameraManager

> **cameraManager**: [`CameraManager`](../classes/CameraManager.md)

The Camera Manager instance.

***

### cameraUi

> **cameraUi**: [`CameraManagerComponent`](CameraManagerComponent.md)

The Camera Manager UI instance.

***

### destroy

> **destroy**: () => `Promise`\<`void`\>

Destroys the BlinkIdVerify component and releases all resources.

#### Returns

`Promise`\<`void`\>

***

### verifyOnScanningCompletion

> **verifyOnScanningCompletion**: [`BlinkIdVerifyUxManager`](../interfaces/BlinkIdVerifyUxManager.md)\[`"verifyOnScanningCompletion"`\]

Submits the captured session to the Verify API when scanning completes.

Pass `{ onSuccess, onError }`. API failures are delivered to `onError` with the capture resolver.
