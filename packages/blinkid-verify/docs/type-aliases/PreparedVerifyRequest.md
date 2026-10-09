[**@microblink/blinkid-verify**](../README.md)

***

[@microblink/blinkid-verify](../README.md) / PreparedVerifyRequest

# Type Alias: PreparedVerifyRequest

> **PreparedVerifyRequest** = `object`

POST-ready Verify request. `body` is the exact assembled bytes (the payload that would be signed). Do not rebuild
`FormData` from parts.

`url` is `{baseUrl}/api/v3/verify`. `headers` contain only `Content-Type`.

## Properties

### body

> **body**: `Uint8Array`

***

### headers

> **headers**: `Record`\<`string`, `string`\>

Contains only `Content-Type`.

***

### method

> **method**: `"POST"`

***

### serializedPayload?

> `optional` **serializedPayload?**: [`SerializedPayload`](SerializedPayload.md)

Structured multipart parts for inspection and debug only.

***

### url

> **url**: `string`
