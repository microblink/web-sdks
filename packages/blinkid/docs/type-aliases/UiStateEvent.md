[**@microblink/blinkid**](../README.md)

***

[@microblink/blinkid](../README.md) / UiStateEvent

# Type Alias: UiStateEvent\<K\>

> **UiStateEvent**\<`K`\> = `object`

Represents a UI state event in the stabilization queue.
These events are processed to determine which UI state should be displayed.

## Type Parameters

### K

`K` *extends* `string` = `string`

The key type for this event, matching a UI state key

## Properties

### currentWeight

> **currentWeight**: `number`

Current weight of this event in the stabilization process

***

### key

> **key**: `K`

Identifier matching a UI state key

***

### singleEmit?

> `optional` **singleEmit**: `boolean`

If true, this event will be emitted once the previous event completes.
It bypasses the normal stabilization process.

***

### timeStamp

> **timeStamp**: `DOMHighResTimeStamp`

High-resolution timestamp when the event occurred
