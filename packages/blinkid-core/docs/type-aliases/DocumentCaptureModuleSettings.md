[**@microblink/blinkid-core**](../README.md)

***

[@microblink/blinkid-core](../README.md) / DocumentCaptureModuleSettings

# Type Alias: DocumentCaptureModuleSettings

> **DocumentCaptureModuleSettings** = `object`

Settings for the document capture module.

This module is responsible for the initial document detection, image
extraction (such as face and document images), and image quality validation
(blur, glare, and lighting checks).

For Automatic ScanningMode, when scanning a supported document, the front
side must be captured first, followed by the back side. When scanning an
unsupported document, the capture order is flexible; since the side cannot be
identified, either side can be scanned first.

This setting must be turned on for Viz and Mrz extraction to work correctly.

If enabled, session will start with document detection step at the
initialization.

## Properties

### blurSensitivityLevel

> **blurSensitivityLevel**: [`SensitivityLevel`](SensitivityLevel.md)

The sensitivity of blur detection in the document image.

Defines the severity of blur detected in the document image, as defined in
`SensitivityLevel`. Values range from `Off` (detection NotAvailable) to
higher sensitivity levels of blur detection. Low – less sensitive to blur;
if something is detected as blur, it is almost certainly actual blur, but
some amount of blur may not be detected at all. High – highly sensitive to
blur; it may detect as blur even something that only resembles blur.

#### Default

```ts
"mid"
```

***

### documentImageReturnEnabled

> **documentImageReturnEnabled**: `boolean`

Indicates whether the document image should be returned.

#### Default

```ts
false
```

***

### dotsPerInch

> **dotsPerInch**: `number`

The DPI value for the cropped document, face and signature image.

Allowed values range is [100, 400].

#### Default

```ts
250
```

***

### extensionFactor

> **extensionFactor**: `number`

The extension factor for the cropped document image. Applicable only to
document images.

Allowed values range is [0.0, 1.0].

#### Default

```ts
0.0
```

***

### faceImageExtractionEnabled

> **faceImageExtractionEnabled**: `boolean`

Enables the extraction of the document's face image.

If face image is present on the document, an extraction becomes mandatory
for supported documents. The requirement for its presence is determined by
document rules.

For unsupported documents, presence is optional.

#### Default

```ts
false
```

***

### faceImagePresenceMandatory

> **faceImagePresenceMandatory**: `boolean`

If set to true, face image presence will be mandatory for the scanned
document.

For `Automatic` scanning mode, document side with the face image must be
scanned first.

In case of a timeout and advancement to the next step in the scanning flow,
if a face image is detected on the scanned side but cannot be extracted,
the presence requirement is considered fulfilled. As a result, face image
extraction will no longer be a requirement to complete the scan on next
side.

#### Default

```ts
false
```

***

### glareSensitivityLevel

> **glareSensitivityLevel**: [`SensitivityLevel`](SensitivityLevel.md)

The sensitivity of glare detection in the document image.

Defines the severity of glare detected in the document image, as defined in
`SensitivityLevel`. Values range from `Off` (detection NotAvailable) to
higher sensitivity levels of glare detection. Low – less sensitive to
glare; if something is detected as glare, it is almost certainly actual
glare, but some amount of glare may not be detected at all. High – highly
sensitive to glare; it may detect as glare even something that only
resembles glare.

#### Default

```ts
"mid"
```

***

### imageWithBlurRejected

> **imageWithBlurRejected**: `boolean`

Indicates whether images with detected blur should be rejected.

A value of `true` means images with detected blur will be excluded from
further processing. If glare is detected, `ProcessingStatus` will be
`ImagePreprocessingFailed`.

A value of `false` means images will be processed even if blur is detected,
and the blur status will be reported in the `ProcessResult`.

Default behavior depends on `blurSensitivityLevel`:

- `Low`, `Mid`, `High`: Defaults to `true`.
- `Off`: Defaults to `false`. This setting is not applicable if sensitivity
  level is `Off` and setting it to `true` will result in a settings
  validation failure.

#### Default

```ts
true
```

***

### imageWithGlareRejected

> **imageWithGlareRejected**: `boolean`

Indicates whether images with detected glare should be rejected.

A value of `true` means images with detected glare will be excluded from
further processing. If glare is detected, `ProcessingStatus` will be
`ImagePreprocessingFailed`.

A value of `false` means images will be processed even if glare is
detected, and the glare status will be reported in the `ProcessResult`.

Default behavior depends on `glareSensitivityLevel`:

