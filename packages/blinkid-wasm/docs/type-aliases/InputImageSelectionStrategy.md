[**@microblink/blinkid-wasm**](../README.md)

***

[@microblink/blinkid-wasm](../README.md) / InputImageSelectionStrategy

# Type Alias: InputImageSelectionStrategy

> **InputImageSelectionStrategy** = `"single-image"` \| `"optimize-for-speed"` \| `"balanced"` \| `"optimize-for-quality"`

Represents the strategy used to select the best input image from a pool of
stable input images.

Before selecting the best-quality image, a sequence of stable input images
must be collected. From this pool, the one with the highest quality is
selected. An input image is considered stable when the image analysis results
are consistent across a consecutive stream of input images.

A larger pool size increases the likelihood of capturing a high-quality image
but may introduce a slight delay, as more stable input images need to be
collected.

- `"single-image"`: Selects the first acceptable stable input image.
- `"optimize-for-speed"`: Faster processing, but may select a lower-quality
  image because a smaller pool of stable input images is considered.
- `"default"`: Trade-off between quality and speed.
- `"optimize-for-quality"`: Slower processing in order to select a high-quality
  input image, because a larger pool of stable input images is considered.
