[**@microblink/blinkid**](../README.md)

***

[@microblink/blinkid](../README.md) / DocumentClassComponent

# Type Alias: DocumentClassComponent\<TId\>

> **DocumentClassComponent**\<`TId`\> = `object`

A single document classification component.

`id` is present when the classification maps to a value known at build time.
`rawValue` always carries the raw classification token from the document
knowledge database, including OTA-delivered classes unknown at build time.

## Type Parameters

### TId

`TId` *extends* `string`

## Properties

### id?

> `optional` **id**: `TId`

Strongly-typed identifier, when known at build time.

***

### rawValue

> **rawValue**: `string`

Raw classification value (document knowledge database format).
