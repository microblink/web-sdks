[**@microblink/blinkid-verify**](../README.md)

***

[@microblink/blinkid-verify](../README.md) / BlinkIdVerifyComponent

# Type Alias: BlinkIdVerifyComponent

> **BlinkIdVerifyComponent** = `object`

Represents the BlinkIdVerify component with all SDK instances and UI elements.

## Properties

### addOnErrorCallback

> **addOnErrorCallback**: [`BlinkIdVerifyUxManager`](../interfaces/BlinkIdVerifyUxManager.md)\[`"addOnErrorCallback"`\]

Adds a callback function to be called when an error occurs.

***

### addOnFrameProcessCallback

> **addOnFrameProcessCallback**: [`BlinkIdVerifyUxManager`](../interfaces/BlinkIdVerifyUxManager.md)\[`"addOnFrameProcessCallback"`\]

Adds a callback function to be called on each processed frame.

***

### addOnResultCallback

> **addOnResultCallback**: [`BlinkIdVerifyUxManager`](../interfaces/BlinkIdVerifyUxManager.md)\[`"addOnResultCallback"`\]

Adds a callback function to be called when a result is obtained.

***

### blinkIdVerifyCore

> **blinkIdVerifyCore**: [`BlinkIdVerifyCore`](BlinkIdVerifyCore.md)

The BlinkIdVerify Core SDK instance.

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

### destroy()

> **destroy**: () => `Promise`\<`void`\>

Destroys the BlinkIdVerify component and releases all resources.

#### Returns

`Promise`\<`void`\>
