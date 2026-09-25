[**@microblink/biometrics-ux-manager**](../../README.md)

***

[@microblink/biometrics-ux-manager](../../README.md) / [index](../README.md) / createBiometricsUxManager

# Function: createBiometricsUxManager()

> **createBiometricsUxManager**\<`Result`, `Event`, `SessionError`, `DiagnosticEvent`, `DialogKind`\>(`cameraManager`, `session`, `options?`): `Promise`\<[`BiometricsUxManager`](../classes/BiometricsUxManager.md)\<`Result`, `Event`, `SessionError`, `DiagnosticEvent`, `DialogKind`\>\>

## Type Parameters

### Result

`Result`

### Event

`Event` = [`BiometricsUxSessionEvent`](../type-aliases/BiometricsUxSessionEvent.md)

### SessionError

`SessionError` = [`BiometricsError`](../classes/BiometricsError.md)

### DiagnosticEvent

`DiagnosticEvent` = [`BiometricsDiagnosticEvent`](../type-aliases/BiometricsDiagnosticEvent.md)

### DialogKind

`DialogKind` *extends* `string` = `never`

## Parameters

### cameraManager

`CameraManager`

### session

[`BiometricsUxSession`](../type-aliases/BiometricsUxSession.md)\<`Result`, `Event`, `SessionError`, `DiagnosticEvent`\>

### options?

[`BiometricsUxManagerOptions`](../type-aliases/BiometricsUxManagerOptions.md)\<`Result`, `Event`, `SessionError`, `DiagnosticEvent`, `DialogKind`\>

## Returns

`Promise`\<[`BiometricsUxManager`](../classes/BiometricsUxManager.md)\<`Result`, `Event`, `SessionError`, `DiagnosticEvent`, `DialogKind`\>\>
