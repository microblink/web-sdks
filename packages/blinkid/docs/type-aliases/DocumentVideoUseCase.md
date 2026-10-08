[**@microblink/blinkid**](../README.md)

***

[@microblink/blinkid](../README.md) / DocumentVideoUseCase

# Type Alias: DocumentVideoUseCase

> **DocumentVideoUseCase** = `object`

Configures a live document scanning session. Omitted properties use Core Identity defaults.

## Properties

### captureEnvironment?

> `optional` **captureEnvironment?**: [`VideoCaptureEnvironment`](VideoCaptureEnvironment.md)

Selects the physical camera setup.

#### Default Value

`"hand-held"`

***

### quality?

> `optional` **quality?**: [`VideoQualityProfile`](VideoQualityProfile.md)

Selects the trade-off between capture speed and result accuracy.

#### Default Value

`"balanced"`

***

### scenario?

> `optional` **scenario?**: [`DocumentScenario`](DocumentScenario.md)

Selects which recognition modules run and what data must be present.

#### Default Value

`"general"`
