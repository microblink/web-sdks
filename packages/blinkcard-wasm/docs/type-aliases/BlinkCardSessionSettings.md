[**@microblink/blinkcard-wasm**](../README.md)

***

[@microblink/blinkcard-wasm](../README.md) / BlinkCardSessionSettings

# Type Alias: BlinkCardSessionSettings

> **BlinkCardSessionSettings** = `object`

Represents the configuration settings for a scanning session.

This structure holds the settings related to the resources initialization,
input image source, and specific scanning configurations that define how the
scanning session should behave.

## Properties

### inputImageSource

> **inputImageSource**: [`InputImageSource`](InputImageSource.md)

The type of image source for the scanning session.

This type is used to indicate whether an image was obtained from a video
stream or a single-source input such as a standalone photo. The default is
set to `Video`.

***

### scanningSettings

> **scanningSettings**: [`ScanningSettings`](ScanningSettings.md)

The specific scanning settings for the scanning session.

Defines various parameters that control the scanning process.
