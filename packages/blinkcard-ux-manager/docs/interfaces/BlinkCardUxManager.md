[**@microblink/blinkcard-ux-manager**](../README.md)

***

[@microblink/blinkcard-ux-manager](../README.md) / BlinkCardUxManager

# Interface: BlinkCardUxManager

The BlinkCardUxManager class. This is the main class that manages the UX of
the BlinkCard SDK. It is responsible for handling the UI state, the timeout,
and the haptic feedback.

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

> `readonly` **feedbackStabilizer**: [`FeedbackStabilizer`](../classes/FeedbackStabilizer.md)\<[`BlinkCardUiStateMap`](../type-aliases/BlinkCardUiStateMap.md)\>

The feedback stabilizer. Public to allow UI components to read scores,
event queues, and call restartCurrentStateTimer() for help-tooltip resets.

***

### scanningSession

> `readonly` **scanningSession**: `RemoteScanningSession`

The scanning session.

***

### sessionSettings

> `readonly` **sessionSettings**: `BlinkCardSessionSettings`

The session settings.

***

### showDemoOverlay

> `readonly` **showDemoOverlay**: `boolean`

Whether the demo overlay should be shown.

***

### showProductionOverlay

> `readonly` **showProductionOverlay**: `boolean`

Whether the production overlay should be shown.

## Accessors

### analytics

#### Get Signature

> **get** **analytics**(): `AnalyticService`

Gets the analytics service for tracking UX events.

##### Returns

`AnalyticService`

***

### mappedUiStateKey

#### Get Signature

> **get** **mappedUiStateKey**(): [`BlinkCardUiStateKey`](../type-aliases/BlinkCardUiStateKey.md)

Latest mapped candidate key before stabilization.

##### Returns

[`BlinkCardUiStateKey`](../type-aliases/BlinkCardUiStateKey.md)

***

### rawUiStateKey

#### Get Signature

> **get** **rawUiStateKey**(): [`BlinkCardUiStateKey`](../type-aliases/BlinkCardUiStateKey.md)

##### Deprecated

Use `mappedUiStateKey` (internal/debug) or `uiStateKey` (displayed state).

##### Returns

[`BlinkCardUiStateKey`](../type-aliases/BlinkCardUiStateKey.md)

***

### uiState

#### Get Signature

> **get** **uiState**(): [`BlinkCardUiState`](../type-aliases/BlinkCardUiState.md)

The current UI state. Updated internally by the RAF update loop.
Read externally once at UI mount to seed the initial Solid signal value;
subsequent updates are delivered via [addOnUiStateChangedCallback](#addonuistatechangedcallback).

##### Returns

[`BlinkCardUiState`](../type-aliases/BlinkCardUiState.md)

***

### uiStateKey

#### Get Signature

> **get** **uiStateKey**(): [`BlinkCardUiStateKey`](../type-aliases/BlinkCardUiStateKey.md)

The currently applied UI state key.

##### Returns

[`BlinkCardUiStateKey`](../type-aliases/BlinkCardUiStateKey.md)

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

Fully tears down the BlinkCardUxManager. Stops frame processing, cancels the
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

### getSessionResult()

> **getSessionResult**(): `Promise`\<`BlinkCardScanningResult`\>

Gets the result from the scanning session.

#### Returns

`Promise`\<`BlinkCardScanningResult`\>

The result.

***

### getShowDemoOverlay()

> **getShowDemoOverlay**(): `boolean`

Indicates whether the UI should display the demo overlay. Controlled by the
license property.

#### Returns

`boolean`

***

### getShowProductionOverlay()

> **getShowProductionOverlay**(): `boolean`

Indicates whether the UI should display the production overlay. Controlled by
the license property.

#### Returns

`boolean`

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

### logAlertDisplayed()

> **logAlertDisplayed**(`alertType`): `void`

Logs when an alert is displayed.

#### Parameters

##### alertType

`NonNullable`\<`undefined` \| `AlertType`\>

The type of alert displayed.

#### Returns

`void`

***

### logCloseButtonClicked()

> **logCloseButtonClicked**(): `void`

Logs when the close button is clicked.

#### Returns

`void`

***

### logHelpClosed()

> **logHelpClosed**(`fullyViewed`): `void`

Logs when the help modal is closed.

#### Parameters

##### fullyViewed

`boolean`

Whether the user viewed all help content before closing.

#### Returns

`void`

***

### logHelpOpened()

> **logHelpOpened**(): `void`

Logs when the help modal is opened.

#### Returns

`void`

***

### logHelpTooltipDisplayed()

> **logHelpTooltipDisplayed**(): `void`

Logs when the help tooltip is displayed.

#### Returns

`void`

***

### logOnboardingDisplayed()

> **logOnboardingDisplayed**(): `void`

Logs when the onboarding guide is displayed.

#### Returns

`void`

***

### reset()

> **reset**(): `void`

Resets the BlinkCardUxManager. Clears all callbacks.

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

### setTimeoutDuration()

> **setTimeoutDuration**(`duration`): `void`

Sets the duration after which the scanning session will timeout.

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
