[**@microblink/blinkid-wasm**](../README.md)

***

[@microblink/blinkid-wasm](../README.md) / DateResult

# Type Alias: DateResult\<S\>

> **DateResult**\<`S`\> = `object`

Smart date result structure.

## Type Parameters

### S

`S` *extends* `string` \| [`StringResult`](StringResult.md)

The type of the string result.

## Properties

### day?

> `optional` **day**: `number`

Day in month [1-31]

***

### filledByDomainKnowledge

> **filledByDomainKnowledge**: `boolean`

Indicates whether this Date object is filled by internal domain knowledge.
If it is, successfullyParsed flag is set to false and originalString is set
to empty.

***

### month?

> `optional` **month**: `number`

Month in year [1-12]

***

### originalString?

> `optional` **originalString**: `S`

Original date time string

***

### successfullyParsed?

> `optional` **successfullyParsed**: `boolean`

Indicates whether this Date object is successfully parsed from string.

***

### year?

> `optional` **year**: `number`

Four digit year
