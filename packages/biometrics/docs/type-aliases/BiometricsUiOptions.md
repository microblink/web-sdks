[**@microblink/biometrics**](../README.md)

***

[@microblink/biometrics](../README.md) / BiometricsUiOptions

# Type Alias: BiometricsUiOptions

> **BiometricsUiOptions** = `object`

## Properties

### analytics?

> `optional` **analytics?**: [`BiometricsAnalyticsSettings`](BiometricsAnalyticsSettings.md)

***

### cameraManagerUiOptions?

> `optional` **cameraManagerUiOptions?**: `Partial`\<`CameraManagerUiOptions`\>

***

### capture?

> `optional` **capture?**: [`BiometricsCaptureSettings`](BiometricsCaptureSettings.md)

***

### captureFace?

> `optional` **captureFace?**: [`BiometricsSessionConfig`](BiometricsSessionConfig.md)\[`"captureFace"`\]

***

### captureTimeoutMs?

> `optional` **captureTimeoutMs?**: `number` \| `null`

Capture timeout in milliseconds. Set to `null` to disable.

#### Default

```ts
60000
```

***

### feedbackUiOptions?

> `optional` **feedbackUiOptions?**: [`BiometricsFeedbackUiOptions`](BiometricsFeedbackUiOptions.md)

***

### initializationTimeoutMs?

> `optional` **initializationTimeoutMs?**: `number`

Maximum SDK initialization duration in milliseconds.

#### Default

```ts
60000
```

***

### licenseKey

> **licenseKey**: `string`

***

### onDiagnostic?

> `optional` **onDiagnostic?**: [`BiometricsDiagnosticCallback`](BiometricsDiagnosticCallback.md)

***

### onError?

> `optional` **onError?**: (`error`) => `void`

#### Parameters

##### error

[`BiometricsError`](../classes/BiometricsError.md)

#### Returns

`void`

***

### onEvent?

> `optional` **onEvent?**: (`event`) => `void`

#### Parameters

##### event

[`BiometricsUiEvent`](BiometricsUiEvent.md)

#### Returns

`void`

***

### onResult?

> `optional` **onResult?**: (`result`) => `void`

#### Parameters

##### result

[`FaceCaptureResult`](FaceCaptureResult.md)

#### Returns

`void`

***

### onSelectedCameraDeviceIdChange?

> `optional` **onSelectedCameraDeviceIdChange?**: (`deviceId`) => `void`

Called whenever the selected camera changes.

#### Parameters

##### deviceId

`string` \| `undefined`

#### Returns

`void`

***

### preferredCameraDeviceId?

> `optional` **preferredCameraDeviceId?**: `string`

***

### resourcesLocation?

> `optional` **resourcesLocation?**: `string`

***

### targetNode?

> `optional` **targetNode?**: `HTMLElement`

***

### wasmVariant?

> `optional` **wasmVariant?**: [`WasmVariant`](WasmVariant.md)

WebAssembly module variant to use. Defaults to automatic feature detection.
