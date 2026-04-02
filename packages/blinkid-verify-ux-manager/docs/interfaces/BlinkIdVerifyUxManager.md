[**@microblink/blinkid-verify-ux-manager**](../README.md)

***

[@microblink/blinkid-verify-ux-manager](../README.md) / BlinkIdVerifyUxManager

# Interface: BlinkIdVerifyUxManager

The BlinkIdVerifyUxManager class. This is the main class that manages the UX of
the BlinkID Verify SDK. It is responsible for handling the UI state, the timeout,
the help tooltip, and the document class filter.

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

The feedback stabilizer. Public to allow UI components to read scores,
event queues, and call restartCurrentStateTimer() for help-tooltip resets.

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

The current UI state. Updated internally by the RAF update loop.
Read externally once at UI mount to seed the initial Solid signal value;
subsequent updates are delivered via `addOnUiStateChangedCallback`.

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

### addOnErrorCallback()

> **addOnErrorCallback**(`callback`): () => `void`

Registers a callback function to be called when an error occurs during
processing.

#### Parameters

##### callback

(`errorState`) => `void`

A function that will be called with the error state.

#### Returns

A cleanup function that, when called, will remove the registered
callback.

> (): `void`

##### Returns

`void`

#### Example

```ts
const cleanup = manager.addOnErrorCallback((error) => {
  console.error('Processing error:', error);
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

A function that will be called with the frame analysis
result.

#### Returns

A cleanup function that, when called, will remove the registered
callback.

> (): `void`

##### Returns

`void`

#### Example

```ts
const cleanup = manager.addOnFrameProcessCallback((frameResult) => {
  console.log('Frame processed:', frameResult);
});

// Later, to remove the callback:
cleanup();
```

***

### addOnResultCallback()

> **addOnResultCallback**(`callback`): () => `void`

Registers a callback function to be called when a scan result is available.

#### Parameters

##### callback

(`result`) => `void`

A function that will be called with the scan result.

#### Returns

A cleanup function that, when called, will remove the registered
callback.

> (): `void`

##### Returns

`void`

#### Example

```ts
const cleanup = manager.addOnResultCallback((result) => {
  console.log('Scan result:', result);
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

Function to be called when UI state changes. Receives the
new UI state as parameter.

#### Returns

A cleanup function that removes the callback when called.

> (): `void`

##### Returns

`void`

#### Example

```ts
const cleanup = manager.addOnUiStateChangedCallback((newState) => {
  console.log('UI state changed to:', newState);
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

Fully tears down the BlinkIdVerifyUxManager. Stops frame processing, cancels the
scan timeout, removes all subscriptions and the RAF loop, and clears all
registered callbacks. Should be called when the manager is no longer needed.

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

### getSessionResult()

> **getSessionResult**(): `Promise`\<`BlinkIdVerifyScanningResult`\>

Gets the result from the scanning session.

#### Returns

`Promise`\<`BlinkIdVerifyScanningResult`\>

The result.

***

### getTimeoutDuration()

> **getTimeoutDuration**(): `null` \| `number`

Returns the timeout duration in ms. Null if timeout won't be triggered ever.

#### Returns

`null` \| `number`

***

### isHapticFeedbackEnabled()

> **isHapticFeedbackEnabled**(): `boolean`

Check if haptic feedback is currently enabled.

#### Returns

`boolean`

true if haptic feedback is enabled

***

### isHapticFeedbackSupported()

> **isHapticFeedbackSupported**(): `boolean`

Check if haptic feedback is supported by the current browser/device.

#### Returns

`boolean`

true if haptic feedback is supported

***

### reset()

> **reset**(): `void`

Resets the BlinkIdVerifyUxManager. Clears all callbacks.

Does not reset the camera manager or the scanning session.

#### Returns

`void`

***

### resetScanningSession()

> **resetScanningSession**(`startFrameCapture`): `Promise`\<`void`\>

Resets the scanning session.

#### Parameters

##### startFrameCapture

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

> **setInitialUiStateKey**(`uiStateKey`, `applyImmediately`): `void`

Overrides the initial UI state key.

#### Parameters

##### uiStateKey

[`BlinkIdVerifyUiStateKey`](../type-aliases/BlinkIdVerifyUiStateKey.md)

The UI state key to use as manager initial state.

##### applyImmediately

`boolean` = `false`

If true, immediately applies and emits this state.

#### Returns

`void`

***

### setTimeoutDuration()

> **setTimeoutDuration**(`duration`): `void`

Sets the duration after which the scanning session will timeout. The
timeout can occur in various scenarios and may be restarted by different
scanning events.

#### Parameters

##### duration

The timeout duration in milliseconds. If null, timeout won't
be triggered ever.

`null` | `number`

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
