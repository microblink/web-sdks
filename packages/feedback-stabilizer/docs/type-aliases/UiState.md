[**@microblink/feedback-stabilizer**](../README.md)

***

[@microblink/feedback-stabilizer](../README.md) / UiState

# Type Alias: UiState\<K\>

> **UiState**\<`K`\> = `object`

Represents a UI state configuration with timing and weight parameters.
Used to define how different UI states should behave in the stabilization process.

## Type Parameters

### K

`K` *extends* `string` = `string`

The specific key type for this UI state

## Properties

### initialWeight?

> `optional` **initialWeight**: `number`

Initial weight for this state when it enters the stabilization queue.
Higher values give the state more influence in the averaging process.

***

### key

> **key**: `K`

Unique identifier for the UI state

***

### minDuration

> **minDuration**: `number`

Minimum duration (in milliseconds) this state should be displayed

***

### singleEmit?

> `optional` **singleEmit**: `boolean`

If true, the event will be emitted once the previous event is done.
It bypasses the averaging process and is handled separately.
