[**@microblink/blinkcard-wasm**](../README.md)

***

[@microblink/blinkcard-wasm](../README.md) / ScanningSettings

# Type Alias: ScanningSettings

> **ScanningSettings** = `object`

Represents the configurable settings for scanning a card.

This structure defines various parameters and policies related to the
scanning process, including image quality handling, data extraction,
redaction, and liveness detection, along with options for frame
processing and image extraction.

## Properties

### croppedImageSettings

> **croppedImageSettings**: [`CroppedImageSettings`](CroppedImageSettings.md)

Configures the image cropping settings during scanning process.

Allows customization of cropped image handling, such as dotsPerInch,
extensionFactor, and whether images should be returned for the entire
card.

***

### extractionSettings

> **extractionSettings**: [`ExtractionSettings`](ExtractionSettings.md)

Controls which fields and images should be extracted from the card.

Disabling extraction of unused fields can improve recognition performance
or reduce memory usage.

***

### inputImageMargin

> **inputImageMargin**: `number`

Defines the minimum required margin (in percentage) between the edge of the
input image and the card.

Default value is 0.02f (also recommended value). The setting is applicable
only when using images from Video source

***

### livenessSettings

> **livenessSettings**: [`LivenessSettings`](LivenessSettings.md)

Represents the configurable settings for liveness detection.

This structure defines various parameters and policies related to the
liveness detection process, including checks for hand presence and screen
analysis.

***

### redactionSettings

> **redactionSettings**: [`RedactionSettings`](RedactionSettings.md)

Represents the configurable settings for data redaction.

This structure defines various parameters and policies related to the
redaction of sensitive data extracted from the payment cards.

***

### skipImagesWithBlur

> **skipImagesWithBlur**: `boolean`

Indicates whether to reject frames if blur is detected on the card image.

When `true` (default), frames with detected blur are skipped to ensure only
high-quality images are processed. When `false`, blurred frames are still
processed, and the blur status is reported in the
`BlinkCardProcessResult`.

***

### tiltSensitivityLevel

> **tiltSensitivityLevel**: [`SensitivityLevel`](SensitivityLevel.md)

The level of allowed detected tilt of the card in the image.

Defines the severity of allowed detected tilt of the card in the image, as defined in `SensitivityLevel`.
Values range from `Off` (detection turned off) to higher levels of allowed tilt.
