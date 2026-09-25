[**@microblink/biometrics-ux-manager**](../../README.md)

***

[@microblink/biometrics-ux-manager](../../README.md) / [index](../README.md) / BiometricsUxManagerOptions

# Type Alias: BiometricsUxManagerOptions\<Result, Event, SessionError, DiagnosticEvent, DialogKind\>

> **BiometricsUxManagerOptions**\<`Result`, `Event`, `SessionError`, `DiagnosticEvent`, `DialogKind`\> = `object`

## Type Parameters

### Result

`Result` = `unknown`

### Event

`Event` = [`BiometricsUxSessionEvent`](BiometricsUxSessionEvent.md)

### SessionError

`SessionError` = [`BiometricsError`](../classes/BiometricsError.md)

### DiagnosticEvent

`DiagnosticEvent` = [`BiometricsDiagnosticEvent`](BiometricsDiagnosticEvent.md)

### DialogKind

`DialogKind` *extends* `string` = `never`

## Properties

### analytics?

> `optional` **analytics?**: [`AnalyticsTransport`](AnalyticsTransport.md)

***

### errorDialogAlertTypes?

> `optional` **errorDialogAlertTypes?**: `Partial`\<`Record`\<`DialogKind`, [`AlertType`](AlertType.md)\>\>

Analytics alert types reported when a custom error dialog is shown.

***

### helpNudgeDelayMs?

> `optional` **helpNudgeDelayMs?**: `number` \| `null`

***

### onCaptureAnimationComplete?

> `optional` **onCaptureAnimationComplete?**: () => `void`

#### Returns

`void`

***

### onDiagnostic?

> `optional` **onDiagnostic?**: (`event`) => `void`

#### Parameters

##### event

`DiagnosticEvent`

#### Returns

`void`

***

### onError?

> `optional` **onError?**: (`error`) => `void`

#### Parameters

##### error

[`BiometricsError`](../classes/BiometricsError.md) \| `SessionError`

#### Returns

`void`

***

### onEvent?

> `optional` **onEvent?**: (`event`) => `void`

#### Parameters

##### event

[`BiometricsUxEvent`](BiometricsUxEvent.md)\<`Event`\>

#### Returns

`void`

***

### onResult?

> `optional` **onResult?**: (`result`) => `void`

#### Parameters

##### result

`Result`

#### Returns

`void`

***

### resolveErrorDialogKind?

> `optional` **resolveErrorDialogKind?**: (`error`, `stage`) => `DialogKind` \| `undefined`

Selects a custom error dialog for a session failure. Return `undefined` to use the default dialog.

#### Parameters

##### error

`SessionError`

##### stage

[`BiometricsUxFailureStage`](BiometricsUxFailureStage.md)

#### Returns

`DialogKind` \| `undefined`

***

### showDebugOverlay?

> `optional` **showDebugOverlay?**: `boolean`

***

### showOnboarding?

> `optional` **showOnboarding?**: `boolean`
