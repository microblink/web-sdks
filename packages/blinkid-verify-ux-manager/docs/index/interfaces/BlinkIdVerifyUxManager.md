[**@microblink/blinkid-verify-ux-manager**](../../README.md)

***

[@microblink/blinkid-verify-ux-manager](../../README.md) / [index](../README.md) / BlinkIdVerifyUxManager

# Interface: BlinkIdVerifyUxManager

The BlinkIdVerifyUxManager class. This is the main class that manages the UX of the BlinkID Verify SDK. It is
responsible for handling the UI state, the timeout, the help tooltip, and the document class filter.

## Properties

### cameraManager

> `readonly` **cameraManager**: `CameraManager`

The camera manager.

***

### deviceInfo

> `readonly` **deviceInfo**: `DeviceInfo`

The device info.

***

### feedbackStabilizer

> `readonly` **feedbackStabilizer**: [`FeedbackStabilizer`](../classes/FeedbackStabilizer.md)\<[`BlinkIdVerifyUiStateMap`](../type-aliases/BlinkIdVerifyUiStateMap.md)\>

The feedback stabilizer. Public to allow UI components to read scores, event queues, and call
restartCurrentStateTimer() for help-tooltip resets.

***

### scanningSession

> `readonly` **scanningSession**: `RemoteScanningSession`

The scanning session.

***

### sessionSettings

> `readonly` **sessionSettings**: `BlinkIdVerifySessionSettings`

The session settings. Populated asynchronously from the scanning session.

***

### showDemoOverlay

> `readonly` **showDemoOverlay**: `boolean`

Whether the demo overlay should be shown. Populated asynchronously from the scanning session.

***

### showProductionOverlay

> `readonly` **showProductionOverlay**: `boolean`

Whether the production overlay should be shown. Populated asynchronously from the scanning session.

## Accessors

### analytics

#### Get Signature

> **get** **analytics**(): `AnalyticService`

Gets the analytics service for tracking UX events.

##### Returns

`AnalyticService`

The UX analytics service

***

### mappedUiStateKey

#### Get Signature

> **get** **mappedUiStateKey**(): [`BlinkIdVerifyUiStateKey`](../type-aliases/BlinkIdVerifyUiStateKey.md)

Latest mapped candidate key before stabilization.

##### Returns

[`BlinkIdVerifyUiStateKey`](../type-aliases/BlinkIdVerifyUiStateKey.md)

***

### uiState

#### Get Signature

> **get** **uiState**(): [`BlinkIdVerifyUiState`](../type-aliases/BlinkIdVerifyUiState.md)

The current UI state. Updated internally by the RAF update loop. Read externally once at UI mount to seed the
initial Solid signal value; subsequent updates are delivered via `addOnUiStateChangedCallback`.

##### Returns

[`BlinkIdVerifyUiState`](../type-aliases/BlinkIdVerifyUiState.md)

***

### uiStateKey

#### Get Signature

> **get** **uiStateKey**(): [`BlinkIdVerifyUiStateKey`](../type-aliases/BlinkIdVerifyUiStateKey.md)

The currently applied UI state key.

##### Returns

[`BlinkIdVerifyUiStateKey`](../type-aliases/BlinkIdVerifyUiStateKey.md)

## Methods

### addOnCaptureCompletedCallback()

> **addOnCaptureCompletedCallback**(`callback`): () => `void`

Registers a callback invoked after document capture with a lazy [CaptureResultResolver](../type-aliases/CaptureResultResolver.md).

