[**@microblink/blinkid-core**](../README.md)

***

[@microblink/blinkid-core](../README.md) / RedactionSettingsResolver

# Type Alias: RedactionSettingsResolver()

> **RedactionSettingsResolver** = (`classInfo`) => [`RedactionSettings`](RedactionSettings.md) \| `null` \| `undefined` \| `Promise`\<[`RedactionSettings`](RedactionSettings.md) \| `null` \| `undefined`\>

Resolves custom result redaction settings for a classified document.

Return `null` or `undefined` to keep the SDK default redaction behavior.

## Parameters

### classInfo

[`DocumentClassInfo`](DocumentClassInfo.md)

## Returns

[`RedactionSettings`](RedactionSettings.md) \| `null` \| `undefined` \| `Promise`\<[`RedactionSettings`](RedactionSettings.md) \| `null` \| `undefined`\>
