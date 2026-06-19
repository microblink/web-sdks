[**@microblink/blinkid-worker**](../README.md)

***

[@microblink/blinkid-worker](../README.md) / RedactionSettingsResolver

# Type Alias: RedactionSettingsResolver()

> **RedactionSettingsResolver** = (`classInfo`, `getDefaultRedactionSettings`) => `RedactionSettingsResolverReturn` \| `null` \| `Promise`\<`RedactionSettingsResolverReturn` \| `null`\>

Resolves custom result redaction settings for a classified document.

Return `null` to keep the SDK default redaction behavior.

## Parameters

### classInfo

`DocumentClassInfo`

### getDefaultRedactionSettings

(`options`) => `Promise`\<`RedactionSettings`\>

## Returns

`RedactionSettingsResolverReturn` \| `null` \| `Promise`\<`RedactionSettingsResolverReturn` \| `null`\>
