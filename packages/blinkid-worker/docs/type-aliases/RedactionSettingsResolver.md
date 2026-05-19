[**@microblink/blinkid-worker**](../README.md)

***

[@microblink/blinkid-worker](../README.md) / RedactionSettingsResolver

# Type Alias: RedactionSettingsResolver()

> **RedactionSettingsResolver** = (`classInfo`) => `RedactionSettings` \| `null` \| `undefined` \| `Promise`\<`RedactionSettings` \| `null` \| `undefined`\>

Resolves custom result redaction settings for a classified document.

Return `null` or `undefined` to keep the SDK default redaction behavior.

## Parameters

### classInfo

`DocumentClassInfo`

## Returns

`RedactionSettings` \| `null` \| `undefined` \| `Promise`\<`RedactionSettings` \| `null` \| `undefined`\>
