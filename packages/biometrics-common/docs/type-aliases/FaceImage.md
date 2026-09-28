[**@microblink/biometrics-common**](../README.md)

***

[@microblink/biometrics-common](../README.md) / FaceImage

# Type Alias: FaceImage

> **FaceImage** = `object`

Represents an image captured by Biometrics, including security metadata.

## Properties

### image

> **image**: `ImageData`

The underlying image data.

***

### securityBlob

> **securityBlob**: `object`

Security metadata associated with the image.

#### config

> **config**: `string`

JSON stringified configuration used during image capture.

#### hash

> **hash**: `string`

Verification hash for the image and configuration.
