[**@microblink/blinkid**](../README.md)

***

[@microblink/blinkid](../README.md) / BlinkIdUxManager

# Interface: BlinkIdUxManager

The BlinkIdUxManager class. This is the main class that manages the UX of
the BlinkID SDK. It is responsible for handling the UI state, the timeout,
the help tooltip, and the document class filter.

## Properties

### cameraManager

> `readonly` **cameraManager**: [`CameraManager`](../classes/CameraManager.md)

The camera manager.

***

### deviceInfo

> `readonly` **deviceInfo**: [`DeviceInfo`](../type-aliases/DeviceInfo.md)

The device info.

***

### feedbackStabilizer

> `readonly` **feedbackStabilizer**: [`FeedbackStabilizer`](../classes/FeedbackStabilizer.md)\<[`BlinkIdUiStateMap`](../type-aliases/BlinkIdUiStateMap.md)\>

The feedback stabilizer. Public to allow UI components to read scores,
event queues, and call restartCurrentStateTimer() for help-tooltip resets.

***

### handleCameraManagerError()

> **handleCameraManagerError**: (`error`) => `void`

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### scanningSession

> `readonly` **scanningSession**: [`RemoteScanningSession`](../type-aliases/RemoteScanningSession.md)

The scanning session.

***

### sessionSettings

> `readonly` **sessionSettings**: [`BlinkIdSessionSettings`](../type-aliases/BlinkIdSessionSettings.md)

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

> **get** **analytics**(): [`AnalyticService`](../classes/AnalyticService.md)

Gets the analytics service for tracking UX events.

##### Returns

[`AnalyticService`](../classes/AnalyticService.md)

The UX analytics service

***

### extractionMode

#### Get Signature

> **get** **extractionMode**(): `BlinkIdExtractionMode`

Session-settings-derived extraction mode used by feedback and dialogs.

##### Returns

`BlinkIdExtractionMode`

***

### mappedUiStateKey

#### Get Signature

> **get** **mappedUiStateKey**(): [`BlinkIdUiStateKey`](../type-aliases/BlinkIdUiStateKey.md)

Latest mapped candidate key before stabilization.

##### Returns

[`BlinkIdUiStateKey`](../type-aliases/BlinkIdUiStateKey.md)

***

### uiState

#### Get Signature

> **get** **uiState**(): [`BlinkIdUiState`](../type-aliases/BlinkIdUiState.md)

The current UI state. Updated internally by the RAF update loop.
Read externally once at UI mount to seed the initial Solid signal value;
subsequent updates are delivered via `addOnUiStateChangedCallback`.

##### Returns

[`BlinkIdUiState`](../type-aliases/BlinkIdUiState.md)

***

### uiStateKey

#### Get Signature

> **get** **uiStateKey**(): [`BlinkIdUiStateKey`](../type-aliases/BlinkIdUiStateKey.md)

The currently applied UI state key.

##### Returns

[`BlinkIdUiStateKey`](../type-aliases/BlinkIdUiStateKey.md)

## Methods

### addDocumentClassFilter()

> **addDocumentClassFilter**(`callback`): () => `void`

Registers a callback function to filter document classes.

#### Parameters

##### callback

[`DocumentClassFilter`](../type-aliases/DocumentClassFilter.md)

A function that will be called with the document class
info.

#### Returns

A cleanup function that, when called, will remove the registered
callback.

> (): `void`

##### Returns

`void`

#### Example

```ts
const cleanup = manager.addDocumentClassFilter((docClassInfo) => {
  return docClassInfo.country?.id === 'usa';
});

// Later, to remove the callback:
cleanup();
```

***

### addOnDocumentFilteredCallback()

> **addOnDocumentFilteredCallback**(`callback`): () => `void`

Registers a callback function to be called when a document is filtered.

#### Parameters

##### callback

(`documentClassInfo`) => `void`

A function that will be called with the document class
info.

#### Returns

A cleanup function that, when called, will remove the registered
callback.

> (): `void`

##### Returns

`void`

#### Example

```ts
const cleanup = manager.addOnDocumentFilteredCallback((docClassInfo) => {
  console.log('Document filtered:', docClassInfo);
});

// Later, to remove the callback:
cleanup();
```

***

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

[`BlinkIdFrameProcessCallback`](../type-aliases/BlinkIdFrameProcessCallback.md)

A function that receives the processed frame result and
controls for custom step advancement, step timeout triggering, and access to
the last processed frame buffer.

#### Returns

A cleanup function that, when called, will remove the registered
callback.

> (): `void`

##### Returns

`void`

#### Example

```ts
const cleanup = manager.addOnFrameProcessCallback((frameResult, advanceToNextStep) => {
  console.log('Frame processed:', frameResult);
  if (shouldAdvance(frameResult)) {
    void advanceToNextStep();
  }
});

// Later, to remove the callback:
cleanup();
```

***

### addOnProgressCallback()

> **addOnProgressCallback**(`callback`): () => `void`

Registers a callback function to receive BlinkID progress snapshots.

#### Parameters

##### callback

(`progress`) => `void`

A function that will be called with progress data from
the internal 30 FPS RAF loop.

#### Returns

A cleanup function that, when called, will remove the registered
callback.

> (): `void`

##### Returns

`void`

#### Example

```ts
const cleanup = manager.addOnProgressCallback((progress) => {
  console.log('BlinkID progress:', progress);
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

Fully tears down the BlinkIdUxManager. Stops frame processing, cancels the
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

> **getInitialUiStateKey**(): [`BlinkIdUiStateKey`](../type-aliases/BlinkIdUiStateKey.md)

Returns the initial UI state key used when resetting UX state.

#### Returns

[`BlinkIdUiStateKey`](../type-aliases/BlinkIdUiStateKey.md)

***

### getSessionResult()

> **getSessionResult**(): `Promise`\<[`BlinkIdScanningResult`](../type-aliases/BlinkIdScanningResult.md)\>

Gets the result from the scanning session.

#### Returns

`Promise`\<[`BlinkIdScanningResult`](../type-aliases/BlinkIdScanningResult.md)\>

The result.

***

### getTimeoutConfiguration()

> **getTimeoutConfiguration**(): [`BlinkIdTimeoutConfiguration`](../type-aliases/BlinkIdTimeoutConfiguration.md)

Returns the active BlinkID timeout configuration.

#### Returns

[`BlinkIdTimeoutConfiguration`](../type-aliases/BlinkIdTimeoutConfiguration.md)

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

Resets the BlinkIdUxManager. Clears all callbacks.

Does not reset the camera manager or the scanning session.

#### Returns

`void`

***

### resetScanningSession()

> **resetScanningSession**(`startFrameCapture?`): `Promise`\<`void`\>

Resets the scanning session.

#### Parameters

##### startFrameCapture?

`boolean`

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

[`BlinkIdUiStateKey`](../type-aliases/BlinkIdUiStateKey.md)

The UI state key to use as manager initial state.

##### applyImmediately?

`boolean`

If true, immediately applies and emits this state.

#### Returns

`void`

***

### setTimeoutConfiguration()

> **setTimeoutConfiguration**(`timeoutConfiguration`): `void`

Updates the BlinkID timeout configuration.

Updating the configuration resets timeout tracking for the current scan
step so the new durations take effect immediately.

#### Parameters

##### timeoutConfiguration

`Partial`\<[`BlinkIdTimeoutConfiguration`](../type-aliases/BlinkIdTimeoutConfiguration.md)\>

#### Returns

`void`

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
