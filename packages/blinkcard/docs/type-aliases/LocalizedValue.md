[**@microblink/blinkcard**](../README.md)

***

[@microblink/blinkcard](../README.md) / LocalizedValue

# Type Alias: LocalizedValue\<T\>

> **LocalizedValue**\<`T`\> = `T` *extends* `Record`\<`string`, `unknown`\> ? `{ [K in keyof T]: LocalizedValue<T[K]> }` \| `string` & `Record`\<`string`, `never`\> : `T` \| `string` & `Record`\<`string`, `never`\>

Recursively transforms a locale record to allow string overrides at any level.

## Type Parameters

### T

`T`
