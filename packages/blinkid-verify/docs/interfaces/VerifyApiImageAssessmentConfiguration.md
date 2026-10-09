[**@microblink/blinkid-verify**](../README.md)

***

[@microblink/blinkid-verify](../README.md) / VerifyApiImageAssessmentConfiguration

# Interface: VerifyApiImageAssessmentConfiguration

Shared image-assessment settings for /api/v3/verify and /api/v3/extract.

## Properties

### imageQualitySensitivity?

> `optional` **imageQualitySensitivity?**: [`VerifyApiSensitivity`](../type-aliases/VerifyApiSensitivity.md)

Single sensitivity applied uniformly to all image-quality dimensions. On /api/v3/verify, verificationPolicy may
adjust the effective value.
