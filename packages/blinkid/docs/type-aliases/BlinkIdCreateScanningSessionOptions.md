[**@microblink/blinkid**](../README.md)

***

[@microblink/blinkid](../README.md) / BlinkIdCreateScanningSessionOptions

# Type Alias: BlinkIdCreateScanningSessionOptions

> **BlinkIdCreateScanningSessionOptions** = `object`

Options applied by BlinkID Worker when creating a scanning session.

## Properties

### redactionSettingsResolver?

> `optional` **redactionSettingsResolver**: [`RedactionSettingsResolver`](RedactionSettingsResolver.md)

Resolves custom result redaction settings for the classified document.

Returning `null` or `undefined` keeps the SDK default redaction behavior.
