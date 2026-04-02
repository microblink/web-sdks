[**@microblink/blinkid-verify-wasm**](../README.md)

***

[@microblink/blinkid-verify-wasm](../README.md) / InputImageSource

# Type Alias: InputImageSource

> **InputImageSource** = `"photo"` \| `"video"`

The source of the input image.

- `photo`: A single image will be provided to the sdk for analysis per side of
  document. This feature is currently not supported.
- `video`: A consecutive stream of images will be provided to the sdk.