Runs after the capture success animation and does not wait for the Verify API. Hosts can tear down scanning UI
here. Capture itself does not copy session results or submit to the Verify API; call resolver methods for the data
you need. If [BlinkIdVerifyUxManager.verifyOnScanningCompletion](#verifyonscanningcompletion) is also registered, keep the session alive
until those success or error callbacks run.

#### Parameters

##### callback

[`CaptureCompletedCallback`](../type-aliases/CaptureCompletedCallback.md)

Called with a resolver bound to this capture.

#### Returns

A cleanup function that removes the callback.

() => `void`

#### Example

```ts
const cleanup = manager.addOnCaptureCompletedCallback(async (resolver) => {
    const result = await resolver.getCaptureResult();
    console.log(result.typedPayload);
  });

  cleanup();
```

***

### addOnErrorCallback()

> **addOnErrorCallback**(`callback`): () => `void`

Registers a callback function to be called when an error occurs during processing.

#### Parameters

##### callback

(`errorState`) => `void`

A function that will be called with the error state.

#### Returns

A cleanup function that, when called, will remove the registered
callback.

() => `void`

#### Example

```ts
const cleanup = manager.addOnErrorCallback((error) => {
    console.error("Processing error:", error);
  });

  // Later, to remove the callback:
  cleanup();
```

***

### addOnFrameProcessCallback()

> **addOnFrameProcessCallback**(`callback`): () => `void`

Registers a callback function to be called when a frame is processed.

#### Parameters

##### callback

(`frameResult`) => `void`

A function that will be called with the frame analysis result.

#### Returns

A cleanup function that, when called, will remove the registered
callback.

() => `void`

#### Example

```ts
const cleanup = manager.addOnFrameProcessCallback((frameResult) => {
    console.log("Frame processed:", frameResult);
  });

  // Later, to remove the callback:
  cleanup();
```

***

### addOnUiStateChangedCallback()

> **addOnUiStateChangedCallback**(`callback`): () => `void`

Adds a callback function to be executed when the UI state changes.

#### Parameters

##### callback

(`uiState`) => `void`

Function to be called when UI state changes. Receives the new UI state as parameter.

#### Returns

A cleanup function that removes the callback when called.

() => `void`

#### Example

```ts
const cleanup = manager.addOnUiStateChangedCallback((newState) => {
    console.log("UI state changed to:", newState);
  });

  cleanup();
```

***

### cleanupAllObservers()

> **cleanupAllObservers**(): `void`

#### Returns

`void`

***

### clearScanTimeout()

> **clearScanTimeout**(): `void`

Clears the scanning session timeout.

#### Returns

`void`

***

### clearUserCallbacks()

> **clearUserCallbacks**(): `void`

#### Returns

`void`

***

### destroy()

> **destroy**(): `void`

Fully tears down the BlinkIdVerifyUxManager. Stops frame processing, cancels the scan timeout, removes all
subscriptions and the RAF loop, and clears all registered callbacks. Should be called when the manager is no longer
needed.

Does not stop the camera stream or delete the scanning session.

#### Returns

`void`

***

### getHapticFeedbackManager()

> **getHapticFeedbackManager**(): [`HapticFeedbackManager`](../classes/HapticFeedbackManager.md)

Gets the haptic feedback manager instance.

#### Returns

[`HapticFeedbackManager`](../classes/HapticFeedbackManager.md)

The haptic feedback manager

***

### getInitialUiStateKey()

> **getInitialUiStateKey**(): [`BlinkIdVerifyUiStateKey`](../type-aliases/BlinkIdVerifyUiStateKey.md)

Returns the initial UI state key used when resetting UX state.

#### Returns

[`BlinkIdVerifyUiStateKey`](../type-aliases/BlinkIdVerifyUiStateKey.md)

***

### getTimeoutDuration()

> **getTimeoutDuration**(): `number` \| `null`

Returns the timeout duration in ms. Null if timeout won't be triggered ever.

#### Returns

`number` \| `null`

***

### isHapticFeedbackEnabled()

> **isHapticFeedbackEnabled**(): `boolean`

Check if haptic feedback is currently enabled.

#### Returns

`boolean`

True if haptic feedback is enabled

***

### isHapticFeedbackSupported()

> **isHapticFeedbackSupported**(): `boolean`

Check if haptic feedback is supported by the current browser/device.

#### Returns

`boolean`

True if haptic feedback is supported

***

### reset()

> **reset**(): `void`

Resets the BlinkIdVerifyUxManager. Clears all callbacks.

Does not reset the camera manager or the scanning session.

#### Returns

`void`

***

### resetScanningSession()

> **resetScanningSession**(`startFrameCapture?`): `Promise`\<`void`\>

Resets the scanning session.

#### Parameters

##### startFrameCapture?

`boolean` = `true`

Whether to start frame processing.

#### Returns

`Promise`\<`void`\>

***

### setHapticFeedbackEnabled()

> **setHapticFeedbackEnabled**(`enabled`): `void`

Enable or disable haptic feedback.

#### Parameters

##### enabled

`boolean`

Whether haptic feedback should be enabled

#### Returns

`void`

***

### setInitialUiStateKey()

> **setInitialUiStateKey**(`uiStateKey`, `applyImmediately?`): `void`

Overrides the initial UI state key.

#### Parameters

##### uiStateKey

[`BlinkIdVerifyUiStateKey`](../type-aliases/BlinkIdVerifyUiStateKey.md)

The UI state key to use as manager initial state.

##### applyImmediately?

`boolean` = `false`

If true, immediately applies and emits this state.

#### Returns

`void`

***

### setTimeoutDuration()

> **setTimeoutDuration**(`duration`): `void`

Sets the duration after which the scanning session will timeout. The timeout can occur in various scenarios and may
be restarted by different scanning events.

#### Parameters

##### duration

`number` \| `null`

The timeout duration in milliseconds. If null, timeout won't be triggered ever.

#### Returns

`void`

#### Throws

Throws an error if duration is less than or equal to 0 when not null.

***

### startUiUpdateLoop()

> **startUiUpdateLoop**(): `void`

#### Returns

`void`

***

### stopUiUpdateLoop()

> **stopUiUpdateLoop**(): `void`

#### Returns

`void`

***

### verifyOnScanningCompletion()

> **verifyOnScanningCompletion**(`callbacks`): () => `void`

Submits the captured session to the Verify API when scanning completes, then invokes success or error callbacks.

Submit starts after the capture success animation. [BlinkIdVerifyUxManager.addOnCaptureCompletedCallback](#addoncapturecompletedcallback) runs
first and does not wait for the network; these success or error callbacks run when submit settles. Keep the session
alive until then if both APIs are used. Network submit is available on every session. The SDK posts to the base URL
configured at core init and sends no API key.

API failures are delivered to `onError` with the same resolver. From `onError`, call
[CaptureResultResolver.verifyCaptureResult](../type-aliases/CaptureResultResolver.md#verifycaptureresult) again to resubmit that capture while the scanning session is still
alive. That later call is not delivered to `onSuccess`.

#### Parameters

##### callbacks

[`VerifyOnScanningCompletionCallbacks`](../type-aliases/VerifyOnScanningCompletionCallbacks.md)

`onSuccess` receives the API result and capture resolver. `onError` receives a
  VerifyApiError and the capture resolver. The client chooses whether to resubmit.

#### Returns

A cleanup function that removes both callbacks.

() => `void`

#### Example

```ts
const cleanup = manager.verifyOnScanningCompletion({
    onSuccess: (apiResult) => {
      console.log(apiResult);
    },
    onError: async (error, resolver) => {
      console.error(error);
      const retry = await resolver.verifyCaptureResult();
      if (!retry.ok) {
        console.error(retry.error);
      }
    },
  });

  cleanup();
```
