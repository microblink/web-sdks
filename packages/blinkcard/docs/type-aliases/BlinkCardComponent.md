[**@microblink/blinkcard**](../README.md)

***

[@microblink/blinkcard](../README.md) / BlinkCardComponent

# Type Alias: BlinkCardComponent

> **BlinkCardComponent** = `object`

Represents the BlinkCard component with all SDK instances and UI elements.

## Properties

### addOnErrorCallback

> **addOnErrorCallback**: [`BlinkCardUxManagerType`](BlinkCardUxManagerType.md)\[`"addOnErrorCallback"`\]

Adds a callback function to be called when an error occurs.

***

### addOnResultCallback

> **addOnResultCallback**: [`BlinkCardUxManagerType`](BlinkCardUxManagerType.md)\[`"addOnResultCallback"`\]

Adds a callback function to be called when a result is obtained.

***

### blinkCardCore

> **blinkCardCore**: [`BlinkCardCore`](BlinkCardCore.md)

The BlinkCard Core SDK instance.

***

### blinkCardUxManager

> **blinkCardUxManager**: [`BlinkCardUxManagerType`](BlinkCardUxManagerType.md)

The BlinkCard UX Manager instance.

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

Destroys the BlinkCard component and releases all resources.

#### Returns

`Promise`\<`void`\>
