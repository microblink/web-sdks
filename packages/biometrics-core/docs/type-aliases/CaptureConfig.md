[**@microblink/biometrics-core**](../README.md)

***

[@microblink/biometrics-core](../README.md) / CaptureConfig

# Type Alias: CaptureConfig

> **CaptureConfig** = `object`

Configuration options for initializing the capture client.

## Properties

### analytics?

> `optional` **analytics?**: [`CaptureAnalyticsSettings`](CaptureAnalyticsSettings.md)

Native Ping lifecycle settings.

***

### faceAnalysis?

> `optional` **faceAnalysis?**: [`FaceAnalysisSessionSettings`](FaceAnalysisSessionSettings.md)

Optional WASM session settings passed to the Biometrics worker.

***

### imageOrigin?

> `optional` **imageOrigin?**: [`ImageOrigin`](ImageOrigin.md)

Coordinate system used by provided frame images.

#### Default

```ts
"canvas2d"
```

***

### initializationTimeoutMs?

> `optional` **initializationTimeoutMs?**: `number`

Maximum duration for complete capture initialization.

#### Default

```ts
60000
```

***

### licenseKey

> **licenseKey**: `string`

License key used for capture module validation.

***

### logLevel?

> `optional` **logLevel?**: [`CaptureLogLevel`](CaptureLogLevel.md)

Minimum log level. Set to "debug" for verbose diagnostics, "silent" to disable logging.

#### Default

```ts
"warn"
```

***

### onDiagnostic?

> `optional` **onDiagnostic?**: [`BiometricsDiagnosticCallback`](BiometricsDiagnosticCallback.md)

Receives safe lifecycle and component diagnostics.

***

### onDownloadProgress?

> `optional` **onDownloadProgress?**: [`ProgressStatusCallback`](ProgressStatusCallback.md)

Optional callback for WASM and data-file download progress.

***

### resourcePath?

> `optional` **resourcePath?**: `string`

Optional override base path for model and WASM assets.

***

### wasmVariant?

> `optional` **wasmVariant?**: [`WasmVariant`](WasmVariant.md)

WebAssembly module variant to use. Defaults to automatic feature detection.
