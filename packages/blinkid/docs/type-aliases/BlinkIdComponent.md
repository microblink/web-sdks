[**@microblink/blinkid**](../README.md)

***

[@microblink/blinkid](../README.md) / BlinkIdComponent

# Type Alias: BlinkIdComponent

> **BlinkIdComponent** = `object`

Represents the BlinkID component with all SDK instances and UI elements.

## Properties

### addDocumentClassFilter

> **addDocumentClassFilter**: [`BlinkIdUxManagerType`](BlinkIdUxManagerType.md)\[`"addDocumentClassFilter"`\]

Adds a document class filter function.

***

### addOnDocumentFilteredCallback

> **addOnDocumentFilteredCallback**: [`BlinkIdUxManagerType`](BlinkIdUxManagerType.md)\[`"addOnDocumentFilteredCallback"`\]

Adds a callback function to be called when a document is filtered.

***

### addOnErrorCallback

> **addOnErrorCallback**: [`BlinkIdUxManagerType`](BlinkIdUxManagerType.md)\[`"addOnErrorCallback"`\]

Adds a callback function to be called when an error occurs.

***

### addOnResultCallback

> **addOnResultCallback**: [`BlinkIdUxManagerType`](BlinkIdUxManagerType.md)\[`"addOnResultCallback"`\]

Adds a callback function to be called when a result is obtained.

***

### blinkIdCore

> **blinkIdCore**: [`BlinkIdCore`](BlinkIdCore.md)

The BlinkID Core SDK instance.

***

### blinkIdUxManager

> **blinkIdUxManager**: [`BlinkIdUxManagerType`](BlinkIdUxManagerType.md)

The BlinkID UX Manager instance.

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

Destroys the BlinkID component and releases all resources.

#### Returns

`Promise`\<`void`\>