- `Low`, `Mid`, `High`: Defaults to `true`.
- `Off`: Defaults to `false`. This setting is not applicable if sensitivity
  level is `Off` and Setting it to `true` will result in a settings
  validation failure.

#### Default

```ts
true
```

***

### imageWithHandOcclusionRejected

> **imageWithHandOcclusionRejected**: `boolean`

Indicates whether images occluded by hand should be rejected.

When set to `true`, images where a hand is detected covering parts of the
document will be excluded from further processing. If occlusion is
detected, `ProcessingStatus` will be `ImagePreprocessingFailed` and hand
occlusion status will be reported in the `ProcessResult`.

Default behavior depends on `inputImageCropped`:

- `true`: Defaults to `false`. This setting is not applicable. Setting this
  to `true` while `inputImageCropped` is also `true` will result in a
  settings validation failure.
- `false`: Defaults to `true`. Images with hand occlusion are rejected.

#### Default

```ts
true
```

***

### imageWithPoorLightingRejected

> **imageWithPoorLightingRejected**: `boolean`

Indicates whether images with poor lighting conditions should be rejected.

Poor lighting conditions are represented as either `TooBright` or `TooDark`
document images, as defined in the `ImageAnalysisLightingStatus` type.

A value of `true` means images with poor lighting conditions will be
excluded from further processing to prevent images with inadequate lighting
from being used.

If poor light conditions are detected, `ProcessingStatus` will be
`ImagePreprocessingFailed` and lighting status will be reported in the
`ProcessResult`.

#### Default

```ts
true
```

***

### inputImageCropped

> **inputImageCropped**: `boolean`

Indicates whether the input image is already cropped and
perspective-corrected.

If `true`, the input image must consist solely of the already cropped and
corrected document.

Default value is `false`.

This setting is not applicable to `Video` sources and will cause a
validation error if set to true.

#### Default

```ts
false
```

***

### inputImageMargin

> **inputImageMargin**: `number`

Defines the minimum required margin between the document and the edge of
the input image, expressed as a percentage of the image dimensions.

This setting ensures compliance with regulations in certain countries that
mandate documents be stored with adequate visual margins.

This setting is only applicable for the 'Video' input source Providing this
setting for 'Photo' will result in a settings validation failure.

Allowed values range is [0.0, 1.0].

Defaults to '0.02f' for `Video` mode (recommended).

#### Default

```ts
0.02
```

***

### inputImageReturnEnabled

> **inputImageReturnEnabled**: `boolean`

Indicates whether input images should be returned in the result.

Save the input images at the moment of the data extraction or timeout. This
significantly increases memory consumption. The scanning performance is not
affected.

#### Default

```ts
false
```

***

### passportDataPageScanOnly

> **passportDataPageScanOnly**: `boolean`

Indicates whether only the passport data page (the page containing the MRZ)
should be scanned.

If set to `false`, the scanning process will require a second page scan for
certain passport types that support it.

Default value is `true`.

Note for `ScanningMode`:

- `Automatic`: Can be toggled as needed.
- `Single`: This must remain `true`. Since only one side is captured in this
  mode, setting this to `false` will result in a settings validation
  failure.

#### Default

```ts
true
```

***

### secondSideWithNoExtractableDataSkipped

> **secondSideWithNoExtractableDataSkipped**: `boolean`

Indicates whether the back side scan should be skipped if that side
supports image capture only (no MRZ, Barcode, etc.).

Some documents have a back side that is supported for capture but contains
no extractable data. These sides can be captured only.

When `true`, processing stops after the front side for these documents.
When `false`, the back side is captured even if no data is extracted.

Default value is `true`.

Note for `ScanningMode`:

- `Automatic`: Can be toggled as needed to optimize the flow.
- `Single`: This must remain `true`. Since only one side is captured in this
  mode, setting this to `false` will result in a settings validation
  failure.

#### Default

```ts
true
```

***

### tiltSensitivityLevel

> **tiltSensitivityLevel**: [`SensitivityLevel`](SensitivityLevel.md)

The sensitivity of allowed detected tilt of the document in the image.

Defines the severity of allowed detected tilt of the document in the image,
as defined in `SensitivityLevel`. Values range from `Off` (detection
NotAvailable) to higher sensitivity levels of allowed tilt. Low – less
sensitive to tilt. High – highly sensitive to tilt.

#### Default

```ts
"mid"
```

***

### unsupportedDocumentsAllowed

> **unsupportedDocumentsAllowed**: `boolean`

Enables the scanning and processing of unsupported document types.

A document is considered unsupported if its classification result is
`OTHER`.

#### Default

```ts
false
```
