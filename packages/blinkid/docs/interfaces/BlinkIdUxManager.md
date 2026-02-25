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

> **get** **analytics**(): `AnalyticService`

Gets the analytics service for tracking UX events.

##### Returns

`AnalyticService`

The UX analytics service

***

### mappedUiStateKey

#### Get Signature

> **get** **mappedUiStateKey**(): [`BlinkIdUiStateKey`](../type-aliases/BlinkIdUiStateKey.md)

Latest mapped candidate key before stabilization.

##### Returns

[`BlinkIdUiStateKey`](../type-aliases/BlinkIdUiStateKey.md)

***

### rawUiStateKey

#### Get Signature

> **get** **rawUiStateKey**(): [`BlinkIdUiStateKey`](../type-aliases/BlinkIdUiStateKey.md)

##### Deprecated

Use `mappedUiStateKey` (internal/debug) or `uiStateKey` (displayed state).

##### Returns

[`BlinkIdUiStateKey`](../type-aliases/BlinkIdUiStateKey.md)

***

### uiState

#### Get Signature

> **get** **uiState**(): [`BlinkIdUiState`](../type-aliases/BlinkIdUiState.md)

The current UI state. Updated internally by the RAF update loop.
Read externally once at UI mount to seed the initial Solid signal value;
subsequent updates are delivered via [addOnUiStateChangedCallback](#addonuistatechangedcallback).

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
  return docClassInfo.country === 'usa';
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

### ~~getHelpTooltipHideDelay()~~

> **getHelpTooltipHideDelay**(): `null` \| `number`

Returns the time in ms before the help tooltip is hidden. Null if tooltip won't be auto hidden.

#### Returns

`null` \| `number`

#### Deprecated

This option will be removed in a future release. Use `helpTooltipHideDelay` in `FeedbackUiOptions` instead.

***

### ~~getHelpTooltipShowDelay()~~

> **getHelpTooltipShowDelay**(): `null` \| `number`

Returns the time in ms before the help tooltip is shown. Null if tooltip won't be auto shown.

#### Returns

`null` \| `number`

#### Deprecated

This option will be removed in a future release. Use `helpTooltipShowDelay` in `FeedbackUiOptions` instead.

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

### ~~setHelpTooltipHideDelay()~~

> **setHelpTooltipHideDelay**(`duration`): `void`

Sets the duration in milliseconds before the help tooltip is hidden.
A value of null means the help tooltip will not be auto hidden.

#### Parameters

##### duration

The duration in milliseconds before the help tooltip is
hidden. If null, tooltip won't be auto hidden.

`null` | `number`

#### Returns

`void`

#### Throws

Throws an error if duration is less than or equal to 0 when
not null.

#### Deprecated

This option will be removed in a future release. Use `helpTooltipHideDelay` in `FeedbackUiOptions` instead.

***

### ~~setHelpTooltipShowDelay()~~

> **setHelpTooltipShowDelay**(`duration`): `void`

Sets the duration in milliseconds before the help tooltip is shown.
A value of null means the help tooltip will not be auto shown.

#### Parameters

##### duration

The duration in milliseconds before the help tooltip is
shown. If null, tooltip won't be auto shown.

`null` | `number`

#### Returns

`void`

#### Throws

Throws an error if duration is less than or equal to 0 when
not null.

#### Deprecated

This option will be removed in a future release. Use `helpTooltipShowDelay` in `FeedbackUiOptions` instead.

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

### setTimeoutDuration()

> **setTimeoutDuration**(`duration`, `setHelpTooltipShowDelay?`): `void`

Sets the duration after which the scanning session will timeout. The
timeout can occur in various scenarios and may be restarted by different
scanning events.

#### Parameters

##### duration

The timeout duration in milliseconds. If null, timeout won't
be triggered ever.

`null` | `number`

##### setHelpTooltipShowDelay?

`boolean`

If true, also sets the help tooltip show
delay to half of the provided duration. If timeout duration is null, help
tooltip show delay will be set to null. Defaults to true.

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
