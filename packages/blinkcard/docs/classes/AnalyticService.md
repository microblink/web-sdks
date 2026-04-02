[**@microblink/blinkcard**](../README.md)

***

[@microblink/blinkcard](../README.md) / AnalyticService

# Class: AnalyticService

Analytic service
Provides a clean interface for tracking user interactions and events

## Constructors

### Constructor

> **new AnalyticService**(`__namedParameters`): `AnalyticService`

#### Parameters

##### \_\_namedParameters

###### pingFn

(`ping`) => `Promise`\<`void`\>

###### sendPingletsFn

() => `Promise`\<`void`\>

#### Returns

`AnalyticService`

## Methods

### logAlertDisplayedEvent()

> **logAlertDisplayedEvent**(`alertType`): `Promise`\<`void`\>

#### Parameters

##### alertType

`NonNullable`\<`undefined` \| `AlertType`\>

#### Returns

`Promise`\<`void`\>

***

### logAppMovedToBackgroundEvent()

> **logAppMovedToBackgroundEvent**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### logCameraClosedEvent()

> **logCameraClosedEvent**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### logCameraInputInfo()

> **logCameraInputInfo**(`pingData`): `Promise`\<`void`\>

#### Parameters

##### pingData

[`PingCameraInputInfoData`](../type-aliases/PingCameraInputInfoData.md)

#### Returns

`Promise`\<`void`\>

***

### logCameraPermissionCheck()

> **logCameraPermissionCheck**(`granted`): `Promise`\<`void`\>

#### Parameters

##### granted

`boolean`

#### Returns

`Promise`\<`void`\>

***

### logCameraPermissionRequest()

> **logCameraPermissionRequest**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### logCameraPermissionUserResponse()

> **logCameraPermissionUserResponse**(`granted`): `Promise`\<`void`\>

#### Parameters

##### granted

`boolean`

#### Returns

`Promise`\<`void`\>

***

### logCameraStartedEvent()

> **logCameraStartedEvent**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### logCloseButtonClickedEvent()

> **logCloseButtonClickedEvent**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### logDeviceInfo()

> **logDeviceInfo**(`pingData`): `Promise`\<`void`\>

#### Parameters

##### pingData

[`PingBrowserDeviceInfoData`](../type-aliases/PingBrowserDeviceInfoData.md)

#### Returns

`Promise`\<`void`\>

***

### logDeviceOrientation()

> **logDeviceOrientation**(`orientation`): `Promise`\<`void`\>

#### Parameters

##### orientation

`undefined` | `DeviceOrientation`

#### Returns

`Promise`\<`void`\>

***

### logErrorEvent()

> **logErrorEvent**(`__namedParameters`): `Promise`\<`void`\>

#### Parameters

##### \_\_namedParameters

###### error

`unknown`

###### errorType

`ErrorType`

###### origin

`string`

###### sessionNumber?

`number`

#### Returns

`Promise`\<`void`\>

***

### logErrorMessageEvent()

> **logErrorMessageEvent**(`errorMessageType`): `Promise`\<`void`\>

#### Parameters

##### errorMessageType

`undefined` | `ErrorMessageType`

#### Returns

`Promise`\<`void`\>

***

### logFlashlightState()

> **logFlashlightState**(`flashlightOn`): `Promise`\<`void`\>

#### Parameters

##### flashlightOn

`boolean`

#### Returns

`Promise`\<`void`\>

***

### logHardwareCameraInfo()

> **logHardwareCameraInfo**(`cameras`): `Promise`\<`void`\>

#### Parameters

##### cameras

`AvailableCamerasItem`[]

#### Returns

`Promise`\<`void`\>

***

### logHelpClosedEvent()

> **logHelpClosedEvent**(`contentFullyViewed`): `Promise`\<`void`\>

#### Parameters

##### contentFullyViewed

`boolean`

#### Returns

`Promise`\<`void`\>

***

### logHelpOpenedEvent()

> **logHelpOpenedEvent**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### logHelpTooltipDisplayedEvent()

> **logHelpTooltipDisplayedEvent**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### logOnboardingDisplayedEvent()

> **logOnboardingDisplayedEvent**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### logStepTimeoutEvent()

> **logStepTimeoutEvent**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### sendPinglets()

> **sendPinglets**(): `Promise`\<`void`\>

Safely send queued pinglets, handling errors gracefully

#### Returns

`Promise`\<`void`\>
