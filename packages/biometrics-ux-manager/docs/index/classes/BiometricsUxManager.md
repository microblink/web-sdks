[**@microblink/biometrics-ux-manager**](../../README.md)

***

[@microblink/biometrics-ux-manager](../../README.md) / [index](../README.md) / BiometricsUxManager

# Class: BiometricsUxManager\<Result, Event, SessionError, DiagnosticEvent, DialogKind\>

## Type Parameters

### Result

`Result` = `unknown`

### Event

`Event` = [`BiometricsUxSessionEvent`](../type-aliases/BiometricsUxSessionEvent.md)

### SessionError

`SessionError` = [`BiometricsError`](BiometricsError.md)

### DiagnosticEvent

`DiagnosticEvent` = [`BiometricsDiagnosticEvent`](../type-aliases/BiometricsDiagnosticEvent.md)

### DialogKind

`DialogKind` *extends* `string` = `never`

## Constructors

### Constructor

> **new BiometricsUxManager**\<`Result`, `Event`, `SessionError`, `DiagnosticEvent`, `DialogKind`\>(`cameraManager`, `session`, `deviceInfo`, `options?`): `BiometricsUxManager`\<`Result`, `Event`, `SessionError`, `DiagnosticEvent`, `DialogKind`\>

#### Parameters

##### cameraManager

`CameraManager`

##### session

[`BiometricsUxSession`](../type-aliases/BiometricsUxSession.md)\<`Result`, `Event`, `SessionError`, `DiagnosticEvent`\>

##### deviceInfo

`DeviceInfo`

##### options?

[`BiometricsUxManagerOptions`](../type-aliases/BiometricsUxManagerOptions.md)\<`Result`, `Event`, `SessionError`, `DiagnosticEvent`, `DialogKind`\> = `{}`

#### Returns

`BiometricsUxManager`\<`Result`, `Event`, `SessionError`, `DiagnosticEvent`, `DialogKind`\>

## Properties

### deviceInfo

> `readonly` **deviceInfo**: `DeviceInfo`

## Accessors

### cameraManager

#### Get Signature

> **get** **cameraManager**(): `CameraManager`

##### Returns

`CameraManager`

***

### isDesktop

#### Get Signature

> **get** **isDesktop**(): `boolean`

##### Returns

`boolean`

## Methods

### beginCapture()

> **beginCapture**(): `Promise`\<`Result`\>

#### Returns

`Promise`\<`Result`\>

***

### captureAnimationComplete()

> **captureAnimationComplete**(): `void`

#### Returns

`void`

***

### close()

> **close**(`closeReason?`): `void`

#### Parameters

##### closeReason?

[`CloseReason`](../type-aliases/CloseReason.md) = `"Sdk"`

#### Returns

`void`

***

### closeHelp()

> **closeHelp**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### getState()

> **getState**(): [`BiometricsUxState`](../type-aliases/BiometricsUxState.md)\<`SessionError`, `DialogKind`\>

#### Returns

[`BiometricsUxState`](../type-aliases/BiometricsUxState.md)\<`SessionError`, `DialogKind`\>

***

### openHelp()

> **openHelp**(): `void`

#### Returns

`void`

***

### retry()

> **retry**(): `Promise`\<`Result`\>

#### Returns

`Promise`\<`Result`\>

***

### subscribe()

> **subscribe**(`listener`): () => `void`

#### Parameters

##### listener

[`StateListener`](../type-aliases/StateListener.md)\<`SessionError`, `DialogKind`\>

#### Returns

() => `void`
