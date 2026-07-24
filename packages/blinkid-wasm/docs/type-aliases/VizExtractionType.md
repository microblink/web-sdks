[**@microblink/blinkid-wasm**](../README.md)

***

[@microblink/blinkid-wasm](../README.md) / VizExtractionType

# Type Alias: VizExtractionType

> **VizExtractionType** = `"not-available"` \| `"segmentation"` \| `"templating"` \| `"unsupported"`

Describes whether VIZ extraction was available for the processed input image
and which extraction path was selected.

- `"not-available"`: VIZ extraction has not been evaluated yet.
- `"segmentation"`: VIZ data was extracted using segmentation.
- `"templating"`: VIZ data was extracted using a document template.
- `"unsupported"`: VIZ extraction is not supported for the processed image.
