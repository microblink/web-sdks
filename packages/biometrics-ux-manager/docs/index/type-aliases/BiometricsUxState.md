[**@microblink/biometrics-ux-manager**](../../README.md)

***

[@microblink/biometrics-ux-manager](../../README.md) / [index](../README.md) / BiometricsUxState

# Type Alias: BiometricsUxState\<SessionError, DialogKind\>

> **BiometricsUxState**\<`SessionError`, `DialogKind`\> = `object`

## Type Parameters

### SessionError

`SessionError` = [`BiometricsError`](../classes/BiometricsError.md)

### DialogKind

`DialogKind` *extends* `string` = `never`

## Properties

### boundingBox?

> `optional` **boundingBox?**: `BoundingBox`

***

### error?

> `optional` **error?**: [`BiometricsError`](../classes/BiometricsError.md) \| `SessionError`

***

### errorDialogKind?

> `optional` **errorDialogKind?**: [`BiometricsErrorDialogKind`](BiometricsErrorDialogKind.md) \| `DialogKind`

***

### faceBounds?

> `optional` **faceBounds?**: `BoundingBox`

***

### feedback

> **feedback**: `UnifiedFeedback`

***

### frameSize

> **frameSize**: `object`

#### height

> **height**: `number`

#### width

> **width**: `number`

***

### helpNudgeVisible

> **helpNudgeVisible**: `boolean`

***

### key

> **key**: [`BiometricsUxStateKey`](BiometricsUxStateKey.md)

***

### landmarks?

> `optional` **landmarks?**: `FaceLandmarks`

***

### mirrorX

> **mirrorX**: `boolean`

***

### sessionState

> **sessionState**: `CaptureSessionState`
