[**@microblink/blinkid-core**](../README.md)

***

[@microblink/blinkid-core](../README.md) / RedactionSettingsResolver

# Type Alias: RedactionSettingsResolver()

> **RedactionSettingsResolver** = (`classInfo`, `getDefaultRedactionSettings`) => `RedactionSettingsResolverReturn` \| `null` \| `Promise`\<`RedactionSettingsResolverReturn` \| `null`\>

Resolves custom result redaction settings for a classified document.

Return `null` to keep the SDK default redaction behavior.

## Parameters

### classInfo

[`DocumentClassInfo`](DocumentClassInfo.md)

### getDefaultRedactionSettings

(`options`) => `Promise`\<[`RedactionSettings`](RedactionSettings.md)\>

## Returns

`RedactionSettingsResolverReturn` \| `null` \| `Promise`\<`RedactionSettingsResolverReturn` \| `null`\>
