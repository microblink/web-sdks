[**@microblink/blinkcard**](../README.md)

***

[@microblink/blinkcard](../README.md) / CameraManagerUiOptions

# Type Alias: CameraManagerUiOptions

> **CameraManagerUiOptions** = `object`

The camera manager UI options.

## Properties

### localizationStrings?

> `optional` **localizationStrings**: `Partial`\<[`CameraUiLocalizationStrings`](CameraUiLocalizationStrings.md)\>

The localization strings.

***

### showCameraErrorModal?

> `optional` **showCameraErrorModal**: `boolean`

If set to `true`, the camera error modal will be shown.

#### Default Value

```ts
true
```

***

### showCloseButton?

> `optional` **showCloseButton**: `boolean`

If set to `true`, the close button will be shown.

#### Default Value

```ts
true
```

***

### showMirrorCameraButton?

> `optional` **showMirrorCameraButton**: `boolean`

If set to `true`, the mirror camera button will be shown.

#### Default Value

```ts
false
```

***

### showTorchButton?

> `optional` **showTorchButton**: `boolean`

If set to `true`, the torch button will be shown.

#### Default Value

```ts
true
```

***

### zIndex?

> `optional` **zIndex**: `number`

The z-index of the camera UI when rendered as a full-screen overlay.
Only applies when no target element is provided.

If not provided, uses `calc(infinity)` to ensure the camera UI appears on top.

#### Default Value

```ts
calc(infinity)
```
