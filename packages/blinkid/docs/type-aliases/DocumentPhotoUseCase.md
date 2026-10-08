[**@microblink/blinkid**](../README.md)

***

[@microblink/blinkid](../README.md) / DocumentPhotoUseCase

# Type Alias: DocumentPhotoUseCase

> **DocumentPhotoUseCase** = `object`

Configures a document photo or gallery-image scanning session. Omitted properties use Core Identity defaults.

## Properties

### quality?

> `optional` **quality?**: [`PhotoQualityProfile`](PhotoQualityProfile.md)

Selects the trade-off between result accuracy and tolerance of lower-quality input.

#### Default Value

`"balanced"`

***

### scenario?

> `optional` **scenario?**: [`DocumentScenario`](DocumentScenario.md)

Selects which recognition modules run and what data must be present.

#### Default Value

`"general"`
