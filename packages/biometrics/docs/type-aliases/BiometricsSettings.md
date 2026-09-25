[**@microblink/biometrics**](../README.md)

***

[@microblink/biometrics](../README.md) / BiometricsSettings

# Type Alias: BiometricsSettings

> **BiometricsSettings** = `object`

Root SDK settings for face capture.

## Properties

### analytics?

> `optional` **analytics?**: [`BiometricsAnalyticsSettings`](BiometricsAnalyticsSettings.md)

***

### capture?

> `optional` **capture?**: [`BiometricsCaptureSettings`](BiometricsCaptureSettings.md)

***

### initializationTimeoutMs?

> `optional` **initializationTimeoutMs?**: `number`

Maximum initialization duration in milliseconds.

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

### onDownloadProgress?

> `optional` **onDownloadProgress?**: [`ProgressStatusCallback`](ProgressStatusCallback.md)

Optional callback for WASM and data-file download progress.

***

### resourcesLocation?

> `optional` **resourcesLocation?**: `string`

***

### wasmVariant?

> `optional` **wasmVariant?**: [`WasmVariant`](WasmVariant.md)

WebAssembly module variant to use. Defaults to automatic feature detection.
